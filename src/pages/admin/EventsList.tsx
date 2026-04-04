import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const EventsList: React.FC = () => {
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
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Options</TableHead>
                <TableHead>Quota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">Symphony of The Stars</TableCell>
                <TableCell className="text-muted-foreground">Oct 12, 2026</TableCell>
                <TableCell className="text-muted-foreground">Jakarta Arena</TableCell>
                <TableCell>Rp 500,000</TableCell>
                <TableCell>
                  <Badge variant="secondary">800 / 1000</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">DevConnect Summit</TableCell>
                <TableCell className="text-muted-foreground">Nov 20, 2026</TableCell>
                <TableCell className="text-muted-foreground">ICE BSD</TableCell>
                <TableCell>Rp 150,000</TableCell>
                <TableCell>
                  <Badge variant="secondary">150 / 300</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Culinary Night Fest</TableCell>
                <TableCell className="text-muted-foreground">Dec 05, 2026</TableCell>
                <TableCell className="text-muted-foreground">GBK Plaza</TableCell>
                <TableCell>Free</TableCell>
                <TableCell>
                  <Badge variant="destructive">Full / 500</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsList;
