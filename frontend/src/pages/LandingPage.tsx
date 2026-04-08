import { ArrowRight, Flame, Menu, X, User, ShoppingCart } from 'lucide-react';
import { eventsApi, merchandiseApi, authApi, type Event, type Merchandise } from '@/services/api';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import flyerImg from '@/assets/Flyer.webp';
import tshirtImg from '@/assets/tshirt.webp';

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

const MarqueeBanner = ({ text, bgClass, rotateClass, reverse = false }: { text: string, bgClass: string, rotateClass: string, reverse?: boolean }) => {
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
    <div className={`w-full ${bgClass} text-cream border-b-8 border-black py-4 md:py-6 flex overflow-hidden transform ${rotateClass}`}>
      <div ref={marqueeRef} className="flex w-[200%] items-center will-change-transform">
        <span className="text-4xl md:text-6xl font-black uppercase tracking-widest whitespace-nowrap" style={{ textShadow: "3px 3px 0 #000" }}>
          {text}
        </span>
      </div>
    </div>
  );
};

// Static events replaced by API — kept as fallback shape reference only

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getItemCount } = useCart();
  const marqueeText = " CONNECTED LAGI • FESTIVAL MUSIK • KONSER LOKAL • ".repeat(15);

  // ─── API State ───────────────────────────────────────────────────────────
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

  useEffect(() => {
    let animationFrameId: number;
    const scroll = () => {
      // Hanya gerak otomatis jika tidak di-hover, tidak sedang drag, dan ada data
      if (eventScrollRef.current && !isEventsHovered && !isDragging.current && apiEvents.length > 0) {
        scrollPosRef.current += 1.2; // Kecepatan konstan yang smooth
        
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
  }, [isEventsHovered, apiEvents]);

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
        .pestapora-stroke {
          color: var(--color-cream);
          -webkit-text-stroke: 4px #000;
          text-shadow: 8px 8px 0px rgba(0,0,0,1);
        }
        @media (min-width: 768px) {
          .pestapora-stroke {
            -webkit-text-stroke: 8px var(--color-discos);
            text-shadow: 12px 12px 0px rgba(0,0,0,1);
          }
        }
      `}</style>

      <div className="min-h-screen bg-cream font-sans text-black selection:bg-discos selection:text-cream overflow-x-hidden">

        <nav className="sticky top-0 z-50 bg-cream border-b-2 border-gray-300">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">

            <div className="flex items-center space-x-2 group cursor-pointer relative z-10">
              <Flame className="w-8 h-8 md:w-10 md:h-10 fill-salmon group-hover:scale-125 group-hover:rotate-12 transition-transform" />
              <span className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-salmon">connected</span>
            </div>

            <div className="hidden lg:flex items-center space-x-8 text-xl font-black uppercase tracking-tighter">
              <a href="#" className="text-salmon hover:-translate-y-1 hover:rotate-2 transition-all">Home</a>
              <a href="#tickets" className="text-stanton hover:text-salmon hover:-translate-y-1 hover:-rotate-2 transition-all">Ticket</a>
              <a href="#events" className="text-stanton hover:text-discos hover:-translate-y-1 hover:rotate-2 transition-all">Line Up</a>
              <a href="#" className="text-stanton hover:text-salmon hover:-translate-y-1 hover:-rotate-2 transition-all">Rundown</a>
                {currentUser ? (
                <Link to="/profile" className="flex items-center gap-3 group/profile">
                  <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-cream shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform group-hover/profile:-translate-y-1">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-stanton">
                        <User className="w-5 h-5 text-cream" />
                      </div>
                    )}
                  </div>
                  <span className="text-discos font-black uppercase text-base hover:text-salmon transition-colors">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </Link>
              ) : (
                <Link to="/login" className="bg-salmon text-cream border-4 border-black px-5 py-2 text-base font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">Masuk</Link>
              )}

              {/* Cart Toggle */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative bg-white border-4 border-black p-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group"
              >
                <ShoppingCart className="w-6 h-6 text-stanton group-hover:text-salmon transition-colors" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-salmon text-cream text-[10px] font-black w-6 h-6 rounded-full border-2 border-black flex items-center justify-center animate-bounce">
                    {getItemCount()}
                  </span>
                )}
              </button>
            </div>

            <button
              className="lg:hidden relative z-50 text-stanton hover:text-salmon transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-10 h-10" /> : <Menu className="w-10 h-10" />}
            </button>
          </div>

          <div
            className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-500 lg:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={() => setIsMenuOpen(false)}
          ></div>

          <div className={`fixed top-0 right-0 w-[80vw] max-w-[350px] h-screen bg-cream z-40 border-l-4 border-black shadow-[-10px_0_20px_rgba(0,0,0,0.2)] flex flex-col items-start pt-32 px-10 space-y-8 transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <a href="#" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter text-salmon hover:translate-x-2 transition-transform">Home</a>
            <a href="#events" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter text-stanton hover:text-salmon hover:translate-x-2 transition-transform">Ticket</a>
            <a href="#events" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter text-stanton hover:text-discos hover:translate-x-2 transition-transform">Line Up</a>
            <a href="#" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter text-stanton hover:text-salmon hover:translate-x-2 transition-transform">Rundown</a>
            <a href="#" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter text-stanton hover:text-discos hover:translate-x-2 transition-transform">Festival</a>
            <a href="#" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter text-stanton hover:text-salmon hover:translate-x-2 transition-transform">Shop</a>
            {currentUser && (
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter text-discos hover:translate-x-2 transition-transform">Profil Saya</Link>
            )}
            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter text-stanton hover:text-discos hover:translate-x-2 transition-transform mt-auto pb-10">Gallery</Link>
          </div>
        </nav>

        {/* 2. Hero Section with Background Image */}
        {/* GANTI URL DI BAWAH INI DENGAN PATH KE GAMBAR .WEBP KAMU.
           Contoh: backgroundImage: `url('/images/hero-connected.webp')`
           Untuk dummy ini, aku pakai gambar festival dari unsplash.
        */}
        <section className="relative overflow-hidden w-full aspect-[16/9] bg-black">
          <img
            src={flyerImg}
            alt="flyer"
            className="absolute inset-0 z-0 w-full h-full object-cover object-center"
          />
        </section>

        <div className="relative z-20 w-full mt-auto">
          <MarqueeBanner
            text={marqueeText}
            bgClass="bg-salmon"
            rotateClass="-rotate-1 scale-105 origin-bottom"
            reverse={false}
          />
        </div>

        <section id="tickets" className="bg-cream py-24 border-t-2 border-gray-300">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">

            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-stanton">
                AMANKAN SLOTMU!
              </h2>
              <p className="text-xl md:text-2xl font-bold uppercase text-discos tracking-tight">
                jangan sampai nangis di pojokan karena kehabisan
              </p>
            </div>

            <div className="flex justify-center max-w-[1400px] mx-auto">
              {apiEvents.length === 0 && !eventsLoading ? (
                <div className="text-center py-20 font-black uppercase text-stanton opacity-50">
                   Belum ada event yang tersedia
                </div>
              ) : (
                (() => {
                  const closestEvent = [...apiEvents].sort((a, b) => 
                    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
                  )[0];

                  if (!closestEvent) return null;

                  const sortedTiers = [...(closestEvent.ticket_types || [])].sort((a, b) => a.price - b.price);
                  const now = new Date();
                  const activeTier = sortedTiers.find(t => {
                    const start = new Date(t.sales_start_at);
                    const end = new Date(t.sales_end_at);
                    return now >= start && now <= end && t.remaining_quota > 0;
                  }) || sortedTiers[0];

                  const isSoldOut = closestEvent.ticket_types?.every(t => t.remaining_quota <= 0);

                  return (
                    <div key={closestEvent.id} className={`w-full max-w-lg bg-white border-4 border-black rounded-3xl p-8 relative transition-all ${isSoldOut ? 'opacity-60 grayscale' : 'shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2'}`}>
                      {isSoldOut && (
                        <div className="absolute top-10 right-[-35px] bg-burgundy text-cream px-12 py-2 rotate-45 font-black text-xl border-2 border-black shadow-lg z-10">
                          SOLD OUT
                        </div>
                      )}
                      
                      <div className="aspect-[4/5] bg-gray-100 rounded-2xl border-4 border-black overflow-hidden mb-6 relative group/img">
                        {closestEvent.banner_url ? (
                          <img src={closestEvent.banner_url} alt={closestEvent.title} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-stanton text-cream text-6xl">🎵</div>
                        )}
                        <div className="absolute bottom-4 left-4 right-4 bg-cream border-2 border-black p-2 rounded-lg font-black uppercase text-xs">
                          {new Date(closestEvent.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>

                      <h3 className="text-2xl font-black uppercase mb-2 text-stanton line-clamp-2 min-h-[4rem]">{closestEvent.title}</h3>
                      
                      <div className="mb-8">
                        {activeTier ? (
                          <>
                            <p className="text-xs font-black text-discos uppercase tracking-widest mb-1">{activeTier.name}</p>
                            <span className="text-4xl font-black tracking-tighter text-black">
                              {formatPrice(activeTier.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-4xl font-black tracking-tighter text-black">HTM TBA</span>
                        )}
                      </div>

                      {isSoldOut ? (
                        <button disabled className="w-full bg-gray-200 text-gray-500 py-4 rounded-xl text-xl font-black uppercase cursor-not-allowed border-2 border-black">
                          Habis Terjual
                        </button>
                      ) : (
                        <Link to={`/event/${closestEvent.id}`}>
                          <button className="w-full bg-salmon text-cream border-4 border-black py-4 rounded-xl text-xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                            Sikat Tiket!
                          </button>
                        </Link>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </section>

        {/* Section Merchandise Connected */}
        <section id="shop" className="bg-cream py-24 border-t-8 border-black">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-stanton">
                  OFFICIAL MERCH
                </h2>
                <div className="w-32 h-3 bg-salmon mt-4"></div>
              </div>
              <p className="text-xl font-bold uppercase text-discos max-w-md md:text-right">
                pakai kebanggaanmu, bawa pulang kenangan dari kota pendekar.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

              {/* Fallback static item if API not loaded */}
              {!merchLoading && apiMerch.length === 0 && (
                <div className="group cursor-pointer">
                  <div className="relative aspect-square bg-white border-4 border-black rounded-3xl overflow-hidden mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                    <img
                      src={tshirtImg}
                      alt="Official Tee"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-stanton group-hover:text-salmon transition-colors">Connected Oversize Tee</h3>
                  <p className="text-xl font-black text-black mt-1">RP 180.000</p>
                </div>
              )}

              {/* API Merch Items */}
              {apiMerch.slice(0, 4).map(item => (
                <Link to={`/merchandise/${item.id}`} key={item.id} className="group cursor-pointer">
                  <div className="relative aspect-square bg-white border-4 border-black rounded-3xl overflow-hidden mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-6xl">🛍️</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-stanton group-hover:text-salmon transition-colors">{item.name}</h3>
                  <p className="text-xl font-black text-black mt-1">{formatPrice(item.price)}</p>
                </Link>
              ))}

            </div>

            <div className="mt-16 flex justify-center">
              <button className="bg-salmon text-cream border-4 border-black px-12 py-5 text-2xl font-black uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-3">
                Cek Semua Katalog <ArrowRight className="w-8 h-8" />
              </button>
            </div>
          </div>
        </section>

        <section id="events" className="bg-white py-16 relative overflow-hidden border-t-8 border-black">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">

            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-stanton">
                  Event Event Kami
                </h2>
                <div className="w-32 h-3 bg-salmon mt-4"></div>
              </div>
              <p className="text-xl font-bold uppercase text-discos max-w-md md:text-right">
                jangan lewatkan event seru dari kami.
              </p>
            </div>
          </div>

          <div 
            className="w-full relative select-none"
            onMouseEnter={() => setIsEventsHovered(true)}
            onMouseLeave={() => {
              setIsEventsHovered(false);
              stopDragging();
            }}
          >
            <div 
              ref={eventScrollRef}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={stopDragging}
              onMouseLeave={stopDragging}
              className="flex overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing gap-6 px-4 md:px-8 py-4"
            >
              {eventsLoading && (
                <div className="w-full flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-salmon border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!eventsLoading && apiEvents.length === 0 && (
                <div className="flex-shrink-0 w-[420px]">
                  <div className="h-[270px] bg-cream border-4 border-black rounded-3xl flex flex-col items-center justify-center text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-4xl mb-2">🎟️</span>
                    <p className="text-base font-black uppercase text-stanton">Belum ada event</p>
                  </div>
                </div>
              )}
              
              {!eventsLoading && apiEvents.length > 0 && [...apiEvents, ...apiEvents].map((item, index) => (
                <Link 
                  to={`/event/${item.id}`} 
                  key={`${item.id}-${index}`} 
                  className="group cursor-pointer w-[390px] md:w-[450px] flex-shrink-0"
                  onDragStart={(e) => e.preventDefault()}
                >
                  {/* Image box — same pattern as merchandise */}
                  <div className="relative w-full h-[270px] bg-white border-4 border-black rounded-3xl overflow-hidden mb-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                    {item.banner_url ? (
                      <img
                        src={item.banner_url}
                        alt={item.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full bg-stanton flex items-center justify-center pointer-events-none">
                        <span className="text-cream text-5xl font-black">🎵</span>
                      </div>
                    )}
                  </div>

                  {/* Text below — same pattern as merchandise: title + subtitle */}
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-stanton group-hover:text-salmon transition-colors line-clamp-1">{item.title}</h3>
                  <p className="text-xl font-black text-black mt-1">
                    {new Date(item.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                  </p>
                  <span className="text-sm font-bold text-discos uppercase mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Lihat Detail <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <button className="bg-salmon text-cream border-4 border-black px-10 py-4 text-xl font-black uppercase tracking-tighter shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-3">
                Lihat Semua Event <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </section>

        <MarqueeBanner
          text={marqueeText}
          bgClass="bg-stanton"
          rotateClass="rotate-1 scale-105 origin-top"
          reverse={true}
        />

        <footer className="bg-black text-cream py-16 border-t-8 border-burgundy">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-16">

              <div className="md:col-span-5 lg:col-span-4">
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
                  <Flame className="w-8 h-8 text-salmon" />
                  <span className="text-salmon">CONNECTED.</span>
                </h2>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-sm">
                  platform penyedia tiket event lokal dan festival musik terbesar. kami memberikan kemudahan akses untuk merayakan mudamu tanpa ribet.
                </p>
              </div>

              <div className="hidden lg:block lg:col-span-2"></div>

              <div className="md:col-span-3 lg:col-span-3">
                <h3 className="font-bold uppercase tracking-widest text-xs mb-6 text-discos">Jelajahi</h3>
                <ul className="space-y-4 text-sm font-medium text-cream">
                  <li><a href="#events" className="hover:text-salmon transition-colors">Lineup Event</a></li>
                  <li><a href="#" className="hover:text-salmon transition-colors">Merchandise</a></li>
                  <li><a href="#" className="hover:text-salmon transition-colors">Tentang Kami</a></li>
                  <li><a href="#" className="hover:text-salmon transition-colors">Bantuan / FAQ</a></li>
                </ul>
              </div>

              <div className="md:col-span-4 lg:col-span-3">
                <h3 className="font-bold uppercase tracking-widest text-xs mb-6 text-discos">Ikuti Kami</h3>
                <div className="flex flex-col space-y-4 text-sm font-medium text-cream">
                  <a href="#" className="hover:text-salmon transition-colors">Instagram</a>
                  <a href="#" className="hover:text-salmon transition-colors">Twitter / X</a>
                  <a href="#" className="hover:text-salmon transition-colors">TikTok</a>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs md:text-sm text-gray-500">
              <p>© 2026 CONNECTED CORP. all rights reserved.</p>
              <div className="flex gap-6 font-medium">
                <a href="#" className="hover:text-cream transition-colors">Syarat & Ketentuan</a>
                <a href="#" className="hover:text-cream transition-colors">Kebijakan Privasi</a>
              </div>
            </div>
          </div>
        </footer>

        {/* Cart Drawer Component */}
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </>
  );
};

export default LandingPage;