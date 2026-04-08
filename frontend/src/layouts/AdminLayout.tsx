import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, ShoppingCart, LogOut, Menu, X, Ticket, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authApi } from '@/services/api';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = authApi.getUser();

  useEffect(() => {
    // Check if logged in
    if (!authApi.isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    // Check if admin
    if (user?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const navLinks = [
    { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/admin/events', name: 'Events', icon: <CalendarDays className="w-5 h-5" /> },
    { path: '/admin/merchandise', name: 'Merchandise', icon: <Package className="w-5 h-5" /> },
    { path: '/admin/orders', name: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-muted/30 font-sans flex">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/" className="flex items-center space-x-2">
             <Ticket className="w-5 h-5" />
             <span className="text-xl font-bold tracking-tight">mastutik.</span>
          </Link>
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                  isActive 
                    ? 'bg-secondary text-foreground' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
             <LogOut className="w-5 h-5 mr-3" />
             Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="hidden lg:block">
             <h2 className="text-sm font-medium text-muted-foreground">Admin Workspace</h2>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <div className="flex items-center space-x-3 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-muted-foreground mt-1">{user?.email || 'admin@mastutik.com'}</p>
              </div>
              <Avatar>
                <AvatarImage src={user?.avatar_url || "https://github.com/shadcn.png"} />
                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
