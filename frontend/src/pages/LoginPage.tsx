import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '@/services/api';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // @ts-ignore
    if (window.google) {
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });
    }
  }, []);

  const triggerGoogleLogin = () => {
    // @ts-ignore
    if (window.google) {
      // @ts-ignore
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If one-tap is not displayed, try to show the account picker
          // @ts-ignore
          window.google.accounts.id.renderButton(
            document.getElementById('google-hidden-anchor'),
            { theme: 'outline', size: 'large', width: '0' }
          );
          const anchor = document.getElementById('google-hidden-anchor')?.querySelector('div[role="button"]');
          if (anchor) (anchor as HTMLElement).click();
        }
      });
    }
  };

  const handleGoogleResponse = async (response: any) => {
    console.log("Google response received:", response);
    setIsLoading(true);
    setError('');
    try {
      if (!response.credential) {
        throw new Error("No credential received from Google");
      }
      
      const res = await authApi.googleLogin(response.credential);
      console.log("Backend Google login response:", res);
      
      if (res.token && res.user) {
        authApi.saveSession(res.token, res.user);
        navigate('/');
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError(err.message || 'Gagal login via Google. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await authApi.login(email, password);
      authApi.saveSession(res.token, res.user);

      if (res.role === 'admin' || (res.user && res.user.role === 'admin')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      if (err.name === 'RequestError' && err.errors) {
        const allErrors = Object.values(err.errors).join(', ');
        setError(`Kesalahan: ${allErrors}`);
      } else {
        setError(err.message || 'Login gagal, coba lagi.');
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
            to="/register" 
            className="hidden md:block bg-white border-4 border-black px-6 py-2 rounded-2xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            Daftar Dulu →
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Card Wrapper */}
          <div className="bg-white border-4 border-black rounded-3xl p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-stanton leading-none">
                MASUK
              </h1>
              <div className="w-16 h-4 bg-salmon mx-auto mt-4 mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-tight text-[10px]">
                Akses tiket & merchandise kamu eksklusif
              </p>
            </div>

            {/* Google Login Section - CUSTOM BRUTALIST */}
            <div className="mb-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Masuk Lebih Cepat</p>
              
              <button 
                onClick={triggerGoogleLogin}
                className="w-full bg-white border-4 border-black p-4 rounded-2xl flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all group"
              >
                <div className="w-8 h-8 flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-black uppercase tracking-tighter">Sign in with Google</span>
              </button>
              
              {/* Hidden anchor for Google's own iframe if prompt fails */}
              <div id="google-hidden-anchor" className="hidden"></div>

              <div className="relative flex items-center justify-center mt-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-4 border-cream"></div>
                </div>
                <span className="relative px-6 bg-white text-[10px] font-black text-stanton uppercase tracking-[0.3em]">ATAU EMAIL</span>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-8 bg-burgundy text-white border-4 border-black p-4 rounded-2xl font-black text-xs uppercase tracking-wide flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-xl">⚠</span> {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label htmlFor="login-email" className="block text-[10px] font-black uppercase tracking-[0.2em] text-stanton mb-2 ml-1">
                  Email Terdaftar
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="kamu@email.com"
                  className="w-full bg-cream border-4 border-black rounded-2xl px-6 py-4 text-lg font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-salmon transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <div className="group">
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label htmlFor="login-password" className="block text-[10px] font-black uppercase tracking-[0.2em] text-stanton">
                    Password
                  </label>
                  <Link to="/forgot-password" hidden={isLoading} className="text-[10px] font-black uppercase text-salmon hover:underline underline-offset-4 decoration-2">
                    Lupa Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-cream border-4 border-black rounded-2xl px-6 py-4 pr-16 text-lg font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-salmon transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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

              <button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full bg-salmon text-cream border-4 border-black py-5 rounded-2xl text-2xl font-black uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Masuk Sekarang!'
                )}
              </button>
            </form>

            {/* Footer / Switch Action */}
            <div className="mt-12 pt-8 border-t-4 border-cream text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                Belum punya akun?
              </p>
              <Link 
                to="/register" 
                className="inline-block bg-stanton text-white border-4 border-black px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                Daftar Akun Baru
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
