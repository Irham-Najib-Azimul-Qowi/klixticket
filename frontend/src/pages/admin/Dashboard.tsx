import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, 
  CreditCard, 
  Calendar, 
  Package, 
  ArrowUpRight,
  Loader2,
  Users,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { adminApi } from '@/services/api';
import type { DashboardSummaryResponse, Order } from '@/types';

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
      value: `IDR ${(summary?.revenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      trend: "+12.5%",
      isPositive: true
    },
    {
      title: "Total Transactions",
      value: (summary as any)?.total_orders || 0,
      icon: CreditCard,
      trend: "+5.2%",
      isPositive: true
    },
    {
      title: "Active Events",
      value: summary?.active_events || 0,
      icon: Calendar,
      trend: "0%",
      isPositive: true
    },
    {
      title: "Inventory Units",
      value: (summary as any)?.total_merchandise || 0,
      icon: Package,
      trend: "-2.1%",
      isPositive: false
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-slate-300 animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h2>
          <p className="text-sm text-slate-500 font-medium">Real-time performance metrics and system activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-md hover:bg-slate-50 transition-colors uppercase tracking-widest">
            Export Report
          </button>
          <button onClick={() => navigate('/admin/events/create')} className="px-4 py-2 bg-slate-900 border border-slate-900 text-white text-xs font-bold rounded-md hover:bg-slate-800 transition-colors uppercase tracking-widest">
            New Event
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-6 rounded-md shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-slate-50 rounded text-slate-600 border border-slate-100">
                   <stat.icon size={18} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold ${stat.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                   {stat.isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                   {stat.trend}
                </div>
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
              <Link to="/admin/orders" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 uppercase tracking-widest">
                 View All <ArrowUpRight size={14} />
              </Link>
           </div>

           <div className="bg-white border border-slate-200 rounded-md divide-y divide-slate-100 overflow-hidden">
              {(!Array.isArray(recentOrders) || recentOrders.length === 0) ? (
                <div className="p-12 text-center">
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No recent transactions found</p>
                </div>
              ) : (
                recentOrders.map(order => (
                  <div 
                    key={order.id} 
                    onClick={() => navigate('/admin/orders')}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-950 rounded flex items-center justify-center font-bold text-white text-sm">
                           {order.user?.name?.substring(0, 1).toUpperCase() || 'G'}
                        </div>
                        <div className="min-w-0">
                           <p className="text-sm font-bold text-slate-900 truncate">{order.user?.name || 'Customer'}</p>
                           <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-tighter">ORD-{order.id.slice(-6).toUpperCase()} • {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <div className="text-right flex items-center gap-6">
                        <div>
                           <p className="text-sm font-bold text-slate-900">IDR {order.total_amount.toLocaleString()}</p>
                           <div className="flex items-center justify-end gap-1.5 mt-0.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{order.status}</span>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-950 transition-colors" />
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
           {/* Quick Actions */}
           <div className="bg-slate-950 rounded-md p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">System Gateway</span>
              </div>
              <div className="space-y-3">
                 <Link to="/admin/events/create" className="block w-full text-center py-3 bg-white text-slate-950 rounded font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">
                    Host New Event
                 </Link>
                 <Link to="/admin/merch/create" className="block w-full text-center py-3 bg-slate-800 text-white rounded font-bold text-xs uppercase tracking-widest hover:bg-slate-700 transition-colors">
                    List Merchandise
                 </Link>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Live Reach</span>
                 </div>
                 <span className="text-lg font-bold">1,204</span>
              </div>
           </div>

           {/* Market Brief */}
           <div className="border border-slate-200 rounded-md p-6 bg-white">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Market Insight</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                 Your ticket velocity has increased by 14% this period. Optimal conversion rates detected in the "Music/Festival" category. 
              </p>
              <div className="mt-6 flex items-center gap-2 text-emerald-600">
                 <TrendingUp size={14} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Optimal Performance</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
