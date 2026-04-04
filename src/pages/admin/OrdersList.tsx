import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const OrdersList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Transactions Directory</h2>
           <p className="text-muted-foreground mt-1">Review purchases and ticket statuses.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0" />
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">#TRX-001</TableCell>
                <TableCell className="text-muted-foreground">Budi Santoso</TableCell>
                <TableCell className="text-muted-foreground">Symphony of The Stars</TableCell>
                <TableCell>Rp 500,000</TableCell>
                <TableCell>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">Paid</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">#TRX-002</TableCell>
                <TableCell className="text-muted-foreground">Siti Aminah</TableCell>
                <TableCell className="text-muted-foreground">DevConnect Summit</TableCell>
                <TableCell>Rp 150,000</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">#TRX-003</TableCell>
                <TableCell className="text-muted-foreground">Andi Saputra</TableCell>
                <TableCell className="text-muted-foreground">Culinary Night Fest</TableCell>
                <TableCell>Free</TableCell>
                <TableCell>
                  <Badge variant="destructive">Expired</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersList;
