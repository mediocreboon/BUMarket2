import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Star, Eye } from 'lucide-react';

const weeklyRevenue = [
  { day: 'Mon', revenue: 1200, orders: 4 },
  { day: 'Tue', revenue: 2100, orders: 7 },
  { day: 'Wed', revenue: 800, orders: 3 },
  { day: 'Thu', revenue: 3200, orders: 11 },
  { day: 'Fri', revenue: 2800, orders: 9 },
  { day: 'Sat', revenue: 4100, orders: 14 },
  { day: 'Sun', revenue: 1900, orders: 6 },
];

const monthlyRevenue = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Feb', revenue: 18500 },
  { month: 'Mar', revenue: 15200 },
  { month: 'Apr', revenue: 22300 },
  { month: 'May', revenue: 28100 },
];

const categoryData = [
  { name: 'Food & Snacks', value: 35, color: '#3b82f6' },
  { name: 'Academic', value: 28, color: '#8b5cf6' },
  { name: 'Apparel', value: 20, color: '#10b981' },
  { name: 'Services', value: 12, color: '#f59e0b' },
  { name: 'Electronics', value: 5, color: '#ef4444' },
];

const topProducts = [
  { name: 'Coffee & Pastry Bundle', sold: 210, revenue: 31500, rating: 4.9 },
  { name: 'Tutoring – Math & Physics', sold: 90, revenue: 27000, rating: 5.0 },
  { name: 'Thesis Printing & Binding', sold: 112, revenue: 56000, rating: 4.8 },
  { name: 'Custom Printed T-Shirts', sold: 145, revenue: 29000, rating: 4.7 },
  { name: 'Healthy Meal Prep Box', sold: 60, revenue: 27000, rating: 4.6 },
];

const statCards = [
  { label: 'Total Revenue', value: '₱28,100', change: '+18.5%', positive: true, icon: DollarSign, color: 'bg-blue-100 text-blue-600' },
  { label: 'Total Orders', value: '54', change: '+12.3%', positive: true, icon: Package, color: 'bg-indigo-100 text-indigo-600' },
  { label: 'Avg. Rating', value: '4.8 ★', change: '+0.2', positive: true, icon: Star, color: 'bg-amber-100 text-amber-600' },
  { label: 'Profile Views', value: '1,240', change: '-5.1%', positive: false, icon: Eye, color: 'bg-emerald-100 text-emerald-600' },
];

export function SellerAnalytics() {
  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-6">
      <div className="mb-6">
        <h2 className="text-slate-900">Analytics & Insights</h2>
        <p className="text-slate-500 text-sm mt-1">Performance overview for May 2026</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${card.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {card.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {card.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-1">{card.value}</p>
              <p className="text-xs text-slate-500">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Weekly Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-slate-800 text-sm font-semibold">This Week's Revenue</h3>
            <span className="text-xs text-slate-400">May 5–11, 2026</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyRevenue} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`₱${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="text-slate-800 text-sm font-semibold mb-5">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, 'Share']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {categoryData.map(cat => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-600 truncate">{cat.name}</span>
                </div>
                <span className="text-slate-800 font-medium">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6">
        <h3 className="text-slate-800 text-sm font-semibold mb-5">Monthly Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`₱${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h3 className="text-slate-800 text-sm font-semibold mb-4">Top Performing Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Product', 'Units Sold', 'Revenue', 'Rating'].map(col => (
                  <th key={col} className="text-left text-xs text-slate-400 font-medium pb-3 pr-4">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topProducts.map((p, i) => (
                <tr key={p.name} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-indigo-50 text-indigo-600 text-xs rounded-full flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      <span className="text-sm text-slate-700">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm text-slate-600">{p.sold}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm text-slate-800 font-medium">₱{p.revenue.toLocaleString()}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-sm text-amber-500">★ {p.rating}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
