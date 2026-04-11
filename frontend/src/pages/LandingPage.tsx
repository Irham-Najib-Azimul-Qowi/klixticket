// Icons provided by FontAwesome CDN in index.html
import { eventsApi, merchandiseApi, authApi, type Event, type Merchandise } from '@/services/api';
import { formatImageURL, getPlaceholderImage } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
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
  const currentSpeedRef = useRef(0.5);
  const targetSpeedRef = useRef(0.5);
  const xRef = useRef(reverse ? -50 : 0);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      targetSpeedRef.current = 1.5;
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        targetSpeedRef.current = 0.5;
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
      <div ref={marqueeRef} className="flex items-center will-change-transform">
        {[...Array(40)].map((_, i) => (
          <span 
            key={i} 
            className={`text-2xl md:text-5xl font-heading uppercase tracking-tighter whitespace-nowrap px-4 flex items-center ${
              i % 2 === 1 ? 'text-outline' : ''
            }`}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getItemCount, isCartOpen, setIsCartOpen } = useCart();
  const { showToast } = useToast();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const marqueeText = "GIXS DI KOTA";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const [nearestEvent, setNearestEvent] = useState<Event | null>(null);
  const [apiMerch, setApiMerch] = useState<Merchandise[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [merchLoading, setMerchLoading] = useState(true);
  const currentUser = authApi.getUser();

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    eventsApi.getNearestEvent()
      .then(res => setNearestEvent(res))
      .catch(() => setNearestEvent(null))
      .finally(() => setEventsLoading(false));

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

  const merchScrollRef = useRef<HTMLDivElement>(null);
  const [isMerchHovered, setIsMerchHovered] = useState(false);
  const merchScrollPosRef = useRef(0);
  const isMerchDragging = useRef(false);
  const merchStartX = useRef(0);
  const merchScrollLeftStart = useRef(0);

  useEffect(() => {
    let animationFrameId: number;
    const scroll = () => {
      // Only scroll automatically on desktop
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
  }, [isMerchHovered, apiMerch]);

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

  const stopMerchDragging = () => {
    isMerchDragging.current = false;
  };

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
      const displayEvents = nearestEvent ? [nearestEvent] : MOCK_LINEUP;
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
  }, [isEventsHovered, nearestEvent]);

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
              <a href="#merchandise" className="hover:text-neon-pink transition-colors">MERCHANDISE</a>
              <a href="#lineup" className="hover:text-neon-pink transition-colors">FEATURED SHOW</a>
              <a href="#about" className="hover:text-neon-pink transition-colors">About Us</a>

              <div className="flex items-center gap-4 ml-4">
                <a href="#tickets" className="h-[46px] px-8 bg-[#1a1a1a] border border-white/20 hover:bg-white hover:text-black transition-all flex items-center justify-center tracking-widest text-[#ddd] font-heading text-lg">
                  TICKET
                </a>

                <button 
                  onClick={() => {
                    if (!authApi.isLoggedIn()) {
                      showToast('Please login to access your cart', 'warning');
                      return;
                    }
                    setIsCartOpen(true);
                  }} 
                  className="relative group w-[46px] h-[46px] bg-black border border-white/20 hover:border-neon-pink transition-colors flex items-center justify-center"
                >
                  <i className="fa-solid fa-cart-shopping text-[18px] text-[#ddd] group-hover:text-neon-pink transition-colors"></i>
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

            <div className="flex lg:hidden items-center">
              <div className="flex items-center gap-3 mr-4 relative z-50">
                  <button 
                    onClick={() => {
                      if (!authApi.isLoggedIn()) {
                        showToast('Please login to access your cart', 'warning');
                        return;
                      }
                      setIsCartOpen(true);
                    }} 
                    className={`relative w-10 h-10 flex items-center justify-center border transition-colors ${isScrolled ? 'border-black/20 text-black' : 'border-white/20 text-white'}`}
                  >
                      <i className="fa-solid fa-cart-shopping text-sm"></i>
                      {getItemCount() > 0 && (
                          <span className="absolute -top-1 -right-1 bg-neon-pink text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                              {getItemCount()}
                          </span>
                      )}
                  </button>

                  {currentUser ? (
                      <Link to="/profile" className={`w-10 h-10 border overflow-hidden flex items-center justify-center transition-colors ${isScrolled ? 'border-black/20 text-black' : 'border-white/20 text-white'}`}>
                          {currentUser.avatar_url ? (
                              <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                              <i className="fa-solid fa-user text-sm"></i>
                          )}
                      </Link>
                  ) : (
                      <Link to="/login" className={`w-10 h-10 border flex items-center justify-center transition-colors ${isScrolled ? 'border-black/20 text-black' : 'border-white/20 text-white'}`}>
                          <i className="fa-solid fa-user text-sm"></i>
                      </Link>
                  )}
              </div>

              <button className={`relative z-50 transition-colors duration-300 ${isScrolled && !isMenuOpen ? 'text-black' : 'text-white'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <i className="fa-solid fa-xmark text-2xl"></i> : <i className="fa-solid fa-bars text-2xl"></i>}
              </button>
            </div>
          </div>

          {/* Overlay mask (Tetap dipertahankan transparan 60% agar layar utama masih terlihat samar) */}
          <div
            className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* Sidebar (Solid Black) */}
          <div className={`fixed top-0 right-0 h-full w-[80vw] max-w-[320px] bg-black z-40 border-l border-white/10 transition-transform duration-500 ease-out lg:hidden flex flex-col text-white ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

            {/* Spacing untuk tombol close */}
            <div className="h-32 shrink-0"></div>

            {/* Menu Links */}
            <div className="flex-1 flex flex-col px-10 overflow-y-auto pb-10 scrollbar-hide">
              <div className="flex flex-col items-start space-y-6 text-2xl font-bold uppercase tracking-[0.2em] w-full">
                <a href="#" onClick={() => setIsMenuOpen(false)} className="hover:text-neon-pink transition-colors w-full border-b border-white/10 pb-4">Home</a>
                <a href="#lineup" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors w-full border-b border-white/10 pb-4">Featured Show</a>
                <a href="#merchandise" onClick={() => setIsMenuOpen(false)} className="hover:text-neon-pink transition-colors w-full border-b border-white/10 pb-4">Shop</a>

                {/* Cart di Mobile */}
                <button 
                  onClick={() => { 
                    setIsMenuOpen(false); 
                    if (!authApi.isLoggedIn()) {
                      showToast('Please login to access your cart', 'warning');
                      return;
                    }
                    setIsCartOpen(true); 
                  }} 
                  className="hover:text-white transition-colors w-full border-b border-white/10 pb-4 flex items-center justify-between text-left"
                >
                  <span>CART</span>
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
              className="absolute w-[300vw] h-[100vh] md:w-[150vw] md:h-[150vh] xl:w-[120vw] xl:h-[150vh]"
              allow="autoplay; fullscreen; picture-in-picture"
              style={{ border: 'none' }}
              title="Hero Background Video"
            ></iframe>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10"></div>
          </div>

          {/* Ambient Lighting Override */}
          <div className="absolute top-[10%] left-[-10%] w-[60%] h-[60%] bg-neon-pink/20 rounded-full blur-[120px] animate-pulse z-0 mix-blend-overlay"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-neon-pink/10 rounded-full blur-[120px] animate-pulse z-0 mix-blend-overlay" style={{ animationDelay: '2s' }}></div>

        </section>

        <div className="relative z-20 w-full">
          <MarqueeBanner
            text={marqueeText}
            bgClass="bg-neon-pink"
            rotateClass=""
            reverse={false}
          />
        </div>

        <section className="bg-black py-40 relative overflow-hidden grid-background border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center relative z-10">
            <div className="flex items-center gap-4 text-white/40 font-bold uppercase tracking-[0.4em] text-[10px] mb-12">
              <span className="text-neon-pink">»</span> ABOUT KLIXTICKET 2026 <span className="text-neon-pink">«</span>
            </div>
            
            <div className="bg-white text-black px-8 md:px-12 py-4 md:py-6 mb-16 rotate-[-1deg] inline-block shadow-[10px_10px_0px_0px_rgba(255,255,255,0.1)]">
              <h2 className="text-6xl md:text-[10rem] font-heading leading-none uppercase tracking-tighter">
                KLIXTICKET 2026
              </h2>
            </div>
            
            <p className="max-w-3xl text-2xl md:text-5xl font-heading text-white/90 leading-tight mb-20 uppercase tracking-tight">
              GIXS DI KOTA - MADIUN<br className="hidden md:block" />
              10 APRIL 2026, 8.00 PM
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-1/4 -left-20 w-64 h-64 border border-neon-pink rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 -right-20 w-64 h-64 border border-white/20 rounded-full blur-3xl"></div>
          </div>
        </section>



        <section id="tickets" className="bg-black py-40 border-t border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-neon-pink/5 rounded-full blur-[100px]"></div>

          <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
            <div className="text-center mb-32">
              <h2 className="text-8xl md:text-[12rem] font-heading leading-none tracking-tighter uppercase">
                TICKET <span className="text-outline">INFORMATION</span>
              </h2>
              <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs mt-4 md:mt-8">
                SECURE YOUR SPOT FOR THE MOST ANTICIPATED EVENT OF THE YEAR
              </p>
            </div>
            <div className="w-full space-y-32">
              {!nearestEvent && !eventsLoading ? (
                <div className="text-center py-20 font-heading text-5xl uppercase opacity-20">
                  NO TICKETS AVAILABLE
                </div>
              ) : nearestEvent && (
                <div className="space-y-12">
                  <div className="flex items-center gap-6">
                    <div className="h-[2px] flex-1 bg-white/10"></div>
                    <h3 className="text-4xl md:text-6xl font-heading uppercase tracking-tighter text-neon-pink">
                      {nearestEvent.title}
                    </h3>
                    <div className="h-[2px] flex-1 bg-white/10"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {nearestEvent.ticket_types?.map((ticket) => {
                      const isSoldOut = ticket.remaining_quota <= 0;
                      const isExpired = new Date(ticket.sales_end_at) < new Date();
                      const isPresale = ticket.name.toUpperCase().includes('PRESALE');
                      
                      return (
                        <div 
                          key={ticket.id} 
                          className={`group relative bg-dark-grey border border-white/10 p-10 transition-all ${(isSoldOut || isExpired) ? 'opacity-40 grayscale' : 'hover:border-neon-pink hover:-translate-y-2'}`}
                        >
                          {isPresale && !isSoldOut && !isExpired && (
                            <div className="absolute top-0 right-10 bg-neon-pink text-white px-4 py-1 font-heading text-sm uppercase tracking-widest translate-y-[-50%]">
                              HOT DEAL
                            </div>
                          )}
                          
                          <div className="mb-10">
                            <span className="text-white/40 font-bold tracking-[0.3em] text-[10px] mb-4 block uppercase opacity-60">
                              TIER CATEGORY
                            </span>
                            <h4 className="text-4xl font-heading leading-none mb-6 group-hover:text-neon-pink transition-colors uppercase">
                              {ticket.name}
                            </h4>
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
                            <button disabled className="w-full bg-white/5 text-white/20 py-4 font-heading text-xl uppercase cursor-not-allowed border border-white/5 shadow-inner">
                              SOLD OUT
                            </button>
                          ) : isExpired ? (
                            <button disabled className="w-full bg-white/5 text-neon-pink py-4 font-heading text-xl uppercase cursor-not-allowed border border-neon-pink/20">
                              SALES ENDED
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                const params = new URLSearchParams();
                                params.set('ticketId', String(ticket.id));
                                params.set('name', `${nearestEvent.title} - ${ticket.name}`);
                                params.set('price', String(ticket.price));
                                window.location.href = `/checkout?${params.toString()}`;
                              }}
                              className="w-full bg-white text-black font-heading text-2xl py-5 hover:bg-neon-pink hover:text-white transition-all tracking-widest uppercase"
                            >
                              BUY NOW
                            </button>
                          )}

                          {!(isSoldOut || isExpired) && (
                            <div className="mt-6 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-neon-pink">
                              <i className="fa-solid fa-bolt text-xs"></i>
                              <span>{ticket.remaining_quota} SEATS LEFT</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>

        <section id="merchandise" className="bg-black py-40 border-t border-white/10 grid-background relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-6">
              <div>
                <h2 className="text-8xl md:text-[12rem] font-heading leading-none tracking-tighter uppercase">
                  MERCH<span className="text-outline">ANDISE</span>
                </h2>
                <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs mt-4 md:mt-8">
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
              className={`${isMobile ? 'grid grid-cols-1' : 'flex overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing'} gap-8 md:gap-12 px-4 md:px-8 py-10`}
            >
              {merchLoading ? (
                // Skeleton Loading State
                [...Array(5)].map((_, i) => (
                  <div key={`skeleton-${i}`} className="w-[280px] md:w-[350px] flex-shrink-0">
                    <div className="bg-white/5 border border-white/10 p-6 animate-pulse">
                      <div className="w-full aspect-square bg-white/5 mb-8"></div>
                      <div className="space-y-4">
                        <div className="h-2 w-20 bg-white/10"></div>
                        <div className="h-8 w-full bg-white/10"></div>
                        <div className="h-6 w-1/2 bg-white/10"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Actual Data State
                (isMobile ? (apiMerch.length > 0 ? apiMerch : [1, 2, 3]) : [...apiMerch, ...apiMerch, ...(apiMerch.length === 0 ? [1, 2, 3] : [])]).map((item, index) => {
                  const isPlaceholder = typeof item === 'number';
                  return (
                    <div key={isPlaceholder ? `p-${index}` : `${item.id}-${index}`} className="group cursor-pointer w-full md:w-[350px] flex-shrink-0">
                      <Link to={isPlaceholder ? '#' : `/merchandise/${item.id}`}>
                        <div className="bg-white/5 border border-white/10 p-6 transition-all duration-500 group-hover:bg-white/10 group-hover:border-neon-pink group-hover:-translate-y-3 shadow-2xl overflow-hidden relative">
                          <div className="relative w-full aspect-square bg-black border border-white/5 overflow-hidden mb-8">
                            <img 
                              src={isPlaceholder ? tshirtImg : formatImageURL(item.image_url)} 
                              alt={isPlaceholder ? "Official Tee" : item.name} 
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 pointer-events-none scale-95 group-hover:scale-110" 
                              onError={(e) => { 
                                const target = e.target as HTMLImageElement;
                                target.src = getPlaceholderImage(); 
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-neon-pink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                               <span className="w-1.5 h-1.5 bg-neon-pink rounded-full animate-pulse"></span>
                               <span className="text-[9px] font-black text-white/30 tracking-[0.3em] uppercase">OFFICIAL MERCH</span>
                            </div>
                            <h3 className="text-3xl font-heading tracking-tighter group-hover:text-neon-pink transition-colors line-clamp-1 uppercase">
                              {isPlaceholder ? 'SOUNDRENALINE TEE' : item.name}
                            </h3>
                            <div className="flex items-center justify-between pt-2">
                               <p className="text-xl font-heading text-white/60 tracking-tighter uppercase">
                                 {isPlaceholder ? 'RP 180.000' : formatPrice(item.price)}
                               </p>
                               <i className="fa-solid fa-arrow-right-long text-white/20 group-hover:text-neon-pink group-hover:translate-x-2 transition-all"></i>
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


        <section id="lineup" className="bg-black py-40 relative overflow-hidden border-t border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-6">
              <div>
                <h2 className="text-8xl md:text-[12rem] font-heading leading-none tracking-tighter uppercase">
                  FEATURED <span className="text-outline">SHOW</span>
                </h2>
                <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs mt-4 md:mt-8">
                  THE STAGE IS SET. WITNESS THE ARTISTS WHO DEFINE THE SOUND
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
              className="flex overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing gap-12 px-4 md:px-8 py-10"
            >
              {[...MOCK_LINEUP, ...MOCK_LINEUP].map((item, index) => (
                <div key={`${item.id}-${index}`} className="group cursor-pointer w-[450px] md:w-[700px] flex-shrink-0">
                  <div className="relative w-full aspect-[16/9] bg-dark-grey border border-white/5 overflow-hidden mb-8 transition-all group-hover:border-neon-pink group-hover:-translate-y-2">
                     <img src={item.banner_url} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-10">
                      <span className="text-white font-bold tracking-[0.6em] text-sm flex items-center gap-3 uppercase">
                        WATCH PREVIEW <i className="fa-solid fa-arrow-right text-xl"></i>
                      </span>
                    </div>
                  </div>
                  <h3 className="text-6xl md:text-8xl font-heading tracking-tighter group-hover:text-neon-pink transition-colors line-clamp-1 uppercase">{item.title}</h3>
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

        <MarqueeBanner text={marqueeText} bgClass="bg-neon-pink" rotateClass="" reverse={true} />

        <footer id="about" className="bg-black text-white pt-40 pb-20 border-t border-white/5 relative overflow-hidden">
          {/* Ambient Fillers */}
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-neon-pink/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none"></div>

          {/* Large Watermark Text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full overflow-hidden pointer-events-none select-none flex items-center justify-center z-0">
             <span className="text-[25vw] font-heading font-black text-white/[0.03] uppercase tracking-tighter leading-none whitespace-nowrap rotate-[-10deg]">
               KLIX 2026
             </span>
          </div>

          <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col items-center relative z-10">
            {/* Logo */}
            <div className="mb-20">
              <img src={logoImg} alt="KlixTicket Logo" className="h-28 md:h-36 object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
            </div>

            {/* Divider and Icons */}
            <div className="w-full flex items-center justify-center mb-24 opacity-60">
              <div className="flex-1 h-[1px] bg-white/20"></div>
              <div className="flex justify-center">
                <a href="https://www.instagram.com/soundsajang" target="_blank" className="flex items-center text-3xl hover:text-neon-pink transition-colors focus:outline-none">
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