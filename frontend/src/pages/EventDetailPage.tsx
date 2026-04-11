import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, ShieldCheck, ShoppingCart, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { eventsApi, type Event } from '@/services/api';
import { formatImageURL, getPlaceholderImage } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import logoImg from '@/assets/images/klix-logo.webp';
import CartDrawer from '@/components/CartDrawer';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart, isCartOpen, setIsCartOpen } = useCart();

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    eventsApi.getPublishedByID(id)
      .then(setEvent)
      .catch(err => setError(err instanceof Error ? err.message : 'Event not found'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleAddTicket = (ticket: any) => {
    addToCart({
      id: ticket.id,
      type: 'ticket',
      name: `${event?.title} - ${ticket.name}`,
      price: ticket.price,
      quantity: 1,
      image_url: event?.banner_url
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
      <div className="min-h-screen bg-black grid-background font-sans text-white selection:bg-neon-pink selection:text-white overflow-x-hidden">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group cursor-pointer relative z-10">
              <img src={logoImg} alt="KlixTicket Logo" className="h-12 w-auto object-contain transition-all duration-300" />
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-3 text-white/50 hover:text-neon-pink transition-colors font-bold uppercase tracking-[0.2em] text-sm"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" /> BACK TO LINEUP
            </button>
          </div>
        </nav>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-neon-pink">
            <Loader2 className="w-16 h-16 animate-spin" />
            <p className="font-heading text-3xl uppercase tracking-widest animate-pulse">LOADING STAGE...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
            <AlertTriangle className="w-24 h-24 text-neon-pink mb-8" />
            <h2 className="text-6xl md:text-8xl font-heading uppercase tracking-tighter text-white mb-6">LINEUP <span className="text-outline">NOT FOUND</span></h2>
            <p className="text-2xl font-bold text-white/50 mb-12 uppercase tracking-[0.2em]">{error}</p>
            <Link to="/">
              <button className="bg-white text-black px-12 py-6 font-heading text-3xl tracking-widest hover:bg-neon-pink hover:text-white transition-all transform hover:-rotate-2 uppercase">
                RETURN TO MAP
              </button>
            </Link>
          </div>
        )}

        {/* Content */}
        {!isLoading && event && (
          <main className="pb-40">
            {/* Hero Banner Section */}
            <div className="relative w-full aspect-[16/9] md:aspect-[21/7] lg:aspect-[3/1] bg-dark-grey border-b border-white/10 overflow-hidden group/img">
              <img
                src={formatImageURL(event.banner_url)}
                alt={event.title}
                className="w-full h-full object-cover transition-all duration-1000 grayscale group-hover/img:grayscale-0 group-hover/img:scale-105"
                onError={(e) => { 
                  const target = e.target as HTMLImageElement;
                  target.src = getPlaceholderImage(); 
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                <div className="max-w-[1400px] mx-auto">
                  <div className="flex items-center gap-6 mb-6">
                    <span className="text-neon-pink font-bold tracking-[0.3em] text-sm block uppercase">
                      OFFICIAL EVENT
                    </span>
                    <div className="w-12 h-[1px] bg-white/20"></div>
                    <span className="text-white/30 font-bold uppercase tracking-[0.3em] text-xs">
                      EVT-{event.id}
                    </span>
                  </div>
                  
                  <h1 className="text-6xl md:text-9xl font-heading uppercase tracking-tighter text-white leading-[0.85] mb-10 drop-shadow-2xl">
                    {event.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-10 md:gap-16">
                    <div className="flex items-center gap-4 text-white/70 hover:text-neon-pink transition-colors">
                      <Calendar className="w-6 h-6 md:w-8 md:h-8" />
                      <span className="text-xl md:text-2xl font-bold uppercase tracking-[0.1em]">{formatDate(event.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-white/70 hover:text-neon-pink transition-colors">
                      <Clock className="w-6 h-6 md:w-8 md:h-8" />
                      <span className="text-xl md:text-2xl font-bold uppercase tracking-[0.1em]">{formatTime(event.start_date)} – {formatTime(event.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-white/70 hover:text-neon-pink transition-colors">
                      <MapPin className="w-6 h-6 md:w-8 md:h-8" />
                      <span className="text-xl md:text-2xl font-bold uppercase tracking-[0.1em]">{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details & Selection Grid */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
                
                {/* Left Column: Description */}
                <div className="lg:col-span-7 flex flex-col gap-16">
                  <div>
                    <h2 className="text-5xl md:text-7xl font-heading uppercase tracking-tighter text-white mb-8">
                       EVENT <span className="text-outline">DETAILS</span>
                    </h2>
                    <div className="w-32 h-1 bg-neon-pink mb-12"></div>
                    
                    <div className="text-xl md:text-2xl text-white/60 font-bold leading-relaxed whitespace-pre-line tracking-wide">
                      {event.description}
                    </div>
                  </div>

                  {/* Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 pt-16">
                    <div className="p-8 bg-dark-grey border border-white/5 hover:border-neon-pink transition-colors">
                      <h4 className="font-heading uppercase text-3xl mb-6 text-white tracking-widest">RULES & T&C</h4>
                      <ul className="text-sm font-bold text-white/50 space-y-4 tracking-[0.1em] uppercase">
                        <li className="flex gap-4"><span className="text-neon-pink">/</span> MIN. AGE 18+ (ID REQUIRED)</li>
                        <li className="flex gap-4"><span className="text-neon-pink">/</span> ZERO TOLERANCE DRUGS & WEAPONS</li>
                        <li className="flex gap-4"><span className="text-neon-pink">/</span> STRICTLY NO REFUNDS</li>
                      </ul>
                    </div>
                    <div className="p-8 bg-dark-grey border border-white/5 hover:border-white transition-colors">
                      <h4 className="font-heading uppercase text-3xl mb-6 text-white tracking-widest">FACILITIES</h4>
                      <ul className="text-sm font-bold text-white/50 space-y-4 tracking-[0.1em] uppercase">
                        <li className="flex gap-4"><span className="text-neon-pink">/</span> EXCLUSIVE MERCHANDISE</li>
                        <li className="flex gap-4"><span className="text-neon-pink">/</span> F&B DISTRICT</li>
                        <li className="flex gap-4"><span className="text-neon-pink">/</span> MEDICAL FIRST AID</li>
                      </ul>
                    </div>
                  </div>

                  {/* Secure Payment Note */}
                  <div className="mt-8 p-10 border border-white/10 flex items-center justify-between group hover:border-neon-pink transition-colors">
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-neon-pink/10 transition-all">
                        <ShieldCheck className="w-8 h-8 text-neon-pink" />
                      </div>
                      <div>
                        <p className="font-heading uppercase tracking-widest text-3xl mb-2">SECURE CHECKOUT</p>
                        <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">INSTANT & ENCRYPTED PAYMENTS</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Ticket Selection */}
                <div className="lg:col-span-5 relative mt-16 md:mt-0">
                  <div className="sticky top-40 bg-black border border-white/10 p-10 md:p-14">
                    <h2 className="text-5xl md:text-6xl font-heading uppercase tracking-tighter text-white mb-12 flex items-center justify-between">
                       TICKETS
                       <span className="w-3 h-3 bg-neon-pink rounded-full animate-pulse"></span>
                    </h2>

                    {event.ticket_types && event.ticket_types.length > 0 ? (
                      <div className="flex flex-col gap-6">
                        {event.ticket_types.map(ticket => {
                          const isSoldOut = ticket.remaining_quota === 0;
                          const isAvailable = ticket.active_status && !isSoldOut;
                          const isPresale = ticket.name.toLowerCase().includes('presale');

                          return (
                            <div
                              key={ticket.id}
                              className={`group relative bg-dark-grey border border-white/5 p-8 transition-all ${
                                isAvailable ? 'hover:border-neon-pink cursor-pointer' : 'opacity-40 grayscale'
                              }`}
                            >
                              {isSoldOut && (
                                <div className="absolute top-0 right-0 bg-neon-pink text-white px-8 py-2 font-heading text-xl uppercase tracking-widest">
                                  SOLD OUT
                                </div>
                              )}

                              {isPresale && isAvailable && (
                                <div className="absolute top-0 left-0 bg-neon-pink text-white px-4 py-1 flex items-center gap-2 font-heading text-sm uppercase tracking-widest">
                                  <Sparkles className="w-3 h-3" /> HOT DEAL
                                </div>
                              )}

                              <div className="mt-4">
                                <h3 className="text-3xl font-heading uppercase tracking-widest text-white mb-2">
                                  {ticket.name}
                                </h3>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-8 max-w-[80%] line-clamp-2">
                                  {ticket.description || 'General Admission 1-Day Pass'}
                                </p>

                                <div className="flex flex-col mb-10">
                                  {isPresale && (
                                    <span className="text-sm font-bold text-white/30 line-through tracking-[0.1em] mb-1">
                                       {formatPrice(ticket.price * 1.5)}
                                    </span>
                                  )}
                                  <div className="text-5xl font-heading tracking-tighter text-white">
                                    {formatPrice(ticket.price)}
                                  </div>
                                </div>

                                <div className="border-t border-white/10 pt-8 mt-auto">
                                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-neon-pink mb-8">
                                    <ShoppingCart className="w-4 h-4" />
                                    <span>AVAILABLE: {ticket.remaining_quota}</span>
                                  </div>
                                  
                                  <div className="flex flex-col gap-4">
                                    <button
                                      disabled={!isAvailable}
                                      onClick={() => {
                                        const params = new URLSearchParams();
                                        params.set('ticketId', String(ticket.id));
                                        params.set('name', `${event.title} - ${ticket.name}`);
                                        params.set('price', String(ticket.price));
                                        navigate(`/checkout?${params.toString()}`);
                                      }}
                                      className={`w-full py-5 font-heading text-2xl uppercase tracking-widest transition-all ${
                                        isAvailable
                                          ? 'bg-white text-black hover:bg-neon-pink hover:text-white'
                                          : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                                      }`}
                                    >
                                      {isSoldOut ? 'UNAVAILABLE' : 'GET TICKETS'}
                                    </button>
                                    
                                    {!isSoldOut && isAvailable && (
                                      <button
                                        onClick={() => handleAddTicket(ticket)}
                                        className="w-full py-4 border border-white/20 text-white/70 font-heading text-xl uppercase tracking-widest hover:border-white hover:text-white transition-all"
                                      >
                                        ADD TO CART
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-dark-grey border border-white/5">
                        <span className="text-6xl mb-6 block opacity-20">🎫</span>
                        <p className="text-white/40 font-heading text-2xl uppercase tracking-widest">
                          TICKETS TBA
                        </p>
                      </div>
                    )}

                    <div className="mt-12 pt-8 border-t border-white/10 flex flex-col items-center justify-center gap-4 opacity-30">
                      <span className="text-5xl font-heading tracking-tighter uppercase">KLIX<span className="text-outline">TICKET</span></span>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">AUTHORIZED TICKETING PARTNER</p>
                    </div>
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

export default EventDetailPage;
