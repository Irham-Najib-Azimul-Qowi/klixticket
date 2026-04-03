import React from 'react';
import { FiTrendingUp, FiCreditCard, FiActivity } from 'react-icons/fi';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Ringkasan Sistem</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
            <FiActivity size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Event</p>
            <h3 className="text-2xl font-bold text-blue-900">24</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
            <FiCreditCard size={24} />
          </div>
          <div>
             <p className="text-slate-500 text-sm font-medium">Tiket Terjual</p>
             <h3 className="text-2xl font-bold text-blue-900">1,240</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
            <FiTrendingUp size={24} />
          </div>
          <div>
             <p className="text-slate-500 text-sm font-medium">Total Pendapatan</p>
             <h3 className="text-2xl font-bold text-blue-900">Rp 128.5M</h3>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-blue-900">Transaksi Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="py-3 px-6 font-medium">ID Pesanan</th>
                <th className="py-3 px-6 font-medium">Pelanggan</th>
                <th className="py-3 px-6 font-medium">Event</th>
                <th className="py-3 px-6 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-slate-50 hover:bg-slate-50 transition">
                <td className="py-3 px-6 font-medium text-blue-900">#TRX-001</td>
                <td className="py-3 px-6 text-slate-600">Budi Santoso</td>
                <td className="py-3 px-6 text-slate-600">Konser Musik Merdeka</td>
                <td className="py-3 px-6 text-slate-600 font-medium">Rp 500.000</td>
              </tr>
              <tr className="border-b border-slate-50 hover:bg-slate-50 transition">
                <td className="py-3 px-6 font-medium text-blue-900">#TRX-002</td>
                <td className="py-3 px-6 text-slate-600">Siti Aminah</td>
                <td className="py-3 px-6 text-slate-600">Tech Startup Summit</td>
                <td className="py-3 px-6 text-slate-600 font-medium">Rp 150.000</td>
              </tr>
              <tr className="hover:bg-slate-50 transition">
                <td className="py-3 px-6 font-medium text-blue-900">#TRX-003</td>
                <td className="py-3 px-6 text-slate-600">Andi Saputra</td>
                <td className="py-3 px-6 text-slate-600">Nusantara Food Fest</td>
                <td className="py-3 px-6 text-slate-600 font-medium">Rp 0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
