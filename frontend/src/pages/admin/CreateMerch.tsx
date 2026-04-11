import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminApi } from '@/services/api';
import { 
  ArrowLeft, 
  Package, 
  Upload, 
  Save, 
  Loader2, 
  CheckCircle2,
  Box,
  Shapes,
  Activity,
} from 'lucide-react';
import { RequestError } from '@/lib/api-client';
import { merchSchema, type MerchInput } from '@/lib/validations/merch.schema';
import { useToast } from '@/context/ToastContext';

const CreateMerch: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MerchInput>({
    resolver: zodResolver(merchSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      stock: 0,
      active_status: true
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setValue('image', file, { shouldValidate: true });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: MerchInput) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('slug', data.slug || data.name.toLowerCase().replace(/ /g, '-'));
    formData.append('description', data.description || '');
    formData.append('price', data.price.toString());
    formData.append('stock', data.stock.toString());
    formData.append('active_status', String(data.active_status));
    
    if (data.image && data.image instanceof File) {
      formData.append('image', data.image);
    }

    try {
      await adminApi.createMerchandise(formData as any);
      showToast('Inventory manifest successfully registered.', 'success');
      navigate('/admin/merchandise');
    } catch (err: any) {
      if (err instanceof RequestError && err.errors) {
        showToast('Validation mismatch. Check configuration markers.', 'error');
      } else {
        showToast(err.message || 'System error during inventory initialization.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-32">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/merchandise')}
              className="p-2 bg-white border border-slate-200 rounded text-slate-400 hover:text-slate-900 transition-all"
            >
               <ArrowLeft size={16} />
            </button>
            <div>
               <h2 className="text-2xl font-bold tracking-tight text-slate-900">Register Asset</h2>
               <p className="text-sm text-slate-500 font-medium">Initialize a new product node in the inventory.</p>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/admin/merchandise')}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded transition-all hover:bg-slate-50"
            >
               Discard
            </button>
            <button 
              form="merch-form"
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-slate-950 text-white font-bold text-xs uppercase tracking-widest rounded hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
               {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
               Init manifest
            </button>
         </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Content Sections */}
        <div className="lg:col-span-8 space-y-6">
          <div className={`bg-white border rounded-md p-6 sm:p-8 space-y-8 ${errors.name || errors.price || errors.stock ? 'border-rose-200' : 'border-slate-200'}`}>
             <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <Shapes size={18} className="text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Product Specification</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Asset Identifier <span className="text-rose-500">*</span>
                   </label>
                   <input 
                     {...register('name')}
                     className={`w-full bg-slate-50 border px-4 py-2.5 rounded text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-950/5 transition-all ${errors.name ? 'border-rose-300' : 'border-slate-200 focus:border-slate-300'}`}
                     placeholder="e.g. Official Cap 2024"
                   />
                   {errors.name && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Reference Slug
                   </label>
                   <input 
                     {...register('slug')}
                     className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-950/5 focus:border-slate-300 outline-none transition-all placeholder:text-slate-300"
                     placeholder="tshirt-v1-black"
                   />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description Narrative</label>
                   <textarea 
                    {...register('description')}
                    rows={5}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-300 transition-all resize-none"
                    placeholder="Describe material, edition, and utility..."
                   />
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation (IDR) <span className="text-rose-500">*</span></label>
                   <input 
                    {...register('price')}
                    type="number"
                    className={`w-full bg-slate-50 border px-4 py-2.5 rounded text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-950/5 transition-all ${errors.price ? 'border-rose-300' : 'border-slate-200 focus:border-slate-300'}`}
                    placeholder="150000"
                   />
                   {errors.price && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.price.message}</p>}
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Box size={12} /> Unit Capacity <span className="text-rose-500">*</span>
                   </label>
                   <input 
                     {...register('stock')}
                     type="number"
                     className={`w-full bg-slate-50 border px-4 py-2.5 rounded text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-950/5 transition-all ${errors.stock ? 'border-rose-300' : 'border-slate-200 focus:border-slate-300'}`}
                     placeholder="100"
                   />
                   {errors.stock && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.stock.message}</p>}
                </div>
             </div>

             <div className="pt-6 border-t border-slate-50">
                <label className="inline-flex items-center cursor-pointer group p-3 bg-slate-50 rounded border border-slate-100 hover:bg-slate-100 transition-all">
                  <input 
                    {...register('active_status')}
                    type="checkbox" 
                    className="sr-only peer" 
                  />
                  <div className="relative w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-950"></div>
                  <span className="ms-3 text-[10px] font-black text-slate-900 uppercase tracking-widest">Set as LIVE manifest</span>
                </label>
             </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6">
           {/* Asset Upload */}
           <div className={`bg-white border rounded-md p-6 space-y-6 ${errors.image ? 'border-rose-200' : 'border-slate-200'}`}>
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <Upload size={18} className="text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Asset Upload</h3>
              </div>

              <div className="space-y-4">
                 <div className="aspect-square bg-slate-50 rounded border border-dashed border-slate-300 overflow-hidden relative group flex items-center justify-center cursor-pointer hover:border-slate-400 transition-all">
                    {previewUrl ? (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="p-10 flex flex-col items-center text-center">
                         <Package size={48} className="text-slate-200 mb-2 group-hover:text-slate-400 transition-all" />
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Visual</p>
                      </div>
                    )}
                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                 </div>
                 {errors.image && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider text-center">{errors.image.message as string}</p>}
                 
                 <div className="p-4 bg-slate-50 rounded border border-slate-100 flex items-start gap-3">
                    <CheckCircle2 size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[9px] font-medium text-slate-500 leading-relaxed italic">
                      High-res assets are recommended for optimal marketplace presence.
                    </p>
                 </div>
              </div>
           </div>

           {/* Status Card */}
           <div className="bg-slate-950 rounded-md p-6 text-white space-y-6 shadow-xl shadow-slate-950/10 border border-slate-800">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Registry Status</p>
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase">
                           <Activity size={10} /> Ready
                        </span>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                           <span>Configuration</span>
                           <span className="text-white">v0.1.0</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                           <span>Data Cluster</span>
                           <span className="text-white">IDR-NODE</span>
                        </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-white text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] rounded hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                    >
                       {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                       Deploy node
                    </button>
                </div>
            </div>
        </div>
      </form>
    </div>
  );
};

export default CreateMerch;
