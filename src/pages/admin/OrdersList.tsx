import React from 'react';

const OrdersList: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-900">Daftar Transaksi</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="py-4 px-6 font-medium">ID Pesanan</th>
                <th className="py-4 px-6 font-medium">Pelanggan</th>
                <th className="py-4 px-6 font-medium">Event</th>
                <th className="py-4 px-6 font-medium">Total Harga</th>
                <th className="py-4 px-6 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-slate-50 hover:bg-slate-50 transition">
                <td className="py-4 px-6 font-medium text-blue-900">#TRX-001</td>
                <td className="py-4 px-6 text-slate-600">Budi Santoso</td>
                <td className="py-4 px-6 text-slate-600">Konser Musik Merdeka</td>
                <td className="py-4 px-6 text-slate-600 font-medium">Rp 500.000</td>
                <td className="py-4 px-6">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">Paid</span>
                </td>
              </tr>
              <tr className="border-b border-slate-50 hover:bg-slate-50 transition">
                <td className="py-4 px-6 font-medium text-blue-900">#TRX-002</td>
                <td className="py-4 px-6 text-slate-600">Siti Aminah</td>
                <td className="py-4 px-6 text-slate-600">Tech Startup Summit</td>
                <td className="py-4 px-6 text-slate-600 font-medium">Rp 150.000</td>
                <td className="py-4 px-6">
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">Pending</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition">
                <td className="py-4 px-6 font-medium text-blue-900">#TRX-003</td>
                <td className="py-4 px-6 text-slate-600">Andi Saputra</td>
                <td className="py-4 px-6 text-slate-600">Konser Musik Merdeka</td>
                <td className="py-4 px-6 text-slate-600 font-medium">Rp 250.000</td>
                <td className="py-4 px-6">
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">Expired</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersList;
