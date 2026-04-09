import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Loader2, ArrowRight, Mail, Ticket, ShoppingBag, History, X, CheckCircle2, QrCode, Lock, Shield, UserCircle, Key, Package } from 'lucide-react';
import { authApi, orderApi } from '@/services/api';
import type { User, Order } from '@/services/api';

interface ProfilePageProps {
  tab?: 'items' | 'history' | 'account' | 'security';
}

const ProfilePage: React.FC<ProfilePageProps> = ({ tab }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState<'items' | 'history' | 'account' | 'security'>(tab || 'items');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (tab) {
      setActiveSection(tab);
    }
  }, [tab]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("FETCHING PROFILE DATA");
        const [userData, activeOrdersData, historyOrdersData] = await Promise.all([
          authApi.getMe(),
          orderApi.getMyOrders({ filter: 'active' }),
          orderApi.getMyOrders({ filter: 'history' })
        ]);
        
        setUser(userData);
        setName(userData.name || '');
        setEmail(userData.email || '');
        setActiveOrders(activeOrdersData || []);
        setHistoryOrders(historyOrdersData || []);
        
        console.log("USER ID:", userData.id);
        console.log("ACTIVE TICKETS:", activeOrdersData);
        console.log("HISTORY ORDERS:", historyOrdersData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile data');
        if (err.status === 401) {
          authApi.logout();
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);
    try {
      const updatedUser = await authApi.updateProfile(name, email);
      setUser(updatedUser);
      setSuccess('Your profile has been updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setError('');
    setSuccess('');
    setIsSaving(true);
    try {
      await authApi.changePassword({ old_password: oldPassword, new_password: newPassword });
      setSuccess('Your password has been changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
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
            <div className="w-8 h-8 bg-white text-black font-heading text-xl flex items-center justify-center">K</div>
            <span className="text-lg font-heading uppercase tracking-tighter">KlixTicket</span>
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
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            className="bg-dark-grey border border-white/5 p-6 hover:border-neon-pink transition-all cursor-pointer group flex flex-col relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                               {item.item_type === 'ticket' ? <Ticket size={80} /> : <ShoppingBag size={80} />}
                            </div>
                            <div className="flex justify-between items-start mb-10 relative z-10">
                               <div className="w-10 h-10 bg-black border border-white/10 flex items-center justify-center text-neon-pink shadow-[0_0_15px_rgba(255,0,128,0.1)] group-hover:shadow-[0_0_15px_rgba(255,0,128,0.3)] transition-all">
                                  {item.item_type === 'ticket' ? <Ticket size={20} /> : <ShoppingBag size={20} />}
                               </div>
                               <span className="text-[8px] font-black uppercase text-white px-2 py-1 bg-white/10 rounded-full tracking-widest">Ownership Confirmed</span>
                            </div>
                            <h3 className="text-xl font-heading uppercase text-white mb-8 group-hover:text-neon-pink transition-colors truncate relative z-10">{item.item_name}</h3>
                            <div className="flex items-center justify-between relative z-10">
                               <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Ref: {item.orderId?.slice(-8).toUpperCase()}</span>
                               <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/order/${item.orderId}/ticket`);
                                }}
                                className="flex items-center gap-1 text-[9px] font-black uppercase text-neon-pink tracking-widest hover:text-white transition-colors"
                               >
                                  VIEW TICKET <ArrowRight size={10} />
                               </button>
                            </div>
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
                   
                   <form onSubmit={handleUpdate} className="space-y-8">
                      <div className="space-y-2 group">
                         <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] group-focus-within:text-neon-pink transition-colors">Full Display Name</label>
                         <div className="relative">
                            <input 
                              value={name} 
                              onChange={e => setName(e.target.value)} 
                              className="w-full bg-dark-grey border border-white/10 p-4 font-heading text-xl text-white outline-none focus:border-neon-pink transition-all" 
                              placeholder="Enter your name"
                            />
                            <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-neon-pink/20 transition-colors" size={20} />
                         </div>
                      </div>
                      
                      <div className="space-y-2 group">
                         <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] group-focus-within:text-neon-pink transition-colors">Primary Contact Email</label>
                         <div className="relative">
                            <input 
                              value={email} 
                              onChange={e => setEmail(e.target.value)} 
                              className="w-full bg-dark-grey border border-white/10 p-4 font-heading text-xl text-white outline-none focus:border-neon-pink transition-all" 
                              placeholder="Enter your email"
                            />
                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-neon-pink/20 transition-colors" size={20} />
                         </div>
                      </div>

                      {(error || success) && activeSection === 'account' && (
                        <div className={`p-4 text-center font-bold text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-top-2 ${error ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/30' : 'bg-white/10 text-white border border-white/20'}`}>
                           {error || success}
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
                   
                   <form onSubmit={handleChangePassword} className="space-y-8">
                      <div className="space-y-2 group">
                         <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] group-focus-within:text-neon-pink transition-colors">Current Password</label>
                         <div className="relative">
                            <input 
                              type="password"
                              value={oldPassword} 
                              onChange={e => setOldPassword(e.target.value)} 
                              className="w-full bg-dark-grey border border-white/10 p-4 font-heading text-xl text-white outline-none focus:border-neon-pink transition-all" 
                              placeholder="••••••••"
                            />
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-neon-pink/20 transition-colors" size={20} />
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-2 group">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] group-focus-within:text-neon-pink transition-colors">New Password</label>
                            <input 
                              type="password"
                              value={newPassword} 
                              onChange={e => setNewPassword(e.target.value)} 
                              className="w-full bg-dark-grey border border-white/10 p-4 font-heading text-lg text-white outline-none focus:border-neon-pink transition-all" 
                              placeholder="Enter new"
                            />
                         </div>
                         <div className="space-y-2 group">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] group-focus-within:text-neon-pink transition-colors">Confirm New</label>
                            <input 
                              type="password"
                              value={confirmPassword} 
                              onChange={e => setConfirmPassword(e.target.value)} 
                              className="w-full bg-dark-grey border border-white/10 p-4 font-heading text-lg text-white outline-none focus:border-neon-pink transition-all" 
                              placeholder="Confirm new"
                            />
                         </div>
                      </div>

                      {(error || success) && activeSection === 'security' && (
                        <div className={`p-4 text-center font-bold text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-top-2 ${error ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/30' : 'bg-white/10 text-white border border-white/20'}`}>
                           {error || success}
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

      {/* Item Detail Modal (Standardized) */}
      {selectedItem && (
         <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl p-6 flex items-center justify-center animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={() => setSelectedItem(null)}></div>
            <div className="max-w-md w-full bg-[#111] border border-white/10 p-10 relative animate-in zoom-in-95 duration-500 shadow-[0_0_100px_rgba(0,0,0,1)]">
                <button 
                  onClick={() => setSelectedItem(null)} 
                  className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"
                >
                   <X size={24} />
                </button>
                
                <div className="space-y-10 text-center">
                   <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-neon-pink mb-4">
                         {selectedItem.item_type === 'ticket' ? <Ticket size={32} /> : <ShoppingBag size={32} />}
                      </div>
                      <h2 className="text-4xl font-heading uppercase border-b-2 border-neon-pink pb-2 inline-block mb-2">{selectedItem.item_name}</h2>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Proprietary Digital Asset</p>
                   </div>
                   
                   <div className="w-full aspect-square bg-[#050505] border border-white/5 p-8 flex items-center justify-center relative">
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
                         <QrCode size={250} />
                      </div>
                      <div className="relative z-10 p-4 bg-white rounded-lg">
                         <QrCode className="w-40 h-40 text-black" />
                      </div>
                   </div>
                   
                   <div className="p-4 bg-white/5 rounded-sm border border-white/10">
                      <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2">Identification Code</p>
                      <p className="font-mono text-neon-pink text-sm tracking-widest select-all">REF-{selectedItem.orderId?.toUpperCase()}</p>
                   </div>
                   
                   <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest leading-relaxed mb-6">
                      Present this interface at the authorized checkpoint for validation. Ownership is non-transferable via this node.
                   </p>

                   <button 
                     onClick={() => navigate(`/order/${selectedItem.orderId}/ticket`)}
                     className="w-full py-4 bg-white text-black font-heading text-lg uppercase tracking-widest hover:bg-neon-pink hover:text-white transition-all transform hover:-rotate-1"
                   >
                     OPEN OFFICIAL TICKET
                   </button>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default ProfilePage;
