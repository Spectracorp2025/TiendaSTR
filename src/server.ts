import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS workers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL, -- 'Santa Rosa', 'Palermo', 'Pueblo'
        number INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS consumptions (
        id SERIAL PRIMARY KEY,
        worker_id INTEGER REFERENCES workers(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        type TEXT NOT NULL, -- 'store', 'lunch', 'soup', 'weekly_food', 'sunday_food'
        price INTEGER NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
}

async function startServer() {
  await initDb();
  
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ok', database: 'connected' });
    } catch (err) {
      res.status(500).json({ status: 'error', database: 'disconnected' });
    }
  });

  app.get('/api/workers', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM workers ORDER BY name ASC, number ASC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch workers' });
    }
  });

  app.post('/api/workers', async (req, res) => {
    const { name, type, number } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO workers (name, type, number) VALUES ($1, $2, $3) RETURNING *',
        [name, type, number]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create worker' });
    }
  });

  app.put('/api/workers/:id', async (req, res) => {
    const { id } = req.params;
    const { name, type, number } = req.body;
    try {
      const result = await pool.query(
        'UPDATE workers SET name = $1, type = $2, number = $3 WHERE id = $4 RETURNING *',
        [name, type, number, id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update worker' });
    }
  });

  app.delete('/api/workers/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM workers WHERE id = $1', [id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete worker' });
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM products ORDER BY name ASC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.post('/api/products', async (req, res) => {
    const { name, price } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *',
        [name, price]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
    try {
      const result = await pool.query(
        'UPDATE products SET name = $1, price = $2 WHERE id = $3 RETURNING *',
        [name, price, id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  app.get('/api/consumptions', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT c.*, w.name as worker_name, w.number as worker_number, p.name as product_name 
        FROM consumptions c 
        JOIN workers w ON c.worker_id = w.id 
        LEFT JOIN products p ON c.product_id = p.id 
        ORDER BY c.created_at DESC
      `);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch consumptions' });
    }
  });

  app.post('/api/consumptions', async (req, res) => {
    const { worker_id, product_id, type, price, description } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO consumptions (worker_id, product_id, type, price, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [worker_id, product_id, type, price, description]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create consumption' });
    }
  });

  app.delete('/api/consumptions/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM consumptions WHERE id = $1', [id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete consumption' });
    }
  });

  app.post('/api/reset-week', async (req, res) => {
    try {
      await pool.query('DELETE FROM consumptions');
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to reset week' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
