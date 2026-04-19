import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { authApi } from '@/services/api';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth.schema';
import logoImg from '@/assets/images/klix-logo.webp';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token,
      password: '',
      confirmPassword: '',
    }
  });

  useEffect(() => {
    if (!token) {
      setServerError('Reset token is missing or invalid.');
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) return;
    setServerError('');
    setIsLoading(true);

    try {
      await authApi.resetPassword({
        token: token,
        new_password: data.password,
        confirm_password: data.confirmPassword,
      });
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setServerError(err.message || 'Failed to reset password. Please ensure your token is still valid.');
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
      `}</style>
      <div className="min-h-screen bg-black grid-background font-sans text-white selection:bg-neon-lime selection:text-white flex flex-col overflow-x-hidden relative">
        
        {/* Background glow effects */}
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-neon-lime/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Navbar */}
        <nav className="w-full bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group cursor-pointer">
              <img src={logoImg} alt="KlixTicket Logo" className="h-12 w-auto object-contain transition-all duration-300" />
            </Link>
            <Link 
              to="/login" 
              className="flex items-center gap-3 text-white/50 hover:text-neon-lime font-bold uppercase tracking-[0.2em] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> 
              <span>CANCEL</span>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
          <div className="w-full max-w-lg">
            
            <div className="bg-dark-grey border border-white/10 p-10 md:p-14 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-lime/5 blur-3xl pointer-events-none"></div>

              {!isSuccess ? (
                <>
                  {/* Header */}
                  <div className="mb-10 text-left">
                    <h1 className="text-4xl md:text-6xl font-heading uppercase tracking-tighter text-white leading-none mb-4">
                      RESET <span className="text-outline">KEY</span>
                    </h1>
                    <div className="w-24 h-1 bg-neon-lime mb-6" />
                    <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-xs leading-relaxed">
                      ENTER A NEW PASSWORD BELOW TO SECURE YOUR ACCOUNT.
                    </p>
                  </div>

                  {serverError && (
                    <div className="mb-8 border border-neon-lime p-4 bg-neon-lime/10 flex items-center gap-4">
                      <AlertCircle className="w-6 h-6 flex-shrink-0 text-neon-lime" />
                      <span className="font-bold text-xs uppercase tracking-widest text-neon-lime flex-1">{serverError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                      <label htmlFor="password" className="block text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                        NEW PASSWORD
                      </label>
                      <div className="relative">
                        <input
                          {...register('password')}
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className={`w-full bg-black border ${errors.password ? 'border-neon-lime' : 'border-white/20'} p-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-lime transition-colors font-bold tracking-wide`}
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
                        <div className="flex items-center gap-2 mt-2 text-neon-lime">
                          <AlertCircle size={12} />
                          <p className="text-[10px] font-bold uppercase tracking-widest">{errors.password.message}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                        CONFIRM NEW PASSWORD
                      </label>
                      <input
                        {...register('confirmPassword')}
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={`w-full bg-black border ${errors.confirmPassword ? 'border-neon-lime' : 'border-white/20'} p-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-lime transition-colors font-bold tracking-wide`}
                      />
                      {errors.confirmPassword && (
                        <div className="flex items-center gap-2 mt-2 text-neon-lime">
                          <AlertCircle size={12} />
                          <p className="text-[10px] font-bold uppercase tracking-widest">{errors.confirmPassword.message}</p>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !token}
                      className="w-full bg-white text-black py-5 font-heading text-2xl uppercase tracking-widest hover:bg-neon-lime hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-8 transform hover:-rotate-1"
                    >
                      {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        'SAVE NEW KEY'
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="flex justify-center mb-10">
                    <div className="w-24 h-24 bg-neon-lime/10 rounded-full flex items-center justify-center border border-neon-lime">
                      <CheckCircle2 className="w-12 h-12 text-neon-lime" />
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-heading uppercase tracking-tighter text-white mb-6">KEY UPDATED!</h2>
                  <p className="text-white/50 font-bold uppercase tracking-widest text-xs leading-relaxed">
                    YOUR SECURITY KEY HAS BEEN SUCCESSFULLY ROLLED. REROUTING YOU TO LOGIN...
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ResetPasswordPage;
