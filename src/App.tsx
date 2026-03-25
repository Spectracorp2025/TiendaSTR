/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Store, 
  Utensils, 
  History, 
  Settings, 
  Plus, 
  Trash2, 
  Edit2, 
  LogOut, 
  FileText, 
  RefreshCw, 
  ChevronRight,
  Search,
  Check,
  X,
  Coffee,
  Sun,
  Moon,
  ArrowRight,
  Image as ImageIcon,
  AlertTriangle,
  Bell,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Types
type WorkerType = 'Santa Rosa' | 'Palermo' | 'Pueblo';

interface Worker {
  id: number;
  name: string;
  type: WorkerType;
  number?: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

interface Consumption {
  id: number;
  worker_id: number;
  worker_name: string;
  worker_number?: number;
  product_id?: number;
  product_name?: string;
  type: 'store' | 'lunch' | 'soup' | 'weekly_food' | 'sunday_food';
  price: number;
  description?: string;
  created_at: string;
}

// Components
const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
      type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/20 border-rose-500/50 text-rose-400'
    }`}
  >
    <Bell size={20} />
    <span className="font-semibold">{message}</span>
    <button onClick={onClose} className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors">
      <X size={16} />
    </button>
  </motion.div>
);

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, showPasswordInput, passwordValue, onPasswordChange }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-zinc-400 mb-6 leading-relaxed">{message}</p>
          
          {showPasswordInput && (
            <div className="mb-8">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Contraseña de Seguridad</label>
              <input 
                type="password"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                placeholder="Ingresa la clave..."
                value={passwordValue}
                onChange={(e) => onPasswordChange(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancelar</Button>
            <Button variant="danger" className="flex-1" onClick={onConfirm}>Confirmar</Button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon }: any) => {
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20',
    ghost: 'bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white',
    accent: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variants[variant as keyof typeof variants]} ${className}`}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

