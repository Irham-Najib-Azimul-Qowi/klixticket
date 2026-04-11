import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Ticket, QrCode, Printer, Download, Receipt } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useCart } from '@/context/CartContext';
import { orderApi } from '@/services/api';
import { type Order } from '@/types';
import logoImg from '@/assets/images/klix-logo.webp';

const PaymentSuccess: React.FC = () => {
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Robust ID detection: Check URL params first, then fallback to LocalStorage
  const orderId = searchParams.get('order_id') || 
                  searchParams.get('external_id') || 
                  searchParams.get('id') || 
                  localStorage.getItem('latest_order_id');

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        try {
          const data = await orderApi.getByID(orderId);
          setOrder(data);
        } catch (error) {
          console.error('Failed to fetch order:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchOrder();
    
    // Small delay to ensure state doesn't conflict with initial render
    const timer = setTimeout(() => {
      clearCart();
    }, 100);
    return () => clearTimeout(timer);
  }, [clearCart, orderId]);

  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black grid-background flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 mb-8 border-4 border-neon-pink border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(255,0,128,0.5)]"></div>
        <h2 className="text-2xl font-heading text-white uppercase tracking-widest animate-pulse">Synchronizing Records...</h2>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .text-outline {
          -webkit-text-stroke: 1px white;
          color: transparent;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-black grid-background flex flex-col items-center py-20 px-4">
        <div className="max-w-4xl w-full text-center space-y-12">
          
          <div className="no-print space-y-10 flex flex-col items-center">
            <Link to="/">
              <img src={logoImg} alt="KlixTicket Logo" className="h-10 w-auto object-contain mb-8" />
            </Link>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-neon-pink blur-3xl opacity-20 rounded-full" />
              <div className="relative w-32 h-32 border border-white/20 bg-dark-grey flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-neon-pink" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-heading uppercase tracking-tighter text-white">
                PAYMENT <span className="text-outline">SUCCESS</span>
              </h1>
              <p className="text-xl font-bold text-white/50 uppercase tracking-widest">TRANSACTION AUTHORIZED & SECURED</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            {/* Left Column: QR Code */}
            {orderId && (
              <div className="no-print relative group animate-in zoom-in-95 duration-700 delay-300">
                 <div className="absolute inset-0 bg-neon-pink blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                 <div className="relative bg-dark-grey border border-white/10 p-10 flex flex-col items-center h-full justify-center">
                    <div className="mb-6 flex items-center gap-3">
                       <QrCode className="text-neon-pink w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Official E-Ticket Code</span>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-[0_0_50px_rgba(255,0,128,0.15)] group-hover:shadow-[0_0_50px_rgba(255,0,128,0.25)] transition-all duration-500">
                       <QRCodeCanvas 
                          value={orderId} 
                          size={220}
                          level="H"
                          bgColor="#FFFFFF"
                          fgColor="#000000"
                       />
                    </div>
                    
                    <div className="mt-8 text-center">
                       <p className="text-neon-pink font-mono text-xs tracking-widest uppercase mb-1">{orderId}</p>
                       <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Your unique entry key</p>
                    </div>
                 </div>
              </div>
            )}

            {/* Right Column: Mini Stats or Next Steps */}
            <div className="no-print bg-dark-grey border border-white/10 p-10 text-left space-y-8 transform hover:border-neon-pink transition-colors h-full flex flex-col justify-center">
                <div className="flex items-center gap-4">
                    <Ticket className="w-10 h-10 text-neon-pink" />
                    <span className="font-heading uppercase text-3xl tracking-widest text-white">NEXT STEPS</span>
                </div>
                <ul className="space-y-5 text-sm font-bold uppercase tracking-[0.2em] text-white/60">
                    <li className="flex items-start gap-4">
                        <span className="text-neon-pink text-xl">/</span>
                        <span>CHECK YOUR PROFILE TO ACCESS YOUR E-TICKET.</span>
                    </li>
                    <li className="flex items-start gap-4">
                        <span className="text-neon-pink text-xl">/</span>
                        <span>YOUR TICKET QR CODE IS UNIQUE AND SECURE.</span>
                    </li>
                    <li className="flex items-start gap-4">
                        <span className="text-neon-pink text-xl">/</span>
                        <span>SHOW THE QR CODE AT THE GATE FOR ENTRY.</span>
                    </li>
                </ul>
            </div>
          </div>

          {/* Invoice Section */}
          {order && (
            <div id="printable-invoice" className="animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-500">
              <div className="bg-dark-grey border border-white/10 overflow-hidden text-left shadow-2xl">
                {/* Invoice Header */}
                <div className="p-8 border-b border-white/10 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h2 className="text-3xl font-heading text-white uppercase mb-1">Electronic <span className="text-neon-pink">Invoice</span></h2>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">ID: {order.id}</p>
                  </div>
                  <div className="flex gap-4 no-print">
                      <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-white/10 hover:bg-neon-pink text-white px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        <Printer size={16} /> Print
                      </button>
                      <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-neon-pink text-white px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all hover:bg-white hover:text-black"
                      >
                        <Download size={16} /> Save PDF
                      </button>
                  </div>
                </div>

                {/* Invoice Body */}
                <div className="p-8 md:p-12 bg-black/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 border-b border-white/5 pb-12">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Billing Info</p>
                      <div className="space-y-1">
                        <p className="text-xl font-heading uppercase text-white">{order.user?.name}</p>
                        <p className="text-sm font-bold text-white/40">{order.user?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-4 md:text-right">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Transaction Details</p>
                      <div className="space-y-1">
                        <p className="text-sm text-white/60 font-bold uppercase">Date: {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="text-sm text-white/60 font-bold uppercase">Status: <span className="text-neon-pink">PAID</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-6">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-6">Manifest Items</p>
                    <div className="space-y-4">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                          <div>
                            <p className="text-lg font-heading text-white uppercase">{item.item_name}</p>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Qty: {item.quantity} x {formatPrice(item.price_per_item)}</p>
                          </div>
                          <p className="text-xl font-heading text-white">{formatPrice(item.price_per_item * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mt-12 pt-8 border-t-2 border-neon-pink flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.5em] mb-2">Total Value</p>
                        <div className="flex items-center gap-3">
                            <Receipt className="text-neon-pink mb-1" size={24} />
                            <p className="text-5xl font-heading text-white tracking-tighter">
                                {formatPrice(order.total_amount)}
                            </p>
                        </div>
                    </div>
                    <div className="text-right hidden md:block flex flex-col items-end">
                        <img src={logoImg} alt="Logo" className="h-6 w-auto object-contain opacity-20 mb-2 ml-auto" />
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Authorized by KLIXTICKET Payment Gateway</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="no-print flex flex-col md:flex-row gap-4 pt-12 border-t border-white/10">
            <button 
              onClick={() => order?.id ? navigate(`/order/${order.id}/ticket`) : navigate('/profile/tickets')}
              className="flex-1 bg-white text-black py-6 text-2xl font-heading uppercase tracking-widest hover:bg-neon-pink hover:text-white transition-all flex items-center justify-center gap-4 transform hover:-rotate-1"
            >
              ACCESS TICKETS <ArrowRight className="w-6 h-6" />
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex-1 bg-transparent border border-white/20 text-white py-5 text-xl font-heading uppercase tracking-widest hover:border-white transition-all"
            >
              RETURN TO GRID
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
