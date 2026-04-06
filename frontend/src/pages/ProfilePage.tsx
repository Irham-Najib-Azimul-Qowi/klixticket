import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, User as UserIcon, LogOut, Loader2, Save, ArrowLeft } from 'lucide-react';
import { authApi } from '@/lib/api';
import type { User } from '@/lib/api';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authApi.getMe();
        setUser(data);
        setName(data.name);
        setEmail(data.email);
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

    fetchUser();
  }, [navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const updatedUser = await authApi.updateProfile(name, email);
      setUser(updatedUser);
      // Update session storage
      const token = localStorage.getItem('auth_token') || '';
      authApi.saveSession(token, updatedUser);
      setSuccess('Profil berhasil diperbarui!');
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

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
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
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-cream border-b-2 border-gray-300">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group cursor-pointer relative z-10">
            <Flame className="w-8 h-8 md:w-10 md:h-10 fill-salmon group-hover:scale-125 group-hover:rotate-12 transition-transform" />
            <span className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-salmon">connected</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-burgundy font-black uppercase text-sm tracking-widest hover:text-salmon transition-colors"
          >
            Logout <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
        <div className="w-full max-w-2xl bg-white border-4 border-black rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12">
          {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-stanton rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-cream" />
                )}
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-stanton leading-tight">
                  PROFIL SAYA
                </h1>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  ID: #{user?.id} • Member Since 2026
                </p>
              </div>
            </div>
            <Link to="/" className="flex items-center gap-2 text-stanton font-black uppercase text-xs tracking-widest hover:text-salmon transition-colors">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
          </div>

          {/* Success/Error Alert */}
          {error && (
            <div className="mb-8 bg-burgundy/10 border-2 border-burgundy text-burgundy px-6 py-4 rounded-2xl font-bold text-sm tracking-wide uppercase">
              ⚠ {error}
            </div>
          )}
          {success && (
            <div className="mb-8 bg-green-100 border-2 border-green-600 text-green-700 px-6 py-4 rounded-2xl font-bold text-sm tracking-wide uppercase">
              ✓ {success}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-stanton mb-3">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-cream/30 border-4 border-black rounded-2xl px-5 py-4 text-lg font-bold text-black placeholder-gray-400 focus:outline-none focus:border-salmon transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-stanton mb-3">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-cream/30 border-4 border-black rounded-2xl px-5 py-4 text-lg font-bold text-black placeholder-gray-400 focus:outline-none focus:border-salmon transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  placeholder="Masukkan email"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-stanton mb-3">
                  Peran Akun
                </label>
                <div className="w-full bg-gray-100 border-4 border-gray-300 rounded-2xl px-5 py-4 text-lg font-bold text-gray-400 uppercase tracking-widest cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(200,200,200,1)]">
                  {user?.role}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div className="bg-stanton/5 border-2 border-dashed border-stanton/30 rounded-3xl p-6 mb-8 text-center">
                <p className="text-stanton font-bold uppercase tracking-wide text-xs mb-4">Informasi Keamanan</p>
                <p className="text-gray-500 text-sm font-medium leading-relaxed italic">
                  Password hanya bisa diubah melalui fitur "Lupa Password" atau hubungi admin jika ingin mengganti kredensial utama.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-salmon text-cream border-4 border-black py-5 rounded-2xl text-2xl font-black uppercase tracking-tighter shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    Simpan Profil
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Data Summary Section */}
          <div className="mt-16 pt-12 border-t-4 border-dashed border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-cream border-4 border-black rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[10px] font-black uppercase text-stanton mb-1">Tiket Saya</p>
              <p className="text-4xl font-black text-salmon">0</p>
            </div>
            <div className="p-6 bg-cream border-4 border-black rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[10px] font-black uppercase text-stanton mb-1">Merchandise</p>
              <p className="text-4xl font-black text-stanton">0</p>
            </div>
            <div className="p-6 bg-cream border-4 border-black rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[10px] font-black uppercase text-stanton mb-1">Loyalty Points</p>
              <p className="text-4xl font-black text-discos">0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
