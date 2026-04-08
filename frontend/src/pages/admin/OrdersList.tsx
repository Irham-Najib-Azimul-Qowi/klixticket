import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/services/api';
import type { Order } from '@/types';

function formatPrice(price: number) {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAllOrders()
      .then(res => setOrders(res.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

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
              {loading ? (
                 <TableRow>
                   <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Loading orders...</TableCell>
                 </TableRow>
              ) : orders.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No orders found.</TableCell>
                 </TableRow>
              ) : (
                orders.map(order => {
                  const eventName = order.order_items?.[0]?.ticket_type?.name || order.order_items?.[0]?.item_name || 'N/A';
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-semibold text-xs">...{order.id.split('-').pop()}</TableCell>
                      <TableCell className="text-muted-foreground">{order.user?.name || 'Guest'}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">{eventName}</TableCell>
                      <TableCell>{formatPrice(order.total_amount)}</TableCell>
                      <TableCell>
                         <Badge variant={order.status === 'paid' ? 'default' : order.status === 'pending' ? 'secondary' : 'destructive'} 
                           className={
                             order.status === 'paid' ? 'bg-green-600 hover:bg-green-700' :
                             order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''
                           }>
                           {order.status}
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

export default OrdersList;