const Card = ({ children, className = '', title, action }: any) => (
  <div className={`bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden ${className}`}>
    {(title || action) && (
      <div className="px-6 py-4 border-bottom border-zinc-800 flex items-center justify-between">
        {title && <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const Input = ({ label, ...props }: any) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-zinc-400 ml-1">{label}</label>}
    <input
      {...props}
      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600"
    />
  </div>
);

const Select = ({ label, options, ...props }: any) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-zinc-400 ml-1">{label}</label>}
    <select
      {...props}
      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('consumptions');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);
  const [bgImage, setBgImage] = useState(() => {
    return localStorage.getItem('finca_bg_image') || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=2070&auto=format&fit=crop';
  });

  useEffect(() => {
    localStorage.setItem('finca_bg_image', bgImage);
  }, [bgImage]);

  // UI States
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Form States
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [workerManagementSearchQuery, setWorkerManagementSearchQuery] = useState('');
  const [resumenSearchQuery, setResumenSearchQuery] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [resetPassword, setResetPassword] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
      const interval = setInterval(checkHealth, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      setDbConnected(res.ok);
    } catch (error) {
      setDbConnected(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [workersRes, productsRes, consumptionsRes] = await Promise.all([
        fetch('/api/workers'),
        fetch('/api/products'),
        fetch('/api/consumptions')
      ]);
      
      const workersData = await workersRes.json();
      const productsData = await productsRes.json();
      const consumptionsData = await consumptionsRes.json();

      setWorkers(workersData);
      setProducts(productsData);
      setConsumptions(consumptionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '121508') {
      setIsLoggedIn(true);
      showToast('Bienvenido al sistema');
    } else {
      showToast('Credenciales incorrectas', 'error');
    }
  };

  const handleAddConsumption = async (type: Consumption['type'], price: number, productId?: number, description?: string, qty: number = 1) => {
    if (!selectedWorker) return;

    try {
      // Create multiple consumptions if quantity > 1
      const promises = [];
      for (let i = 0; i < qty; i++) {
        promises.push(
          fetch('/api/consumptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              worker_id: selectedWorker.id,
              product_id: productId,
              type,
              price,
              description
            })
          })
        );
      }

      const results = await Promise.all(promises);
      const allOk = results.every(res => res.ok);

      if (allOk) {
        fetchData();
        showToast(`${qty > 1 ? `(${qty}) ` : ''}Agregado: ${description || 'Consumo'}`);
        setQuantity(1); // Reset quantity
        setCustomItemName('');
        setCustomItemPrice('');
      } else {
        showToast('Error al registrar algunos consumos', 'error');
      }
    } catch (error) {
      showToast('Error al registrar consumo', 'error');
      console.error('Error adding consumption:', error);
    }
  };

  const handleResetWeek = async () => {
    if (resetPassword !== '2025') {
      showToast('Contraseña incorrecta', 'error');
      return;
    }
    setIsConfirmOpen(false);
    setResetPassword('');
    setLoading(true);
    try {
      const res = await fetch('/api/reset-week', { method: 'POST' });
      if (res.ok) {
        await fetchData();
        showToast('Semana reiniciada correctamente');
      } else {
        showToast('Error al reiniciar semana', 'error');
      }
    } catch (error) {
      showToast('Error al reiniciar semana', 'error');
      console.error('Error resetting week:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const today = format(new Date(), "eeee, d 'de' MMMM", { locale: es });
    const saturdayDate = format(new Date(), 'dd/MM/yyyy');

    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129);
    doc.text('FINCA SANTA ROSA', 105, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text('CUENTA SEMANAL DE TRABAJADORES', 105, 25, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Fecha de pago: Sábado ${saturdayDate}`, 105, 32, { align: 'center' });

    const tableData = workers.map(worker => {
      const workerConsumptions = consumptions.filter(c => c.worker_id === worker.id);
      let total = 0;
      
      // Calculate total including weekly food for Santa Rosa
      const storeTotal = workerConsumptions.reduce((sum, c) => sum + c.price, 0);
      
      let baseFood = 0;
      if (worker.type === 'Santa Rosa') {
        baseFood = 162000;
      }
      
      total = storeTotal + baseFood;

      return [
        worker.number ? `#${worker.number} - ${worker.name}` : worker.name,
        worker.type,
        `$${storeTotal.toLocaleString()}`,
        worker.type === 'Santa Rosa' ? `$${baseFood.toLocaleString()}` : '$0',
        `$${total.toLocaleString()}`
      ];
    });

    autoTable(doc, {
      head: [['Trabajador', 'Tipo', 'Tienda', 'Comida Base', 'Total']],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
    });

    doc.save(`Cuenta_Semanal_${saturdayDate}.pdf`);
  };

  // Filtered workers for search
  const filteredWorkers = useMemo(() => {
    return workers.filter(w => 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (w.number && w.number.toString().includes(searchQuery))
    );
  }, [workers, searchQuery]);

  // Calculate current balance for selected worker
  const selectedWorkerBalance = useMemo(() => {
    if (!selectedWorker) return 0;
    const workerConsumptions = consumptions.filter(c => c.worker_id === selectedWorker.id);
    const storeTotal = workerConsumptions.reduce((sum, c) => sum + c.price, 0);
    let baseFood = 0;
    if (selectedWorker.type === 'Santa Rosa') {
      baseFood = 162000;
    }
    return storeTotal + baseFood;
  }, [selectedWorker, consumptions]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 mb-4 border border-emerald-500/20 backdrop-blur-md">
              <Coffee size={40} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">FINCACONTROL</h1>
            <p className="text-zinc-400 mt-2 font-medium">Gestión de Tienda y Obreros</p>
          </div>

          <Card className="bg-zinc-900/80">
            <form onSubmit={handleLogin} className="space-y-6">
              <Input 
                label="Usuario" 
                placeholder="admin" 
                value={username}
                onChange={(e: any) => setUsername(e.target.value)}
              />
              <Input 
                label="Contraseña" 
                type="password" 
                placeholder="••••••" 
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
              />
              <Button className="w-full h-14 text-lg" type="submit">
                Entrar al Sistema
              </Button>
            </form>
          </Card>
        </motion.div>
        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col lg:flex-row overflow-hidden relative">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Sidebar - Optimized for Tablet */}
      <aside className="w-full lg:w-64 bg-zinc-900/90 backdrop-blur-xl border-r border-zinc-800 flex flex-col shrink-0 z-20">
        <div className="p-6 flex items-center gap-3 border-b border-zinc-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-zinc-900 shadow-lg shadow-emerald-500/20">
            <Coffee size={24} />
          </div>
          <div>
            <h2 className="font-black text-lg leading-tight tracking-tighter">FINCACONTROL</h2>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${dbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{dbConnected ? 'En Línea' : 'Sin Conexión'}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem 
            icon={Store} 
            label="Consumos" 
            active={activeTab === 'consumptions'} 
            onClick={() => setActiveTab('consumptions')} 
          />
          <NavItem 
            icon={LayoutDashboard} 
            label="Resumen" 
            active={activeTab === 'summary'} 
            onClick={() => setActiveTab('summary')} 
          />
          <NavItem 
            icon={Users} 
            label="Trabajadores" 
            active={activeTab === 'workers'} 
            onClick={() => setActiveTab('workers')} 
          />
          <NavItem 
            icon={Utensils} 
            label="Productos" 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')} 
          />
          <NavItem 
            icon={History} 
            label="Historial" 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />
          <NavItem 
            icon={Settings} 
            label="Ajustes" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-2">
          <Button variant="ghost" className="w-full justify-start" icon={LogOut} onClick={() => setIsLoggedIn(false)}>
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 relative z-10 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'consumptions' && (
            <motion.div 
              key="consumptions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto space-y-6 lg:space-y-8"
            >
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black tracking-tighter">REGISTRO DE CONSUMOS</h1>
                  <p className="text-zinc-500 font-medium">Selecciona un trabajador para anotar sus consumos</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:gap-3">
                  <Button variant="secondary" icon={FileText} onClick={generatePDF}>Reporte PDF</Button>
                  <Button variant="danger" icon={RefreshCw} onClick={() => setIsConfirmOpen(true)}>Reiniciar Semana</Button>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Worker Selection */}
                <Card className="lg:col-span-3 h-fit sticky top-0" title="Trabajadores">
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                      <input 
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="Buscar por nombre o #"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 max-h-[300px] lg:max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredWorkers.map(worker => (
                      <button
                        key={worker.id}
                        onClick={() => setSelectedWorker(worker)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border ${
                          selectedWorker?.id === worker.id 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                            : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            selectedWorker?.id === worker.id ? 'bg-emerald-500 text-zinc-900' : 'bg-zinc-700 text-zinc-400'
                          }`}>
                            {worker.number || 'W'}
                          </div>
                          <div className="text-left">
                            <div className="font-bold leading-none text-sm truncate max-w-[80px] xl:max-w-[120px]">{worker.name}</div>
                            <div className="text-[9px] uppercase tracking-wider mt-1 opacity-60 font-bold">{worker.type}</div>
                          </div>
                        </div>
                        {selectedWorker?.id === worker.id && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Consumption Actions */}
                <div className="lg:col-span-9 space-y-6">
                  {selectedWorker ? (
                    <>
                      <Card className="bg-emerald-500/10 border-emerald-500/30 shadow-xl shadow-emerald-500/5">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-zinc-900 text-2xl font-black shadow-lg shadow-emerald-500/20">
                              {selectedWorker.number || selectedWorker.name[0]}
                            </div>
                            <div>
                              <h2 className="text-2xl font-black text-white tracking-tight uppercase">{selectedWorker.name}</h2>
                              <p className="text-emerald-500 font-bold uppercase text-xs tracking-widest">{selectedWorker.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Cuenta Actual</div>
                              <div className="text-3xl font-black text-emerald-500">${selectedWorkerBalance.toLocaleString()}</div>
                            </div>
                            <button 
                              onClick={() => setSelectedWorker(null)}
                              className="p-3 rounded-xl bg-zinc-800/50 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-zinc-700 hover:border-rose-500/50"
                              title="Quitar selección"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </div>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Store Products */}
                        <Card title="Tienda">
                          <div className="space-y-4">
                            {/* Quantity and Search */}
                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cant.</span>
                                <button 
                                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                  className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-white hover:bg-zinc-600 transition-colors"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-black text-emerald-500">{quantity}</span>
                                <button 
                                  onClick={() => setQuantity(quantity + 1)}
                                  className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-white hover:bg-zinc-600 transition-colors"
                                >
                                  +
                                </button>
                              </div>
                              <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                <input 
                                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                  placeholder="Buscar producto..."
                                  value={productSearchQuery}
                                  onChange={(e) => setProductSearchQuery(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                              {products
                                .filter(p => p.name.toLowerCase().includes(productSearchQuery.toLowerCase()))
                                .map(product => (
                                <button
                                  key={product.id}
                                  onClick={() => handleAddConsumption('store', product.price, product.id, product.name, quantity)}
                                  className="p-4 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-left transition-all active:scale-95 group"
                                >
                                  <div className="font-bold text-zinc-100 group-hover:text-white truncate">{product.name}</div>
                                  <div className="text-emerald-500 font-black mt-1">${product.price.toLocaleString()}</div>
                                </button>
                              ))}
                              {products.length === 0 && (
                                <p className="col-span-2 text-center py-8 text-zinc-600 italic text-sm">No hay productos creados</p>
                              )}
                            </div>
                          </div>
                        </Card>

                        {/* Quick Food & Custom Actions */}
                        <div className="space-y-6">
                          <Card title="Comidas Rápidas">
                            <div className="space-y-3">
                              <button
                                onClick={() => handleAddConsumption('lunch', 12000, undefined, 'Almuerzo Completo', quantity)}
                                className="w-full flex items-center justify-between p-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400 transition-all active:scale-95"
                              >
                                <div className="flex items-center gap-3">
                                  <Utensils size={20} />
                                  <span className="font-black uppercase text-sm tracking-tight">Almuerzo Completo</span>
                                </div>
                                <span className="font-black">$12.000</span>
                              </button>
                              <button
                                onClick={() => handleAddConsumption('soup', 5000, undefined, 'Sopa', quantity)}
                                className="w-full flex items-center justify-between p-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 transition-all active:scale-95"
                              >
                                <div className="flex items-center gap-3">
                                  <Utensils size={20} />
                                  <span className="font-black uppercase text-sm tracking-tight">Sopa</span>
                                </div>
                                <span className="font-black">$5.000</span>
                              </button>
                              {selectedWorker.type === 'Santa Rosa' && (
                                <button
                                  onClick={() => handleAddConsumption('sunday_food', 27000, undefined, 'Comida Domingo', quantity)}
                                  className="w-full flex items-center justify-between p-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 transition-all active:scale-95"
                                >
                                  <div className="flex items-center gap-3">
                                    <Sun size={20} />
                                    <span className="font-black uppercase text-sm tracking-tight">Día Domingo</span>
                                  </div>
                                  <span className="font-black">$27.000</span>
                                </button>
                              )}
                            </div>
                          </Card>

                          <Card title="Consumo Personalizado">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Descripción</label>
                                  <input 
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="Ej: Jabón, etc"
                                    value={customItemName}
                                    onChange={(e) => setCustomItemName(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Precio</label>
                                  <input 
                                    type="number"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="0"
                                    value={customItemPrice}
                                    onChange={(e) => setCustomItemPrice(e.target.value)}
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => handleAddConsumption('store', Number(customItemPrice), undefined, customItemName, quantity)}
                                disabled={!customItemName || !customItemPrice}
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-zinc-900 font-black rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                              >
                                <Plus size={18} />
                                AGREGAR A LA CUENTA {quantity > 1 && `(x${quantity})`}
                              </button>
                            </div>
                          </Card>
                        </div>
                      </div>

                      {/* All Consumptions for this worker */}
                      <Card title="Historial de Consumos del Trabajador">
                        <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 custom-scrollbar">
                          {consumptions
                            .filter(c => c.worker_id === selectedWorker.id)
                            .map(c => (
                              <div key={c.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-800">
                                <div>
                                  <div className="font-bold text-zinc-200">{c.description || c.product_name || c.type}</div>
                                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{format(new Date(c.created_at), 'HH:mm - dd/MM')}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="font-black text-emerald-500">${c.price.toLocaleString()}</span>
                                  <button 
                                    onClick={async () => {
                                      await fetch(`/api/consumptions/${c.id}`, { method: 'DELETE' });
                                      fetchData();
                                      showToast('Consumo eliminado');
                                    }}
                                    className="p-2 text-zinc-600 hover:text-rose-500 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          {consumptions.filter(c => c.worker_id === selectedWorker.id).length === 0 && (
                            <p className="text-center py-6 text-zinc-600 italic text-sm">No hay consumos registrados esta semana</p>
                          )}
                        </div>
                      </Card>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20 backdrop-blur-sm">
                      <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center text-zinc-700 mb-6 border border-zinc-800">
                        <Users size={40} />
                      </div>
                      <h3 className="text-2xl font-black text-zinc-400 tracking-tight">NINGÚN TRABAJADOR SELECCIONADO</h3>
                      <p className="text-zinc-600 max-w-xs mt-3 font-medium">Por favor, selecciona un trabajador de la lista de la izquierda para comenzar a registrar sus consumos.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'summary' && (
            <SummaryView 
              workers={workers} 
              consumptions={consumptions} 
              searchQuery={resumenSearchQuery}
              setSearchQuery={setResumenSearchQuery}
            />
          )}

          {activeTab === 'workers' && (
            <WorkerManagement 
              workers={workers} 
              onUpdate={fetchData} 
              showToast={showToast} 
              searchQuery={workerManagementSearchQuery}
              setSearchQuery={setWorkerManagementSearchQuery}
            />
          )}

          {activeTab === 'products' && (
            <ProductManagement products={products} onUpdate={fetchData} showToast={showToast} />
          )}

          {activeTab === 'history' && (
            <HistoryView consumptions={consumptions} workers={workers} />
          )}

          {activeTab === 'settings' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <header>
                <h1 className="text-4xl font-black tracking-tighter">AJUSTES</h1>
                <p className="text-zinc-500 font-medium">Personaliza la apariencia del sistema</p>
              </header>

              <Card title="Apariencia">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Imagen de Fondo (URL)</label>
                    <div className="flex gap-3">
                      <input 
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        value={bgImage}
                        onChange={(e) => setBgImage(e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                      <Button onClick={() => showToast('Fondo actualizado')}>Aplicar</Button>
                    </div>
                    <p className="text-xs text-zinc-600">Pega una URL de imagen para cambiar el fondo del sistema.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=2070&auto=format&fit=crop',
                      'https://images.unsplash.com/photo-1500632164164-30ea9970f407?q=80&w=2070&auto=format&fit=crop',
                      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop'
                    ].map((url, i) => (
                      <button 
                        key={i}
                        onClick={() => setBgImage(url)}
                        className={`aspect-video rounded-xl bg-cover bg-center border-2 transition-all ${bgImage === url ? 'border-emerald-500 scale-95' : 'border-transparent opacity-50 hover:opacity-100'}`}
                        style={{ backgroundImage: `url(${url})` }}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="animate-spin text-emerald-500" size={48} />
            <p className="text-white font-bold tracking-widest uppercase text-sm">Cargando...</p>
          </div>
        </div>
      )}

      {/* Overlays */}
      <ConfirmModal 
        isOpen={isConfirmOpen}
        title="¿Reiniciar Semana?"
        message="Esta acción eliminará TODOS los consumos registrados hasta el momento. Los trabajadores y productos no se verán afectados. ¿Deseas continuar?"
        onConfirm={handleResetWeek}
        onCancel={() => {
          setIsConfirmOpen(false);
          setResetPassword('');
        }}
        showPasswordInput={true}
        passwordValue={resetPassword}
        onPasswordChange={setResetPassword}
      />

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}

// Sub-components
const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-emerald-500 text-zinc-900 font-bold shadow-lg shadow-emerald-500/20' 
        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

const SummaryView = ({ workers, consumptions, searchQuery, setSearchQuery }: { workers: Worker[], consumptions: Consumption[], searchQuery: string, setSearchQuery: any }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Resumen de Cuentas</h1>
          <p className="text-zinc-500 font-medium">Vista general de saldos por trabajador</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="Buscar trabajador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <Card title="Estado de Cuentas Semanal">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
          {workers
            .filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.number?.toString().includes(searchQuery))
            .map(worker => {
            const workerConsumptions = consumptions.filter(c => c.worker_id === worker.id);
            const storeTotal = workerConsumptions.reduce((sum, c) => sum + c.price, 0);
            let baseFood = 0;
            if (worker.type === 'Santa Rosa') baseFood = 162000;
            const total = storeTotal + baseFood;
            
            if (total === 0) return null;

            return (
              <div key={worker.id} className="p-6 bg-zinc-800/40 border border-zinc-700 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-lg text-white uppercase tracking-tight">{worker.name}</h3>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{worker.type}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold">
                    {worker.number || 'W'}
                  </div>
                </div>
                
                <div className="space-y-2 pt-2 border-t border-zinc-700/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Tienda:</span>
                    <span className="font-bold text-zinc-300">${storeTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Comida Base:</span>
                    <span className="font-bold text-zinc-300">${baseFood.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-zinc-700/50">
                    <span className="text-zinc-400 font-bold">TOTAL:</span>
                    <span className="text-xl font-black text-emerald-500">${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {workers.every(w => {
          const workerConsumptions = consumptions.filter(c => c.worker_id === w.id);
          const storeTotal = workerConsumptions.reduce((sum, c) => sum + c.price, 0);
          let baseFood = 0;
          if (w.type === 'Santa Rosa') baseFood = 162000;
          return (storeTotal + baseFood) === 0;
        }) && (
          <div className="text-center py-20 text-zinc-600 italic">No hay cuentas activas esta semana</div>
        )}
      </Card>
    </motion.div>
  );
};

const WorkerManagement = ({ workers, onUpdate, showToast, searchQuery, setSearchQuery }: { workers: Worker[], onUpdate: () => void, showToast: any, searchQuery: string, setSearchQuery: any }) => {
  const [isEditing, setIsEditing] = useState<Worker | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'Santa Rosa' as WorkerType, number: '' });

  const filteredWorkers = useMemo(() => {
    return workers.filter(w => 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      w.number?.toString().includes(searchQuery)
    );
  }, [workers, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing ? `/api/workers/${isEditing.id}` : '/api/workers';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          number: formData.number ? parseInt(formData.number) : null
        })
      });

      if (res.ok) {
        onUpdate();
        showToast(isEditing ? 'Trabajador actualizado' : 'Trabajador creado');
        setIsEditing(null);
        setFormData({ name: '', type: 'Santa Rosa', number: '' });
      }
    } catch (error) {
      showToast('Error al guardar trabajador', 'error');
      console.error('Error saving worker:', error);
    }
  };

  const handleDeleteWorker = async (id: number) => {
    try {
      const res = await fetch(`/api/workers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onUpdate();
        showToast('Trabajador eliminado');
      }
    } catch (error) {
      showToast('Error al eliminar trabajador', 'error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <header>
        <h1 className="text-4xl font-black tracking-tighter">GESTIÓN DE TRABAJADORES</h1>
        <p className="text-zinc-500 font-medium">Crea y administra los obreros de la finca</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit" title={isEditing ? "Editar Trabajador" : "Nuevo Trabajador"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Nombre" 
              value={formData.name} 
              onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} 
              required 
            />
            <Select 
              label="Tipo de Finca" 
              value={formData.type} 
              onChange={(e: any) => setFormData({ ...formData, type: e.target.value as WorkerType })}
              options={[
                { label: 'Santa Rosa', value: 'Santa Rosa' },
                { label: 'Palermo', value: 'Palermo' },
                { label: 'Pueblo', value: 'Pueblo' }
              ]}
            />
            <Input 
              label="Número (Opcional)" 
              type="number" 
              value={formData.number} 
              onChange={(e: any) => setFormData({ ...formData, number: e.target.value })} 
            />
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" type="submit">{isEditing ? 'Actualizar' : 'Crear'}</Button>
              {isEditing && (
                <Button variant="secondary" onClick={() => {
                  setIsEditing(null);
                  setFormData({ name: '', type: 'Santa Rosa', number: '' });
                }}>Cancelar</Button>
              )}
            </div>
          </form>
        </Card>

        <Card className="lg:col-span-2" title="Lista de Trabajadores">
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Buscar por nombre o número..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 custom-scrollbar">
              {filteredWorkers.map(worker => (
                <div key={worker.id} className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl hover:border-zinc-500 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center font-bold text-zinc-400">
                      {worker.number || 'W'}
                    </div>
                    <div>
                      <div className="font-bold">{worker.name}</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">{worker.type}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => {
                        setIsEditing(worker);
                        setFormData({ name: worker.name, type: worker.type, number: worker.number?.toString() || '' });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteWorker(worker.id)}
                      className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredWorkers.length === 0 && (
                <p className="col-span-2 text-center py-12 text-zinc-600 italic">No se encontraron trabajadores</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

const ProductManagement = ({ products, onUpdate, showToast }: { products: Product[], onUpdate: () => void, showToast: any }) => {
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing ? `/api/products/${isEditing.id}` : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: parseInt(formData.price)
        })
      });

      if (res.ok) {
        onUpdate();
        showToast(isEditing ? 'Producto actualizado' : 'Producto creado');
        setIsEditing(null);
        setFormData({ name: '', price: '' });
      }
    } catch (error) {
      showToast('Error al guardar producto', 'error');
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onUpdate();
        showToast('Producto eliminado');
      }
    } catch (error) {
      showToast('Error al eliminar producto', 'error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <header>
        <h1 className="text-4xl font-black tracking-tighter">GESTIÓN DE PRODUCTOS</h1>
        <p className="text-zinc-500 font-medium">Administra los artículos de la tienda y sus precios</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit" title={isEditing ? "Editar Producto" : "Nuevo Producto"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Nombre del Producto" 
              value={formData.name} 
              onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} 
              required 
            />
            <Input 
              label="Precio (COP)" 
              type="number" 
              value={formData.price} 
              onChange={(e: any) => setFormData({ ...formData, price: e.target.value })} 
              required 
            />
            <div className="flex gap-2 pt-2">
              <Button className="w-full" type="submit">{isEditing ? 'Actualizar' : 'Crear'}</Button>
              {isEditing && (
                <Button variant="secondary" onClick={() => {
                  setIsEditing(null);
                  setFormData({ name: '', price: '' });
                }}>Cancelar</Button>
              )}
            </div>
          </form>
        </Card>

        <Card className="lg:col-span-2" title="Inventario de Tienda">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[calc(100vh-350px)] overflow-y-auto pr-2 custom-scrollbar">
            {products.map(product => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl hover:border-zinc-500 transition-all">
                <div>
                  <div className="font-bold">{product.name}</div>
                  <div className="text-emerald-500 font-black">${product.price.toLocaleString()}</div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => {
                      setIsEditing(product);
                      setFormData({ name: product.name, price: product.price.toString() });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="col-span-2 text-center py-12 text-zinc-600 italic">No hay productos registrados</p>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

const HistoryView = ({ consumptions, workers }: { consumptions: Consumption[], workers: Worker[] }) => {
  const [filter, setFilter] = useState('');
  
  const filteredConsumptions = useMemo(() => {
    return consumptions.filter(c => 
      c.worker_name.toLowerCase().includes(filter.toLowerCase()) ||
      (c.worker_number && c.worker_number.toString().includes(filter)) ||
      (c.description && c.description.toLowerCase().includes(filter.toLowerCase()))
    );
  }, [consumptions, filter]);

  const totalAmount = useMemo(() => {
    return filteredConsumptions.reduce((sum, c) => sum + c.price, 0);
  }, [filteredConsumptions]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historial de Consumos</h1>
          <p className="text-zinc-500">Registro detallado de todas las transacciones de la semana</p>
        </div>
        <Card className="py-2 px-6 bg-emerald-500/10 border-emerald-500/20">
          <div className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Total Acumulado</div>
          <div className="text-2xl font-black text-emerald-500">${totalAmount.toLocaleString()}</div>
        </Card>
      </header>

      <Card>
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Filtrar por trabajador, producto o tipo..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                <th className="pb-4 font-bold">Fecha / Hora</th>
                <th className="pb-4 font-bold">Trabajador</th>
                <th className="pb-4 font-bold">Concepto</th>
                <th className="pb-4 font-bold">Tipo</th>
                <th className="pb-4 font-bold text-right">Precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredConsumptions.map(c => (
                <tr key={c.id} className="group hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4 text-sm text-zinc-400">
                    {format(new Date(c.created_at), 'dd/MM/yy HH:mm')}
                  </td>
                  <td className="py-4">
                    <div className="font-bold text-zinc-200">
                      {c.worker_number ? `#${c.worker_number} - ` : ''}{c.worker_name}
                    </div>
                  </td>
                  <td className="py-4 text-zinc-300">
                    {c.description || c.product_name || 'Consumo'}
                  </td>
                  <td className="py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                      c.type === 'store' ? 'bg-blue-500/10 text-blue-400' :
                      c.type === 'lunch' ? 'bg-indigo-500/10 text-indigo-400' :
                      c.type === 'soup' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {c.type}
                    </span>
                  </td>
                  <td className="py-4 text-right font-bold text-emerald-500">
                    ${c.price.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredConsumptions.length === 0 && (
            <div className="text-center py-12 text-zinc-600 italic">No se encontraron registros</div>
          )}
        </div>

        {/* Mobile List View for History */}
        <div className="md:hidden space-y-4">
          {filteredConsumptions.map(c => (
            <div key={c.id} className="p-4 bg-zinc-800/30 border border-zinc-800 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-zinc-200">
                    {c.worker_number ? `#${c.worker_number} - ` : ''}{c.worker_name}
                  </div>
                  <div className="text-xs text-zinc-500">{format(new Date(c.created_at), 'dd/MM/yy HH:mm')}</div>
                </div>
                <div className="font-black text-emerald-500">${c.price.toLocaleString()}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-zinc-400">{c.description || c.product_name || 'Consumo'}</div>
                <span className={`text-[8px] font-bold uppercase px-2 py-1 rounded-md ${
                  c.type === 'store' ? 'bg-blue-500/10 text-blue-400' :
                  c.type === 'lunch' ? 'bg-indigo-500/10 text-indigo-400' :
                  c.type === 'soup' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {c.type}
                </span>
              </div>
            </div>
          ))}
          {filteredConsumptions.length === 0 && (
            <div className="text-center py-12 text-zinc-600 italic">No se encontraron registros</div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
