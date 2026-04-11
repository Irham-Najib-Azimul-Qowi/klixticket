import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminApi } from '@/services/api';
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
  FileText,
  Activity
} from 'lucide-react';
import { RequestError } from '@/lib/api-client';
import { eventSchema, type EventInput } from '@/lib/validations/event.schema';
import { useToast } from '@/context/ToastContext';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      start_date: '',
      end_date: '',
      publish_status: 'published',
      ticket_types: [{ name: 'General Admission', price: 0, quota: 100 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ticket_types'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setValue('banner', file, { shouldValidate: true });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: EventInput) => {
    setIsLoading(true);

    try {
      const ticketTypes = data.ticket_types.map(t => ({
        ...t,
        description: t.name,
        sales_start_at: new Date().toISOString(),
        sales_end_at: new Date(data.end_date).toISOString(),
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

      await adminApi.createEvent(formData);
      showToast('Event manifest successfully deployed to the catalog.', 'success');
      navigate('/admin/events');
    } catch (err: any) {
      if (err instanceof RequestError && err.errors) {
        showToast('Configuration validation failed. Check your inputs.', 'error');
      } else {
        showToast(err.message || 'Failed to initialize event manifest.', 'error');
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
              onClick={() => navigate('/admin/events')}
              className="p-2 bg-white border border-slate-200 rounded text-slate-400 hover:text-slate-900 transition-all"
              title="Return to Catalog"
            >
               <ArrowLeft size={16} />
            </button>
            <div>
               <h2 className="text-2xl font-bold tracking-tight text-slate-900">Deploy Manifest</h2>
               <p className="text-sm text-slate-500 font-medium">Initialize a new event node in the system.</p>
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
              disabled={isLoading}
              className="px-4 py-2 bg-slate-950 text-white font-bold text-xs uppercase tracking-widest rounded hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
            >
               {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
               Save manifest
            </button>
         </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
         
         {/* Main Content Sections */}
         <div className="lg:col-span-8 space-y-6">
            
            {/* Section 01: Metadata */}
            <div className={`bg-white border rounded-md p-6 sm:p-8 space-y-8 ${errors.title || errors.location ? 'border-rose-200' : 'border-slate-200'}`}>
               <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                  <FileText size={18} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Primary Configuration</h3>
               </div>

               <div className="space-y-6">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        Event Identifier <span className="text-rose-500">*</span>
                     </label>
                     <input 
                        {...register('title')}
                        placeholder="e.g. Neon Genesis Music Festival"
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
                        rows={5}
                        placeholder="Detailed manifest overview..."
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-300 transition-all resize-none" 
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <MapPin size={12} /> Physical Coordinates <span className="text-rose-500">*</span>
                        </label>
                        <input 
                           {...register('location')}
                           placeholder="Jakarta International Stadium"
                           className={`w-full bg-slate-50 border px-4 py-2.5 rounded text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-950/5 transition-all ${errors.location ? 'border-rose-300' : 'border-slate-200 focus:border-slate-300'}`} 
                        />
                        {errors.location && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.location.message}</p>}
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Calendar size={12} /> Sync Start <span className="text-rose-500">*</span>
                        </label>
                        <input 
                           {...register('start_date')}
                           type="datetime-local"
                           className={`w-full bg-slate-50 border px-4 py-2.5 rounded text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-950/5 transition-all ${errors.start_date ? 'border-rose-300' : 'border-slate-200 focus:border-slate-300'}`} 
                        />
                        {errors.start_date && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.start_date.message}</p>}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Calendar size={12} /> Terminate Sync <span className="text-rose-500">*</span>
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
                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Access Tiers</h3>
                  </div>
                  <button 
                     type="button"
                     onClick={() => append({ name: '', price: 0, quota: 100 })}
                     className="px-3 py-1.5 bg-slate-50 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded border border-slate-200 hover:bg-slate-100 transition-all flex items-center gap-2"
                  >
                     <Plus size={12} /> Append Tier
                  </button>
               </div>

                <div className="space-y-3">
                  {fields.map((field, idx) => (
                     <div key={field.id} className="p-4 bg-slate-50 rounded border border-slate-200 relative group animate-in slide-in-from-bottom-1">
                        <div className="absolute top-2 right-2 flex items-center gap-2">
                           <span className="text-[9px] font-black text-slate-300 uppercase">TIER-{idx + 1}</span>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                           <div className="space-y-1">
                              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                              <input 
                                 {...register(`ticket_types.${idx}.name`)}
                                 placeholder="e.g. VIP Access"
                                 className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded text-xs font-bold text-slate-900 outline-none focus:border-slate-400 transition-all"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Rate (IDR)</label>
                              <input 
                                 {...register(`ticket_types.${idx}.price`)}
                                 type="number"
                                 className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded text-xs font-bold text-slate-900 outline-none focus:border-slate-400 transition-all"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Quota</label>
                              <input 
                                 {...register(`ticket_types.${idx}.quota`)}
                                 type="number"
                                 className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded text-xs font-bold text-slate-900 outline-none focus:border-slate-400 transition-all"
                              />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Sidebar Controls */}
         <div className="lg:col-span-4 space-y-6">
            
            {/* Image Asset */}
            <div className={`bg-white border rounded-md p-6 space-y-6 ${errors.banner ? 'border-rose-200' : 'border-slate-200'}`}>
               <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                  <Upload size={18} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Asset Upload</h3>
               </div>

               <div className="space-y-4">
                  <div className="relative aspect-[16/10] w-full bg-slate-50 border border-dashed border-slate-300 rounded flex items-center justify-center overflow-hidden group hover:border-slate-400 transition-all cursor-pointer">
                     {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                     ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                           <Upload size={24} className="text-slate-300 mb-2 group-hover:text-slate-500 transition-all" />
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Upload Key Asset</p>
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
                     <p className="text-[9px] font-medium text-slate-500 leading-relaxed">
                        Assets are optimized upon upload. Use high-resolution markers for optimal platform visibility.
                     </p>
                  </div>
               </div>
            </div>

            {/* Status Card */}
            <div className="bg-slate-950 rounded-md p-6 text-white space-y-6 shadow-xl shadow-slate-950/10 border border-slate-800">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sync Status</p>
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
                           <span>Currency Node</span>
                           <span className="text-white">IDR</span>
                        </div>
                    </div>
                    <button 
                       type="submit"
                       disabled={isLoading}
                       className="w-full py-3 bg-white text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] rounded hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                    >
                       {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                       Deploy manifest
                    </button>
                </div>
            </div>
         </div>
      </form>
    </div>
  );
};

export default CreateEvent;
