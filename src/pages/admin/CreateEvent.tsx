import React from 'react';
import { Link } from 'react-router-dom';

const CreateEvent: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-blue-900">Tambah Event Baru</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">Judul Event</label>
            <input 
              type="text" 
              placeholder="Masukkan judul event"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">Deskripsi</label>
            <textarea 
              rows={4}
              placeholder="Jelaskan detail event"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition resize-none" 
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">Lokasi</label>
              <input 
                type="text" 
                placeholder="Ex: JCC Senayan"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">Tanggal & Waktu</label>
              <input 
                type="datetime-local" 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-slate-600" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">Harga (Rp)</label>
              <input 
                type="number" 
                placeholder="0 untuk gratis"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">Kuota Tiket</label>
              <input 
                type="number" 
                placeholder="Jumlah tiket tersedia"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-4">
            <Link 
              to="/admin/events"
              className="px-6 py-2.5 rounded-lg font-semibold text-slate-500 hover:bg-slate-100 transition"
            >
              Batal
            </Link>
            <button 
              type="button"
              className="px-6 py-2.5 rounded-lg font-semibold bg-amber-500 text-white hover:bg-amber-600 shadow-sm transition"
            >
              Simpan Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
