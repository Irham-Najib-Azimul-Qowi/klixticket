import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, ShieldCheck, ShoppingCart, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { eventsApi, merchandiseApi, type Event, type Merchandise } from '@/services/api';
import { formatImageURL, getPlaceholderImage } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import logoImg from '@/assets/images/klix-logo.webp';
import CartDrawer from '@/components/CartDrawer';
import daveImg from '@/assets/images/lineup/paps.webp';
import g6gImg from '@/assets/images/lineup/g6g.webp';
import hakiImg from '@/assets/images/lineup/hq.webp';
import tshirtImg from '@/assets/tshirt.webp';

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

const MOCK_LINEUP = [
  { id: 9991, title: 'DAVE THE PAPS', start_date: '2026-12-01T20:00:00Z', banner_url: daveImg, location: 'MAIN STAGE', description: 'Legendary Indonesian Reggae', publish_status: 'published' },
  { id: 9992, title: 'G6G', start_date: '2026-12-02T20:00:00Z', banner_url: g6gImg, location: 'URBAN STAGE', description: 'Modern Rock Explosion', publish_status: 'published' },
  { id: 9993, title: 'HAKI', start_date: '2026-12-03T20:00:00Z', banner_url: hakiImg, location: 'INDIE STAGE', description: 'Alternative Vibes', publish_status: 'published' },
];

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart, isCartOpen, setIsCartOpen } = useCart();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [apiMerch, setApiMerch] = useState<Merchandise[]>([]);
  const [merchLoading, setMerchLoading] = useState(true);

  // Lineup drag state
  const eventScrollRef = useRef<HTMLDivElement>(null);
  const [isEventsHovered, setIsEventsHovered] = useState(false);
  const scrollPosRef = useRef(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  // Merch drag state
  const merchScrollRef = useRef<HTMLDivElement>(null);
  const [isMerchHovered, setIsMerchHovered] = useState(false);
  const merchScrollPosRef = useRef(0);
  const isMerchDragging = useRef(false);
  const merchStartX = useRef(0);
  const merchScrollLeftStart = useRef(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    eventsApi.getPublishedByID(id)
      .then(setEvent)
      .catch(err => setError(err instanceof Error ? err.message : 'Event not found'))
      .finally(() => setIsLoading(false));

    merchandiseApi.getPublic()
      .then(res => setApiMerch(res.data || []))
      .catch(() => setApiMerch([]))
      .finally(() => setMerchLoading(false));
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

  // Lineup auto-scroll effect
  useEffect(() => {
    let animationFrameId: number;
    const scroll = () => {
      const displayEvents = MOCK_LINEUP;
      if (eventScrollRef.current && !isEventsHovered && !isDragging.current && displayEvents.length > 0) {
        scrollPosRef.current -= 1.2;
        const maxScroll = eventScrollRef.current.scrollWidth / 2;
        if (scrollPosRef.current <= 0) {
          scrollPosRef.current = maxScroll;
        }
        eventScrollRef.current.scrollLeft = scrollPosRef.current;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };
    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isEventsHovered]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!eventScrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - eventScrollRef.current.offsetLeft;
    scrollLeftStart.current = eventScrollRef.current.scrollLeft;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !eventScrollRef.current) return;
    const x = e.pageX - eventScrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    eventScrollRef.current.scrollLeft = scrollLeftStart.current - walk;
    scrollPosRef.current = eventScrollRef.current.scrollLeft;
  };
  const stopDragging = () => { isDragging.current = false; };

  // Merch auto-scroll effect
  useEffect(() => {
    let animationFrameId: number;
    const scroll = () => {
      if (!isMobile && merchScrollRef.current && !isMerchHovered && !isMerchDragging.current) {
        if (apiMerch.length > 0) {
          merchScrollPosRef.current += 1.0;
          const maxScroll = merchScrollRef.current.scrollWidth / 2;
          if (merchScrollPosRef.current >= maxScroll) {
            merchScrollPosRef.current = 0;
          }
          merchScrollRef.current.scrollLeft = merchScrollPosRef.current;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };
    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isMerchHovered, apiMerch, isMobile]);

  const onMerchMouseDown = (e: React.MouseEvent) => {
    if (!merchScrollRef.current) return;
    isMerchDragging.current = true;
    merchStartX.current = e.pageX - merchScrollRef.current.offsetLeft;
    merchScrollLeftStart.current = merchScrollRef.current.scrollLeft;
  };
  const onMerchMouseMove = (e: React.MouseEvent) => {
    if (!isMerchDragging.current || !merchScrollRef.current) return;
    const x = e.pageX - merchScrollRef.current.offsetLeft;
    const walk = (x - merchStartX.current) * 2;
    merchScrollRef.current.scrollLeft = merchScrollLeftStart.current - walk;
    merchScrollPosRef.current = merchScrollRef.current.scrollLeft;
  };
  const stopMerchDragging = () => { isMerchDragging.current = false; };

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
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      <div className="min-h-screen bg-black grid-background font-sans text-white selection:bg-neon-lime selection:text-white overflow-x-hidden">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group cursor-pointer relative z-10">
              <img src={logoImg} alt="KlixTicket Logo" className="h-12 w-auto object-contain transition-all duration-300" />
            </Link>

            <div className="hidden md:flex items-center space-x-12 text-sm font-bold uppercase tracking-[0.2em]">
              <a href="#tickets" className="hover:text-neon-lime transition-colors">Tickets</a>
              <a href="#merchandise" className="hover:text-neon-lime transition-colors">Merch</a>
              <a href="#lineup" className="hover:text-neon-lime transition-colors">Line-up</a>
            </div>

            <button
              onClick={() => navigate('/')}
              className="group flex items-center gap-3 text-white/50 hover:text-neon-lime transition-colors font-bold uppercase tracking-[0.2em] text-sm"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" /> BACK TO SITE
            </button>
          </div>
        </nav>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-neon-lime">
            <Loader2 className="w-16 h-16 animate-spin" />
            <p className="font-heading text-3xl uppercase tracking-widest animate-pulse">LOADING STAGE...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
            <AlertTriangle className="w-24 h-24 text-neon-lime mb-8" />
            <h2 className="text-6xl md:text-8xl font-heading uppercase tracking-tighter text-white mb-6">EVENT <span className="text-outline">NOT FOUND</span></h2>
            <p className="text-2xl font-bold text-white/50 mb-12 uppercase tracking-[0.2em]">{error}</p>
            <Link to="/">
              <button className="bg-white text-black px-12 py-6 font-heading text-3xl tracking-widest hover:bg-neon-lime hover:text-white transition-all transform hover:-rotate-2 uppercase">
                RETURN TO LIST
              </button>
            </Link>
          </div>
        )}

        {/* Content */}
        {!isLoading && event && (
          <main className="pb-0">
            {/* Hero Banner Section */}
            <div className="relative w-full aspect-[16/9] md:aspect-[21/7] lg:aspect-[3/1] bg-dark-grey border-b border-white/10 overflow-hidden group/img">
              <img
                src={formatImageURL(event.banner_url, 'event')}
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
                    <span className="text-neon-lime font-bold tracking-[0.3em] text-sm block uppercase">
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
                    <div className="flex items-center gap-4 text-white/70 hover:text-neon-lime transition-colors">
                      <Calendar className="w-6 h-6 md:w-8 md:h-8" />
                      <span className="text-xl md:text-2xl font-bold uppercase tracking-[0.1em]">{formatDate(event.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-white/70 hover:text-neon-lime transition-colors">
                      <Clock className="w-6 h-6 md:w-8 md:h-8" />
                      <span className="text-xl md:text-2xl font-bold uppercase tracking-[0.1em]">{formatTime(event.start_date)} – {formatTime(event.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-white/70 hover:text-neon-lime transition-colors">
                      <MapPin className="w-6 h-6 md:w-8 md:h-8" />
                      <span className="text-xl md:text-2xl font-bold uppercase tracking-[0.1em]">{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details & Tickets Wrapper */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-20 pb-20">
              <div className="flex flex-col gap-24">
                
                {/* 1. Description Block */}
                <div className="w-full flex flex-col gap-16">
                  <div>
                    <h2 className="text-5xl md:text-7xl font-heading uppercase tracking-tighter text-white mb-8">
                       EVENT <span className="text-outline">DETAILS</span>
                    </h2>
                    <div className="w-32 h-1 bg-neon-lime mb-12"></div>
                    
                    <div className="text-xl md:text-2xl text-white/60 font-bold leading-relaxed whitespace-pre-line tracking-wide">
                      {event.description}
                    </div>
                  </div>

                  {/* Secure Payment Note */}
                  <div className="p-10 border border-white/10 flex items-center justify-between group hover:border-neon-lime transition-colors">
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-neon-lime/10 transition-all">
                        <ShieldCheck className="w-8 h-8 text-neon-lime" />
                      </div>
                      <div>
                        <p className="font-heading uppercase tracking-widest text-3xl mb-2">SECURE CHECKOUT</p>
                        <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">INSTANT & ENCRYPTED PAYMENTS</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Tickets Selection */}
                <div id="tickets" className="w-full relative pt-10 border-t border-white/10">
                  <div className="bg-black border border-white/10 p-10 md:p-14">
                    <h2 className="text-5xl md:text-6xl font-heading uppercase tracking-tighter text-white mb-12 flex items-center justify-between">
                       TICKETS
                       <span className="w-3 h-3 bg-neon-lime rounded-full animate-pulse"></span>
                    </h2>

                    {event.ticket_types && event.ticket_types.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {event.ticket_types.map(ticket => {
                          const isSoldOut = ticket.remaining_quota === 0;
                          const isAvailable = ticket.active_status && !isSoldOut;
                          const isPresale = ticket.name.toLowerCase().includes('presale');

                          return (
                            <div
                              key={ticket.id}
                              className={`group relative bg-dark-grey border border-white/5 p-8 transition-all ${
                                isAvailable ? 'hover:border-neon-lime cursor-pointer' : 'opacity-40 grayscale'
                              }`}
                            >
                              {isSoldOut && (
                                <div className="absolute top-0 right-0 bg-neon-lime text-white px-8 py-2 font-heading text-xl uppercase tracking-widest">
                                  SOLD OUT
                                </div>
                              )}

                              {isPresale && isAvailable && (
                                <div className="absolute top-0 left-0 bg-neon-lime text-white px-4 py-1 flex items-center gap-2 font-heading text-sm uppercase tracking-widest">
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
                                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-neon-lime mb-8">
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
                                          ? 'bg-white text-black hover:bg-neon-lime hover:text-white'
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

            {/* 3. Merch Section */}
            <section id="merchandise" className="bg-black pt-32 pb-32 relative overflow-hidden border-t border-white/10">
              <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                  <div>
                    <h2 className="text-6xl md:text-8xl font-heading leading-none tracking-tighter uppercase">
                      EVENT <span className="text-outline">MERCH</span>
                    </h2>
                    <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs mt-4">
                      WEAR THE ENERGY. OFFICIAL LIMITED EDITION DROPS
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="w-full relative select-none"
                onMouseEnter={() => setIsMerchHovered(true)}
                onMouseLeave={() => { setIsMerchHovered(false); stopMerchDragging(); }}
              >
                <div
                  ref={merchScrollRef}
                  onMouseDown={onMerchMouseDown}
                  onMouseMove={onMerchMouseMove}
                  onMouseUp={stopMerchDragging}
                  onMouseLeave={stopMerchDragging}
                  className="flex overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing gap-8 px-4 md:px-8 py-10"
                >
                  {merchLoading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={`skeleton-${i}`} className="w-[250px] md:w-[300px] flex-shrink-0">
                        <div className="bg-white/5 border border-white/10 p-4 animate-pulse">
                          <div className="w-full aspect-square bg-white/5 mb-6"></div>
                          <div className="space-y-4">
                            <div className="h-2 w-20 bg-white/10"></div>
                            <div className="h-6 w-full bg-white/10"></div>
                            <div className="h-4 w-1/2 bg-white/10"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    [...apiMerch, ...apiMerch, ...(apiMerch.length === 0 ? [1,2,3] : [])].map((item, index) => {
                      const isPlaceholder = typeof item === 'number';
                      return (
                        <div key={isPlaceholder ? `p-${index}` : `${item.id}-${index}`} className="group cursor-pointer w-[250px] md:w-[300px] flex-shrink-0">
                          <Link to={isPlaceholder ? '#' : `/merchandise/${item.id}`}>
                            <div className="bg-white/5 border border-white/10 p-6 transition-all duration-500 group-hover:bg-white/10 group-hover:border-neon-lime group-hover:-translate-y-2 shadow-xl overflow-hidden relative">
                              <div className="relative w-full aspect-square bg-black border border-white/5 overflow-hidden mb-6">
                                <img 
                                  src={isPlaceholder ? tshirtImg : formatImageURL(item.image_url)} 
                                  alt={isPlaceholder ? "Official Tee" : item.name} 
                                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 pointer-events-none scale-95 group-hover:scale-110" 
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = getPlaceholderImage(); 
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-neon-lime/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-2xl font-heading tracking-tighter group-hover:text-neon-lime transition-colors line-clamp-1 uppercase">
                                  {isPlaceholder ? 'SOUNDRENALINE TEE' : item.name}
                                </h3>
                                <div className="flex items-center justify-between pt-1">
                                   <p className="text-lg font-heading text-white/60 tracking-tighter uppercase">
                                     {isPlaceholder ? 'RP 180.000' : formatPrice(item.price)}
                                   </p>
                                   <i className="fa-solid fa-arrow-right-long text-white/20 group-hover:text-neon-lime group-hover:translate-x-2 transition-all"></i>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>

            {/* 4. Lineup Section Moved to Bottom */}
            <section id="lineup" className="bg-black pt-32 pb-40 relative overflow-hidden border-t border-white/10">
              <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                  <div>
                    <h2 className="text-6xl md:text-8xl font-heading leading-none tracking-tighter uppercase">
                      LINE-<span className="text-outline">UP</span>
                    </h2>
                    <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs mt-4">
                      THE ARTISTS DEFINING THE SOUND OF THIS EVENT
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="w-full relative select-none"
                onMouseEnter={() => setIsEventsHovered(true)}
                onMouseLeave={() => { setIsEventsHovered(false); stopDragging(); }}
              >
                <div
                  ref={eventScrollRef}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={stopDragging}
                  onMouseLeave={stopDragging}
                  className="flex overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing gap-8 px-4 md:px-8 py-4"
                >
                  {[...MOCK_LINEUP, ...MOCK_LINEUP].map((item, index) => (
                    <div key={`${item.id}-${index}`} className="group cursor-pointer w-[300px] md:w-[450px] flex-shrink-0">
                      <div className="relative w-full aspect-[16/9] bg-dark-grey border border-white/5 overflow-hidden mb-4 transition-all group-hover:border-neon-lime group-hover:-translate-y-2">
                         <img src={item.banner_url} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                          <span className="text-white font-bold tracking-[0.4em] text-xs flex items-center gap-2 uppercase">
                            WATCH PREVIEW <i className="fa-solid fa-arrow-right text-lg"></i>
                          </span>
                        </div>
                      </div>
                      <h3 className="text-3xl md:text-5xl font-heading tracking-tighter group-hover:text-neon-lime transition-colors line-clamp-1 uppercase">{item.title}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm font-heading text-white/30 uppercase tracking-tighter">
                          {item.description}
                        </span>
                        <div className="h-3 w-[1px] bg-white/10"></div>
                        <span className="text-[10px] font-bold text-neon-lime uppercase tracking-[0.2em] leading-none">
                          {item.location}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </main>
        )}
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </>
  );
};

export default EventDetailPage;
