import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FiHome, FiCalendar, FiShoppingCart, FiLogOut, FiMenu, FiX, FiUser } from 'react-icons/fi';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/admin', name: 'Dashboard', icon: <FiHome /> },
    { path: '/admin/events', name: 'Kelola Event', icon: <FiCalendar /> },
    { path: '/admin/orders', name: 'Transaksi', icon: <FiShoppingCart /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-blue-900 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-blue-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-blue-900">mastutik.</Link>
          <button className="ml-auto lg:hidden text-slate-500" onClick={() => setSidebarOpen(false)}>
            <FiX size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu Utama</p>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition font-medium ${
                  isActive 
                    ? 'bg-blue-50 text-blue-900' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className={`text-xl ${isActive ? 'text-amber-500' : 'text-slate-400'}`}>
                  {link.icon}
                </div>
                <span>{link.name}</span>
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center w-full space-x-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition font-medium">
            <FiLogOut className="text-xl" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0">
          <button 
            className="lg:hidden text-slate-600 hover:text-blue-900"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu size={24} />
          </button>
          
          {/* Header Title (optional context based on route) */}
          <div className="hidden lg:block">
            <h1 className="text-lg font-bold text-blue-900 capitalize">
              {location.pathname.split('/').pop() === 'admin' ? 'Dashboard' : location.pathname.split('/').pop()}
            </h1>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-blue-900">Admin Utama</p>
                <p className="text-xs text-slate-500">admin@mastutik.com</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 shadow-inner">
                <FiUser size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
