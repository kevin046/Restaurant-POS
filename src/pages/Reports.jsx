import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  DollarSign, TrendingUp, Users, Receipt,
  Calendar, Download, ChefHat, Clock, FileText
} from 'lucide-react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { cn } from "@/lib/utils";
import DailySalesReport from '@/components/pos/DailySalesReport';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const [dateRange, setDateRange] = useState('today');
  const [showDailyReport, setShowDailyReport] = useState(false);

  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { $gte: startOfDay(now).toISOString() };
      case 'week':
        return { $gte: subDays(now, 7).toISOString() };
      case 'month':
        return { $gte: subDays(now, 30).toISOString() };
      default:
        return {};
    }
  };

  const { data: paidOrders = [] } = useQuery({
    queryKey: ['report-paid-orders', dateRange],
    queryFn: async () => {
      const allOrders = await base44.entities.Order.filter({ status: 'paid' });
      const dateFilter = getDateFilter();
      if (dateFilter.$gte) {
        return allOrders.filter(o => new Date(o.closed_at || o.created_date) >= new Date(dateFilter.$gte));
      }
      return allOrders;
    }
  });

  const { data: completedOrders = [] } = useQuery({
    queryKey: ['report-completed-orders', dateRange],
    queryFn: async () => {
      const allOrders = await base44.entities.Order.filter({ status: 'completed' });
      const dateFilter = getDateFilter();
      if (dateFilter.$gte) {
        return allOrders.filter(o => new Date(o.closed_at || o.created_date) >= new Date(dateFilter.$gte));
      }
      return allOrders;
    }
  });

  // Merge all finalized orders
  const orders = [...paidOrders, ...completedOrders];

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', dateRange],
    queryFn: () => base44.entities.Transaction.filter({ type: 'payment' })
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ['all-shifts'],
    queryFn: () => base44.entities.Shift.list()
  });

  // Calculate metrics
  // Calculate directly from items to ensure consistency with Daily Report and handle potential stale DB values
  const totalSubtotal = orders.reduce((sum, o) => {
    return sum + (o.items?.reduce((is, i) => is + (i.price * i.quantity), 0) || 0);
  }, 0);

  const totalTax = totalSubtotal * 0.13; // Always calculate tax from actual items
  const totalSales = totalSubtotal + totalTax; // Total Revenue (excluding tips)
  const totalTips = orders.reduce((sum, o) => sum + (o.tip || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalSales / orders.length : 0;
  const totalGuests = orders.reduce((sum, o) => sum + (o.guests || 0), 0);

  // Order type breakdown
  // Online orders: orders that were paid online (before arrival)
  // In-store orders: all other orders including dine-in and takeout paid in-store
  const onlineOrders = orders.filter(o => o.is_online && o.payment_status === 'paid');
  const takeoutOrders = orders.filter(o => o.type === 'takeout' && (!o.is_online || o.payment_status !== 'paid'));
  const dineInOrders = orders.filter(o => o.type === 'dine_in' || (!o.type && !o.is_online));
  const inStoreOrders = [...takeoutOrders, ...dineInOrders];

  const onlineSales = onlineOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const inStoreSales = inStoreOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  // Sales by payment method
  const salesByMethod = transactions.reduce((acc, t) => {
    acc[t.method] = (acc[t.method] || 0) + t.amount;
    return acc;
  }, {});

  const paymentMethodData = Object.entries(salesByMethod).map(([method, amount]) => ({
    name: method.charAt(0).toUpperCase() + method.slice(1),
    value: amount
  }));

  // Sales by hour
  const salesByHour = orders.reduce((acc, o) => {
    const hour = new Date(o.closed_at || o.created_date).getHours();
    acc[hour] = (acc[hour] || 0) + (o.total || 0);
    return acc;
  }, {});

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    sales: salesByHour[i] || 0
  })).filter(d => d.sales > 0);

  // Top selling items
  const itemSales = {};
  orders.forEach(order => {
    order.items?.forEach(item => {
      const key = item.name;
      if (!itemSales[key]) {
        itemSales[key] = { name: key, quantity: 0, revenue: 0 };
      }
      itemSales[key].quantity += item.quantity || 0;
      itemSales[key].revenue += (item.price || 0) * (item.quantity || 0);
    });
  });

  const topItems = Object.values(itemSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Server performance
  const serverPerformance = orders.reduce((acc, o) => {
    const server = o.server || 'Unknown';
    if (!acc[server]) {
      acc[server] = { server, sales: 0, tips: 0, orders: 0 };
    }
    acc[server].sales += o.total || 0;
    acc[server].tips += o.tip || 0;
    acc[server].orders += 1;
    return acc;
  }, {});

  const serverData = Object.values(serverPerformance).sort((a, b) => b.sales - a.sales);

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Header (Fixed) */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
            <p className="text-slate-500">Business performance insights</p>
          </div>
          <div className="flex items-center gap-3">
            <Tabs value={dateRange} onValueChange={setDateRange}>
              <TabsList className="bg-slate-800/50">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              onClick={() => setShowDailyReport(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Daily Report
            </Button>
            <Button variant="outline" className="border-slate-700 text-slate-400">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Stats (Scrollable Area) */}
      <div className="flex-1 overflow-auto p-6 pt-2">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Gross Sales</p>
                  <p className="text-3xl font-bold text-white">${totalSubtotal.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Tax Collected</p>
                  <p className="text-3xl font-bold text-white">${totalTax.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Tips</p>
                  <div>
                    <span className="text-3xl font-bold text-white">${totalTips.toFixed(2)}</span>
                    <span className="ml-2 text-sm text-emerald-400">
                      ({totalSubtotal > 0 ? ((totalTips / totalSubtotal) * 100).toFixed(1) : '0.0'}%)
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Gross Revenue <span className="text-[10px] opacity-70">(Excl. Tips)</span></p>
                  <p className="text-3xl font-bold text-white">${totalSales.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Hourly Sales */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                Sales by Hour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px' }}
                    itemStyle={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '500' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']}
                  />
                  <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-slate-400" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px' }}
                    itemStyle={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '500' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                    formatter={(value, name) => [`$${value.toFixed(2)}`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {paymentMethodData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-slate-400">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Items */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-slate-400" />
                Top Selling Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topItems.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                        index === 0 ? "bg-amber-500/20 text-amber-400" :
                          index === 1 ? "bg-slate-500/20 text-slate-400" :
                            index === 2 ? "bg-orange-500/20 text-orange-400" :
                              "bg-slate-800 text-slate-500"
                      )}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.quantity} sold</p>
                      </div>
                    </div>
                    <span className="font-semibold text-emerald-400">
                      ${item.revenue.toFixed(2)}
                    </span>
                  </div>
                ))}
                {topItems.length === 0 && (
                  <p className="text-center text-slate-500 py-8">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Server Performance */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" />
                Server Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {serverData.map((server, index) => (
                  <div
                    key={server.server}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                        "bg-gradient-to-br",
                        index === 0 ? "from-emerald-500 to-cyan-500" :
                          index === 1 ? "from-blue-500 to-purple-500" :
                            "from-slate-600 to-slate-700"
                      )}>
                        {server.server.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{server.server.split('@')[0]}</p>
                        <p className="text-xs text-slate-500">{server.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">${server.sales.toFixed(2)}</p>
                      <p className="text-xs text-emerald-400">+${server.tips.toFixed(2)} tips</p>
                    </div>
                  </div>
                ))}
                {serverData.length === 0 && (
                  <p className="text-center text-slate-500 py-8">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Daily Sales Report Modal */}
      <DailySalesReport
        open={showDailyReport}
        onClose={() => setShowDailyReport(false)}
        selectedDate={new Date()}
      />
    </div>
  );
}