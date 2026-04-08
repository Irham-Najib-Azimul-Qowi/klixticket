import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/services/api';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await authApi.forgotPassword(email);
      console.log("Forgot password API response:", res);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(err.message || 'Gagal mengirim permintaan reset password. Silakan cek koneksi atau hubungi admin.');
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
            className="flex items-center gap-2 bg-white border-4 border-black px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            <span>Kembali</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Card Wrapper */}
          <div className="bg-white border-4 border-black rounded-3xl p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {!isSubmitted ? (
              <>
                {/* Header */}
                <div className="mb-10 text-center">
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-stanton leading-none">
                    LUPA PASSWORD?
                  </h1>
                  <div className="w-16 h-4 bg-salmon mx-auto mt-4 mb-4" />
                  <p className="text-gray-500 font-bold uppercase tracking-tight text-[10px] leading-relaxed">
                    Masukan email kamu untuk mendapatkan instruksi reset password.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 bg-burgundy/10 border-4 border-burgundy text-burgundy p-4 rounded-2xl font-black text-xs uppercase tracking-wide flex items-center gap-3">
                    <span className="text-lg">⚠</span> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="group">
                    <label htmlFor="forgot-email" className="block text-[10px] font-black uppercase tracking-[0.2em] text-stanton mb-2 ml-1">
                      Alamat Email
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="kamu@email.com"
                      className="w-full bg-cream border-4 border-black rounded-2xl px-6 py-4 text-lg font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-salmon transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full bg-stanton text-cream border-4 border-black py-4 rounded-2xl text-xl font-black uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      'Kirim Instruksi'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-stanton mb-4">Email Dikirim!</h2>
                <p className="text-gray-500 font-bold uppercase tracking-wide text-xs mb-10 leading-relaxed">
                  Jika akun dengan <span className="text-salmon">{email}</span> tersedia, kami telah mengirimkan link untuk mereset password kamu.
                </p>

                <Link
                  to="/login"
                  className="inline-flex w-full bg-salmon text-cream border-4 border-black py-4 rounded-2xl text-xl font-black uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" /> Kembali Ke Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
