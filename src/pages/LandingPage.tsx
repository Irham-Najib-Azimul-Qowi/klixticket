import React from 'react';
import { Link } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-slate-800 pb-20">
      
      {/* Navbar Section */}
      <div className="sticky top-0 z-50 shadow-md">
        {/* Top Navbar */}
        <div className="bg-[#111827] text-white py-1.5 px-6 flex justify-center space-x-6 text-sm font-medium">
          <a href="#" className="hover:text-amber-500 transition">Our Journey</a>
          <a href="#" className="hover:text-amber-500 transition">Biaya</a>
          <a href="#" className="hover:text-amber-500 transition">Tiket Gelang</a>
          <a href="#" className="hover:text-amber-500 transition">FAQ</a>
        </div>
        
        {/* Main Navbar */}
        <nav className="bg-[#213FC0] text-white px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold tracking-tight">mastutik.</span>
            </div>

            {/* Pill Menu */}
            <div className="hidden md:flex bg-[#1E3A8A] rounded-full p-1 items-center">
              <a href="#" className="px-6 py-2 bg-[#3B5BDB] rounded-full font-semibold text-sm shadow-sm transition">Beranda</a>
              <a href="#" className="px-6 py-2 hover:bg-[#3B5BDB]/50 rounded-full font-semibold text-sm transition text-blue-100">Jelajah</a>
              <a href="#" className="px-6 py-2 hover:bg-[#3B5BDB]/50 rounded-full font-semibold text-sm transition text-blue-100">Tentang</a>
              <a href="#" className="px-6 py-2 hover:bg-[#3B5BDB]/50 rounded-full font-semibold text-sm transition text-blue-100">Hubungi Kami</a>
            </div>

            {/* Right Action Menu */}
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-[#1E3A8A] hover:bg-[#3B5BDB] rounded-full px-4 py-2 transition text-sm font-medium border border-[#3B5BDB]/20">
                 <span>🇮🇩</span>
                 <span>ID</span>
              </button>
              <button className="w-10 h-10 bg-[#1E3A8A] hover:bg-[#3B5BDB] rounded-full flex items-center justify-center transition border border-[#3B5BDB]/20">
                <FiSearch size={18} />
              </button>
              <Link to="/admin" className="bg-[#3B5BDB] hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-full transition shadow-sm text-sm">
                Masuk
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Hero Banner Section */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-900 rounded-3xl w-full h-[400px] flex items-center justify-center overflow-hidden relative shadow-lg">
           <img src="https://images.unsplash.com/photo-1540039155732-d68f7c9e05a2?q=80&w=2000&auto=format&fit=crop" alt="Hero Slider" className="absolute inset-0 w-full h-full object-cover opacity-80" />
           <div className="absolute inset-0 bg-[#213FC0]/40 mix-blend-multiply"></div>
           <div className="relative text-center z-10 px-4 mt-8">
             <h1 className="text-white text-5xl md:text-7xl font-black italic tracking-tighter drop-shadow-2xl uppercase transform -skew-x-6">#SOLUSITIKET<br/>EVENTMU</h1>
             <p className="mt-4 text-blue-100 font-semibold drop-shadow-md">Dengan jutaan tiket terjual ke seluruh penjuru</p>
           </div>
        </div>
        
        {/* Pagination Dots */}
        <div className="flex justify-center items-center mt-5 space-x-2.5">
           <div className="w-8 h-2 bg-[#3B5BDB] rounded-full"></div>
           <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
           <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
           <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
           <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
        </div>
      </div>

      {/* Recommended Events Section */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <h2 className="text-2xl font-black text-slate-900 mb-6">Rekomendasi Event</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100 flex flex-col cursor-pointer">
            <div className="relative w-full aspect-[2.5/1] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop" alt="Event Cover" className="w-full h-full object-cover hover:scale-105 transition duration-500 ease-out" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
               <h3 className="text-xl font-bold text-slate-900 leading-tight mb-3">NORTH LIVE FESTIVAL VOL.1</h3>
               <div className="text-sm font-medium text-slate-500 mb-6 flex items-center space-x-2">
                 <span className="flex items-center justify-center border border-slate-200 rounded-md px-1.5 py-0.5 text-[10px] uppercase font-bold text-slate-500 bg-slate-50">12 Okt 26</span>
                 <span className="truncate">Mega Mas Manado</span>
                 <span className="px-1">•</span>
                 <span>Penyelenggara</span>
               </div>
               
               <div className="mt-auto pt-5 border-t border-slate-100">
                 <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-0.5">Mulai Dari</p>
                 <div className="flex justify-between items-end">
                    <p className="text-[#213FC0] font-black text-2xl">IDR 250.000</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100 flex flex-col cursor-pointer">
            <div className="relative w-full aspect-[2.5/1] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop" alt="Event Cover" className="w-full h-full object-cover hover:scale-105 transition duration-500 ease-out" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
               <h3 className="text-xl font-bold text-slate-900 leading-tight mb-3">Live Arena 2026: The Start</h3>
               <div className="text-sm font-medium text-slate-500 mb-6 flex items-center space-x-2">
                 <span className="flex items-center justify-center border border-slate-200 rounded-md px-1.5 py-0.5 text-[10px] uppercase font-bold text-slate-500 bg-slate-50">20 Nov 26</span>
                 <span className="truncate">ICE BSD Jakarta</span>
                 <span className="px-1">•</span>
                 <span>Artatix</span>
               </div>
               
               <div className="mt-auto pt-5 border-t border-slate-100">
                 <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-0.5">Mulai Dari</p>
                 <div className="flex justify-between items-end">
                    <p className="text-[#213FC0] font-black text-2xl">IDR 150.000</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100 flex flex-col cursor-pointer">
            <div className="relative w-full aspect-[2.5/1] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1511516104443-42bcfe2e5647?w=800&auto=format&fit=crop" alt="Event Cover" className="w-full h-full object-cover hover:scale-105 transition duration-500 ease-out" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
               <h3 className="text-xl font-bold text-slate-900 leading-tight mb-3">Hip Hop Soringin Festival</h3>
               <div className="text-sm font-medium text-slate-500 mb-6 flex items-center space-x-2">
                 <span className="flex items-center justify-center border border-slate-200 rounded-md px-1.5 py-0.5 text-[10px] uppercase font-bold text-slate-500 bg-slate-50">05 Des 26</span>
                 <span className="truncate">JNM Bloc YK</span>
                 <span className="px-1">•</span>
                 <span>Swag Org</span>
               </div>
               
               <div className="mt-auto pt-5 border-t border-slate-100">
                 <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-0.5">Mulai Dari</p>
                 <div className="flex justify-between items-end">
                    <p className="text-[#213FC0] font-black text-2xl mb-1">Gratis</p>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </section>
      
      {/* Regional Section Matches Artatix Filter Options */}
      <section className="max-w-7xl mx-auto px-4 mt-16 pb-12 border-b border-slate-200">
         <h2 className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-5">Pilih Wilayah</h2>
         <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
            {['Jabodetabek', 'Jawa Barat', 'Jawa Tengah', 'DIY Yogyakarta', 'Jawa Timur', 'Kalimantan', 'Sumatera', 'Bali'].map(region => (
              <button key={region} className="whitespace-nowrap px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold text-sm shadow-sm transition transform hover:-translate-y-0.5">
                 {region}
              </button>
            ))}
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#213FC0] text-blue-200 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
             <span className="text-3xl font-black text-white tracking-tight mb-6 block">mastutik.</span>
             <p className="text-blue-200/80 leading-relaxed max-w-sm text-sm">
               Platform andalanmu untuk manajemen tiket dan pencarian event terkemuka di Indonesia. Semua jadi lebih mudah dan aman.
             </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Perusahaan</h4>
            <div className="flex flex-col space-y-3 text-sm">
              <a href="#" className="hover:text-white transition">Tentang Kami</a>
              <a href="#" className="hover:text-white transition">Karir</a>
              <a href="#" className="hover:text-white transition">Hubungi Kami</a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Pusat Bantuan</h4>
            <div className="flex flex-col space-y-3 text-sm">
              <a href="#" className="hover:text-white transition">Syarat & Ketentuan</a>
              <a href="#" className="hover:text-white transition">Kebijakan Privasi</a>
              <a href="#" className="hover:text-white transition">FAQ</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-blue-800 text-sm text-blue-300 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} mastutik. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
