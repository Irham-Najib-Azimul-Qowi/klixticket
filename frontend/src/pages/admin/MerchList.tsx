import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Loader2, Search, Filter, Edit, Trash2, MoreVertical, Tag } from 'lucide-react';
import { adminApi } from '@/services/api';
import type { Merchandise } from '@/types';
import { formatImageURL, getPlaceholderImage } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

const MerchList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchMerch();
  }, []);

  const fetchMerch = async () => {
    setLoading(true);
    try {
      const resp: any = await adminApi.getAllMerchandise();
      const merchData = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);
      setMerchandise(merchData);
    } catch (error) {
      setMerchandise([]);
      showToast('Failed to sync inventory records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete === null) return;
    
    try {
      await adminApi.deleteMerchandise(itemToDelete);
      showToast('Inventory item successfully purged.', 'success');
      fetchMerch();
    } catch (err: any) {
      showToast('Purge protocol failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 focus:outline-none">Inventory Control</h2>
          <p className="text-sm text-slate-500 font-medium">Manage your event merchandise and stock levels.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/merch/create')} 
          className="bg-slate-950 hover:bg-slate-800 text-white px-4 py-2 rounded-md font-bold text-xs transition-all flex items-center gap-2 w-fit uppercase tracking-widest"
        >
          <Plus size={16} /> Deploy Product
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between py-2 border-b border-slate-100">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search SKU manifests..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-950/5 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-colors text-xs font-bold uppercase tracking-widest">
          <Filter size={14} /> Filter
        </button>
      </div>

      {/* List Area */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white border border-slate-100 rounded-md">
            <Loader2 className="animate-spin text-slate-200 w-8 h-8 mb-4" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Syncing inventory node...</p>
          </div>
        ) : !Array.isArray(merchandise) || merchandise.length === 0 ? (
          <div className="py-32 bg-white border border-slate-200 rounded-md text-center">
             <Package className="w-12 h-12 mx-auto mb-4 text-slate-200" />
             <p className="text-sm font-bold text-slate-900">Inventory empty</p>
             <p className="text-xs text-slate-500 mt-1">No items detected in the current stock manifest.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {merchandise.map(item => (
              <div key={item.id} className="bg-white border border-slate-200 p-4 rounded-md flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-slate-400 transition-colors">
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="w-16 h-16 bg-slate-50 rounded border border-slate-100 overflow-hidden flex-shrink-0">
                      <img 
                        src={formatImageURL(item.image_url)} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                        onError={(e) => { 
                          const target = e.target as HTMLImageElement;
                          target.src = getPlaceholderImage(); 
                        }}
                      />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">SKU-{item.id.toString().padStart(4, '0')}</span>
                        {item.stock <= 5 && (
                          <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 text-[8px] font-black uppercase rounded">Low Stock</span>
                        )}
                        <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded border ${
                          item.active_status 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          {item.active_status ? 'Active' : 'Inactive'}
                        </span>
                     </div>
                     <h3 className="text-sm font-bold text-slate-950 truncate">{item.name}</h3>
                     <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-slate-500">
                           <Tag size={12} className="text-slate-300" />
                           <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase">IDR {item.price.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                           <Package size={12} className="text-slate-300" />
                           <span className={`text-[10px] font-bold uppercase tracking-wider ${item.stock === 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                             {item.stock} Units
                           </span>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                   <button 
                     onClick={() => navigate(`/admin/merch/edit/${item.id}`)}
                     className="flex-1 md:flex-none p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-950 transition-colors rounded border border-transparent"
                     title="Edit Item"
                   >
                     <Edit size={16} />
                   </button>
                   <button 
                     onClick={() => handleDeleteClick(item.id)}
                     className="flex-1 md:flex-none p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors rounded border border-transparent"
                     title="Delete Item"
                   >
                     <Trash2 size={16} />
                   </button>
                   <div className="h-4 w-px bg-slate-100 mx-1 hidden md:block" />
                   <button className="hidden md:block p-2 text-slate-300 hover:text-slate-950">
                      <MoreVertical size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Purge Inventory Record"
        message="Are you sure you want to permanently remove this SKU from the inventory node? This action cannot be reversed."
        confirmText="Confirm Purge"
        type="danger"
      />
    </div>
  );
};

export default MerchList;
