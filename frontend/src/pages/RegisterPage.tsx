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
    <div className="min-h-screen bg-cream font-sans text-black selection:bg-discos selection:text-cream overflow-x-hidden flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-cream border-b-2 border-gray-300">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group cursor-pointer relative z-10">
            <Flame className="w-8 h-8 md:w-10 md:h-10 fill-salmon group-hover:scale-125 group-hover:rotate-12 transition-transform" />
            <span className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-salmon">connected</span>
          </Link>
          <Link to="/login" className="text-stanton font-black uppercase text-sm tracking-widest hover:text-salmon transition-colors">
            Sudah punya akun →
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 md:py-20">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-stanton leading-tight">
              DAFTAR
            </h1>
            <div className="w-20 h-3 bg-salmon mt-4 mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-wide text-sm">
              Buat akun & amankan tiketmu sekarang
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-burgundy/10 border-2 border-burgundy text-burgundy px-5 py-4 rounded-2xl font-bold text-sm uppercase tracking-wide">
              ⚠ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="register-name" className="block text-xs font-black uppercase tracking-widest text-stanton mb-2">
                Nama Lengkap
              </label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Nama kamu"
                className="w-full bg-white border-4 border-black rounded-2xl px-5 py-4 text-lg font-bold text-black placeholder-gray-300 focus:outline-none focus:border-salmon transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="block text-xs font-black uppercase tracking-widest text-stanton mb-2">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="kamu@email.com"
                className="w-full bg-white border-4 border-black rounded-2xl px-5 py-4 text-lg font-bold text-black placeholder-gray-300 focus:outline-none focus:border-salmon transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block text-xs font-black uppercase tracking-widest text-stanton mb-2">
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
                  className="w-full bg-white border-4 border-black rounded-2xl px-5 py-4 pr-16 text-lg font-bold text-black placeholder-gray-300 focus:outline-none focus:border-salmon transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-stanton transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="block text-xs font-black uppercase tracking-widest text-stanton mb-2">
                Konfirmasi Password
              </label>
              <input
                id="register-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="Ulangi password"
                className="w-full bg-white border-4 border-black rounded-2xl px-5 py-4 text-lg font-bold text-black placeholder-gray-300 focus:outline-none focus:border-salmon transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={isLoading}
              className="w-full bg-salmon text-cream border-4 border-black py-5 rounded-2xl text-2xl font-black uppercase tracking-tighter shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Mendaftar...
                </>
              ) : (
                'Daftar Sekarang!'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm font-bold text-gray-400 uppercase tracking-wide">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-stanton hover:text-salmon transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
