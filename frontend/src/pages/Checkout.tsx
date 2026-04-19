import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { orderApi, authApi, taxApi } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { User, ShieldCheck, Lock, ChevronRight, Loader2 } from 'lucide-react';
import type { Tax } from '@/types';

import logoImg from '@/assets/images/klix-logo.webp';

const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items, getTotalPrice } = useCart();
  const currentUser = authApi.getUser();

  const [loading, setLoading] = useState(false);
  const [fetchingTaxes, setFetchingTaxes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTaxes, setActiveTaxes] = useState<Tax[]>([]);


  const directTicketId = searchParams.get('ticketId');
  const directMerchId = searchParams.get('merchId');
  const directName = searchParams.get('name') || 'Item';
  const directPriceStr = searchParams.get('price');
  const directPrice = directPriceStr ? parseInt(directPriceStr, 10) : 0;
  const directQtyStr = searchParams.get('qty');
  const directQty = directQtyStr ? parseInt(directQtyStr, 10) : 1;

  const isDirectBuy = !!(directTicketId || directMerchId);
  const checkoutItems = isDirectBuy 
    ? [{ 
        id: parseInt((directTicketId || directMerchId) as string), 
        type: (directTicketId ? 'ticket' : 'merchandise') as 'ticket' | 'merchandise', 
        name: directName, 
        price: directPrice, 
        quantity: directQty 
      }] 
    : items;

  const subtotal = isDirectBuy ? (directPrice * directQty) : getTotalPrice();
  
  // Dynamic Tax Calculation
  const taxLines = activeTaxes.map(tax => ({
    name: tax.name,
    rate: tax.percentage,
    amount: (tax.percentage / 100) * subtotal
  }));
  
  const totalTax = taxLines.reduce((sum, line) => sum + line.amount, 0);
  const total = subtotal + totalTax;

  useEffect(() => {
    fetchTaxes();
    if (!isDirectBuy && items.length === 0) {
      navigate('/');
    }
  }, [isDirectBuy, items, navigate]);

  const fetchTaxes = async () => {
    try {
      const taxes = await taxApi.getActiveTaxes();
      setActiveTaxes(taxes);
    } catch (err) {
      console.error("Failed to fetch taxes", err);
    } finally {
      setFetchingTaxes(false);
    }
  };


  const handleCheckout = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ticket_items = checkoutItems
        .filter(i => i.type === 'ticket')
        .map(i => ({ ticket_type_id: i.id as number, quantity: i.quantity }));
      
      const merchandise_items = checkoutItems
        .filter(i => i.type === 'merchandise')
        .map(i => ({ merchandise_id: i.id as number, quantity: i.quantity }));

      const idempotencyKey = `ord_${currentUser.id}_${Date.now()}`;

      const orderData = await orderApi.createOrder({
        items: [],
        ticket_items,
        merchandise_items,
        payment_method: 'xendit',
        idempotency_key: idempotencyKey
      });

      if (orderData.payment?.checkout_url) {
        // Fallback: simpan order ID di localStorage jika redirect param nanti hilang
        localStorage.setItem('latest_order_id', orderData.id);
        window.location.href = orderData.payment.checkout_url;
      } else {
        setError('Failed to generate payment link. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating your order.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6 selection:bg-neon-lime">
        <div className="w-20 h-20 mb-10 border-4 border-neon-lime border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(255,0,128,0.3)]"></div>
        <h1 className="text-4xl font-heading text-white mb-2 uppercase tracking-widest">Processing Transaction</h1>
        <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Do not close this window...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .grid-background {
          background-image: radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.03) 1px, transparent 0);
          background-size: 32px 32px;
        }
      `}</style>
      <div className="min-h-screen bg-black grid-background text-white font-sans selection:bg-neon-lime pb-32">
        <header className="fixed top-0 left-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-4 group">
               <img src={logoImg} alt="KlixTicket Logo" className="h-10 w-auto object-contain" />
               <span className="text-2xl font-heading uppercase tracking-tighter hidden md:inline">Synchronizing Order</span>
            </Link>
            <div className="flex items-center gap-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
               <Lock size={14} className="text-neon-lime" /> Secure Infrastructure Active
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 pt-32 md:pt-40">
          {error && (
            <div className="mb-12 bg-neon-lime text-white p-6 border-l-8 border-black font-heading text-xl uppercase tracking-widest animate-in slide-in-from-top duration-300">
               {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8 xl:gap-16">
            
            {/* Main Content Area (Left) */}
            <div className="flex-1 space-y-8">
              
              {/* Step 1: Items */}
              <div className="bg-dark-grey border border-white/5 rounded-sm">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <span className="w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center text-xs">01</span>
                     <h2 className="text-xl font-bold uppercase tracking-[0.2em]">Review Selection</h2>
                  </div>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{checkoutItems.length} ITEM(S)</span>
                </div>
                <div className="divide-y divide-white/5">
                  {checkoutItems.map((item, idx) => (
                    <div key={idx} className="p-8 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-black border border-white/10 flex items-center justify-center text-3xl group-hover:border-neon-lime transition-colors">
                           {item.type === 'ticket' ? '🎟️' : '🛍️'}
                        </div>
                        <div>
                           <p className="font-heading uppercase text-xl text-white group-hover:text-neon-lime transition-colors">{item.name}</p>
                           <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">QTY: {item.quantity} // TYPE: {item.type}</p>
                        </div>
                      </div>
                      <p className="text-2xl font-heading text-white">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Information */}
              <div className="bg-dark-grey border border-white/5 rounded-sm">
                <div className="p-8 border-b border-white/5 flex items-center gap-4">
                   <span className="w-8 h-8 rounded-full bg-neon-lime text-white font-bold flex items-center justify-center text-xs">02</span>
                   <h2 className="text-xl font-bold uppercase tracking-[0.2em]">Delivery Identity</h2>
                </div>
                <div className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center text-white/20">
                         <User size={32} />
                      </div>
                      <div>
                         <p className="text-2xl font-heading uppercase text-white leading-none mb-2">{currentUser?.name}</p>
                         <p className="text-sm font-bold text-white/30 uppercase tracking-widest">{currentUser?.email}</p>
                      </div>
                   </div>
                   <div className="px-5 py-2 grow-0 bg-white/5 border border-white/5 rounded-full flex items-center gap-3">
                      <div className="w-2 h-2 bg-neon-lime rounded-full animate-pulse shadow-[0_0_10px_#A8FF3C]" />
                      <span className="text-[10px] font-bold text-neon-lime uppercase tracking-widest">Identity Confirmed</span>
                   </div>
                </div>
              </div>


            </div>

            {/* Sidebar (Right) */}
            <div className="w-full lg:w-[400px] xl:w-[450px]">
              <div className="sticky top-32 space-y-6">
                <div className="bg-dark-grey border border-white/10 p-10 overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-neon-lime/5 rounded-full blur-[60px]" />
                   <h2 className="text-2xl font-bold uppercase tracking-widest mb-10 border-b border-white/5 pb-6">Payment Finalization</h2>
                   
                   <div className="space-y-4 mb-10">
                      <div className="flex justify-between items-center text-white/40 text-xs font-bold uppercase tracking-widest">
                         <span>Subtotal</span>
                         <span>{formatPrice(subtotal)}</span>
                      </div>
                      
                      {fetchingTaxes ? (
                        <div className="flex justify-center py-2">
                          <Loader2 size={16} className="animate-spin text-white/20" />
                        </div>
                      ) : (
                        taxLines.map((line, idx) => (
                          <div key={idx} className="flex justify-between items-center text-white/40 text-[10px] font-bold uppercase tracking-widest border-t border-white/5 pt-3 mt-1">
                            <span>{line.name} ({line.rate}%)</span>
                            <span>{formatPrice(line.amount)}</span>
                          </div>
                        ))
                      )}

                      <div className="pt-6 mt-6 border-t border-white/10 flex flex-col items-center">
                         <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mb-4">Total Manifest Value</p>
                         <p className="text-7xl font-heading text-neon-lime tracking-tighter leading-none border-b-8 border-neon-lime pb-2 mb-4">
                           {total < 1000000 ? formatPrice(total) : `IDR ${(total/1000).toLocaleString()}K`}
                         </p>
                         <p className="text-xs font-bold text-white/60 tracking-widest">{formatPrice(total)} FULL_SYNC</p>
                      </div>
                   </div>


                   <button 
                     onClick={handleCheckout}
                     disabled={loading || !currentUser}
                     className="w-full bg-white text-black py-7 font-heading text-3xl uppercase tracking-widest border border-black hover:bg-neon-lime hover:text-white transition-all transform active:translate-x-1 active:translate-y-1 shadow-[10px_10px_0px_0px_#111] hover:shadow-none disabled:opacity-20 flex items-center justify-center gap-4 group"
                   >
                     <span>Buy Now</span>
                     <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                   </button>
                   
                   <div className="mt-10 flex flex-col items-center gap-3 opacity-20">
                      <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest">
                         <ShieldCheck size={14} /> Encrypted Gateway Secure
                      </div>
                      <p className="text-[8px] font-bold uppercase text-center leading-relaxed max-w-[200px]">All transactions are authorized securely. Protocol v1.4 established.</p>
                   </div>
                </div>
                
                <Link to="/" className="w-full h-16 border border-white/10 hover:border-white transition-all flex items-center justify-center text-xs font-bold uppercase tracking-[0.4em] text-white/30 hover:text-white">
                  Abort & Return
                </Link>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default Checkout;
