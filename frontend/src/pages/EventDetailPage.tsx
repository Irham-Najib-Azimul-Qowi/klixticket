import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Flame, ArrowLeft, MapPin, Calendar, Ticket, Loader2, Sparkles, Clock, ShieldCheck, ShoppingCart } from 'lucide-react';
import { eventsApi, type Event } from '@/services/api';
import { useCart } from '@/context/CartContext';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('id-ID', {
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
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    eventsApi.getByID(Number(id))
      .then(setEvent)
      .catch(err => setError(err instanceof Error ? err.message : 'Event tidak ditemukan'))
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
  };

  return (
    <div className="min-h-screen bg-cream font-sans text-black selection:bg-discos selection:text-cream overflow-x-hidden">
      {/* Navbar Refined */}
      <nav className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b-4 border-black">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group cursor-pointer relative z-10">
            <Flame className="w-8 h-8 md:w-10 md:h-10 fill-salmon group-hover:scale-125 group-hover:rotate-12 transition-transform" />
            <span className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-salmon">connected</span>
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="bg-white border-4 border-black px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-3 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Kembali
          </button>
        </div>
      </nav>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-16 h-16 animate-spin text-salmon" />
          <p className="font-black uppercase tracking-widest text-stanton">Memuat Event...</p>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="inline-block p-6 bg-burgundy/10 border-4 border-burgundy rounded-[40px] mb-8">
            <Sparkles className="w-16 h-16 text-burgundy mx-auto mb-4" />
            <h2 className="text-5xl font-black uppercase tracking-tighter text-burgundy mb-4">MAAF YA!</h2>
            <p className="text-xl font-bold text-stanton mb-0">{error}</p>
          </div>
          <br />
          <Link
            to="/"
            className="inline-block bg-salmon text-cream border-4 border-black px-12 py-5 rounded-3xl text-2xl font-black uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            BALIK KE HOME
          </Link>
        </div>
      )}

      {/* Content */}
      {!isLoading && event && (
        <main className="pb-24">
          {/* Hero Banner Section - Refined Ratio & Styling */}
          <div className="relative w-full aspect-[16/9] md:aspect-[21/7] lg:aspect-[3/1] bg-black border-b-8 border-black overflow-hidden group">
            {event.banner_url ? (
              <img
                src={event.banner_url}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-stanton flex items-center justify-center">
                <Flame className="w-32 h-32 text-cream/20 animate-pulse" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
              <div className="max-w-[1400px] mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-discos text-white px-4 py-1 rounded-full font-black text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> OFFICIAL EVENT
                  </span>
                  <span className="text-cream/60 font-bold uppercase tracking-widest text-[10px]">
                    CON-EVT-{event.id}
                  </span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-cream leading-[0.85] mb-6 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  {event.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 md:gap-10">
                  <div className="flex items-center gap-3 text-cream/90">
                    <Calendar className="w-6 h-6 text-salmon" />
                    <span className="text-lg md:text-xl font-black uppercase tracking-tight">{formatDate(event.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-cream/90">
                    <Clock className="w-6 h-6 text-salmon" />
                    <span className="text-lg md:text-xl font-black uppercase tracking-tight">{formatTime(event.start_date)} – {formatTime(event.end_date)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-cream/90">
                    <MapPin className="w-6 h-6 text-salmon" />
                    <span className="text-lg md:text-xl font-black uppercase tracking-tight">{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Selection Grid */}
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 -mt-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
              
              {/* Left Column: Description */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                <div className="bg-white border-4 border-black rounded-[40px] p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-stanton mb-8 flex items-center gap-4">
                    <span className="w-12 h-12 bg-salmon rounded-2xl border-4 border-black flex items-center justify-center text-cream">?</span>
                    TENTANG EVENT
                  </h2>
                  <div className="prose prose-2xl max-w-none">
                    <p className="text-xl md:text-2xl text-stanton font-bold leading-relaxed whitespace-pre-line italic opacity-80 mb-8 border-l-8 border-discos pl-6">
                      "{event.description}"
                    </p>
                  </div>
                  
                  {/* Additional Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                    <div className="bg-cream border-4 border-black p-6 rounded-3xl">
                      <h4 className="font-black uppercase text-sm mb-3 text-salmon">Syarat & Ketentuan</h4>
                      <ul className="text-sm font-bold text-stanton space-y-2 opacity-70">
                        <li>• Minimal usia 18+ (KTP Wajib)</li>
                        <li>• No drugs & Weapons allowed</li>
                        <li>• Tiket tidak dapat direfund</li>
                      </ul>
                    </div>
                    <div className="bg-cream border-4 border-black p-6 rounded-3xl">
                      <h4 className="font-black uppercase text-sm mb-3 text-discos">Fasilitas Event</h4>
                      <ul className="text-sm font-bold text-stanton space-y-2 opacity-70">
                        <li>• Exclusive Merch Store</li>
                        <li>• Food & Beverages Area</li>
                        <li>• First Aid Station</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Secure Payment Note */}
                <div className="bg-stanton text-cream border-4 border-black rounded-3xl p-6 flex items-center justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-4">
                    <ShieldCheck className="w-10 h-10 text-salmon" />
                    <div>
                      <p className="font-black uppercase tracking-tighter text-xl leading-none">PEMBAYARAN AMAN</p>
                      <p className="text-xs font-bold opacity-60 uppercase tracking-widest mt-1">Metode bayar otomatis & instan</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-4 opacity-50 grayscale brightness-200">
                     {/* Placeholder for payment icons */}
                     <span className="text-xs font-black border-2 border-cream py-1 px-3 rounded-lg">VISA</span>
                     <span className="text-xs font-black border-2 border-cream py-1 px-3 rounded-lg">BNI</span>
                     <span className="text-xs font-black border-2 border-cream py-1 px-3 rounded-lg">QRIS</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Ticket Selection */}
              <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                <div className="bg-discos text-white border-4 border-black rounded-[40px] p-8 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-8 border-b-4 border-white pb-6">
                    PILIH TIKET
                  </h2>

                  {event.ticket_types && event.ticket_types.length > 0 ? (
                    <div className="flex flex-col gap-8">
                      {event.ticket_types.map(ticket => {
                        const isSoldOut = ticket.remaining_quota === 0;
                        const isAvailable = ticket.active_status && !isSoldOut;
                        const isPresale = ticket.name.toLowerCase().includes('presale');

                        return (
                          <div
                            key={ticket.id}
                            className={`group bg-white border-4 border-black rounded-[32px] p-6 relative transition-all ${
                              isAvailable
                                ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                                : 'opacity-60 grayscale'
                            }`}
                          >
                            {isSoldOut && (
                              <div className="absolute top-4 right-[-24px] bg-burgundy text-white px-8 py-1 rotate-45 font-black text-[10px] border-2 border-black z-20">
                                SOLD OUT
                              </div>
                            )}

                            {isPresale && isAvailable && (
                              <div className="absolute top-0 right-6 -translate-y-1/2 bg-salmon text-white px-3 py-1 rounded-lg border-2 border-black font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                HOT DEAL 🔥
                              </div>
                            )}

                            <div className="flex flex-col gap-4">
                              <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-stanton mb-1 flex items-center gap-2">
                                  {ticket.name}
                                  {isPresale && <Sparkles className="w-5 h-5 text-salmon" />}
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                  {ticket.description || 'Akses eksklusif untuk satu hari'}
                                </p>
                              </div>

                              <div className="flex flex-col">
                                {isPresale && (
                                  <span className="text-xs font-bold text-gray-400 line-through decoration-burgundy decoration-2">
                                     {formatPrice(ticket.price * 1.5)}
                                  </span>
                                )}
                                <div className="text-4xl font-black tracking-tighter text-discos">
                                  {formatPrice(ticket.price)}
                                </div>
                              </div>

                              <div className="pt-4 border-t-2 border-dashed border-gray-200">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                                  <Ticket className="w-4 h-4 text-salmon" />
                                  <span>Tersedia: {ticket.remaining_quota} Tiket</span>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-3">
                                  <button
                                    disabled={!isAvailable}
                                    onClick={() => {
                                      const params = new URLSearchParams();
                                      params.set('ticketId', String(ticket.id));
                                      params.set('name', `${event.title} - ${ticket.name}`);
                                      params.set('price', String(ticket.price));
                                      navigate(`/checkout?${params.toString()}`);
                                    }}
                                    className={`w-full py-4 rounded-2xl text-lg font-black uppercase tracking-tight border-4 border-black transition-all ${
                                      isAvailable
                                        ? 'bg-salmon text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    }`}
                                  >
                                    {isSoldOut ? 'HABIS TERJUAL' : 'BELI SEKARANG'}
                                  </button>
                                  
                                  {!isSoldOut && isAvailable && (
                                    <button
                                      onClick={() => handleAddTicket(ticket)}
                                      className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-tight border-4 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2"
                                    >
                                      <ShoppingCart className="w-4 h-4" /> Tambah ke Keranjang
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
                    <div className="text-center py-12 bg-white/10 rounded-3xl border-4 border-dashed border-white/20">
                      <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60 font-black uppercase tracking-widest text-xs">
                        Tiket Belum Tersedia
                      </p>
                    </div>
                  )}

                  {/* Trust indicator in sidebar */}
                  <div className="mt-10 flex items-center justify-center gap-4 opacity-40">
                    <Flame className="w-6 h-6 text-white" />
                    <span className="h-6 w-[2px] bg-white"></span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">GENUINE TICKETING SYSTEM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default EventDetailPage;
