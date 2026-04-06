import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Flame, ArrowLeft, Package, ShoppingCart, Loader2 } from 'lucide-react';
import { merchandiseApi, type Merchandise } from '@/services/api';

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

const MerchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [merch, setMerch] = useState<Merchandise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    merchandiseApi.getByID(Number(id))
      .then(setMerch)
      .catch(err => setError(err instanceof Error ? err.message : 'Produk tidak ditemukan'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const isOutOfStock = merch ? merch.stock === 0 : false;

  return (
    <div className="min-h-screen bg-cream font-sans text-black selection:bg-discos selection:text-cream overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-cream border-b-2 border-gray-300">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group cursor-pointer relative z-10">
            <Flame className="w-8 h-8 md:w-10 md:h-10 fill-salmon group-hover:scale-125 group-hover:rotate-12 transition-transform" />
            <span className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-salmon">connected</span>
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-stanton font-black uppercase text-sm tracking-widest hover:text-salmon transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        </div>
      </nav>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-12 h-12 animate-spin text-salmon" />
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <h2 className="text-5xl font-black uppercase tracking-tighter text-stanton mb-4">Oops!</h2>
          <p className="text-xl font-bold text-gray-500 mb-8">{error}</p>
          <Link
            to="/"
            className="inline-block bg-salmon text-cream border-4 border-black px-10 py-4 text-xl font-black uppercase tracking-tighter shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            Balik ke Home
          </Link>
        </div>
      )}

      {/* Content */}
      {!isLoading && merch && (
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: Image */}
            <div className={`relative aspect-square bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}>
              {merch.image_url ? (
                <img
                  src={merch.image_url}
                  alt={merch.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-200" />
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-burgundy text-cream px-8 py-3 border-4 border-black font-black text-2xl uppercase tracking-tighter rotate-[-15deg] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    SOLD OUT
                  </div>
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div>
              <div className="mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-salmon">Official Merchandise</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-stanton leading-tight mb-4">
                {merch.name}
              </h1>
              <div className="w-20 h-3 bg-salmon mb-6" />

              <div className="text-5xl font-black tracking-tighter text-black mb-6">
                {formatPrice(merch.price)}
              </div>

              <div className="flex items-center gap-2 mb-8">
                <Package className="w-5 h-5 text-discos" />
                <span className="font-bold uppercase text-sm tracking-widest text-gray-500">
                  Stok: {merch.stock} item
                </span>
              </div>

              <p className="text-lg text-stanton font-semibold leading-relaxed mb-10">
                {merch.description}
              </p>

              {/* Quantity */}
              {!isOutOfStock && (
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-xs font-black uppercase tracking-widest text-stanton">Jumlah:</span>
                  <div className="flex items-center border-4 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="px-5 py-3 bg-white font-black text-2xl hover:bg-gray-100 transition-colors"
                    >
                      −
                    </button>
                    <span className="px-6 py-3 bg-cream font-black text-xl border-x-4 border-black min-w-[60px] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(q => Math.min(merch.stock, q + 1))}
                      className="px-5 py-3 bg-white font-black text-2xl hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <button
                disabled={isOutOfStock}
                className={`w-full py-5 rounded-2xl text-2xl font-black uppercase tracking-tighter border-4 border-black transition-all flex items-center justify-center gap-3 ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-salmon text-cream shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                }`}
              >
                <ShoppingCart className="w-7 h-7" />
                {isOutOfStock ? 'Habis Terjual' : 'Tambah ke Keranjang'}
              </button>

              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-center">
                * Pengiriman ke seluruh Indonesia
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchDetailPage;
