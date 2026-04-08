import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, User as UserIcon, LogOut, Loader2, Save, ArrowLeft, Mail, ShieldCheck, Ticket, ShoppingBag, Star, Edit3, X } from 'lucide-react';
import { authApi, orderApi } from '@/services/api';
import type { User, Order } from '@/services/api';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const editFormRef = React.useRef<HTMLDivElement>(null);
  const passwordFormRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to form when editing starts
  useEffect(() => {
    if (isEditing && editFormRef.current) {
      editFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (isChangingPassword && passwordFormRef.current) {
      passwordFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isEditing, isChangingPassword]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, ordersData] = await Promise.all([
          authApi.getMe(),
          orderApi.getMyOrders()
        ]);
        setUser(userData);
        setName(userData.name);
        setEmail(userData.email);
        setOrders(ordersData || []);
      } catch (err: any) {
        setError(err.message || 'Gagal mengambil data profil');
        if (err.status === '401') {
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
      const token = localStorage.getItem('auth_token') || '';
      authApi.saveSession(token, updatedUser);
      setSuccess('Profil berhasil diperbarui!');
      setIsEditing(false);
    } catch (err: any) {
      if (err.name === 'RequestError' && err.errors) {
        const allErrors = Object.values(err.errors).join(', ');
        setError(`Kesalahan: ${allErrors}`);
      } else {
        setError(err.message || 'Gagal memperbarui profil');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setIsSaving(true);
    try {
      await authApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      setSuccess('Password berhasil diubah!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setName(user?.name || '');
    setEmail(user?.email || '');
    setError('');
    setSuccess('');
  };

  const handleCancelPassword = () => {
    setIsChangingPassword(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-salmon" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream font-sans text-black selection:bg-discos selection:text-cream overflow-x-hidden flex flex-col">
      {/* Navbar Minimalis */}
      <nav className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b-4 border-black">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group cursor-pointer relative z-10">
            <Flame className="w-8 h-8 md:w-10 md:h-10 fill-salmon group-hover:scale-125 group-hover:rotate-12 transition-transform" />
            <span className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-salmon">connected</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="bg-white border-4 border-black px-4 sm:px-6 py-3 rounded-2xl font-black uppercase text-[10px] sm:text-sm tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex items-center gap-3 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
              <span className="hidden sm:inline">Home</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="bg-burgundy text-white border-4 border-black px-4 sm:px-6 py-3 rounded-2xl font-black uppercase text-[10px] sm:text-sm tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex items-center gap-3 group"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> 
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Konten Utama - Single Unified Card */}
      <main className="flex-1 px-4 py-8 md:py-20 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white border-4 border-black rounded-[40px] shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          
          {/* Section Header & Identity */}
          <div className="bg-stanton p-8 md:p-12 text-cream border-b-4 border-black relative">
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              {/* Avatar Area */}
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-cream rounded-full flex items-center justify-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] overflow-hidden transition-transform group-hover:scale-105">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-16 h-16 md:w-20 md:h-20 text-stanton" />
                  )}
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="absolute bottom-0 right-0 bg-salmon text-white p-3 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* User Basic Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <span className="bg-salmon text-white px-3 py-1 rounded-lg border-2 border-black font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {user?.role}
                  </span>
                  <p className="text-cream/60 font-bold uppercase tracking-widest text-[10px]">
                    ID: #{user?.id} • SEJAK 2026
                  </p>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-none mb-3">
                  {user?.name}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2 text-cream/80">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span className="text-lg md:text-xl font-bold truncate max-w-full">{user?.email}</span>
                </div>
              </div>
            </div>
            
            {/* Dekorasi Abstract */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-salmon/10 rounded-full -translate-y-32 translate-x-32 blur-3xl pointer-events-none"></div>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            {/* Row Statistik (Internal Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-cream border-4 border-black rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
                <div className="bg-salmon/20 p-3 rounded-2xl mb-4 border-2 border-black">
                  <Ticket className="w-8 h-8 text-salmon" />
                </div>
                <p className="text-xl font-black text-stanton tracking-tighter uppercase mb-1">Tiket Saya</p>
                <p className="text-4xl font-black text-black">
                  {orders.reduce((acc, o) => acc + (o.order_items?.length || 0), 0)}
                </p>
              </div>
              
              <div className="p-6 bg-cream border-4 border-black rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
                <div className="bg-stanton/20 p-3 rounded-2xl mb-4 border-2 border-black">
                  <ShoppingBag className="w-8 h-8 text-stanton" />
                </div>
                <p className="text-xl font-black text-stanton tracking-tighter uppercase mb-1">Order</p>
                <p className="text-4xl font-black text-black">{orders.length}</p>
              </div>
              
              <div className="p-6 bg-cream border-4 border-black rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
                <div className="bg-discos/20 p-3 rounded-2xl mb-4 border-2 border-black">
                  <Star className="w-8 h-8 text-discos" />
                </div>
                <p className="text-xl font-black text-stanton tracking-tighter uppercase mb-1">Points</p>
                <p className="text-4xl font-black text-black">
                  {Math.floor(orders.reduce((acc, o) => acc + (o.total_amount || 0), 0) / 10000)}
                </p>
              </div>
            </div>

            {/* Alert Area */}
            {(error || success) && (
              <div className={`p-5 border-4 border-black rounded-2xl font-black uppercase text-sm tracking-tight ${error ? 'bg-burgundy text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-green-100 text-green-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>
                {error ? `⚠ ${error}` : `✓ ${success}`}
              </div>
            )}

            {/* Detail Information / Form Area */}
            <div ref={editFormRef} className="pt-4 space-y-12">
              <section>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-stanton mb-8 flex items-center gap-3">
                  {isEditing ? <Edit3 className="w-8 h-8" /> : <UserIcon className="w-8 h-8" />}
                  {isEditing ? 'Perbarui Profil' : 'Informasi Akun'}
                </h2>

                <form onSubmit={handleUpdate} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-stanton mb-3 ml-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className={`w-full bg-cream border-4 border-black rounded-2xl px-6 py-5 text-xl font-black text-black focus:outline-none focus:border-salmon transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:shadow-none`}
                        placeholder="Masukkan nama lengkap"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-stanton mb-3 ml-1">
                        Alamat Email
                      </label>
                      <input
                        type="email"
                        disabled={!isEditing}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={`w-full bg-cream border-4 border-black rounded-2xl px-6 py-5 text-xl font-black text-black focus:outline-none focus:border-salmon transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:shadow-none`}
                        placeholder="Masukkan email"
                        required
                      />
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 bg-salmon text-white border-4 border-black py-6 rounded-3xl text-2xl font-black uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-60 flex items-center justify-center gap-4"
                      >
                        {isSaving ? <Loader2 className="w-8 h-8 animate-spin" /> : <Save className="w-8 h-8" />}
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="bg-white text-black border-4 border-black px-10 py-6 rounded-3xl text-2xl font-black uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-4"
                      >
                        <X className="w-8 h-8" /> Batal
                      </button>
                    </div>
                  ) : null}
                </form>
              </section>

              {/* Password Section */}
              <section ref={passwordFormRef} className="pt-8 border-t-4 border-black/5">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-stanton mb-8 flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8" />
                  Keamanan & Password
                </h2>

                {isChangingPassword ? (
                  <form onSubmit={handleChangePassword} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-black uppercase tracking-widest text-stanton mb-3 ml-1">
                          Password Lama
                        </label>
                        <input
                          type="password"
                          value={oldPassword}
                          onChange={e => setOldPassword(e.target.value)}
                          className="w-full bg-cream border-4 border-black rounded-2xl px-6 py-5 text-xl font-black text-black focus:outline-none focus:border-salmon transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-stanton mb-3 ml-1">
                          Password Baru
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="w-full bg-cream border-4 border-black rounded-2xl px-6 py-5 text-xl font-black text-black focus:outline-none focus:border-salmon transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-stanton mb-3 ml-1">
                          Konfirmasi Password Baru
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full bg-cream border-4 border-black rounded-2xl px-6 py-5 text-xl font-black text-black focus:outline-none focus:border-salmon transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 bg-stanton text-white border-4 border-black py-6 rounded-3xl text-2xl font-black uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-60 flex items-center justify-center gap-4"
                      >
                        {isSaving ? <Loader2 className="w-8 h-8 animate-spin" /> : <ShieldCheck className="w-8 h-8" />}
                        {isSaving ? 'Memperbarui...' : 'Ganti Password'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelPassword}
                        className="bg-white text-black border-4 border-black px-10 py-6 rounded-3xl text-2xl font-black uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-4"
                      >
                        <X className="w-8 h-8" /> Batal
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-cream border-4 border-black rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-start gap-5">
                      <div className="bg-stanton/10 p-4 rounded-2xl border-2 border-black/10 hidden sm:block">
                        <ShieldCheck className="w-10 h-10 text-stanton" />
                      </div>
                      <div>
                        <p className="text-xl font-black uppercase tracking-tighter text-stanton mb-2">Ganti Kata Sandi</p>
                        <p className="text-gray-500 font-bold text-sm max-w-md">
                          Kami menyarankan Anda untuk mengganti password secara berkala untuk menjaga keamanan akun.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsChangingPassword(true);
                        setIsEditing(false);
                      }}
                      className="bg-white text-black border-4 border-black px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex-shrink-0"
                    >
                      Ubah Password
                    </button>
                  </div>
                )}
              </section>
              {/* Recent Orders Section */}
              <section className="pt-8 border-t-4 border-black/5">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-stanton mb-8 flex items-center gap-3">
                  <ShoppingBag className="w-8 h-8" />
                  Pesanan Terbaru
                </h2>
                
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="p-12 border-4 border-black border-dashed rounded-3xl text-center opacity-40">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-4" />
                      <p className="font-black uppercase">Belum ada pesanan</p>
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="bg-cream border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center text-2xl ${order.status?.toLowerCase() === 'paid' ? 'bg-green-400' : order.status?.toLowerCase() === 'expired' ? 'bg-burgundy text-white' : 'bg-yellow-400'}`}>
                            {order.status?.toLowerCase() === 'paid' ? '✅' : order.status?.toLowerCase() === 'expired' ? '❌' : '⏳'}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Order #{order.id.slice(0, 8)}</p>
                            <h3 className="font-black text-sm uppercase">
                              {order.order_items?.[0]?.item_name || 'Item'} 
                              {(order.order_items?.length || 0) > 1 && ' ...'}
                            </h3>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between md:justify-end gap-10">
                          <div className="text-right">
                             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total</p>
                             <p className="font-black text-lg">
                               {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.total_amount)}
                             </p>
                          </div>
                          <span className={`px-4 py-1 rounded-full border-2 border-black text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                            order.status?.toLowerCase() === 'paid' ? 'bg-green-100 text-green-700' : 
                            order.status?.toLowerCase() === 'expired' ? 'bg-burgundy/10 text-burgundy' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
