import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User as UserIcon, Loader2, ArrowRight, Mail, Ticket, ShoppingBag, History, X, CheckCircle2, Lock, Shield, UserCircle, Key, Package } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { authApi, orderApi } from '@/services/api';
import type { User, Order } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { 
  updateProfileSchema, 
  changePasswordSchema, 
  type UpdateProfileInput, 
  type ChangePasswordInput 
} from '@/lib/validations/auth.schema';
import logoImg from '@/assets/images/klix-logo.webp';

interface ProfilePageProps {
  tab?: 'items' | 'history' | 'account' | 'security';
}

const ProfilePage: React.FC<ProfilePageProps> = ({ tab }) => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState<'items' | 'history' | 'account' | 'security'>(tab || 'items');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    if (tab) {
      setActiveSection(tab);
    }
  }, [tab]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, activeOrdersData, historyOrdersData] = await Promise.all([
          authApi.getMe(),
          orderApi.getMyOrders({ filter: 'active' }),
          orderApi.getMyOrders({ filter: 'history' })
        ]);
        
        setUser(userData);
        resetProfile({
          name: userData.name || '',
          email: userData.email || '',
        });
        setActiveOrders(activeOrdersData || []);
        setHistoryOrders(historyOrdersData || []);
      } catch (err: any) {
        setServerError(err.message || 'Failed to fetch profile data');
        if (err.status === 401) {
          authApi.logout();
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, resetProfile]);

  const onUpdateProfile = async (data: UpdateProfileInput) => {
    setServerError('');
    setSuccess('');
    setIsSaving(true);
    try {
      const updatedUser = await authApi.updateProfile(data.name, data.email);
      setUser(updatedUser);
      setSuccess('Your profile has been updated successfully.');
    } catch (err: any) {
      setServerError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordInput) => {
    setServerError('');
    setSuccess('');
    setIsSaving(true);
    try {
      await authApi.changePassword({ old_password: data.oldPassword, new_password: data.newPassword });
      setSuccess('Your password has been changed successfully.');
      resetPassword({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setServerError(err.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    clearCart();
    navigate('/login');
  };

  const myPaidItems = activeOrders.flatMap(o => (o.order_items || []).map(item => ({ ...item, orderId: o.id })));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">
        <div className="w-12 h-12 mb-8 border-2 border-neon-pink border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(255,0,128,0.4)]"></div>
        <p className="font-heading uppercase text-sm text-white tracking-widest animate-pulse">Syncing Session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black font-sans text-white flex flex-col pt-16">
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImg} alt="KlixTicket Logo" className="h-10 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-6">
             <Link to="/" className="text-[9px] font-bold text-white/50 uppercase tracking-widest hover:text-neon-pink transition-colors">Kembali ke Landing Page</Link>
             {user?.role === 'admin' && (
              <Link to="/admin" className="px-4 py-1.5 bg-neon-pink/10 text-neon-pink border border-neon-pink/20 rounded-sm font-bold text-[9px] uppercase tracking-widest hover:bg-neon-pink hover:text-white transition-all">Go to Admin</Link>
            )}
             <button onClick={handleLogout} className="text-[9px] font-bold text-white/50 uppercase tracking-widest hover:text-red-500 transition-colors">Sign Out</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
        
        {/* User Quick Switcher/Header */}
        <div className="mb-12 flex flex-col md:flex-row items-center gap-8 bg-dark-grey/30 border border-white/5 p-8 rounded-sm">
           <div className="relative">
              <div className="w-24 h-24 bg-dark-grey border border-white/10 flex items-center justify-center rounded-sm">
                 <UserCircle className="w-16 h-16 text-white/10" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-neon-pink rounded-full border-2 border-black flex items-center justify-center text-black">
                 <CheckCircle2 size={12} />
              </div>
           </div>
           <div className="text-center md:text-left flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-pink mb-2">Authenticated Account</p>
              <h1 className="text-4xl md:text-5xl font-heading uppercase leading-none tracking-tighter mb-2">{user?.name}</h1>
              <p className="text-white/40 text-sm">{user?.email}</p>
           </div>
           <div className="flex md:flex-col gap-2">
              <div className="px-4 py-2 bg-dark-grey border border-white/5 rounded-sm text-center">
                 <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Purchases</p>
                 <p className="font-heading text-xl">{historyOrders.length}</p>
              </div>
              <div className="px-4 py-2 bg-dark-grey border border-white/5 rounded-sm text-center">
                 <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Active Items</p>
                 <p className="font-heading text-xl text-neon-pink">{myPaidItems.length}</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Navigation Sidebar */}
            <aside className="lg:col-span-3">
               <div className="flex flex-col gap-1">
                  <button 
                   onClick={() => { setActiveSection('items'); navigate('/profile/tickets'); }} 
                   className={`flex items-center gap-4 px-6 py-4 font-heading text-sm uppercase tracking-widest border transition-all ${activeSection === 'items' ? 'bg-white text-black border-white' : 'text-white/40 border-white/5 hover:bg-white/5 hover:text-white'}`}
                  >
                     <Package size={18} />
                     <span>My Items</span>
                  </button>
                  <button 
                   onClick={() => { setActiveSection('history'); navigate('/profile/history'); }} 
                   className={`flex items-center gap-4 px-6 py-4 font-heading text-sm uppercase tracking-widest border transition-all ${activeSection === 'history' ? 'bg-white text-black border-white' : 'text-white/40 border-white/5 hover:bg-white/5 hover:text-white'}`}
                  >
                     <History size={18} />
                     <span>Order History</span>
                  </button>
                  <button 
                   onClick={() => { setActiveSection('account'); navigate('/profile'); }} 
                   className={`flex items-center gap-4 px-6 py-4 font-heading text-sm uppercase tracking-widest border transition-all ${activeSection === 'account' ? 'bg-white text-black border-white' : 'text-white/40 border-white/5 hover:bg-white/5 hover:text-white'}`}
                  >
                     <UserIcon size={18} />
                     <span>Profile Info</span>
                  </button>
                  <button 
                   onClick={() => { setActiveSection('security'); navigate('/profile/security'); }} 
                   className={`flex items-center gap-4 px-6 py-4 font-heading text-sm uppercase tracking-widest border transition-all ${activeSection === 'security' ? 'bg-white text-black border-white' : 'text-white/40 border-white/5 hover:bg-white/5 hover:text-white'}`}
                  >
                     <Key size={18} />
                     <span>Security</span>
                  </button>
               </div>
            </aside>

           {/* Content Area */}
           <div className="lg:col-span-9">
              
              {activeSection === 'items' && (
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h2 className="text-2xl font-heading uppercase tracking-widest">My Digital Items</h2>
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{myPaidItems.length} ACTIVE ASSETS</span>
                   </div>
                   
                   <div className="flex flex-col gap-4">
                      {myPaidItems.length === 0 ? (
                        <div className="col-span-full py-24 bg-dark-grey/20 border border-dashed border-white/5 flex flex-col items-center text-center">
                           <ShoppingBag size={48} className="mb-4 text-white/10" />
                           <p className="text-white/40 text-sm italic font-medium">You haven't purchased anything yet.</p>
                           <Link to="/" className="mt-8 px-8 py-3 bg-white text-black font-bold uppercase text-[10px] tracking-widest hover:bg-neon-pink hover:text-white transition-all transform hover:-rotate-1">Discover Events</Link>
                        </div>
                      ) : (
                        myPaidItems.map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedItem(item)}
                            className="bg-dark-grey border border-white/5 p-4 hover:border-neon-pink transition-all cursor-pointer group flex flex-row items-center gap-6 relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                               {item.item_type === 'ticket' ? <Ticket size={120} /> : <ShoppingBag size={120} />}
                            </div>
                            
                            <div className="w-16 h-16 bg-black border border-white/10 flex-shrink-0 flex items-center justify-center text-neon-pink shadow-[0_0_15px_rgba(255,0,128,0.1)] group-hover:shadow-[0_0_15px_rgba(255,0,128,0.3)] transition-all relative z-10">
                               {item.item_type === 'ticket' ? <Ticket size={32} /> : <ShoppingBag size={32} />}
                            </div>

                            <div className="flex flex-col flex-1 relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-[8px] font-black uppercase text-white px-2 py-1 bg-white/10 rounded-sm tracking-widest">Ownership Confirmed</span>
                                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Ref: {item.orderId?.slice(-8).toUpperCase()}</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-heading uppercase text-white group-hover:text-neon-pink transition-colors truncate">{item.item_name}</h3>
                                {item.item_type === 'ticket' && <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Ticket • Qty: {item.quantity}</p>}
                                {item.item_type === 'merchandise' && <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Merchandise • Qty: {item.quantity}</p>}
                            </div>

                            <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               navigate(`/order/${item.orderId}/ticket`);
                             }}
                             className="hidden md:flex flex-shrink-0 items-center gap-2 text-[10px] font-black uppercase bg-white/5 px-4 py-3 border border-white/10 text-neon-pink tracking-widest hover:bg-neon-pink hover:text-white transition-colors relative z-10"
                            >
                               {item.item_type === 'ticket' ? 'VIEW TICKET' : 'CLAIM VOUCHER'} <ArrowRight size={12} />
                            </button>
                          </div>
                        ))
                      )}
                   </div>
                </div>
              )}

              {activeSection === 'history' && (
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h2 className="text-2xl font-heading uppercase tracking-widest">Transaction History</h2>
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Global Order Ledger</span>
                   </div>
                   
                   <div className="bg-dark-grey/30 border border-white/5 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead className="bg-[#050505] text-[9px] font-bold uppercase tracking-widest text-white/30">
                              <tr>
                                 <th className="p-4 border-b border-white/5">Order Ref</th>
                                 <th className="p-4 border-b border-white/5">Timestamp</th>
                                 <th className="p-4 border-b border-white/5">Subject</th>
                                 <th className="p-4 border-b border-white/5">Amount</th>
                                 <th className="p-4 border-b border-white/5 text-right">Progress</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5">
                              {historyOrders.length === 0 ? (
                                <tr><td colSpan={5} className="p-20 text-center text-white/10 font-bold uppercase tracking-widest">No transaction logs available</td></tr>
                              ) : (
                                historyOrders.map(order => (
                                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                     <td className="p-4 font-mono text-[10px] text-white/40 tracking-tighter">#{order.id.slice(-8).toUpperCase()}</td>
                                     <td className="p-4 text-[10px] text-white/20 whitespace-nowrap">{new Date(order.created_at).toLocaleString()}</td>
                                     <td className="p-4 font-heading text-[11px] uppercase truncate max-w-[150px]">{order.order_items?.[0]?.item_name || 'Multiple Assets'}</td>
                                     <td className="p-4 font-heading text-[11px] text-white/60">{formatPrice(order.total_amount)}</td>
                                     <td className="p-4 text-right flex items-center justify-end gap-3">
                                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border border-white/20 text-white`}>
                                           {order.status}
                                        </span>
                                        {order.status.toLowerCase() === 'paid' && (
                                          <Link 
                                           to={`/order/${order.id}/ticket`}
                                           className="text-[9px] font-bold uppercase tracking-widest text-neon-pink hover:text-white transition-colors"
                                          >
                                            VIEW
                                          </Link>
                                        )}
                                     </td>
                                  </tr>
                                ))
                              )}
                           </tbody>
                        </table>
                      </div>
                   </div>
                </div>
              )}

              {activeSection === 'account' && (
                <div className="space-y-6 max-w-2xl">
                   <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
                      <h2 className="text-2xl font-heading uppercase tracking-widest">Account Information</h2>
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Registry Sync</span>
                   </div>
                   
                   <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-8">
                      <div className="space-y-2 group">
                         <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] group-focus-within:text-neon-pink transition-colors">Full Display Name</label>
                         <div className="relative">
                            <input 
                              {...registerProfile('name')}
                              className={`w-full bg-dark-grey border ${profileErrors.name ? 'border-neon-pink' : 'border-white/10'} p-4 font-heading text-xl text-white outline-none focus:border-neon-pink transition-all`}
                              placeholder="Enter your name"
                            />
                            <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-neon-pink/20 transition-colors" size={20} />
                         </div>
                         {profileErrors.name && (
                           <p className="text-[10px] font-bold text-neon-pink uppercase tracking-widest mt-1">{profileErrors.name.message}</p>
                         )}
                      </div>
                      
                      <div className="space-y-2 group">
                         <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] group-focus-within:text-neon-pink transition-colors">Primary Contact Email</label>
                         <div className="relative">
                            <input 
                              {...registerProfile('email')}
                              className={`w-full bg-dark-grey border ${profileErrors.email ? 'border-neon-pink' : 'border-white/10'} p-4 font-heading text-xl text-white outline-none focus:border-neon-pink transition-all`} 
                              placeholder="Enter your email"
                            />
                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-neon-pink/20 transition-colors" size={20} />
                         </div>
                         {profileErrors.email && (
                           <p className="text-[10px] font-bold text-neon-pink uppercase tracking-widest mt-1">{profileErrors.email.message}</p>
                         )}
                      </div>

                      {(serverError || success) && activeSection === 'account' && (
                        <div className={`p-4 text-center font-bold text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-top-2 ${serverError ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/30' : 'bg-white/10 text-white border border-white/20'}`}>
                           {serverError || success}
                        </div>
                      )}

                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="w-full py-5 bg-white text-black font-heading text-xl uppercase tracking-[0.2em] hover:bg-neon-pink transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                      >
                         {isSaving ? <Loader2 className="animate-spin" size={24} /> : 'Save Profile Changes'}
                      </button>
                   </form>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-6 max-w-2xl">
                   <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
                      <h2 className="text-2xl font-heading uppercase tracking-widest">Security Settings</h2>
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Protocol Override</span>
                   </div>
                   
                   <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-8">
                      <div className="space-y-2 group">
                         <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] group-focus-within:text-neon-pink transition-colors">Current Password</label>
                         <div className="relative">
                            <input 
                              {...registerPassword('oldPassword')}
                              type="password"
                              className={`w-full bg-dark-grey border ${passwordErrors.oldPassword ? 'border-neon-pink' : 'border-white/10'} p-4 font-heading text-xl text-white outline-none focus:border-neon-pink transition-all`}
                              placeholder="••••••••"
                            />
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-neon-pink/20 transition-colors" size={20} />
                         </div>
                         {passwordErrors.oldPassword && (
                           <p className="text-[10px] font-bold text-neon-pink uppercase tracking-widest mt-1">{passwordErrors.oldPassword.message}</p>
                         )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-2 group">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] group-focus-within:text-neon-pink transition-colors">New Password</label>
                            <input 
                              {...registerPassword('newPassword')}
                              type="password"
                              className={`w-full bg-dark-grey border ${passwordErrors.newPassword ? 'border-neon-pink' : 'border-white/10'} p-4 font-heading text-lg text-white outline-none focus:border-neon-pink transition-all`}
                              placeholder="Enter new"
                            />
                            {passwordErrors.newPassword && (
                              <p className="text-[10px] font-bold text-neon-pink uppercase tracking-widest mt-1">{passwordErrors.newPassword.message}</p>
                            )}
                         </div>
                         <div className="space-y-2 group">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] group-focus-within:text-neon-pink transition-colors">Confirm New</label>
                            <input 
                              {...registerPassword('confirmPassword')}
                              type="password"
                              className={`w-full bg-dark-grey border ${passwordErrors.confirmPassword ? 'border-neon-pink' : 'border-white/10'} p-4 font-heading text-lg text-white outline-none focus:border-neon-pink transition-all`}
                              placeholder="Confirm new"
                            />
                            {passwordErrors.confirmPassword && (
                              <p className="text-[10px] font-bold text-neon-pink uppercase tracking-widest mt-1">{passwordErrors.confirmPassword.message}</p>
                            )}
                         </div>
                      </div>

                      {(serverError || success) && activeSection === 'security' && (
                        <div className={`p-4 text-center font-bold text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-top-2 ${serverError ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/30' : 'bg-white/10 text-white border border-white/20'}`}>
                           {serverError || success}
                        </div>
                      )}

                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="w-full py-5 bg-white text-black font-heading text-xl uppercase tracking-[0.2em] hover:bg-neon-pink transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                      >
                         {isSaving ? <Loader2 className="animate-spin" size={24} /> : 'Update Secure Password'}
                      </button>
                   </form>

                   <div className="mt-12 p-6 border border-white/5 bg-white/[0.02]">
                      <div className="flex gap-4">
                         <Shield className="text-neon-pink flex-shrink-0" size={24} />
                         <div>
                            <h4 className="text-sm font-bold uppercase tracking-widest mb-1">Account Protection Enabled</h4>
                            <p className="text-white/40 text-xs leading-relaxed">Your account is secured with standard encryption protocols. To maintain safety, avoid using reused passwords and regularly update your credentials.</p>
                         </div>
                      </div>
                   </div>
                </div>
              )}

           </div>
        </div>
      </main>

      {/* Invoice Details Modal */}
      {selectedItem && (
         <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md p-6 flex flex-col items-center overflow-y-auto">
            <div className="absolute inset-0" onClick={() => setSelectedItem(null)}></div>
            
            <button 
              onClick={() => setSelectedItem(null)} 
              className="fixed top-6 right-6 z-[101] flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-neon-pink hover:border-neon-pink transition-all"
            >
               <X size={16} /> Close
            </button>

            <div className="w-full max-w-2xl relative z-10 animate-in zoom-in-95 duration-500 mt-16 mb-16">
              <style>{`
                @media print {
                  body * { visibility: hidden; }
                  .invoice-modal-content, .invoice-modal-content * { visibility: visible; }
                  .invoice-modal-content {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    background: white !important;
                    color: black !important;
                    }
                  .no-print { display: none !important; }
                }
              `}</style>

              <div className="invoice-modal-content bg-dark-grey border border-white/10 overflow-hidden text-left shadow-2xl">
                {/* Modal Invoice Header */}
                <div className="p-8 border-b border-white/10 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h2 className="text-3xl font-heading text-white uppercase mb-1">Electronic <span className="text-neon-pink">Invoice</span></h2>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">ID: {selectedItem.orderId}</p>
                  </div>
                  <div className="flex gap-4 no-print">
                      <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-white/10 hover:bg-neon-pink text-white px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> Print
                      </button>
                      <button 
                        onClick={() => navigate(`/order/${selectedItem.orderId}/ticket`)}
                        className="flex items-center gap-2 bg-neon-pink text-white px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all hover:bg-white hover:text-black"
                      >
                        <Ticket size={16} /> Open Pass
                      </button>
                  </div>
                </div>

                {/* Modal Invoice Body */}
                <div className="p-8 md:p-12 bg-black/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 border-b border-white/5 pb-12">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Billing Info</p>
                      <div className="space-y-1">
                        <p className="text-xl font-heading uppercase text-white">{user?.name}</p>
                        <p className="text-sm font-bold text-white/40">{user?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-4 md:text-right">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                        {selectedItem.item_type === 'ticket' ? 'E-Ticket Entry Code' : 'Collection Voucher Code'}
                      </p>
                      <div className="bg-white p-2 inline-block rounded shadow-[0_0_15px_rgba(255,0,128,0.2)]">
                         <QRCodeCanvas 
                            value={selectedItem.item_type === 'ticket' ? `KLIX-${selectedItem.orderId}-${selectedItem.ticket_type_id}` : `MERCH-${selectedItem.orderId}`} 
                            size={100}
                            bgColor="#FFFFFF"
                            fgColor="#000000"
                            level="L"
                         />
                      </div>
                      <p className="text-[8px] font-mono font-bold text-neon-pink uppercase tracking-widest mt-2 block break-all">
                        {selectedItem.item_type === 'ticket' ? `KLIX-${selectedItem.orderId?.slice(-8)}` : `MERCH-${selectedItem.orderId?.slice(-8)}`}
                      </p>
                    </div>
                  </div>

                  {/* Items List inside Modal */}
                  <div className="space-y-6">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-6">Manifest Items</p>
                    <div className="space-y-4">
                      {/* We find the full order from activeOrders based on selectedItem's orderId */}
                      {activeOrders.find(o => o.id === selectedItem.orderId)?.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                          <div>
                            <p className="text-lg font-heading text-white uppercase">{item.item_name}</p>
                            <p className="text-[10px] font-bold text-neon-pink uppercase tracking-widest">{item.item_type}</p>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Qty: {item.quantity} x {formatPrice(item.price_per_item)}</p>
                          </div>
                          <p className="text-xl font-heading text-white">{formatPrice(item.price_per_item * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total inside Modal */}
                  <div className="mt-12 pt-8 border-t-2 border-neon-pink flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.5em] mb-2">Total Value</p>
                        <div className="flex items-center gap-3">
                            <ShoppingBag className="text-neon-pink mb-1" size={24} />
                            <p className="text-5xl font-heading text-white tracking-tighter">
                                {formatPrice(activeOrders.find(o => o.id === selectedItem.orderId)?.total_amount || 0)}
                            </p>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Authorized by KLIXTICKET Payment Gateway</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default ProfilePage;
