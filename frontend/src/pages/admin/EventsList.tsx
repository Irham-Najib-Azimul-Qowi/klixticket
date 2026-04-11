import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Loader2, Search, Filter, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { adminApi } from '@/services/api';
import type { Event } from '@/types';
import { formatImageURL, getPlaceholderImage } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

const EventsList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res: any = await adminApi.getAllEvents();
      const eventData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setEvents(eventData);
    } catch (error) {
      setEvents([]);
      showToast('Failed to sync event node records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setEventToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (eventToDelete === null) return;
    
    try {
      await adminApi.deleteEvent(eventToDelete);
      showToast('Event manifest successfully terminated.', 'success');
      fetchEvents();
    } catch (err: any) {
      showToast('Termination protocol failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 focus:outline-none">Event Catalog</h2>
          <p className="text-sm text-slate-500 font-medium">Manage and schedule your high-traffic event nodes.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/events/create')} 
          className="bg-slate-950 hover:bg-slate-800 text-white px-4 py-2 rounded-md font-bold text-xs transition-all flex items-center gap-2 w-fit uppercase tracking-widest"
        >
          <Plus size={16} /> Deploy Event
        </button>
      </div>

      {/* Filters/Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between py-2 border-b border-slate-100">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search manifests..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-950/5 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-colors text-xs font-bold uppercase tracking-widest">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      {/* List Area */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white border border-slate-100 rounded-md">
            <Loader2 className="animate-spin text-slate-300 w-8 h-8 mb-4" />
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Syncing manifest logs...</p>
          </div>
        ) : !Array.isArray(events) || events.length === 0 ? (
          <div className="py-32 bg-white border border-slate-200 rounded-md text-center">
             <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-200" />
             <p className="text-sm font-bold text-slate-900">No event nodes detected</p>
             <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Initialize a new manifest to populate the catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {events.map(event => (
              <div key={event.id} className="bg-white border border-slate-200 p-4 rounded-md flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-slate-400 transition-colors">
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="w-16 h-16 bg-slate-50 rounded border border-slate-100 overflow-hidden flex-shrink-0">
                      <img 
                        src={formatImageURL(event.banner_url, 'event')} 
                        alt={event.title} 
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                        onError={(e) => { 
                          const target = e.target as HTMLImageElement;
                          target.src = getPlaceholderImage(); 
                        }}
                      />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">EVT-{event.id.toString().padStart(4, '0')}</span>
                        <div className={`px-2 py-0.5 text-[8px] font-black uppercase rounded border ${
                          event.publish_status === 'published' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {event.publish_status}
                        </div>
                     </div>
                     <h3 className="text-sm font-bold text-slate-900 truncate">{event.title}</h3>
                     <div className="flex flex-wrap items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-slate-400">
                           <Calendar size={12} />
                           <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(event.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                           <MapPin size={12} />
                           <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[120px]">{event.location}</span>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                   <button 
                     onClick={() => navigate(`/admin/events/edit/${event.id}`)}
                     className="flex-1 md:flex-none p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-950 transition-colors rounded border border-transparent hover:border-slate-100"
                     title="Edit Event"
                   >
                     <Edit size={16} />
                   </button>
                   <button 
                     onClick={() => handleDeleteClick(event.id)}
                     className="flex-1 md:flex-none p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors rounded border border-transparent hover:border-rose-100"
                     title="Delete Event"
                   >
                     <Trash2 size={16} />
                   </button>
                   <div className="h-4 w-px bg-slate-100 mx-1 hidden md:block" />
                   <button className="hidden md:block p-2 text-slate-400 hover:text-slate-950">
                      <MoreVertical size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Terminate Event Node"
        message="This will permanently delete the event manifest and all associated data records. This protocol cannot be reversed."
        confirmText="Confirm Termination"
        type="danger"
      />
    </div>
  );
};

export default EventsList;
