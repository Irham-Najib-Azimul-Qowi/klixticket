import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X, 
  CalendarDays, 
  ShoppingCart, 
  Package,
  ChevronRight,
  Bell,
  QrCode,
  Percent
} from 'lucide-react';
import { authApi } from '@/services/api';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = authApi.getUser();

  useEffect(() => {
    if (!authApi.isLoggedIn()) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const navLinks = [
    { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/admin/scan', name: 'Scan Tiket & Merchandise', icon: <QrCode size={18} /> },
    { path: '/admin/events', name: 'Events', icon: <CalendarDays size={18} /> },
    { path: '/admin/merchandise', name: 'Merchandise', icon: <Package size={18} /> },
    { path: '/admin/orders', name: 'Orders', icon: <ShoppingCart size={18} /> },
    { path: '/admin/taxes', name: 'Tax Config', icon: <Percent size={18} /> },
  ];


  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 bg-slate-50 text-slate-950 font-sans flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-950 text-slate-400 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col border-r border-slate-800 h-full`}>
        {/* Branding */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
          <Link to="/admin" className="flex items-center gap-2.5">
            <span className="text-lg font-bold tracking-tight text-white uppercase">Klix<span className="text-slate-500">Admin</span></span>
          </Link>
          <button className="lg:hidden ml-auto p-2 text-slate-500 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <p className="px-3 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Platform Management</p>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all font-semibold text-sm ${
                  isActive 
                    ? 'bg-slate-800 text-white' 
                    : 'hover:bg-slate-900 hover:text-slate-200'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className={`${isActive ? 'text-white' : 'text-slate-500'}`}>
                  {link.icon}
                </div>
                {link.name}
                {isActive && (
                  <ChevronRight size={14} className="ml-auto text-slate-600" />
                )}
              </Link>
            );
          })}
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-950">
          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-900 transition-colors cursor-default mb-2">
            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-white text-xs font-bold border border-slate-700">
              {user?.name?.substring(0, 1).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-200 truncate uppercase tracking-tight">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <LogOut size={14} />
            Logout System
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 lg:px-10 border-b border-slate-200 bg-white sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:text-slate-900">
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-bold uppercase tracking-widest text-slate-500">
              {navLinks.find(l => location.pathname === l.path || (l.path !== '/admin' && location.pathname.startsWith(l.path)))?.name || 'Overview'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-950 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </button>
            <div className="h-4 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200" />
              <span className="text-xs font-bold text-slate-600 uppercase hidden sm:inline">Production Mode</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
