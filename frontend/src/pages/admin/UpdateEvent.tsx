import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminApi } from '@/services/api';
import { formatImageURL } from '@/lib/utils';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Upload, 
  Calendar, 
  MapPin, 
  Ticket as TicketIcon, 
  Loader2, 
  Save,
  CheckCircle2,
  Activity,
  FileText
} from 'lucide-react';
import { RequestError } from '@/lib/api-client';
import { eventSchema, type EventInput } from '@/lib/validations/event.schema';
import { useToast } from '@/context/ToastContext';

const UpdateEvent: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ticketStats, setTicketStats] = useState<Record<number, { remaining: number; total: number }>>({});

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ticket_types'
  });

  useEffect(() => {
    if (id) {
       fetchEvent(parseInt(id));
    }
  }, [id]);

  const fetchEvent = async (eventId: number) => {
    try {
      const data: any = await adminApi.getEventById(eventId);
      
      const formattedData: EventInput = {
        title: data.title || '',
        description: data.description || '',
        location: data.location || '',
        start_date: data.start_date ? new Date(data.start_date).toISOString().slice(0, 16) : '',
        end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : '',
        publish_status: (data.publish_status as any) || 'published',
        ticket_types: (data.ticket_types || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          price: t.price,
          quota: t.quota,
        })),
        banner: undefined
      };
      
      const stats: Record<number, { remaining: number; total: number }> = {};
      (data.ticket_types || []).forEach((t: any) => {
        if (t.id) {
          stats[t.id] = { remaining: t.remaining_quota, total: t.quota };
        }
      });
      setTicketStats(stats);

      reset(formattedData);

      if (data.banner_url) {
        setPreviewUrl(formatImageURL(data.banner_url));
      }
    } catch (err: any) {
      showToast('Critical error accessing manifest records.', 'error');
      setTimeout(() => navigate('/admin/events'), 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setValue('banner', file, { shouldValidate: true });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: EventInput) => {
    if (!id) return;
    setSaving(true);
    
    try {
      const ticketTypes = data.ticket_types.map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.name,
        price: Number(t.price),
        quota: Number(t.quota),
        sales_start_at: t.sales_start_at ? new Date(t.sales_start_at).toISOString() : new Date().toISOString(),
        sales_end_at: t.sales_end_at ? new Date(t.sales_end_at).toISOString() : new Date(data.end_date).toISOString(),
        active_status: true,
      }));

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('location', data.location);
      formData.append('start_date', new Date(data.start_date).toISOString());
      formData.append('end_date', new Date(data.end_date).toISOString());
      formData.append('publish_status', data.publish_status);
      formData.append('ticket_types', JSON.stringify(ticketTypes));
      
      if (data.banner && data.banner instanceof File) {
        formData.append('banner', data.banner);
      }

      await adminApi.updateEvent(parseInt(id), formData);
      showToast('Event manifest successfully updated.', 'success');
      navigate('/admin/events');
    } catch (err: any) {
      if (err instanceof RequestError && err.errors) {
        showToast('Validation protocol failed. Check markers.', 'error');
      } else {
        showToast(err.message || 'System crash during manifest synchronization.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-slate-200 w-12 h-12 mb-6" />
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Accessing Database Manifest...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-32">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/events')}
              className="p-2 bg-white border border-slate-200 rounded text-slate-400 hover:text-slate-900 transition-all"
            >
               <ArrowLeft size={16} />
            </button>
            <div>
               <h2 className="text-2xl font-bold tracking-tight text-slate-900">Modify Manifest</h2>
               <p className="text-sm text-slate-500 font-medium">Update event node #{id} configuration.</p>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/admin/events')}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded transition-all hover:bg-slate-50"
            >
               Discard
            </button>
            <button 
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
              className="px-4 py-2 bg-slate-950 text-white font-bold text-xs uppercase tracking-widest rounded hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
               {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
               Commit update
            </button>
         </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
         <div className="lg:col-span-8 space-y-6">
            
            {/* Section 01: Metadata */}
            <div className={`bg-white border rounded-md p-6 sm:p-8 space-y-8 ${errors.title || errors.location ? 'border-rose-200' : 'border-slate-200'}`}>
               <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                  <FileText size={18} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Strategic Configuration</h3>
               </div>

               <div className="space-y-6">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        Event Identifier <span className="text-rose-500">*</span>
                     </label>
                     <input 
                        {...register('title')}
                        className={`w-full bg-slate-50 border px-4 py-2.5 rounded text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-950/5 transition-all ${errors.title ? 'border-rose-300' : 'border-slate-200 focus:border-slate-300'}`} 
                     />
                     {errors.title && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.title.message}</p>}
                  </div>
                  
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Narrative Description
                     </label>
                     <textarea 
                        {...register('description')}
                        rows={6}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-300 transition-all resize-none" 
                     />
                     {errors.description && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <MapPin size={12} /> Physical Coordinates
                        </label>
                        <input 
                           {...register('location')}
                           className={`w-full bg-slate-50 border px-4 py-2.5 rounded text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-950/5 transition-all ${errors.location ? 'border-rose-300' : 'border-slate-200 focus:border-slate-300'}`} 
                        />
                        {errors.location && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.location.message}</p>}
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Calendar size={12} /> Sync Start
                        </label>
                        <input 
                           {...register('start_date')}
                           type="datetime-local"
                           className={`w-full bg-slate-50 border px-4 py-2.5 rounded text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-950/5 transition-all ${errors.start_date ? 'border-rose-300' : 'border-slate-200 focus:border-slate-300'}`} 
                        />
                        {errors.start_date && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.start_date.message}</p>}
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Calendar size={12} /> Terminate Sync
                        </label>
                        <input 
                           {...register('end_date')}
                           type="datetime-local"
                           className={`w-full bg-slate-50 border px-4 py-2.5 rounded text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-950/5 transition-all ${errors.end_date ? 'border-rose-300' : 'border-slate-200 focus:border-slate-300'}`} 
                        />
                        {errors.end_date && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.end_date.message}</p>}
                     </div>
                  </div>
               </div>
            </div>

            {/* Section 02: Tickets */}
            <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 space-y-6">
               <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <div className="flex items-center gap-3">
                     <TicketIcon size={18} className="text-slate-400" />
                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Access Tier Architecture</h3>
                  </div>
                  <button 
                     type="button"
                     onClick={() => append({ name: '', price: 0, quota: 100 })}
                     className="px-3 py-1.5 bg-slate-50 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded border border-slate-200 hover:bg-slate-100 transition-all flex items-center gap-2"
                  >
                     <Plus size={12} /> Extend Tiers
                  </button>
               </div>

               <div className="space-y-4">
                  {fields.map((field, idx) => {
                     const watchId = watch(`ticket_types.${idx}.id`);
                     const stats = watchId ? ticketStats[watchId as number] : null;

                     return (
                     <div key={field.id} className="p-5 bg-slate-50 rounded border border-slate-200 relative group animate-in slide-in-from-bottom-1">
                        <div className="absolute top-2 right-2 flex items-center gap-3">
                           <span className="text-[9px] font-black text-slate-300 uppercase">Tier 0{idx + 1}</span>
                           {fields.length > 1 && (
                              <button 
                                 type="button"
                                 onClick={() => remove(idx)}
                                 className="p-1 text-slate-300 hover:text-rose-600 transition-all"
                              >
                                 <X size={14} />
                              </button>
                           )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                           <div className="space-y-1.5">
                              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Description</label>
                              <input 
                                 {...register(`ticket_types.${idx}.name`)}
                                 className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded text-xs font-bold text-slate-900 outline-none focus:border-slate-400 shadow-sm" 
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Rate (IDR)</label>
                              <input 
                                 {...register(`ticket_types.${idx}.price`)}
                                 type="number"
                                 className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded text-xs font-bold text-slate-900 outline-none focus:border-slate-400 shadow-sm" 
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Manifest Capacity</label>
                              <input 
                                 {...register(`ticket_types.${idx}.quota`)}
                                 type="number"
                                 className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded text-xs font-bold text-slate-900 outline-none focus:border-slate-400 shadow-sm" 
                              />
                               {stats && (
                                 <div className="mt-2 flex items-center justify-between px-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Inventory Status</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${stats.remaining === 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                                       Sold: {stats.total - stats.remaining} / {stats.total}
                                    </span>
                                 </div>
                               )}
                               {stats && stats.remaining > 0 && (
                                 <p className="text-[8px] text-slate-400 font-medium mt-1 px-1">
                                   * To Sold Out: adjust capacity to {stats.total - stats.remaining} records.
                                 </p>
                               )}
                            </div>
                        </div>
                     </div>
                  );
                  })}
               </div>
            </div>
         </div>

         {/* Sidebar Controls */}
         <div className="lg:col-span-4 space-y-6">
            
            {/* Visual Section */}
            <div className={`bg-white border rounded-md p-6 space-y-6 ${errors.banner ? 'border-rose-200' : 'border-slate-200'}`}>
               <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                  <Upload size={18} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Asset Synchronization</h3>
               </div>

               <div className="space-y-4">
                  <div className="relative aspect-[16/10] w-full bg-slate-50 border border-dashed border-slate-200 rounded flex items-center justify-center overflow-hidden group hover:border-slate-400 transition-all cursor-pointer">
                     {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                           <Upload size={24} className="text-slate-300 mb-2" />
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Update Asset</p>
                        </div>
                     )}
                     <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                     />
                  </div>
                  
                  {errors.banner && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider text-center">{errors.banner.message as string}</p>}

                  <div className="p-4 bg-slate-50 rounded border border-slate-100 flex items-start gap-3">
                     <CheckCircle2 size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                     <p className="text-[9px] font-medium text-slate-500 leading-relaxed italic">
                        Manifest visuals are pushed to the global marketplace cluster.
                     </p>
                  </div>
               </div>
            </div>

            {/* Status Card */}
            <div className="bg-slate-950 rounded-md p-6 text-white space-y-6 shadow-xl shadow-slate-950/10 border border-slate-800">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Update Status</p>
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase">
                           <Activity size={10} /> Sync Ready
                        </span>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                           <span>Configuration</span>
                           <span className="text-white">v0.2.1</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                           <span>Last Modified</span>
                           <span className="text-white uppercase">Now</span>
                        </div>
                    </div>
                    <button 
                       type="submit"
                       onClick={handleSubmit(onSubmit)}
                       disabled={saving}
                       className="w-full py-3 bg-white text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] rounded hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                    >
                       {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                       Push Changes
                    </button>
                </div>
            </div>
         </div>
      </form>
    </div>
  );
};

export default UpdateEvent;
