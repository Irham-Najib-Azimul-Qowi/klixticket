import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from "@/components/ui/card";
import { adminApi } from '@/services/api';
import type { Order } from '@/types';
import { CreditCard, ShoppingBag, Clock, User, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAllOrders()
      .then(res => setOrders(res.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  }

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'expired':
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold tracking-tight text-foreground">Transaction Registry</h2>
           <p className="text-muted-foreground text-sm">Monitor all customer orders, payment status, and fulfillment.</p>
        </div>
      </div>

      <Card className="border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[180px]">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-24 text-muted-foreground animate-pulse">
                   Loading transaction records...
                 </TableCell>
               </TableRow>
            ) : orders.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-24 text-muted-foreground">
                   No transactions found in history.
                 </TableCell>
               </TableRow>
            ) : (
              orders.map(order => {
                const isTicket = order.order_items?.[0]?.item_type === 'ticket';
                const firstItem = order.order_items?.[0]?.item_name || 'Multiple Items';
                
                return (
                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-xs text-muted-foreground uppercase">ORD-{order.id.split('-').pop()}</span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <User className="w-4 h-4 text-secondary-foreground" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{order.user?.name || 'Guest User'}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[120px]">{order.user?.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        {isTicket ? <CreditCard className="w-3.5 h-3.5 text-primary" /> : <ShoppingBag className="w-3.5 h-3.5 text-primary" />}
                        <span className="truncate max-w-[150px]">{firstItem}</span>
                        {order.order_items && order.order_items.length > 1 && (
                          <Badge variant="outline" className="text-[10px] h-4.5 px-1.5">+{order.order_items.length - 1}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      {formatPrice(order.total_amount)}
                    </TableCell>
                    <TableCell>
                       <Badge variant={getStatusVariant(order.status)} className="capitalize font-medium">
                         {order.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                         Details <ArrowUpRight className="w-3 h-3" />
                       </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default OrdersList;
