import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign } from 'lucide-react';
import { adminApi } from '@/services/api';
import type { DashboardSummaryResponse, Order } from '@/types';
import { Badge } from '@/components/ui/badge';

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
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

  const stats = [
    {
      title: "Total Revenue",
      value: formatPrice(summary?.revenue || 0),
      icon: DollarSign,
      description: "Lifetime earnings from all sales",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Tickets Sold",
      value: summary?.tickets_sold || 0,
      icon: CreditCard,
      description: "Total tickets processed and paid",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Active Events",
      value: summary?.active_events || 0,
      icon: Activity,
      description: "Events currently published and live",
      color: "text-amber-600",
      bg: "bg-amber-50"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Overview</h2>
        <p className="text-muted-foreground text-sm">Key performance indicators and recent activity.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders Table */}
        <Card className="border-border shadow-sm col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
            <Badge variant="outline" className="font-normal">Latest 5 orders</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[150px]">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground animate-pulse">
                      Syncing data...
                    </TableCell>
                  </TableRow>
                ) : recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      No recent sales found.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map(order => (
                    <TableRow key={order.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate('/admin/orders')}>
                      <TableCell className="font-mono text-xs uppercase text-muted-foreground">
                        #{order.id.split('-').pop()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                           <span className="text-sm font-medium">{order.user?.name || 'Guest'}</span>
                           <span className="text-[10px] text-muted-foreground line-clamp-1">{order.user?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-semibold">{formatPrice(order.total_amount)}</TableCell>
                      <TableCell>
                         <Badge variant={order.status === 'paid' ? 'default' : order.status === 'pending' ? 'secondary' : 'destructive'}>
                           {order.status}
                         </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
