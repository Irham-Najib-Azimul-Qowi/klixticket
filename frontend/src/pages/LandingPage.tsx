// Icons provided by FontAwesome CDN in index.html
import { eventsApi, merchandiseApi, authApi, type Event, type Merchandise } from '@/services/api';
import { formatImageURL } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '@/assets/images/klix-logo.webp';
import tshirtImg from '@/assets/tshirt.webp';
import thePapsAudio from '@/assets/audio/perlahan-tenang.mp3';
import daveImg from '@/assets/images/lineup/paps.webp';
import g6gImg from '@/assets/images/lineup/g6g.webp';
import hakiImg from '@/assets/images/lineup/hq.webp';
import Lenis from 'lenis';

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

const MarqueeBanner = ({ text, bgClass, rotateClass, reverse = false, textColor = "text-white" }: { text: string, bgClass: string, rotateClass: string, reverse?: boolean, textColor?: string }) => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const currentSpeedRef = useRef(1);
  const targetSpeedRef = useRef(1);
  const xRef = useRef(reverse ? -50 : 0);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      targetSpeedRef.current = 3;
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        targetSpeedRef.current = 1;
      }, 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const loop = () => {
      currentSpeedRef.current += (targetSpeedRef.current - currentSpeedRef.current) * 0.05;
      const dir = reverse ? 1 : -1;
      xRef.current += currentSpeedRef.current * 0.05 * dir;
      if (!reverse && xRef.current <= -50) xRef.current = 0;
      if (reverse && xRef.current >= 0) xRef.current = -50;
      if (marqueeRef.current) {
        marqueeRef.current.style.transform = `translateX(${xRef.current}%)`;
      }
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [reverse]);

  return (
    <div className={`w-full ${bgClass} ${textColor} border-y border-white/10 py-3 md:py-5 flex overflow-hidden transform ${rotateClass}`}>
      <div ref={marqueeRef} className="flex w-[200%] items-center will-change-transform">
        <span className="text-2xl md:text-4xl font-heading uppercase tracking-tighter whitespace-nowrap">
          {text}
        </span>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getItemCount, isCartOpen, setIsCartOpen } = useCart();
  const marqueeText = "GIXS DI KOTA • ".repeat(30);

  const MOCK_LINEUP = [
    { id: 9991, title: 'DAVE THE PAPS', start_date: '2026-12-01T20:00:00Z', banner_url: daveImg, location: 'MAIN STAGE', description: 'Legendary Indonesian Reggae', publish_status: 'published' },
    { id: 9992, title: 'G6G', start_date: '2026-12-02T20:00:00Z', banner_url: g6gImg, location: 'URBAN STAGE', description: 'Modern Rock Explosion', publish_status: 'published' },
    { id: 9993, title: 'HAKI', start_date: '2026-12-03T20:00:00Z', banner_url: hakiImg, location: 'INDIE STAGE', description: 'Alternative Vibes', publish_status: 'published' },
  ];

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const [apiEvents, setApiEvents] = useState<Event[]>([]);
  const [apiMerch, setApiMerch] = useState<Merchandise[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [merchLoading, setMerchLoading] = useState(true);
  const currentUser = authApi.getUser();

  useEffect(() => {
    eventsApi.getPublished({ limit: 6 })
      .then(res => setApiEvents(res.data || []))
      .catch(() => setApiEvents([]))
      .finally(() => setEventsLoading(false));
  }, []);

  useEffect(() => {
    merchandiseApi.getPublic()
      .then(res => setApiMerch(res.data || []))
      .catch(() => setApiMerch([]))
      .finally(() => setMerchLoading(false));
  }, []);

  const eventScrollRef = useRef<HTMLDivElement>(null);
  const [isEventsHovered, setIsEventsHovered] = useState(false);
  const scrollPosRef = useRef(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const scroll = () => {
      const displayEvents = apiEvents.length > 0 ? apiEvents : MOCK_LINEUP;
      if (eventScrollRef.current && !isEventsHovered && !isDragging.current && displayEvents.length > 0) {
        scrollPosRef.current += 1.2;
        const maxScroll = eventScrollRef.current.scrollWidth / 2;
        if (scrollPosRef.current >= maxScroll) {
          scrollPosRef.current = 0;
        }
        eventScrollRef.current.scrollLeft = scrollPosRef.current;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };
    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isEventsHovered, apiEvents, MOCK_LINEUP]);

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

  const stopDragging = () => {
    isDragging.current = false;
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

        {/* Floating Audio Player */}
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[100] group">
          <div 
            className="bg-black/90 backdrop-blur-md border border-white/20 border-r-0 rounded-l-full py-4 px-6 flex items-center gap-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] cursor-pointer hover:bg-black transition-all hover:pr-8" 
            onClick={togglePlay}
          >
            {/* Tooltip */}
            <div className="absolute right-full mr-4 px-4 py-2 bg-neon-pink text-white text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none skew-x-[-10deg]">
               NOW PLAYING: PERLAHAN TENANG - DAVE THE PAPS
            </div>

            {/* Graphic Badge */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <i className={`fa-solid fa-compact-disc text-[50px] text-neon-pink z-0 ${isPlaying ? 'animate-[spin_2s_linear_infinite]' : ''}`}></i>
              
              {/* Notification Bubble */}
              <div className="absolute -top-1 -right-1 z-20 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-black">
                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-black text-[8px] ${!isPlaying ? 'ml-[1px]' : ''}`}></i>
              </div>
            </div>

            <audio ref={audioRef} loop>
               <source src={thePapsAudio} type="audio/mpeg" />
            </audio>
          </div>
        </div>

        <nav className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${isScrolled ? 'bg-white text-black shadow-md' : 'bg-black text-white'}`}>
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center group cursor-pointer relative z-10">
              <img src={logoImg} alt="KlixTicket Logo" className={`h-12 w-auto object-contain transition-all duration-300 ${isScrolled ? 'invert' : ''}`} />
            </Link>

            <div className="hidden lg:flex items-center space-x-8 xl:space-x-12 text-sm md:text-xs xl:text-sm font-bold uppercase tracking-[0.2em] whitespace-nowrap">
              <a href="#merchandise" className="hover:text-neon-yellow transition-colors">MERCHANDISE</a>
              <a href="#lineup" className="hover:text-neon-blue transition-colors">LINE UP</a>
              <a href="#about" className="hover:text-neon-pink transition-colors">About Us</a>

              <div className="flex items-center gap-4 ml-4">
                <a href="#tickets" className="h-[46px] px-8 bg-[#1a1a1a] border border-white/20 hover:bg-white hover:text-black transition-all flex items-center justify-center tracking-widest text-[#ddd] font-heading text-lg">
                  TICKET
                </a>

                <button onClick={() => setIsCartOpen(true)} className="relative group w-[46px] h-[46px] bg-black border border-white/20 hover:border-neon-cyan transition-colors flex items-center justify-center">
                  <i className="fa-solid fa-cart-shopping text-[18px] text-[#ddd] group-hover:text-neon-cyan transition-colors"></i>
                  {getItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-neon-pink text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {getItemCount()}
                    </span>
                  )}
                </button>

                {currentUser ? (
                  <Link to="/profile" className="group w-[46px] h-[46px] bg-black border border-white/20 hover:border-neon-pink transition-colors flex items-center justify-center overflow-hidden">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <i className="fa-solid fa-user text-[18px] text-[#ddd] group-hover:text-neon-pink transition-colors"></i>
                    )}
                  </Link>
                ) : (
                  <Link to="/login" className="group w-[46px] h-[46px] bg-black border border-white/20 hover:border-neon-pink transition-colors flex items-center justify-center">
                    <i className="fa-solid fa-user text-[18px] text-[#ddd] group-hover:text-neon-pink transition-colors"></i>
                  </Link>
                )}
              </div>
            </div>

            <button className={`lg:hidden relative z-50 transition-colors duration-300 ${isScrolled && !isMenuOpen ? 'text-black' : 'text-white'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <i className="fa-solid fa-xmark text-3xl"></i> : <i className="fa-solid fa-bars text-3xl"></i>}
            </button>
          </div>

          {/* Overlay mask (Tetap dipertahankan transparan 60% agar layar utama masih terlihat samar) */}
          <div
            className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* Sidebar (Solid Black) */}
          <div className={`fixed top-0 right-0 h-full w-[80vw] max-w-[320px] bg-black z-40 border-l border-white/10 transition-transform duration-500 ease-out lg:hidden flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

            {/* Spacing untuk tombol close */}
            <div className="h-32 shrink-0"></div>

            {/* Menu Links */}
            <div className="flex-1 flex flex-col px-10 overflow-y-auto pb-10 scrollbar-hide">
              <div className="flex flex-col items-start space-y-6 text-2xl font-bold uppercase tracking-[0.2em] w-full">
                <a href="#" onClick={() => setIsMenuOpen(false)} className="hover:text-neon-pink transition-colors w-full border-b border-white/10 pb-4">Home</a>
                <a href="#lineup" onClick={() => setIsMenuOpen(false)} className="hover:text-neon-cyan transition-colors w-full border-b border-white/10 pb-4">Line Up</a>
                <a href="#shop" onClick={() => setIsMenuOpen(false)} className="hover:text-neon-yellow transition-colors w-full border-b border-white/10 pb-4">Shop</a>

                {/* Cart di Mobile */}
                <button onClick={() => { setIsMenuOpen(false); setIsCartOpen(true); }} className="hover:text-neon-cyan transition-colors w-full border-b border-white/10 pb-4 flex items-center justify-between text-left">
                  <span>Cart</span>
                  {getItemCount() > 0 && (
                    <span className="bg-neon-pink text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {getItemCount()}
                    </span>
                  )}
                </button>

                <a href="#tickets" onClick={() => setIsMenuOpen(false)} className="text-neon-pink hover:text-white transition-colors w-full border-b border-white/10 pb-4">Tickets</a>
              </div>

              {/* Profile / Login Area */}
              <div className="mt-8 pt-4 w-full">
                {currentUser ? (
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 group/profile hover:text-neon-pink transition-colors w-full">
                    <div className="w-12 h-12 rounded-full border border-white/20 overflow-hidden bg-dark-grey transition-all group-hover/profile:border-neon-pink shrink-0">
                      {currentUser.avatar_url ? (
                        <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-dark-grey">
                          <i className="fa-solid fa-user text-white/50 text-lg"></i>
                        </div>
                      )}
                    </div>
                    <span className="text-lg font-bold tracking-[0.2em] uppercase line-clamp-1">
                      {currentUser.name}
                    </span>
                  </Link>
                ) : (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="hover:text-neon-pink transition-colors text-xl font-bold uppercase tracking-[0.2em]">
                    Login
                  </Link>
                )}
              </div>
            </div>

            {/* Sidebar Footer (Solid Black) */}
            <div className="mt-auto p-10 border-t border-white/10 shrink-0 bg-black">
              <a href="#" className="flex justify-center items-center text-2xl hover:text-neon-pink transition-colors focus:outline-none">
                <i className="fa-brands fa-instagram mt-[2px]"></i>
                <span className="text-sm pl-3 font-bold tracking-[0.2em] uppercase leading-none">
                  @SOUNDSAJANG
                </span>
              </a>
            </div>

          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-0px)] mt-[80px] flex flex-col justify-end items-center overflow-hidden pb-32">
          <div className="absolute inset-0 z-0 bg-black pointer-events-none overflow-hidden flex items-center justify-center">
            <iframe
              src="https://www.youtube.com/embed/xo8ltw1URqE?autoplay=1&mute=1&controls=0&loop=1&playlist=xo8ltw1URqE&playsinline=1&modestbranding=1&disablekb=1"
              className="absolute w-[200vw] h-[200vh] md:w-[150vw] md:h-[150vh] xl:w-[110vw] xl:h-[150vh]"
              allow="autoplay; fullscreen; picture-in-picture"
              style={{ border: 'none' }}
              title="Hero Background Video"
            ></iframe>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10"></div>
          </div>

          {/* Ambient Lighting Override */}
          <div className="absolute top-[10%] left-[-10%] w-[60%] h-[60%] bg-neon-pink/20 rounded-full blur-[120px] animate-pulse z-0 mix-blend-overlay"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-neon-cyan/20 rounded-full blur-[120px] animate-pulse z-0 mix-blend-overlay" style={{ animationDelay: '2s' }}></div>

        </section>

        <div className="relative z-20 w-full">
          <MarqueeBanner
            text={marqueeText}
            bgClass="bg-neon-pink"
            rotateClass=""
            reverse={false}
          />
        </div>

        <section id="tickets" className="bg-black py-40 border-t border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[100px]"></div>

          <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
            <div className="text-center mb-32">
              <h2 className="text-8xl md:text-[12rem] font-heading leading-none tracking-tighter mb-6 uppercase">
                TICKET <span className="text-outline">INFORMATION</span>
              </h2>
            </div>

            <div className="w-full">
              {apiEvents.length === 0 && !eventsLoading ? (
                <div className="text-center py-20 font-heading text-5xl uppercase opacity-20">
                  NO TICKETS AVAILABLE
                </div>
              ) : (
                (() => {
                  // Find the main event (GIXS DI KOTA) or fallback to the closest one
                  const mainEvent = apiEvents.find(e => e.title.toUpperCase().includes('GIXS DI KOTA')) || 
                                   [...apiEvents].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0];
                  
                  if (!mainEvent || !mainEvent.ticket_types) return null;

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                      {mainEvent.ticket_types.map((ticket) => {
                        const isSoldOut = ticket.remaining_quota <= 0;
                        const isPresale = ticket.name.toUpperCase().includes('PRESALE');
                        
                        return (
                          <div 
                            key={ticket.id} 
                            className={`group relative bg-dark-grey border border-white/10 p-10 transition-all ${isSoldOut ? 'opacity-40 grayscale' : 'hover:border-neon-pink hover:-translate-y-2'}`}
                          >
                            {isPresale && (
                              <div className="absolute top-0 right-10 bg-neon-pink text-white px-4 py-1 font-heading text-sm uppercase tracking-widest translate-y-[-50%]">
                                HOT DEAL
                              </div>
                            )}
                            
                            <div className="mb-10">
                              <span className="text-neon-cyan font-bold tracking-[0.3em] text-[10px] mb-4 block uppercase opacity-60">
                                TIER CATEGORY
                              </span>
                              <h3 className="text-4xl font-heading leading-none mb-6 group-hover:text-neon-pink transition-colors uppercase">
                                {ticket.name}
                              </h3>
                              <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-8 line-clamp-2">
                                {ticket.description || 'General Admission Pass'}
                              </p>
                            </div>

                            <div className="mb-12">
                               <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] block mb-2">PRICE</span>
                               <span className="text-5xl font-heading tracking-tighter text-white">
                                 {formatPrice(ticket.price)}
                               </span>
                            </div>

                            {isSoldOut ? (
                              <button disabled className="w-full bg-white/5 text-white/20 py-4 font-heading text-xl uppercase cursor-not-allowed border border-white/5">
                                SOLD OUT
                              </button>
                            ) : (
                              <button 
                                onClick={() => {
                                  const params = new URLSearchParams();
                                  params.set('ticketId', String(ticket.id));
                                  params.set('name', `${mainEvent.title} - ${ticket.name}`);
                                  params.set('price', String(ticket.price));
                                  window.location.href = `/checkout?${params.toString()}`;
                                }}
                                className="w-full bg-white text-black font-heading text-2xl py-5 hover:bg-neon-pink hover:text-white transition-all tracking-widest uppercase"
                              >
                                BUY NOW
                              </button>
                            )}

                            {!isSoldOut && (
                              <div className="mt-6 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-neon-cyan">
                                <i className="fa-solid fa-bolt text-xs"></i>
                                <span>{ticket.remaining_quota} SEATS LEFT</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </section>

        <section id="shop" className="bg-black py-40 border-t border-white/10 grid-background">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-32 gap-8">
              <div>
                <h2 className="text-8xl md:text-[12rem] font-heading leading-none tracking-tighter uppercase">
                  MERCH<span className="text-outline">ANDISE</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {!merchLoading && apiMerch.length === 0 && (
                <div className="group cursor-pointer">
                  <div className="relative aspect-square bg-dark-grey border border-white/5 overflow-hidden mb-8 transition-all group-hover:border-neon-yellow group-hover:-translate-y-2">
                    <img src={tshirtImg} alt="Official Tee" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                  </div>
                  <h3 className="text-4xl font-heading tracking-tighter group-hover:text-neon-yellow transition-colors uppercase">Soundrenaline Tee</h3>
                  <p className="text-2xl font-heading text-white/40 mt-2 tracking-tighter">RP 180.000</p>
                </div>
              )}

              {apiMerch.slice(0, 4).map(item => (
                <Link to={`/merchandise/${item.id}`} key={item.id} className="group cursor-pointer">
                  <div className="relative aspect-square bg-dark-grey border border-white/5 overflow-hidden mb-8 transition-all group-hover:border-neon-yellow group-hover:-translate-y-2">
                    <img 
                      src={formatImageURL(item.image_url)} 
                      alt={item.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
                      onError={(e) => (e.currentTarget.src = "/fallback.png")}
                    />
                  </div>
                  <h3 className="text-4xl font-heading tracking-tighter group-hover:text-neon-yellow transition-colors uppercase line-clamp-1">{item.name}</h3>
                  <p className="text-2xl font-heading text-white/40 mt-2 tracking-tighter">{formatPrice(item.price)}</p>
                </Link>
              ))}
            </div>


          </div>
        </section>

        <section id="lineup" className="bg-black py-40 relative overflow-hidden border-t border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-6">
              <div>
                <h2 className="text-8xl md:text-[12rem] font-heading leading-none tracking-tighter uppercase">
                  OFFICIAL <span className="text-outline">LINEUP</span>
                </h2>
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
              className="flex overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing gap-12 px-4 md:px-8 py-10"
            >
              {[...MOCK_LINEUP, ...MOCK_LINEUP].map((item, index) => (
                <div key={`${item.id}-${index}`} className="group cursor-pointer w-[450px] md:w-[700px] flex-shrink-0">
                  <div className="relative w-full aspect-[16/9] bg-dark-grey border border-white/5 overflow-hidden mb-8 transition-all group-hover:border-neon-cyan group-hover:-translate-y-2">
                     <img src={item.banner_url} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-10">
                      <span className="text-neon-cyan font-bold tracking-[0.6em] text-sm flex items-center gap-3 uppercase">
                        ARTIST PROFILE <i className="fa-solid fa-arrow-right text-xl"></i>
                      </span>
                    </div>
                  </div>
                  <h3 className="text-6xl md:text-8xl font-heading tracking-tighter group-hover:text-neon-cyan transition-colors line-clamp-1 uppercase">{item.title}</h3>
                  <div className="flex items-center gap-6 mt-4">
                    <span className="text-2xl font-heading text-white/30 uppercase tracking-tighter">
                      {item.description}
                    </span>
                    <div className="h-4 w-[1px] bg-white/10"></div>
                    <span className="text-sm font-bold text-neon-pink uppercase tracking-[0.3em] leading-none">
                      Headline Artist
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <MarqueeBanner text={marqueeText} bgClass="bg-neon-cyan" rotateClass="" reverse={true} textColor="text-black" />

        <footer className="bg-black text-white pt-32 pb-20 border-t border-white/5 relative">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-black to-black opacity-50"></div>
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col items-center relative z-10">
            {/* Logo */}
            <div className="mb-16">
              <img src={logoImg} alt="KlixTicket Logo" className="h-24 md:h-32 object-contain" />
            </div>

            {/* Divider and Icons */}
            <div className="w-full flex items-center justify-center mb-24 opacity-60">
              <div className="flex-1 h-[1px] bg-white/20"></div>
              <div className="flex justify-center">
                <a href="#" className="flex items-center text-3xl hover:text-neon-pink transition-colors focus:outline-none">
                  {/* Icon */}
                  <i className="fa-brands fa-instagram"></i>

                  {/* Text */}
                  <span className="text-xl pl-2 font-bold tracking-[0.2em] uppercase">
                    @SOUNDSAJANG
                  </span>
                </a>
              </div>
              <div className="flex-1 h-[1px] bg-white/20"></div>
            </div>

            {/* Copyright */}
            <div className="text-[13px] font-bold text-white/90 tracking-widest text-center">
              © 2026 KLIXTICKET. ALL RIGHTS RESERVED.
            </div>
          </div>
        </footer>

        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </>
  );
};

export default LandingPage;