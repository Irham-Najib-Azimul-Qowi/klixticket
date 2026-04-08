import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { orderApi, authApi } from '@/services/api';
import { ArrowLeft, Minus, Plus, AlertCircle } from 'lucide-react';

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentUser = authApi.getUser();

  const ticketId = searchParams.get('ticketId');
  const name = searchParams.get('name') || 'Ticket';
  const priceStr = searchParams.get('price');
  const price = priceStr ? parseInt(priceStr, 10) : 0;

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Constants
  const PPN_RATE = 0.10; // 10%
  const subtotal = price * quantity;
  const ppn = subtotal * PPN_RATE;
  const total = subtotal + ppn;

  useEffect(() => {
    if (!ticketId || !price) {
      navigate('/');
    }
  }, [ticketId, price, navigate]);

  const handleCheckout = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const order = await orderApi.createOrder({
        items: [],
        ticket_items: [{
          ticket_type_id: parseInt(ticketId as string, 10),
          quantity: quantity
        }]
      });

      if (order.payment?.checkout_url) {
        window.open(order.payment.checkout_url, '_blank');
      } else {
        setError('Checkout URL tidak ditemukan dari server.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memproses pesanan. Pastikan tiket tersedia atau Anda sudah login.');
    } finally {
      setLoading(false);
    }
  };

  if (!ticketId) return null;

  return (
    <div className="min-h-screen bg-cream font-sans text-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center text-stanton hover:text-salmon font-bold uppercase tracking-wider mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Home
        </Link>

        <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-stanton mb-2">Peninjauan Pesanan</h1>
          <p className="text-gray-500 font-medium mb-8">Pastikan pesanan Anda benar sebelum melanjutkan ke pembayaran Xendit.</p>

          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 rounded-xl mb-6 flex items-center font-bold">
              <AlertCircle className="w-5 h-5 mr-2" /> {error}
            </div>
          )}

          {!currentUser && (
            <div className="bg-yellow-100 border-2 border-yellow-500 text-yellow-800 p-4 rounded-xl mb-6 font-bold flex justify-between items-center">
              <span>Anda harus login untuk membeli tiket.</span>
              <Link to="/login" className="bg-black text-white px-4 py-2 rounded uppercase text-xs">Login</Link>
            </div>
          )}

          <div className="border-2 border-gray-200 rounded-2xl p-6 mb-8">
            <h3 className="text-2xl font-black uppercase text-salmon mb-1">{name}</h3>
            <p className="font-bold text-gray-400 uppercase tracking-widest text-sm mb-6">Tiket Festival</p>
            
            <div className="flex items-center justify-between pb-6 border-b-2 border-gray-100 mb-6">
              <span className="text-xl font-bold">Harga Satuan</span>
              <span className="text-xl font-black">{formatPrice(price)}</span>
            </div>

            <div className="flex items-center justify-between pb-6 border-b-2 border-gray-100 mb-6">
              <span className="text-xl font-bold">Kuantitas</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-black w-8 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(5, quantity + 1))}
                  className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                  disabled={quantity >= 5}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-500 font-bold">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-bold">
                <span>Pajak PPN (10%)</span>
                <span>{formatPrice(ppn)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border-2 border-black">
              <span className="text-xl font-black uppercase">Total Bayar</span>
              <span className="text-3xl font-black text-discos">{formatPrice(total)}</span>
            </div>
          </div>


          <button 
            onClick={handleCheckout}
            disabled={loading || !currentUser}
            className="w-full bg-salmon text-cream border-4 border-black py-4 rounded-2xl text-xl font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Lanjutkan ke Xendit'}
          </button>
          <div className="text-center mt-4">
             <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Powered by Xendit</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
