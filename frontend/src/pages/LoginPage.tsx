import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/services/api';
import { loginSchema, type LoginInput } from '@/lib/validations/auth.schema';
import logoImg from '@/assets/images/klix-logo.webp';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    // @ts-ignore
    if (window.google && clientId) {
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        auto_select: false,
        use_fedcm_for_prompt: true, // Opt-in to FedCM as requested by Google
        cancel_on_tap_outside: true
      });
    } else if (!clientId) {
      console.error("VITE_GOOGLE_CLIENT_ID is not defined in environment variables");
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
    setIsLoading(true);
    setServerError('');
    try {
      if (!response.credential) {
        throw new Error("No credential received from Google");
      }
      
      const res = await authApi.googleLogin(response.credential);
      
      if (res.token && res.user) {
        authApi.saveSession(res.token, res.user);
        navigate('/');
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.message && (err.message.includes('origin') || err.message.includes('Forbidden') || err.message.includes('not allow'))) {
        setServerError(`Konfigurasi Google OAuth salah (Origin Not Allowed). Pastikan ${window.location.origin} terdaftar di Authorized JavaScript Origins pada Google Cloud Console.`);
      } else {
        setServerError(err.message || 'Failed to login via Google. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LoginInput) => {
    setServerError('');
    setIsLoading(true);
 
    try {
      const res = await authApi.login(data.email, data.password);
      authApi.saveSession(res.token, res.user);

      if (res.role === 'admin' || (res.user && res.user.role === 'admin')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      if (err.name === 'RequestError' && err.errors) {
        const allErrors = Object.values(err.errors).join(', ');
        setServerError(`Error: ${allErrors}`);
      } else {
        setServerError(err.message || 'Login failed, try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .text-outline {
          -webkit-text-stroke: 1px white;
          color: transparent;
        }
        .grid-background {
          background-image: radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.03) 1px, transparent 0);
          background-size: 32px 32px;
        }
      `}</style>
      <div className="min-h-screen bg-black grid-background font-sans text-white selection:bg-neon-pink selection:text-white flex flex-col overflow-x-hidden relative">
        
        {/* Background glow effects */}
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-neon-pink/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-neon-pink/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Navbar */}
        <nav className="w-full bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group cursor-pointer">
              <img src={logoImg} alt="KlixTicket Logo" className="h-12 w-auto object-contain transition-all duration-300" />
            </Link>
            <Link 
              to="/register" 
              className="hidden md:block bg-white text-black px-8 py-3 font-heading text-xl tracking-wider hover:bg-neon-pink hover:text-white transition-all transform hover:scale-105 uppercase"
            >
              REGISTER
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
          <div className="w-full max-w-lg">
            
            <div className="bg-dark-grey border border-white/10 p-10 md:p-14 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/5 blur-3xl pointer-events-none"></div>

              {/* Header */}
              <div className="mb-10">
                <h1 className="text-5xl md:text-7xl font-heading uppercase tracking-tighter text-white mb-4">
                  LOGIN
                </h1>
                <div className="w-24 h-1 bg-neon-pink mb-6" />
                <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-xs">
                  AUTHORIZE ACCESS TO TICKETS AND MERCH
                </p>
              </div>

              {/* Google Login Section */}
              <div className="mb-8">
                <button 
                  onClick={triggerGoogleLogin}
                  className="w-full bg-white text-black p-4 flex items-center justify-center gap-4 hover:bg-white/90 transition-all font-heading text-xl tracking-widest uppercase"
                >
                  <div className="w-6 h-6 flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  </div>
                  CONTINUE WITH GOOGLE
                </button>
                
                <div id="google-hidden-anchor" className="hidden"></div>

                <div className="relative flex items-center justify-center mt-10 mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <span className="relative px-6 bg-dark-grey text-xs font-bold text-white/30 uppercase tracking-[0.2em] z-10">OR EMAIL</span>
                </div>
              </div>

              {/* Server Error Alert */}
              {serverError && (
                <div className="mb-8 border border-neon-pink p-4 bg-neon-pink/10 flex items-center gap-4 animate-in slide-in-from-top-2">
                  <span className="text-xl text-neon-pink font-heading">ERROR</span>
                  <p className="font-bold text-[10px] uppercase tracking-widest text-neon-pink flex-1">{serverError}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                    EMAIL ADDRESS
                  </label>
                  <input
                    {...register('email')}
                    id="login-email"
                    type="email"
                    placeholder="user@example.com"
                    className={`w-full bg-black border ${errors.email ? 'border-neon-pink bg-neon-pink/5' : 'border-white/20'} p-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-pink transition-colors font-bold tracking-wide`}
                  />
                  {errors.email && (
                    <p className="text-[9px] font-black text-neon-pink uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle size={10} /> {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                      PASSWORD
                    </label>
                    <Link to="/forgot-password" hidden={isLoading} className="text-xs font-bold uppercase text-neon-pink hover:text-white transition-colors tracking-widest">
                      FORGOT?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      {...register('password')}
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full bg-black border ${errors.password ? 'border-neon-pink bg-neon-pink/5' : 'border-white/20'} p-4 pr-16 text-white placeholder-white/20 focus:outline-none focus:border-neon-pink transition-colors font-bold tracking-wide`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[9px] font-black text-neon-pink uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle size={10} /> {errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black py-5 font-heading text-2xl uppercase tracking-widest hover:bg-neon-pink hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-8 transform hover:-rotate-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      AUTHENTICATING...
                    </>
                  ) : (
                    'LOGIN'
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-white/10 text-center">
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">
                  NEW TO KLIXTICKET?
                </p>
                <Link 
                  to="/register" 
                  className="inline-block border border-white/20 text-white px-8 py-3 font-heading uppercase text-lg tracking-widest hover:border-white transition-all"
                >
                  CREATE ACCOUNT
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default LoginPage;
