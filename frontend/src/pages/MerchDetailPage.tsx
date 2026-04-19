import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, ShoppingCart, Loader2, AlertTriangle } from 'lucide-react';
import { merchandiseApi, type Merchandise } from '@/services/api';
import { formatImageURL, getPlaceholderImage } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import logoImg from '@/assets/images/klix-logo.webp';

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
  const { addToCart, setIsCartOpen, isCartOpen } = useCart();

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    merchandiseApi.getByID(Number(id))
      .then(setMerch)
      .catch(err => setError(err instanceof Error ? err.message : 'Product not found'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const isOutOfStock = merch ? merch.stock === 0 : false;

  const handleAddToCart = () => {
    if (!merch) return;
    addToCart({
      id: merch.id,
      type: 'merchandise',
      name: merch.name,
      price: merch.price,
      quantity: qty,
      image_url: merch.image_url
    });
    setIsCartOpen(true);
  };

  return (
    <>
      <style>{`
        .boxed-heading {
          display: inline-block;
          background: white;
          color: black;
          padding: 0 10px;
          line-height: 1.1;
        }
        .text-outline {
          -webkit-text-stroke: 1px white;
          color: transparent;
        }
      `}</style>
      <div className="min-h-screen bg-black grid-background font-sans text-white selection:bg-neon-lime selection:text-white overflow-x-hidden">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group cursor-pointer relative z-10">
              <img src={logoImg} alt="KlixTicket Logo" className="h-12 w-auto object-contain transition-all duration-300" />
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-3 text-white/50 hover:text-neon-lime transition-colors font-bold uppercase tracking-[0.2em] text-sm"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" /> BACK TO SHOP
            </button>
          </div>
        </nav>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-neon-lime">
            <Loader2 className="w-16 h-16 animate-spin" />
            <p className="font-heading text-3xl uppercase tracking-widest animate-pulse">LOADING MERCH...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
            <AlertTriangle className="w-24 h-24 text-neon-lime mb-8" />
            <h2 className="text-6xl md:text-8xl font-heading uppercase tracking-tighter text-white mb-6">ITEM <span className="text-outline">NOT FOUND</span></h2>
            <p className="text-2xl font-bold text-white/50 mb-12 uppercase tracking-[0.2em]">{error}</p>
            <Link to="/">
              <button className="bg-white text-black px-12 py-6 font-heading text-3xl tracking-widest hover:bg-neon-lime hover:text-white transition-all transform hover:-rotate-2 uppercase">
                RETURN TO SHOP
              </button>
            </Link>
          </div>
        )}

        {/* Content */}
        {!isLoading && merch && (
          <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-20 pb-40">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-start">
              
              {/* Left: Image Box */}
              <div className="relative aspect-square bg-dark-grey border border-white/10 group/img overflow-hidden">
                  <img
                    src={formatImageURL(merch.image_url)}
                    alt={merch.name}
                    className={`w-full h-full object-cover transition-all duration-1000 ${
                      isOutOfStock ? 'grayscale opacity-50' : 'grayscale group-hover/img:grayscale-0 group-hover/img:scale-110'
                    }`}
                    onError={(e) => { 
                      const target = e.target as HTMLImageElement;
                      target.src = getPlaceholderImage(); 
                    }}
                  />
                
                {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40 backdrop-blur-sm">
                    <div className="bg-neon-lime text-white px-12 py-4 font-heading text-4xl uppercase tracking-widest -rotate-12 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                      SOLD OUT
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Details Column */}
              <div className="flex flex-col h-full bg-black">
                <div className="mb-6 flex items-center gap-4">
                  <span className="text-neon-lime font-bold uppercase tracking-[0.3em] text-sm">OFFICIAL MERCHANDISE</span>
                  <div className="h-[1px] w-12 bg-white/20"></div>
                  <span className="text-white/30 font-bold uppercase tracking-[0.3em] text-xs">SKU: MERCH-{merch.id}</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-heading uppercase tracking-tighter text-white leading-[0.9] mb-8">
                  {merch.name}
                </h1>
                
                <div className="text-5xl md:text-6xl font-heading tracking-tighter text-white mb-12">
                  {formatPrice(merch.price)}
                </div>

                <div className="flex items-center gap-4 mb-10 text-white/50 border-b border-white/10 pb-10">
                  <Package className="w-6 h-6 text-neon-lime" />
                  <span className="font-bold uppercase tracking-[0.2em] text-sm">
                    AVAILABLE STOCK: {merch.stock}
                  </span>
                </div>

                <p className="text-xl text-white/70 font-bold leading-relaxed whitespace-pre-line tracking-wide mb-12">
                  {merch.description}
                </p>

                <div className="mt-auto">
                  {/* Quantity Selector */}
                  {!isOutOfStock && (
                    <div className="flex items-center gap-6 mb-10">
                      <span className="font-heading uppercase text-2xl tracking-widest text-white/50">QTY</span>
                      <div className="flex items-center border border-white/20 bg-dark-grey">
                        <button
                          onClick={() => setQty(q => Math.max(1, q - 1))}
                          className="px-6 py-4 text-white hover:text-neon-lime hover:bg-white/5 transition-colors font-heading text-2xl"
                        >
                          −
                        </button>
                        <span className="px-8 py-4 text-white font-heading text-3xl min-w-[80px] text-center border-x border-white/20">
                          {qty}
                        </span>
                        <button
                          onClick={() => setQty(q => Math.min(merch.stock, q + 1))}
                          className="px-6 py-4 text-white hover:text-neon-lime hover:bg-white/5 transition-colors font-heading text-2xl"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-4">
                    <button
                      disabled={isOutOfStock}
                      onClick={() => {
                        const params = new URLSearchParams();
                        params.set('merchId', String(merch.id));
                        params.set('name', merch.name);
                        params.set('price', String(merch.price));
                        params.set('qty', String(qty));
                        navigate(`/checkout?${params.toString()}`);
                      }}
                      className={`w-full py-6 font-heading text-2xl md:text-3xl uppercase tracking-widest transition-all flex items-center justify-center gap-4 ${
                        isOutOfStock
                          ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                          : 'bg-white text-black hover:bg-neon-lime hover:text-white transform hover:-rotate-1'
                      } shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all`}
                    >
                      <ShoppingCart className="w-8 h-8" />
                      {isOutOfStock ? 'OUT OF STOCK' : 'BUY IT NOW'}
                    </button>

                    {!isOutOfStock && (
                      <button
                        onClick={handleAddToCart}
                        className="w-full py-5 border border-white/20 text-white/70 font-heading text-xl md:text-2xl uppercase tracking-widest hover:border-white hover:text-white transition-colors flex items-center justify-center gap-3 bg-dark-grey/50"
                      >
                        <Package className="w-6 h-6" /> ADD TO CART
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-8 flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                    <span className="w-2 h-2 bg-neon-lime/50 rounded-full"></span>
                    NATIONWIDE SHIPPING AVAILABLE
                    <span className="w-2 h-2 bg-neon-lime/50 rounded-full"></span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </>
  );
};

export default MerchDetailPage;
