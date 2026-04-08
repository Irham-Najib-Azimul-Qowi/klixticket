import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, CreditCard, DollarSign } from 'lucide-react';
import { adminApi } from '@/services/api';
import type { DashboardSummaryResponse, Order } from '@/types';

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getDashboardSummary().catch(() => null),
      adminApi.getAllOrders({ limit: 5 }).catch(() => ({ data: [] }))
    ]).then(([summaryData, ordersData]) => {
      if (summaryData) setSummary(summaryData);
      setRecentOrders(ordersData?.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your ticketing platform metrics.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
               <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
               <div className="text-2xl font-bold">{formatPrice(summary?.revenue || 0)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Overall lifetime revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
               <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
               <div className="text-2xl font-bold">{summary?.tickets_sold || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Total combined tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
               <div className="h-8 w-12 bg-muted animate-pulse rounded" />
            ) : (
               <div className="text-2xl font-bold">{summary?.active_events || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Currently published & upcoming</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Loading recent sales...</TableCell>
                </TableRow>
              ) : recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No recent sales found.</TableCell>
                </TableRow>
              ) : (
                recentOrders.map(order => {
                  const eventName = order.order_items?.[0]?.ticket_type?.name || order.order_items?.[0]?.item_name || 'N/A';
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-xs">...{order.id.split('-').pop()}</TableCell>
                      <TableCell>{order.user?.name || 'Guest'}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">{eventName}</TableCell>
                      <TableCell>
                         <span className={`px-2 py-1 rounded text-xs uppercase font-bold tracking-wider ${
                           order.status === 'paid' ? 'bg-green-100 text-green-800' : 
                           order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                           'bg-red-100 text-red-800'
                         }`}>
                           {order.status}
                         </span>
                      </TableCell>
                      <TableCell className="text-right">{formatPrice(order.total_amount)}</TableCell>
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

export default Dashboard;
