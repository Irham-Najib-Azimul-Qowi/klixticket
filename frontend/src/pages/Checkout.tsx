import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { orderApi, authApi } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, Ticket, AlertCircle, ShoppingCart, Loader2, User, Info } from 'lucide-react';

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items, clearCart, getTotalPrice } = useCart();
  const currentUser = authApi.getUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Directly buying one item?
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

  const PPN_RATE = 0.11; // 11%
  const subtotal = isDirectBuy ? (directPrice * directQty) : getTotalPrice();
  const ppn = subtotal * PPN_RATE;
  const total = subtotal + ppn;

  useEffect(() => {
    if (!isDirectBuy && items.length === 0) {
      navigate('/');
    }
  }, [isDirectBuy, items, navigate]);

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

      const order = await orderApi.createOrder({
        items: [], // Legacy field
        ticket_items,
        merchandise_items,
        payment_method: 'xendit'
      });

      if (!isDirectBuy) {
        clearCart();
      }

      if (order.payment?.checkout_url) {
        window.location.href = order.payment.checkout_url;
      } else {
        setError('Checkout URL tidak ditemukan dari server.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memproses pesanan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream font-sans text-black py-12 px-4 selection:bg-discos selection:text-cream">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center text-stanton hover:text-salmon font-black uppercase tracking-wider mb-12 transition-all hover:-translate-x-1">
          <ArrowLeft className="w-6 h-6 mr-3" /> Back to Store
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left: Summary */}
          <div className="lg:col-span-7">
            <div className="mb-12">
               <h1 className="text-7xl font-black uppercase tracking-tighter text-stanton leading-none">Checkout</h1>
               <div className="flex items-center gap-4 mt-4">
                  <span className="h-1 w-24 bg-salmon"></span>
                  <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">Secure Transaction Protocol</p>
               </div>
            </div>

            {error && (
              <div className="bg-discos text-cream border-4 border-black p-6 rounded-[2rem] mb-12 flex items-center font-black uppercase text-sm italic shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <AlertCircle className="w-8 h-8 mr-4 flex-shrink-0 text-salmon" /> {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center px-4 mb-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order Items</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{checkoutItems.length} Products</span>
              </div>
              
              {checkoutItems.map((item, idx) => (
                <div key={idx} className="group flex items-center gap-6 bg-white border-4 border-black p-6 rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                  <div className="w-20 h-20 bg-cream border-4 border-black rounded-[2rem] flex items-center justify-center text-4xl group-hover:bg-salmon transition-colors">
                    {item.type === 'ticket' ? '🎟️' : '🛍️'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border border-black ${item.type === 'ticket' ? 'bg-salmon text-white' : 'bg-discos text-white'}`}>
                        {item.type}
                      </span>
                    </div>
                    <h3 className="font-black uppercase text-xl leading-tight text-stanton">{item.name}</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                      QTY: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-2xl text-stanton">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 bg-white border-4 border-black rounded-[3rem] p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase tracking-widest text-xs text-gray-400">Merchant Subtotal</span>
                   <div className="flex-1 border-b-2 border-black border-dotted mx-4 mb-1"></div>
                  <span className="font-black text-xl">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase tracking-widest text-xs text-gray-400">Government Tax (11%)</span>
                  <div className="flex-1 border-b-2 border-black border-dotted mx-4 mb-1"></div>
                  <span className="font-black text-xl">{formatPrice(ppn)}</span>
                </div>
              </div>
              
              <div className="relative pt-6">
                <div className="absolute top-0 left-0 right-0 border-t-4 border-black border-dashed opacity-20"></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                   <div className="bg-stanton text-white py-6 px-10 rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(255,107,107,1)] flex-1 w-full md:w-auto">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 block mb-1 italic">Final Amount</span>
                      <span className="text-5xl font-black tracking-tighter italic">{formatPrice(total)}</span>
                   </div>
                   <div className="flex items-center gap-3 md:pt-4">
                      <div className="text-right">
                         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Powered by</p>
                         <p className="font-black text-stanton text-xl uppercase italic">Xendit</p>
                      </div>
                      <div className="h-12 w-1 bg-black/10"></div>
                      <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                        <Info className="text-white w-6 h-6" />
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Payment Sidebar */}
          <div className="lg:col-span-5 lg:sticky lg:top-12 h-fit">
            <div className="bg-stanton text-white border-8 border-black rounded-[3.5rem] p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
              {/* Decorative element */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-salmon rounded-full opacity-10 blur-3xl"></div>
              
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-10 leading-none">
                Payment<br/><span className="text-salmon italic">Gateway</span>
              </h2>

              {!currentUser ? (
                <div className="space-y-8 relative z-10">
                  <div className="bg-white/5 border-2 border-white/10 p-6 rounded-3xl">
                     <p className="font-bold uppercase text-xs mb-2 opacity-60">Authentication Required</p>
                     <p className="font-medium text-sm text-gray-400 leading-relaxed">
                       Silakan login untuk menyimpan histori transaksi dan mendapatkan link tiket di halaman profil.
                     </p>
                  </div>
                  <Link 
                    to="/login"
                    className="group block w-full bg-cream text-stanton border-4 border-black py-6 rounded-3xl text-2xl font-black uppercase shadow-[8px_8px_0px_0px_rgba(255,107,107,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-center relative overflow-hidden"
                  >
                    <span className="relative z-10">Login to Continue</span>
                    <div className="absolute inset-0 bg-salmon translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-10"></div>
                  </Link>
                </div>
              ) : (
                <div className="space-y-8 relative z-10">
                  <div className="flex items-center gap-4 bg-white/5 p-5 rounded-3xl border-2 border-white/10 backdrop-blur-md">
                     <div className="w-14 h-14 rounded-2xl bg-salmon flex items-center justify-center border-4 border-black rotate-3">
                        <User className="text-white w-7 h-7" />
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Recipient Info</p>
                        <p className="font-black text-lg uppercase tracking-tight truncate max-w-[180px]">{currentUser.name}</p>
                        <p className="text-[10px] font-bold text-salmon/80 lowercase">{currentUser.email}</p>
                     </div>
                  </div>

                  <div className="bg-cream/5 p-6 rounded-3xl border-2 border-dashed border-white/20">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-relaxed mb-1">
                      Secure Checkout Info
                    </p>
                    <ul className="text-[10px] font-bold space-y-2 opacity-80">
                      <li className="flex items-start gap-2">
                        <span className="text-salmon">✓</span> E-Ticket dikirim instan via email
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-salmon">✓</span> Mendukung QRIS, VA, & Kartu Kredit
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-salmon">✓</span> PPN 11% sudah termasuk
                      </li>
                    </ul>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full bg-salmon text-cream border-4 border-black py-6 rounded-3xl text-3xl font-black uppercase shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 group"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin w-10 h-10" />
                        <span className="italic">Processing</span>
                      </>
                    ) : (
                      <>
                        <span>Pay Now</span>
                        <ShoppingCart className="w-10 h-10 group-hover:rotate-12 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 opacity-40">
                    <div className="h-[1px] w-8 bg-white"></div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]">
                      SSL Encrypted
                    </p>
                    <div className="h-[1px] w-8 bg-white"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Alert / Scarcity Component */}
            <div className="mt-12 group bg-yellow-400 border-4 border-black p-6 rounded-[2.5rem] flex items-center gap-5 cursor-default relative overflow-hidden">
               <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
               <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center flex-shrink-0 animate-wiggle">
                 <Ticket className="text-yellow-400 w-10 h-10" />
               </div>
               <div>
                  <p className="text-[11px] font-black uppercase leading-tight text-black mb-1">
                    Don't lose your spot!
                  </p>
                  <p className="text-[9px] font-bold text-black/60 uppercase leading-none">
                    Stok terbatas. Tiket di keranjang tidak menjamin ketersediaan.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
