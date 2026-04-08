import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '@/services/api';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.register(name, email, password);
      // Backend returns empty token for register now. If user should be auto-logged in,
      // we'd need the token. For now, redirect to login with success.
      if (res.token) {
        authApi.saveSession(res.token, res.user);
        navigate('/');
      } else {
        setError('Registrasi berhasil! Silakan login.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err: any) {
      if (err.name === 'RequestError' && err.errors) {
        // Gabungkan semua error menjadi satu pesan
        const allErrors = Object.values(err.errors).join(', ');
        setError(`Kesalahan: ${allErrors}`);
      } else {
        setError(err.message || 'Registrasi gagal, coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream font-sans text-black selection:bg-discos selection:text-cream flex flex-col overflow-x-hidden">
      {/* Navbar - Simplified and Safe */}
      <nav className="w-full bg-cream border-b-4 border-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <Flame className="w-8 h-8 md:w-10 md:h-10 fill-salmon group-hover:scale-110 group-hover:rotate-6 transition-all" />
            <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-stanton">Connected</span>
          </Link>
          <Link 
            to="/login" 
            className="hidden md:block bg-white border-4 border-black px-6 py-2 rounded-2xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            Masuk Sekarang →
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Card Wrapper */}
          <div className="bg-white border-4 border-black rounded-3xl p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {/* Header */}
            <div className="mb-10 text-center">
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-stanton leading-none">
                DAFTAR
              </h1>
              <div className="w-16 h-4 bg-salmon mx-auto mt-4 mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-tight text-xs">
                Buat akun & amankan tiketmu sekarang
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-burgundy/10 border-4 border-burgundy text-burgundy p-4 rounded-2xl font-black text-xs uppercase tracking-wide flex items-center gap-3">
                <span className="text-xl">⚠</span> {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="group">
                <label htmlFor="register-name" className="block text-[10px] font-black uppercase tracking-[0.2em] text-stanton mb-1 ml-1">
                  Nama Lengkap
                </label>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Nama kamu"
                  className="w-full bg-cream border-4 border-black rounded-2xl px-6 py-3.5 text-lg font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-salmon transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <div className="group">
                <label htmlFor="register-email" className="block text-[10px] font-black uppercase tracking-[0.2em] text-stanton mb-1 ml-1">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="kamu@email.com"
                  className="w-full bg-cream border-4 border-black rounded-2xl px-6 py-3.5 text-lg font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-salmon transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <div className="group">
                <label htmlFor="register-password" className="block text-[10px] font-black uppercase tracking-[0.2em] text-stanton mb-1 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Min. 8 karakter"
                    className="w-full bg-cream border-4 border-black rounded-2xl px-6 py-3.5 pr-16 text-lg font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-salmon transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              <div className="group">
                <label htmlFor="register-confirm-password" className="block text-[10px] font-black uppercase tracking-[0.2em] text-stanton mb-1 ml-1">
                  Konfirmasi Password
                </label>
                <input
                  id="register-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Ulangi password"
                  className="w-full bg-cream border-4 border-black rounded-2xl px-6 py-3.5 text-lg font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-salmon transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <button
                id="register-submit"
                type="submit"
                disabled={isLoading}
                className="w-full bg-salmon text-cream border-4 border-black py-4 rounded-2xl text-2xl font-black uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin" />
                    Mendaftar...
                  </>
                ) : (
                  'Daftar Sekarang!'
                )}
              </button>
            </form>

            {/* Footer / Switch Action */}
            <div className="mt-10 pt-6 border-t-4 border-cream text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                Sudah punya akun?
              </p>
              <Link 
                to="/login" 
                className="inline-block bg-stanton text-white border-4 border-black px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                Masuk Di Sini
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
