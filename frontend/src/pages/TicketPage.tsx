import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, ArrowLeft, Printer, Calendar, MapPin, User, Hash } from 'lucide-react';
import { orderApi } from '@/services/api';
import type { Order } from '@/services/api';

const TicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!id) return;
        // orderApi uses getByID not getOrderByID
        const data = await orderApi.getByID(id);
        setOrder(data);
      } catch (err: any) {
        console.error('Failed to fetch order:', err);
        setError('UNABLE TO RETRIEVE TICKET DATA. INVOICE MIGHT BE INVALID.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-neon-pink animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black grid-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-heading text-white mb-4 uppercase tracking-widest">SYSTEM ERROR</h1>
        <p className="text-neon-pink font-bold mb-8 uppercase tracking-widest">{error || 'ORDER NOT FOUND'}</p>
        <button 
          onClick={() => navigate('/profile')}
          className="bg-white text-black px-8 py-3 font-heading text-xl uppercase tracking-widest hover:bg-neon-pink hover:text-white transition-all"
        >
          BACK TO PROFILE
        </button>
      </div>
    );
  }

  // Backend uses order_items in snake_case
  const ticketItems = (order.order_items || []).filter(item => item.item_type === 'ticket');
  const merchItems = (order.order_items || []).filter(item => item.item_type === 'merchandise');

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none; }
          body { background: white !important; color: black !important; }
          .ticket-container { border: 2px solid black !important; background: white !important; color: black !important; }
          .bg-black { background: white !important; }
          .text-white { color: black !important; }
          .text-white\/50 { color: #666 !important; }
          .bg-dark-grey { background: #f5f5f5 !important; }
          .grid-background { background-image: none !important; }
          .text-neon-pink { color: black !important; }
          .border-white\/10 { border-color: #000 !important; }
        }
        .ticket-cut-edge {
          position: relative;
        }
        .ticket-cut-edge::before, .ticket-cut-edge::after {
          content: '';
          position: absolute;
          width: 30px;
          height: 30px;
          background: black;
          border-radius: 50%;
          top: 50%;
          margin-top: -15px;
          z-index: 10;
        }
        @media print {
            .ticket-cut-edge::before, .ticket-cut-edge::after {
                background: white;
                border: 1px solid black;
            }
        }
        .ticket-cut-edge::before { left: -16px; }
        .ticket-cut-edge::after { right: -16px; }
      `}</style>
      
      <div className="min-h-screen bg-black grid-background font-sans text-white p-4 md:p-10 pb-20">
        {/* Navigation / Actions */}
        <div className="max-w-4xl mx-auto flex justify-between items-center mb-10 no-print">
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-bold uppercase tracking-widest text-sm"
          >
            <ArrowLeft size={16} /> BACK TO PROFILE
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={handlePrint}
              className="bg-white text-black px-6 py-2 flex items-center gap-2 font-heading text-lg hover:bg-neon-pink hover:text-white transition-all"
            >
              <Printer size={18} /> PRINT TICKET
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center md:text-left mb-12">
            <h1 className="text-5xl md:text-8xl font-heading uppercase tracking-tighter leading-none mb-4">
              {ticketItems.length > 0 ? (
                <>SECURE <span className="text-transparent" style={{ WebkitTextStroke: '1px white' }}>ACCESS</span> PASSPORT</>
              ) : (
                <>COLLECTION <span className="text-transparent" style={{ WebkitTextStroke: '1px white' }}>MERCH</span> VOUCHER</>
              )}
            </h1>
            <div className="w-24 h-2 bg-neon-pink" />
          </div>

          {/* MAIN TICKET SECTION (IF HAS TICKETS) */}
          {ticketItems.map((item, idx) => (
            <div key={idx} className="ticket-container bg-dark-grey border-2 border-white/10 relative overflow-hidden mb-12 transform hover:scale-[1.01] transition-transform duration-500">
              <div className="absolute top-0 right-0 p-4 border-l border-b border-white/10 bg-black/40 text-[10px] font-bold tracking-[0.3em] uppercase opacity-50 z-20">
                OFFICIAL ENTRY
              </div>

              <div className="flex flex-col md:flex-row">
                {/* Left Side: General Info */}
                <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/10 relative">
                  <div className="mb-10 flex justify-between items-start">
                    <div>
                      <p className="text-neon-pink font-bold text-xs uppercase tracking-[0.3em] mb-2">EVENT NAME</p>
                      <h2 className="text-4xl md:text-6xl font-heading uppercase tracking-tighter leading-none">{item.item_name}</h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <p className="text-white/30 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">DATE & TIME</p>
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <Calendar size={14} className="text-neon-pink" />
                          <span>VALID FOR DATE OF EVENT</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-white/30 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">LOCATION</p>
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <MapPin size={14} className="text-neon-pink" />
                          <span>OFFICIAL VENUE</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-white/30 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">HOLDER</p>
                        <div className="flex items-center gap-2 font-bold text-sm uppercase">
                          <User size={14} className="text-neon-pink" />
                          <span>CUSTOMER #{order.user_id}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-white/30 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">QUANTITY</p>
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <Hash size={14} className="text-neon-pink" />
                          <span>{item.quantity} PERSON(S)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ID NUMBER WATERMARK */}
                  <div className="absolute bottom-4 left-8 text-[8px] font-mono text-white/5 uppercase tracking-[0.5em]">
                    INV_ID:{order.id.substring(0, 18).toUpperCase()}
                  </div>
                </div>

                {/* Right Side: QR Code Area */}
                <div className="w-full md:w-64 bg-white p-8 md:p-10 flex flex-col items-center justify-center text-black ticket-cut-edge">
                  <div className="bg-white p-2">
                    <QRCodeSVG 
                      value={`KLIX-${order.id}-${item.ticket_type_id}`}
                      size={140}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-center border-t border-black/10 pt-4 w-full">
                    SCAN AT ENTRY
                  </p>
                </div>
              </div>
              
              {/* Bottom Decoration Strip */}
              <div className="h-2 w-full flex">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-neon-pink' : 'bg-white'}`}></div>
                ))}
              </div>
            </div>
          ))}

          {/* MERCHANDISE SECTION (IF HAS MERCH) */}
          {merchItems.length > 0 && (
            <div className="bg-dark-grey border-2 border-white/10 p-8 md:p-12 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 border-l border-b border-white/10 bg-black/40 text-[10px] font-bold tracking-[0.3em] uppercase opacity-50 z-20">
                MERCHANDISE RECEIPT
              </div>
              
              <h2 className="text-4xl font-heading uppercase tracking-widest mb-10">COLLECTION VOUCHER</h2>
              
              <div className="space-y-6">
                {merchItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-4 border-b border-white/10">
                    <div>
                      <p className="text-white font-bold text-lg uppercase tracking-wide">{item.item_name}</p>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">QTY: {item.quantity} UNIT(S)</p>
                    </div>
                    <div className="text-neon-pink font-bold font-mono tracking-tighter">
                      ID: {order.id.substring(0, 8).toUpperCase()}-{idx}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 flex flex-col md:flex-row gap-10 items-center justify-between">
                <div className="text-left max-w-md">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">INSTRUCTIONS</p>
                  <p className="text-xs font-bold text-white/60 leading-relaxed uppercase tracking-widest">
                    PRESENT THIS VOUCHER AT THE OFFICIAL MERCHANDISE BOOTH DURING THE EVENT AREA TO CLAIM YOUR ITEMS.
                  </p>
                </div>
                
                <div className="bg-white p-4">
                  <QRCodeSVG 
                    value={`MERCH-${order.id}`}
                    size={80}
                    level="L"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Verification Footer */}
          <div className="pt-20 text-center space-y-4 opacity-30 no-print">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em]">SYSTEM VERIFIED TICKET</p>
            <p className="text-[8px] font-mono leading-relaxed">
              SECURITY HASH: {order.id.replace(/-/g, '')}<br/>
              TIMESTAMP: {new Date().toISOString()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketPage;
