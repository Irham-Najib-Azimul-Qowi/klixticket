import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';

const EventsList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-blue-900">Daftar Event</h2>
        <Link 
          to="/admin/events/create" 
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-semibold transition shadow-sm"
        >
          <FiPlus />
          <span>Tambah Event</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="py-4 px-6 font-medium">Judul Event</th>
                <th className="py-4 px-6 font-medium">Tanggal</th>
                <th className="py-4 px-6 font-medium">Lokasi</th>
                <th className="py-4 px-6 font-medium">Harga</th>
                <th className="py-4 px-6 font-medium">Kuota</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-slate-50 hover:bg-slate-50 transition">
                <td className="py-4 px-6 font-bold text-blue-900">Konser Musik Merdeka</td>
                <td className="py-4 px-6 text-slate-600">12 Okt 2026, 19:00</td>
                <td className="py-4 px-6 text-slate-600">JCC Senayan</td>
                <td className="py-4 px-6 text-slate-600">Rp 250.000</td>
                <td className="py-4 px-6 text-slate-600">
                  <span className="bg-blue-50 text-blue-900 px-2 py-1 rounded-md font-medium text-xs">800 / 1000</span>
                </td>
              </tr>
              <tr className="border-b border-slate-50 hover:bg-slate-50 transition">
                <td className="py-4 px-6 font-bold text-blue-900">Tech Startup Summit</td>
                <td className="py-4 px-6 text-slate-600">20 Nov 2026, 09:00</td>
                <td className="py-4 px-6 text-slate-600">ICE BSD</td>
                <td className="py-4 px-6 text-slate-600">Rp 150.000</td>
                <td className="py-4 px-6 text-slate-600">
                  <span className="bg-blue-50 text-blue-900 px-2 py-1 rounded-md font-medium text-xs">150 / 300</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition">
                <td className="py-4 px-6 font-bold text-blue-900">Nusantara Food Fest</td>
                <td className="py-4 px-6 text-slate-600">05 Des 2026, 10:00</td>
                <td className="py-4 px-6 text-slate-600">GBK Area</td>
                <td className="py-4 px-6 text-slate-600">Gratis</td>
                <td className="py-4 px-6 text-slate-600">
                  <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-md font-medium text-xs">Full / 500</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventsList;
