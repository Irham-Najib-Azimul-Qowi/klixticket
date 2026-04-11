import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  ShoppingBag, 
  Clock, 
  X, 
  ShieldCheck, 
  Printer, 
  Loader2, 
  Search, 
  Filter, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { adminApi } from '@/services/api';
import type { Order } from '@/types';
import { useToast } from '@/context/ToastContext';

const OrdersList: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderID, setSelectedOrderID] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    adminApi.getAllOrders()
      .then((res: any) => {
        const orderData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setOrders(orderData);
      })
      .catch(() => {
        setOrders([]);
        showToast('Failed to sync transaction manifests.', 'error');
      })
      .finally(() => setLoading(false));
  };

  const selectedOrder = (Array.isArray(orders) ? orders : []).find(o => o.id === selectedOrderID);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 focus:outline-none">Transaction Logs</h2>
          <p className="text-sm text-slate-500 font-medium">Audit platform revenue and ticket fulfillment status.</p>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-md border border-slate-200">
           <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Ledger Index</p>
           <p className="text-sm font-bold text-slate-900 tracking-tight">{(Array.isArray(orders) ? orders : []).length} Records</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between py-2 border-b border-slate-100">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" 
            placeholder="Search hash or customer..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-950/5 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-colors text-xs font-bold uppercase tracking-widest">
          <Filter size={14} /> Audit Trail
        </button>
      </div>

      {/* List Area */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white border border-slate-100 rounded-md">
            <Loader2 className="animate-spin text-slate-200 w-8 h-8 mb-4" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Authenticating records...</p>
          </div>
        ) : (!Array.isArray(orders) || orders.length === 0) ? (
          <div className="py-32 bg-white border border-slate-200 rounded-md text-center">
             <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-slate-200" />
             <p className="text-sm font-bold text-slate-900">Zero traffic detected</p>
             <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Transactional history will be cached here once active.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-md overflow-hidden">
            {orders.map(order => {
              const isTicket = order.order_items?.[0]?.item_type === 'ticket';
              return (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrderID(order.id)}
                  className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 group hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1 w-full">
                    <div className={`w-10 h-10 rounded border flex items-center justify-center font-bold text-xs ${
                      order.status === 'paid' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {order.status === 'paid' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-3 mb-0.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ORD-{order.id.slice(-8).toUpperCase()}</span>
                          <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded border ${
                            order.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {order.status}
                          </span>
                       </div>
                       <h3 className="text-sm font-bold text-slate-900 truncate leading-tight">{order.user?.name || 'Guest User'}</h3>
                       <div className="flex flex-wrap items-center gap-4 mt-1.5">
                          <div className="flex items-center gap-1.5 text-slate-400">
                             <Clock size={12} />
                             <span className="text-[9px] font-bold uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                             {isTicket ? <CreditCard size={12} /> : <ShoppingBag size={12} />}
                             <span className="text-[9px] font-bold uppercase tracking-widest truncate max-w-[150px]">
                                {order.order_items?.[0]?.item_name || 'Multi-item'}
                             </span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                     <div className="text-left sm:text-right flex-1">
                        <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase mb-0.5">Payload Val</p>
                        <p className="text-sm font-bold text-slate-900">IDR {order.total_amount.toLocaleString()}</p>
                     </div>
                     <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-950 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedOrderID && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setSelectedOrderID(null)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Audit Manifest</p>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 uppercase">
                    Transaction Summary
                  </h3>
                </div>
                <button onClick={() => setSelectedOrderID(null)} className="p-2 text-slate-400 hover:text-slate-950 transition-all rounded-md">
                   <X size={20} />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Status & ID */}
                <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-100 rounded-md">
                   <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Global Hash</p>
                      <p className="text-xs font-mono font-bold text-slate-800 uppercase tracking-tight">{selectedOrder.id}</p>
                   </div>
                   <div className={`px-4 py-2 rounded border font-black text-[10px] uppercase tracking-widest ${
                      selectedOrder.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                   }`}>
                      {selectedOrder.status}
                   </div>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Authenticated Customer</p>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded bg-slate-950 text-white flex items-center justify-center font-bold text-sm">
                            {selectedOrder.user?.name?.substring(0, 1).toUpperCase() || '?'}
                         </div>
                         <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{selectedOrder.user?.name || 'Guest'}</h4>
                            <p className="text-[10px] text-slate-500 font-medium truncate">{selectedOrder.user?.email}</p>
                         </div>
                      </div>
                   </div>
                   <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Timestamp</p>
                      <div className="flex items-center gap-2 text-slate-900">
                         <Clock size={16} className="text-slate-300" />
                         <span className="text-xs font-bold uppercase">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 px-2 py-1 bg-slate-50 border border-slate-100 rounded text-slate-500 w-fit">
                         <ShieldCheck size={12} />
                         <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Verified Log</span>
                      </div>
                   </div>
                </div>

                {/* Payload Items */}
                <div className="space-y-3">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Payload Items</p>
                   <div className="space-y-2">
                      {selectedOrder.order_items?.map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center p-3 rounded border border-slate-100 bg-white">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-slate-50 border border-slate-100 flex items-center justify-center rounded text-xs font-black text-slate-500">
                                  {item.item_type === 'ticket' ? 'T' : 'M'}
                                </div>
                               <div>
                                  <p className="text-xs font-bold text-slate-900 leading-none mb-1">{item.item_name}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Unit Price: IDR {item.price_per_item.toLocaleString()}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-bold text-slate-900">x{item.quantity}</p>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">NET PAYABLE</p>
                   <p className="text-2xl font-black text-slate-950 tracking-tight">IDR {selectedOrder.total_amount.toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => window.print()}
                  className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-widest rounded-md transition-all flex items-center gap-2 shadow-lg shadow-slate-950/20"
                >
                  <Printer size={16} /> Print Receipt
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;
