import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, MoreVertical, Calendar, MapPin, Ticket as TicketIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { adminApi } from '@/services/api';
import type { Event } from '@/types';

const EventsList: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAllEvents()
      .then(res => setEvents(res.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      adminApi.deleteEvent(id)
        .then(() => setEvents(events.filter(e => e.id !== id)))
        .catch((err: any) => alert('Failed to delete: ' + err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold tracking-tight text-foreground">Events Catalog</h2>
           <p className="text-muted-foreground text-sm">Manage all your upcoming and past events efficiently.</p>
        </div>
        <Button onClick={() => navigate('/admin/events/create')} className="flex items-center gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>

      <Card className="border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[300px]">Event Details</TableHead>
              <TableHead>Schedule & Venue</TableHead>
              <TableHead>Ticketing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-24 text-muted-foreground animate-pulse">
                   Fetching records...
                 </TableCell>
               </TableRow>
            ) : events.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-24 text-muted-foreground">
                   No events found. Start by creating a new one.
                 </TableCell>
               </TableRow>
            ) : (
              events.map(event => (
                <TableRow key={event.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden border">
                         <img 
                           src={event.banner_url || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=100&h=100&fit=crop"} 
                           alt={event.title} 
                           className="w-full h-full object-cover"
                         />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm truncate">{event.title}</span>
                        <span className="text-xs text-muted-foreground">ID: {event.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                       <span className="flex items-center gap-2 text-foreground font-medium">
                         <Calendar className="w-3.5 h-3.5" />
                         {new Date(event.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                       </span>
                       <span className="flex items-center gap-2 truncate max-w-[180px]">
                         <MapPin className="w-3.5 h-3.5" />
                         {event.location}
                       </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <TicketIcon className="w-4 h-4 text-primary" />
                       <span className="text-sm font-medium">{(event.ticket_types || []).length} Tiers</span>
                    </div>
                  </TableCell>
                  <TableCell>
                     <Badge variant={event.publish_status === 'published' ? 'default' : 'secondary'} className="capitalize px-3">
                       {event.publish_status}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => navigate(`/admin/events/${event.id}`)} className="flex items-center gap-2 cursor-pointer">
                          <Edit className="w-4 h-4" /> Edit Event
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="w-4 h-4" /> Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default EventsList;
