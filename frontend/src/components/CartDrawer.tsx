import React from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getItemCount } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 w-full max-w-md h-screen bg-cream z-[70] border-l-8 border-black flex flex-col transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 border-b-4 border-black flex items-center justify-between bg-salmon text-cream">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8" />
            <h2 className="text-3xl font-black uppercase tracking-tighter">Keranjang</h2>
            <span className="bg-black text-cream px-2 py-0.5 rounded text-sm font-bold">{getItemCount()}</span>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <ShoppingBag className="w-20 h-20 mb-4" />
              <p className="text-xl font-black uppercase tracking-widest leading-none">Keranjang Kosong</p>
              <p className="font-bold text-sm mt-2 uppercase">Ayo belanja dulu!</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex gap-4 bg-white border-4 border-black p-4 rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-20 h-20 bg-stanton rounded-2xl border-2 border-black overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {item.type === 'ticket' ? '🎟️' : '🛍️'}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black uppercase text-sm leading-tight line-clamp-2">{item.name}</h3>
                    <p className="text-discos font-black text-sm mt-1">{formatPrice(item.price)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 border-2 border-black rounded-lg overflow-hidden bg-cream scale-90 -ml-2">
                      <button 
                        onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                        className="p-1 hover:bg-black/5 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                        className="p-1 hover:bg-black/5 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id, item.type)}
                      className="text-burgundy hover:scale-110 transition-transform"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t-4 border-black bg-white">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold uppercase text-gray-400">Total</span>
              <span className="text-3xl font-black text-stanton tracking-tighter">{formatPrice(getTotalPrice())}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full bg-salmon text-cream border-4 border-black py-4 rounded-2xl text-xl font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              Checkout Sekarang
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
