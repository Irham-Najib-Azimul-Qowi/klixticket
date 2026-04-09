import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Info,
  CheckCircle2,
  AlertCircle,
  Type,
  FileText
} from 'lucide-react';
import { RequestError } from '@/lib/api-client';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
  });

  const [ticketTiers, setTicketTiers] = useState([
    { name: 'General Admission', price: '', quota: '' }
  ]);

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error for that field
    if (fieldErrors[e.target.name]) {
       const newErrors = { ...fieldErrors };
       delete newErrors[e.target.name];
       setFieldErrors(newErrors);
    }
  };

  const handleTierChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newTiers = [...ticketTiers];
    const { name, value } = e.target;
    newTiers[index] = { ...newTiers[index], [name]: value };
    setTicketTiers(newTiers);
  };

  const addTier = () => {
    setTicketTiers([...ticketTiers, { name: '', price: '', quota: '' }]);
  };

  const removeTier = (index: number) => {
    if (ticketTiers.length <= 1) return;
    setTicketTiers(ticketTiers.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setPreviewUrl(URL.createObjectURL(file));
       if (fieldErrors['banner']) {
          const newErrors = { ...fieldErrors };
          delete newErrors['banner'];
          setFieldErrors(newErrors);
       }
    }
  };

  const handleSubmit = async () => {
    setFieldErrors({});
    setGeneralError('');

    if (!eventData.title || !eventData.location || !eventData.start_date || !eventData.end_date) {
      setGeneralError("Please fill in all mandatory event identification markers.");
      return;
    }
    
    setLoading(true);
    try {
      const ticketTypes = ticketTiers.map(t => ({
        name: t.name,
        description: t.name || 'General Admission', // Auto-fill description
        price: Number(t.price),
        quota: Number(t.quota),
        sales_start_at: new Date().toISOString(), // Auto-fill start date (now)
        sales_end_at: eventData.end_date ? new Date(eventData.end_date).toISOString() : new Date().toISOString(), // Auto-fill end date
        active_status: true,
      }));

      const formData = new FormData();
      formData.append('title', eventData.title);
      formData.append('description', eventData.description);
      formData.append('location', eventData.location);
      formData.append('start_date', eventData.start_date ? new Date(eventData.start_date).toISOString() : '');
      formData.append('end_date', eventData.end_date ? new Date(eventData.end_date).toISOString() : '');
      formData.append('publish_status', 'published');
      formData.append('ticket_types', JSON.stringify(ticketTypes));
      
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      await adminApi.createEvent(formData);
      navigate('/admin/events');
    } catch (err: any) {
      if (err instanceof RequestError && err.errors) {
        setFieldErrors(err.errors);
        setGeneralError('Validation failed. Please correct the highlighted nodes.');
      } else {
        setGeneralError(err.message || 'The system failed to initialize this event node.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-1000">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
         <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/admin/events')}
              className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all group"
              title="Return to Events"
            >
               <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Node Configuration</span>
               </div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Deploy New Event</h2>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/events')}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all"
            >
               Discard
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-10 py-3 bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-3 active:scale-95"
            >
               {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
               Save & Deploy
            </button>
         </div>
      </div>

      {generalError && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600 animate-in slide-in-from-top-2">
           <AlertCircle size={20} />
           <p className="text-sm font-bold uppercase tracking-wider">{generalError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* Main Content Sections */}
         <div className="lg:col-span-8 space-y-8">
            
            {/* 01. Essential Metadata */}
            <div className={`bg-white border rounded-[32px] p-10 shadow-sm transition-all ${generalError ? 'ring-1 ring-rose-100' : ''}`}>
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                     <FileText size={20} />
                  </div>
                  <div>
                     <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Essential Metadata</h3>
                     <p className="text-slate-400 text-xs font-medium">Primary identification markers for the event node.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-10">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Type size={14} className="text-indigo-400" /> Strategic Event Title <span className="text-rose-500">*</span>
                     </label>
                     <input 
                        name="title"
                        value={eventData.title}
                        onChange={handleEventChange}
                        placeholder="Define the resonance..."
                        className={`w-full bg-slate-50 border px-6 py-5 rounded-2xl font-sans text-lg font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300 ${fieldErrors.title ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-indigo-200'}`} 
                     />
                     {fieldErrors.title && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider pl-1">{fieldErrors.title}</p>}
                  </div>
                  
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Info size={14} className="text-indigo-400" /> Narrative Overview
                     </label>
                     <textarea 
                        name="description"
                        rows={6}
                        value={eventData.description}
                        onChange={handleEventChange}
                        placeholder="Articulate the core experience..."
                        className={`w-full bg-slate-50 border px-6 py-5 rounded-2xl font-sans text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300 resize-none ${fieldErrors.description ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-indigo-200'}`} 
                     />
                     {fieldErrors.description && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider pl-1">{fieldErrors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <MapPin size={14} className="text-rose-400" /> Physical/Digital Vector <span className="text-rose-500">*</span>
                        </label>
                        <input 
                           name="location"
                           value={eventData.location}
                           onChange={handleEventChange}
                           placeholder="Location Coordinates"
                           className={`w-full bg-slate-50 border px-6 py-5 rounded-2xl font-sans text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all ${fieldErrors.location ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-indigo-200'}`} 
                        />
                        {fieldErrors.location && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider pl-1">{fieldErrors.location}</p>}
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Calendar size={14} className="text-emerald-400" /> Initial Magnitude <span className="text-rose-500">*</span>
                        </label>
                        <input 
                           name="start_date"
                           type="datetime-local"
                           value={eventData.start_date}
                           onChange={handleEventChange}
                           className={`w-full bg-slate-50 border px-6 py-5 rounded-2xl font-sans text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all ${fieldErrors.start_date ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-indigo-200'}`} 
                        />
                        {fieldErrors.start_date && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider pl-1">{fieldErrors.start_date}</p>}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Calendar size={14} className="text-rose-400" /> Final Resolution <span className="text-rose-500">*</span>
                        </label>
                        <input 
                           name="end_date"
                           type="datetime-local"
                           value={eventData.end_date}
                           onChange={handleEventChange}
                           className={`w-full bg-slate-50 border px-6 py-5 rounded-2xl font-sans text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all ${fieldErrors.end_date ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-indigo-200'}`} 
                        />
                        {fieldErrors.end_date && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider pl-1">{fieldErrors.end_date}</p>}
                     </div>
                  </div>
               </div>
            </div>

            {/* 02. Ticket Architecture */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-10 shadow-sm">
               <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                        <TicketIcon size={20} />
                     </div>
                     <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Access Architecture</h3>
                        <p className="text-slate-400 text-xs font-medium">Define ticket brackets and unit capacities.</p>
                     </div>
                  </div>
                  <button 
                     onClick={addTier}
                     className="px-6 py-3 bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                  >
                     <Plus size={14} /> Add Tier
                  </button>
               </div>

                <div className="space-y-4">
                  {ticketTiers.map((tier, idx) => (
                     <div key={idx} className="p-6 bg-slate-50 rounded-2xl relative border border-slate-100 group animate-in slide-in-from-right-2 duration-300 shadow-sm">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-indigo-600 text-white font-black flex items-center justify-center rounded-xl shadow-lg shadow-indigo-600/20 text-[10px]">
                           {idx + 1}
                        </div>
                        {ticketTiers.length > 1 && (
                           <button 
                              onClick={() => removeTier(idx)}
                              className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                              title="Remove Tier"
                           >
                              <X size={16} />
                           </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="space-y-2">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Name</label>
                              <input 
                                 name="name"
                                 value={tier.name}
                                 onChange={(e) => handleTierChange(idx, e)}
                                 placeholder="e.g. Presale 1"
                                 className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-300 transition-all shadow-sm" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Price (IDR)</label>
                              <input 
                                 name="price"
                                 type="number"
                                 value={tier.price}
                                 onChange={(e) => handleTierChange(idx, e)}
                                 placeholder="0"
                                 className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-300 transition-all shadow-sm" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Capacity</label>
                              <input 
                                 name="quota"
                                 type="number"
                                 value={tier.quota}
                                 onChange={(e) => handleTierChange(idx, e)}
                                 placeholder="100"
                                 className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-300 transition-all shadow-sm" 
                              />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Sidebar Controls/Asset Upload */}
         <div className="lg:col-span-4 space-y-8">
            
            {/* Visual Identity Section */}
            <div className={`bg-white border rounded-[32px] p-8 shadow-sm transition-all ${fieldErrors.banner ? 'border-rose-300 bg-rose-50' : 'border-slate-100'}`}>
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                     <Upload size={20} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase">Hero Asset</h3>
               </div>

               <div className="space-y-6">
                  <div className="relative aspect-[16/10] w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden group hover:border-indigo-400 transition-all cursor-pointer">
                     {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                     ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                           <Upload size={48} className="text-slate-200 mb-4 group-hover:text-indigo-400 group-hover:-translate-y-2 transition-all" />
                           <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Upload Branding</p>
                           <p className="text-[9px] text-slate-400 leading-relaxed max-w-[140px]">High-resolution 16:10 aspect ratio expected.</p>
                        </div>
                     )}
                     <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                     />
                  </div>
                  
                  {fieldErrors.banner && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider text-center">{fieldErrors.banner}</p>}

                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-4">
                     <CheckCircle2 size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                     <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                        Uploaded assets are synchronized to our global CDN. Please ensure clear representation as this is the primary conversion point.
                     </p>
                  </div>
               </div>
            </div>

            {/* Quick Summary / Status */}
            <div className="bg-indigo-600 border border-indigo-500 rounded-[32px] p-8 text-white shadow-2xl shadow-indigo-600/20">
                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Current Visibility</p>
                        <h4 className="text-xl font-black uppercase tracking-tight">Standard Release</h4>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-80">
                           <span>Total Tiers</span>
                           <span>{ticketTiers.length}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-80">
                           <span>Base Currency</span>
                           <span>IDR</span>
                        </div>
                    </div>
                    <button 
                       onClick={handleSubmit}
                       disabled={loading}
                       className="w-full py-4 bg-white text-indigo-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                       {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                       Initialize Node
                    </button>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CreateEvent;
