// Icons provided by FontAwesome CDN in index.html
import { eventsApi, authApi, type Event } from '@/services/api';
import { formatImageURL, getPlaceholderImage } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '@/assets/images/klix-logo.webp';
import thePapsAudio from '@/assets/audio/perlahan-tenang.mp3';
import Lenis from 'lenis';
import { Calendar, MapPin, Loader2 } from 'lucide-react';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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
    <div className={`w-full ${bgClass} ${textColor} border-y border-white/10 py-2 md:py-3 flex overflow-hidden transform ${rotateClass}`}>
      <div ref={marqueeRef} className="flex items-center will-change-transform">
        {[...Array(40)].map((_, i) => (
          <span 
            key={i} 
            className={`text-lg md:text-3xl font-marquee tracking-tighter whitespace-nowrap px-4 flex items-center ${
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
  const marqueeText = "Klixticket.com";
  const navigate = useNavigate();


  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const currentUser = authApi.getUser();

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    eventsApi.getPublished()
      .then(res => {
        setEvents(res.data || []);
      })
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, []);

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

        {/* Floating Audio Player */}
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[100] group">
          <div 
            className="bg-black/90 backdrop-blur-md border border-white/20 border-r-0 rounded-l-full py-4 px-6 flex items-center gap-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] cursor-pointer hover:bg-black transition-all hover:pr-8" 
            onClick={togglePlay}
          >
            {/* Tooltip */}
            <div className="absolute right-full mr-4 px-4 py-2 bg-neon-lime text-white text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none skew-x-[-10deg]">
               NOW PLAYING: PERLAHAN TENANG - DAVE THE PAPS
            </div>

            {/* Graphic Badge */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <i className={`fa-solid fa-compact-disc text-[50px] text-neon-lime z-0 ${isPlaying ? 'animate-[spin_2s_linear_infinite]' : ''}`}></i>
              
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
            <a href="#" className="flex items-center group cursor-pointer relative z-10">
              <img src={logoImg} alt="KlixTicket Logo" className={`h-12 w-auto object-contain transition-all duration-300 ${isScrolled ? 'invert' : ''}`} />
            </a>

            <div className="hidden lg:flex items-center space-x-8 xl:space-x-12 text-sm xl:text-sm font-bold uppercase tracking-[0.2em] whitespace-nowrap">
              <a href="#events" className="hover:text-neon-lime transition-colors">UPCOMING EVENTS</a>
              <a href="#about" className="hover:text-neon-lime transition-colors">About Us</a>

              <div className="flex items-center gap-4 ml-4">
                <a href="#events" className="h-[46px] px-8 bg-[#1a1a1a] border border-white/20 hover:bg-white hover:text-black transition-all flex items-center justify-center tracking-widest text-[#ddd] font-heading text-lg">
                  TICKET
                </a>

                <button onClick={() => setIsCartOpen(true)} className="relative group w-[46px] h-[46px] bg-black border border-white/20 hover:border-neon-lime transition-colors flex items-center justify-center">
                  <i className="fa-solid fa-cart-shopping text-[18px] text-[#ddd] group-hover:text-neon-lime transition-colors"></i>
                  {getItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-neon-lime text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {getItemCount()}
                    </span>
                  )}
                </button>

                {currentUser ? (
                  <Link to="/profile" className="group w-[46px] h-[46px] bg-black border border-white/20 hover:border-neon-lime transition-colors flex items-center justify-center overflow-hidden">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <i className="fa-solid fa-user text-[18px] text-[#ddd] group-hover:text-neon-lime transition-colors"></i>
                    )}
                  </Link>
                ) : (
                  <Link to="/login" className="group w-[46px] h-[46px] bg-black border border-white/20 hover:border-neon-lime transition-colors flex items-center justify-center">
                    <i className="fa-solid fa-user text-[18px] text-[#ddd] group-hover:text-neon-lime transition-colors"></i>
                  </Link>
                )}
              </div>
            </div>

            <button className={`lg:hidden relative z-50 transition-colors duration-300 ${isScrolled && !isMenuOpen ? 'text-black' : 'text-white'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <i className="fa-solid fa-xmark text-3xl"></i> : <i className="fa-solid fa-bars text-3xl"></i>}
            </button>
          </div>

          <div
            className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={() => setIsMenuOpen(false)}
          ></div>

          <div className={`fixed top-0 right-0 h-full w-[80vw] max-w-[320px] bg-black z-40 border-l border-white/10 transition-transform duration-500 ease-out lg:hidden flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-32 shrink-0"></div>

            <div className="flex-1 flex flex-col px-10 overflow-y-auto pb-10 scrollbar-hide">
              <div className="flex flex-col items-start space-y-6 text-2xl font-bold uppercase tracking-[0.2em] w-full">
                <a href="#" onClick={() => setIsMenuOpen(false)} className="hover:text-neon-lime transition-colors w-full border-b border-white/10 pb-4">Home</a>
                <a href="#events" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors w-full border-b border-white/10 pb-4">Events</a>
                
                <button onClick={() => { setIsMenuOpen(false); setIsCartOpen(true); }} className="hover:text-white transition-colors w-full border-b border-white/10 pb-4 flex items-center justify-between text-left">
                  <span>Cart</span>
                  {getItemCount() > 0 && (
                    <span className="bg-neon-lime text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {getItemCount()}
                    </span>
                  )}
                </button>
              </div>

              <div className="mt-8 pt-4 w-full">
                {currentUser ? (
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 group/profile hover:text-neon-lime transition-colors w-full">
                    <div className="w-12 h-12 rounded-full border border-white/20 overflow-hidden bg-dark-grey transition-all group-hover/profile:border-neon-lime shrink-0">
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
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="hover:text-neon-lime transition-colors text-xl font-bold uppercase tracking-[0.2em]">
                    Login
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-auto p-10 border-t border-white/10 shrink-0 bg-black">
              <a href="#" className="flex justify-center items-center text-2xl hover:text-neon-lime transition-colors focus:outline-none">
                <i className="fa-brands fa-instagram mt-[2px]"></i>
                <span className="text-sm pl-3 font-bold tracking-[0.2em] uppercase leading-none">
                  @SOUNDSAJANG
                </span>
              </a>
            </div>
          </div>
        </nav>

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

          <div className="absolute top-[10%] left-[-10%] w-[60%] h-[60%] bg-neon-lime/20 rounded-full blur-[120px] animate-pulse z-0 mix-blend-overlay"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-neon-lime/10 rounded-full blur-[120px] animate-pulse z-0 mix-blend-overlay" style={{ animationDelay: '2s' }}></div>
        </section>

        <div className="relative z-20 w-full">
          <MarqueeBanner
            text={marqueeText}
            bgClass="bg-neon-lime"
            rotateClass=""
            reverse={false}
          />
        </div>

        <section id="events" className="bg-black py-40 relative overflow-hidden border-t border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-6">
              <div>
                <h2 className="text-8xl md:text-[12rem] font-heading leading-none tracking-tighter uppercase">
                  UPCOMING <span className="text-outline">EVENTS</span>
                </h2>
                <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs mt-4 md:mt-8">
                  THE STAGE IS SET. WITNESS THE ARTISTS WHO DEFINE THE SOUND
                </p>
              </div>
            </div>

            {eventsLoading ? (
               <div className="flex flex-col items-center justify-center py-20 text-neon-lime">
                 <Loader2 className="w-16 h-16 animate-spin mb-4" />
                 <p className="font-heading text-2xl tracking-widest animate-pulse uppercase">Syncing Events...</p>
               </div>
            ) : events.length === 0 ? (
               <div className="text-center py-32 border border-white/10 bg-dark-grey">
                 <p className="text-white/40 font-heading text-4xl uppercase tracking-widest">
                   NO UPCOMING EVENTS
                 </p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
                 {events.map((event) => (
                   <div 
                     key={event.id}
                     onClick={() => navigate(`/event/${event.id}`)} 
                     className="group cursor-pointer bg-dark-grey border border-white/5 transition-all hover:border-neon-lime hover:-translate-y-2 flex flex-col"
                   >
                     <div className="relative w-full aspect-[16/9] overflow-hidden">
                       <img 
                         src={formatImageURL(event.banner_url, 'event')} 
                         alt={event.title} 
                         className="w-full h-full object-cover transition-all duration-1000 grayscale group-hover:grayscale-0 group-hover:scale-105"
                         onError={(e) => { 
                           const target = e.target as HTMLImageElement;
                           target.src = getPlaceholderImage(); 
                         }}
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                       <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                         <div className="bg-neon-lime text-white px-4 py-2 font-heading text-sm uppercase tracking-widest">
                           {event.publish_status}
                         </div>
                       </div>
                     </div>
                     <div className="p-8 md:p-10 flex-1 flex flex-col">
                       <div className="flex items-center gap-6 mb-6 text-white/50 text-xs font-bold uppercase tracking-[0.2em]">
                         <div className="flex items-center gap-2">
                           <Calendar className="w-4 h-4 text-neon-lime" />
                           {formatDate(event.start_date)}
                         </div>
                         <div className="flex items-center gap-2">
                           <MapPin className="w-4 h-4 text-neon-lime" />
                           {event.location}
                         </div>
                       </div>
                       
                       <h3 className="text-5xl md:text-6xl font-heading tracking-tighter text-white uppercase group-hover:text-neon-lime transition-colors mb-4 truncate">
                         {event.title}
                       </h3>
                       
                       <p className="text-white/40 font-bold uppercase tracking-[0.1em] text-sm line-clamp-2 leading-relaxed mb-10 border-l border-neon-lime/50 pl-4">
                         {event.description}
                       </p>
                       
                       <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                         <span className="font-heading text-2xl uppercase tracking-widest text-white">GET TICKETS</span>
                         <i className="fa-solid fa-arrow-right-long text-neon-lime text-2xl group-hover:translate-x-2 transition-transform"></i>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </section>

        <MarqueeBanner text={marqueeText} bgClass="bg-neon-lime" rotateClass="" reverse={true} />

        <footer id="about" className="bg-black text-white pt-40 pb-20 border-t border-white/5 relative overflow-hidden">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-neon-lime/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none"></div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full overflow-hidden pointer-events-none select-none flex items-center justify-center z-0">
             <span className="text-[25vw] font-heading font-black text-white/[0.03] uppercase tracking-tighter leading-none whitespace-nowrap rotate-[-10deg]">
               KLIX 2026
             </span>
          </div>

          <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col items-center relative z-10">
            <div className="mb-20">
              <img src={logoImg} alt="KlixTicket Logo" className="h-28 md:h-36 object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
            </div>

            <div className="w-full flex items-center justify-center mb-24 opacity-60">
              <div className="flex-1 h-[1px] bg-white/20"></div>
              <div className="flex justify-center">
                <a href="https://www.instagram.com/soundsajang" target="_blank" className="flex items-center text-3xl hover:text-neon-lime transition-colors focus:outline-none">
                  <i className="fa-brands fa-instagram"></i>
                  <span className="text-xl pl-2 font-bold tracking-[0.2em] uppercase">
                    @SOUNDSAJANG
                  </span>
                </a>
              </div>
              <div className="flex-1 h-[1px] bg-white/20"></div>
            </div>

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