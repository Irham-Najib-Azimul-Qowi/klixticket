import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Flame, ArrowLeft, MapPin, Calendar, Ticket, Loader2 } from 'lucide-react';
import { eventsApi, type Event } from '@/lib/api';

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

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    eventsApi.getByID(Number(id))
      .then(setEvent)
      .catch(err => setError(err instanceof Error ? err.message : 'Event tidak ditemukan'))
      .finally(() => setIsLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-cream font-sans text-black selection:bg-discos selection:text-cream overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-cream border-b-2 border-gray-300">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group cursor-pointer relative z-10">
            <Flame className="w-8 h-8 md:w-10 md:h-10 fill-salmon group-hover:scale-125 group-hover:rotate-12 transition-transform" />
            <span className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-salmon">connected</span>
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-stanton font-black uppercase text-sm tracking-widest hover:text-salmon transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        </div>
      </nav>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-12 h-12 animate-spin text-salmon" />
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <h2 className="text-5xl font-black uppercase tracking-tighter text-stanton mb-4">Oops!</h2>
          <p className="text-xl font-bold text-gray-500 mb-8">{error}</p>
          <Link
            to="/"
            className="inline-block bg-salmon text-cream border-4 border-black px-10 py-4 text-xl font-black uppercase tracking-tighter shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            Balik ke Home
          </Link>
        </div>
      )}

      {/* Content */}
      {!isLoading && event && (
        <>
          {/* Banner */}
          {event.banner_url && (
            <div className="relative w-full aspect-[21/9] bg-black overflow-hidden">
              <img
                src={event.banner_url}
                alt={event.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <span className="text-xs font-black uppercase tracking-widest text-salmon">CONNECTED 2026</span>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-cream mt-2 leading-tight">
                  {event.title}
                </h1>
              </div>
            </div>
          )}

          <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left: Detail */}
              <div className="lg:col-span-2">
                {!event.banner_url && (
                  <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-stanton mb-8">
                    {event.title}
                  </h1>
                )}
                <div className="flex flex-col gap-4 mb-10">
                  <div className="flex items-center gap-3 text-stanton font-bold">
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    <span className="text-lg uppercase tracking-wide">
                      {formatDate(event.start_date)} · {formatTime(event.start_date)} – {formatTime(event.end_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-stanton font-bold">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span className="text-lg uppercase tracking-wide">{event.location}</span>
                  </div>
                </div>

                <div className="w-24 h-2 bg-salmon mb-8" />

                <div className="prose prose-lg max-w-none">
                  <p className="text-xl text-stanton font-semibold leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              </div>

              {/* Right: Ticket Types */}
              <div className="lg:col-span-1">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-stanton mb-6">
                  Pilih Tiket
                </h2>
                <div className="w-16 h-2 bg-salmon mb-8" />

                {event.ticket_types && event.ticket_types.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    {event.ticket_types.map(ticket => {
                      const isSoldOut = ticket.remaining_quota === 0;
                      const isAvailable = ticket.active_status && !isSoldOut;

                      return (
                        <div
                          key={ticket.id}
                          className={`bg-white border-4 border-black rounded-3xl p-6 relative transition-all ${
                            isAvailable
                              ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                              : 'opacity-60 grayscale'
                          }`}
                        >
                          {isSoldOut && (
                            <div className="absolute top-6 right-[-28px] bg-burgundy text-cream px-10 py-1 rotate-45 font-black text-xs border-2 border-black">
                              SOLD OUT
                            </div>
                          )}

                          <h3 className="text-2xl font-black uppercase tracking-tighter text-salmon mb-1">
                            {ticket.name}
                          </h3>
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                            {ticket.description}
                          </p>
                          <div className="text-4xl font-black tracking-tighter text-stanton mb-4">
                            {formatPrice(ticket.price)}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
                            <Ticket className="w-4 h-4" />
                            <span>Sisa: {ticket.remaining_quota} tiket</span>
                          </div>
                          <button
                            disabled={!isAvailable}
                            className={`w-full py-4 rounded-2xl text-lg font-black uppercase tracking-tighter border-4 border-black transition-all ${
                              isAvailable
                                ? 'bg-salmon text-cream shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {isSoldOut ? 'Habis Terjual' : !ticket.active_status ? 'Belum Tersedia' : 'Beli Tiket'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400 font-bold uppercase tracking-wide">
                    Belum ada tiket tersedia.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EventDetailPage;
