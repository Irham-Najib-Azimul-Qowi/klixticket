import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, RefreshCcw, HelpCircle } from 'lucide-react';

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .text-outline {
          -webkit-text-stroke: 1px white;
          color: transparent;
        }
      `}</style>
      <div className="min-h-screen bg-black grid-background flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center space-y-10">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-neon-pink blur-3xl opacity-20 rounded-full" />
            <div className="relative w-32 h-32 border border-white/20 bg-dark-grey flex items-center justify-center">
              <XCircle className="w-16 h-16 text-neon-pink" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-heading uppercase tracking-tighter text-white">
              PAYMENT <span className="text-outline">FAILED</span>
            </h1>
            <p className="text-xl font-bold text-white/50 uppercase tracking-widest">TRANSACTION DENIED OR TIMED OUT</p>
          </div>

          <div className="bg-dark-grey border border-white/10 p-8 text-left space-y-6 transform hover:border-neon-pink transition-colors">
              <div className="flex items-center gap-4">
                  <HelpCircle className="w-8 h-8 text-neon-pink" />
                  <span className="font-heading uppercase text-2xl tracking-widest text-white">SYSTEM ERRORS</span>
              </div>
              <ul className="space-y-4 text-sm font-bold uppercase tracking-widest text-white/60">
                  <li className="flex items-start gap-4">
                      <span className="text-neon-pink">/</span>
                      <span>INSUFFICIENT FUNDS OR LIMIT.</span>
                  </li>
                  <li className="flex items-start gap-4">
                      <span className="text-neon-pink">/</span>
                      <span>GATEWAY CONNECTION TIMEOUT.</span>
                  </li>
              </ul>
              <p className="text-xs uppercase text-white/30 tracking-[0.2em] pt-4 border-t border-white/10 mt-6">
                NOTE: YOUR CART REMAINS INTACT FOR ANOTHER ATTEMPT.
              </p>
          </div>

          <div className="flex flex-col gap-4 pt-8 border-t border-white/10">
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-white text-black py-6 text-2xl font-heading uppercase tracking-widest hover:bg-neon-pink hover:text-white transition-all flex items-center justify-center gap-4 transform hover:-rotate-1"
            >
              RETRY PAYMENT <RefreshCcw className="w-6 h-6" />
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-transparent border border-white/20 text-white py-5 text-xl font-heading uppercase tracking-widest hover:border-white transition-all"
            >
              ABORT TO TERMINAL
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentFailed;
