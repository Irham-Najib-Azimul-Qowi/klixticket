import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import flyerImg from '@/assets/Flyer.webp';
import tshirtImg from '@/assets/tshirt.webp';
import { Ticket, MapPin, Calendar, ArrowRight, Music, Flame, Menu, X } from 'lucide-react';

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

const events = [
  {
    artist: "RAN",
    action: "MEMBAWAKAN\nJ-ROCKS",
    stage: "BOSS STAGE",
    festival: "CONNECTED",
    date: "MADIUN, 05 SEPT 2026",
    desc: "RAN Membawakan J-ROCKS di Connected 2026",
    img: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800"
  },
  {
    artist: "TENXI,",
    action: "JEMSII,\nNAYKILLA",
    stage: "SAT-SET STAGE",
    festival: "CONNECTED",
    date: "MADIUN, 06 SEPT 2026",
    desc: "TENXI, JEMSII, NAYKILLA di Connected 2026",
    img: "https://images.unsplash.com/photo-1540039155732-684735035727?auto=format&fit=crop&q=80&w=800"
  },
  {
    artist: "J-ROCKS",
    action: "MEMBAWAKAN\nRAN",
    stage: "HINGAR BINGAR STAGE",
    festival: "CONNECTED",
    date: "MADIUN, 5 SEPTEMBER 2026",
    desc: "J-ROCKS Membawakan RAN di Connected 2026",
    img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800"
  },
];

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const marqueeText = " CONNECTED LAGI • FESTIVAL MUSIK • KONSER LOKAL • ".repeat(15);

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
              <a href="#events" className="text-stanton hover:text-salmon hover:-translate-y-1 hover:-rotate-2 transition-all">Ticket</a>
              <a href="#events" className="text-stanton hover:text-discos hover:-translate-y-1 hover:rotate-2 transition-all">Line Up</a>
              <a href="#" className="text-stanton hover:text-salmon hover:-translate-y-1 hover:-rotate-2 transition-all">Rundown</a>
              <a href="#" className="text-stanton hover:text-discos hover:-translate-y-1 hover:rotate-2 transition-all">Festival</a>
              <a href="#" className="text-stanton hover:text-salmon hover:-translate-y-1 hover:-rotate-2 transition-all">Shop</a>
              <Link to="/admin" className="text-stanton hover:text-discos hover:-translate-y-1 hover:rotate-2 transition-all">Gallery</Link>
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
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-stanton mb-4">
                AMANKAN SLOTMU!
              </h2>
              <p className="text-xl md:text-2xl font-bold uppercase text-discos tracking-tight">
                jangan sampai nangis di pojokan karena kehabisan
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

              <div className="bg-white border-4 border-gray-200 rounded-3xl p-8 md:p-12 relative overflow-hidden opacity-60 grayscale transition-all">
                <div className="absolute top-10 right-[-35px] bg-burgundy text-cream px-12 py-2 rotate-45 font-black text-xl border-2 border-black shadow-lg">
                  SOLD OUT
                </div>

                <h3 className="text-3xl md:text-4xl font-black uppercase mb-2 text-black">Presale 1</h3>
                <p className="text-gray-500 font-bold mb-8 uppercase tracking-widest text-sm">Tiket Terusan 3 Hari</p>

                <div className="mb-10">
                  <span className="text-5xl md:text-6xl font-black tracking-tighter text-black">RP 350.000</span>
                </div>

                <ul className="space-y-4 mb-12 font-bold text-gray-400 uppercase text-sm">
                  <li className="flex items-center gap-3">✓ akses semua stage</li>
                  <li className="flex items-center gap-3">✓ eksklusif wristband</li>
                  <li className="flex items-center gap-3">✓ madiun pride experience</li>
                </ul>

                <button disabled className="w-full bg-gray-200 text-gray-500 py-5 rounded-2xl text-2xl font-black uppercase cursor-not-allowed">
                  Habis Terjual
                </button>
              </div>

              <div className="bg-white border-4 border-black rounded-3xl p-8 md:p-12 relative shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-2">
                <div className="absolute top-6 left-6 bg-discos text-cream px-4 py-1 rounded-full font-black text-xs uppercase border-2 border-black">
                  rekomendasi
                </div>

                <h3 className="text-3xl md:text-4xl font-black uppercase mb-2 mt-4 text-salmon">Presale 2</h3>
                <p className="text-gray-400 font-bold mb-8 uppercase tracking-widest text-sm">Tiket Terusan 3 Hari</p>

                <div className="mb-10">
                  <span className="text-5xl md:text-6xl font-black tracking-tighter text-stanton">RP 550.000</span>
                </div>

                <ul className="space-y-4 mb-12 font-bold text-black uppercase text-sm">
                  <li className="flex items-center gap-3 text-discos"><Ticket className="w-5 h-5" /> akses semua stage</li>
                  <li className="flex items-center gap-3 text-discos"><Ticket className="w-5 h-5" /> eksklusif wristband</li>
                  <li className="flex items-center gap-3 text-discos"><Ticket className="w-5 h-5" /> madiun pride experience</li>
                </ul>

                <button className="w-full bg-salmon text-cream border-4 border-black py-5 rounded-2xl text-2xl font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                  Sikat Sekarang!
                </button>
              </div>

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
              
              {/* Item 1 - T-Shirt */}
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

            </div>

            <div className="mt-16 flex justify-center">
              <button className="bg-salmon text-cream border-4 border-black px-12 py-5 text-2xl font-black uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-3">
                Cek Semua Katalog <ArrowRight className="w-8 h-8" />
              </button>
            </div>
          </div>
        </section>

        <section id="events" className="bg-white py-24 relative">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">

            <div className="mb-12">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-stanton">
                Jadwal & Lineup
              </h2>
              <div className="w-24 h-2 bg-salmon mt-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {events.map((item, i) => (
                <div key={i} className="bg-cream rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col cursor-pointer border border-gray-200 group">

                  <div className="relative h-[250px] md:h-[280px] w-full overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.artist}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>

                    <div className="absolute top-5 left-5">
                      <span className="text-cream text-xs font-black italic tracking-widest drop-shadow-md">BOSSHOW</span>
                    </div>
                    <div className="absolute top-5 right-5">
                      <span className="text-salmon text-xs font-black tracking-widest drop-shadow-md">CONNECTED</span>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 text-cream">
                      <div className="flex items-end gap-3 mb-4">
                        <h3 className="text-[2.5rem] md:text-5xl font-black uppercase leading-none tracking-tighter drop-shadow-md">
                          {item.artist}
                        </h3>
                        <span className="text-sm md:text-base font-bold uppercase leading-tight pb-1 whitespace-pre-line drop-shadow-md text-discos">
                          {item.action}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[0.55rem] md:text-[0.65rem] font-bold uppercase tracking-widest text-gray-300">
                        <span>{item.stage}</span>
                        <span>{item.festival}</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 flex-grow flex items-center">
                    <p className="text-base md:text-lg text-stanton font-semibold leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                </div>
              ))}
            </div>

            <div className="mt-16 flex justify-center">
              <button className="bg-black text-cream rounded-full px-10 py-4 text-lg font-bold uppercase tracking-widest transition-transform hover:-translate-y-1 hover:shadow-lg">
                LIHAT SEMUA JADWAL
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
      </div>
    </>
  );
};

export default LandingPage;