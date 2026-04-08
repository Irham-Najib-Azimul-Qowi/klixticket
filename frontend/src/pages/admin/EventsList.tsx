import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/services/api';
import type { Event } from '@/types';

function formatPrice(price: number) {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

const EventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAllEvents()
      .then(res => setEvents(res.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Events Catalog</h2>
           <p className="text-muted-foreground mt-1">Manage all your upcoming and past events.</p>
        </div>
        <Link to="/admin/events/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-0" />
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Options (Price)</TableHead>
                <TableHead>Quota</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                   <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Loading events...</TableCell>
                 </TableRow>
              ) : events.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No events found.</TableCell>
                 </TableRow>
              ) : (
                events.map(event => {
                  const firstTicket = event.ticket_types?.[0];
                  const sold = firstTicket ? firstTicket.quota - firstTicket.remaining_quota : 0;
                  const total = firstTicket ? firstTicket.quota : 0;
                  const price = firstTicket?.price || 0;
                  
                  return (
                    <TableRow key={event.id}>
                      <TableCell className="font-semibold">{event.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(event.start_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{event.location}</TableCell>
                      <TableCell>{formatPrice(price)}</TableCell>
                      <TableCell>
                        <Badge variant={sold >= total && total > 0 ? "destructive" : "secondary"}>
                          {sold} / {total}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         <Badge variant={event.publish_status === 'published' ? 'default' : 'secondary'} className={event.publish_status === 'published' ? 'bg-green-600 hover:bg-green-700' : ''}>
                           {event.publish_status}
                         </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsList;
