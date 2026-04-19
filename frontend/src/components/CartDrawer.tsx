import React from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className={`fixed top-0 right-0 w-full md:w-80 h-screen bg-black z-[110] flex flex-col transform transition-transform duration-500 ease-out border-l border-white/10 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header: Compact */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-neon-cyan" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">Cart ({getItemCount()})</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 border border-white/10 hover:border-white text-white/40 hover:text-white flex items-center justify-center transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* List: Smaller Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
               <ShoppingBag size={32} className="mb-4" />
               <p className="text-[10px] font-bold uppercase tracking-widest">Empty</p>
            </div>
          ) : (
            <div className="space-y-3">
               {items.map((item) => (
                 <div key={`${item.type}-${item.id}`} className="bg-dark-grey/50 border border-white/5 p-4 flex gap-4 hover:bg-white/[0.02] transition-colors group relative">
                   <div className="w-14 h-14 bg-black border border-white/10 flex-shrink-0 flex items-center justify-center text-xl group-hover:border-neon-cyan transition-colors">
                     {item.type === 'ticket' ? '🎟️' : '🛍️'}
                   </div>
                   
                   <div className="flex-1 min-w-0 flex flex-col justify-between">
                     <div className="pr-5">
                       <h4 className="text-xs font-bold uppercase text-white truncate leading-tight mb-1">{item.name}</h4>
                       <p className="text-neon-cyan text-[10px] font-bold">{formatPrice(item.price)}</p>
                     </div>
                     
                     <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center bg-black border border-white/10">
                           <button onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center hover:bg-white/5 text-[10px]">-</button>
                           <span className="w-6 text-center text-[9px] font-bold">{item.quantity}</span>
                           <button onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center hover:bg-white/5 text-[10px]">+</button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id, item.type)}
                          className="text-white/20 hover:text-neon-lime transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                     </div>
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* Footer: Compact */}
        {items.length > 0 && (
          <div className="p-6 bg-[#050505] border-t border-white/10 space-y-4">
            <div className="flex justify-between items-end">
               <div>
                  <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-1">Subtotal</p>
                  <p className="text-xl font-heading text-white tracking-tighter">{formatPrice(getTotalPrice())}</p>
               </div>
               <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest">IDR</p>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full h-12 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-neon-lime hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Checkout <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
