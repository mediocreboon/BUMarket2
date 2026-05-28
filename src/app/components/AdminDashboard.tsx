import { useState } from 'react';
import {
  Users, Package, ShieldCheck, Flag, BarChart2, Bell, LogOut, Settings,
  TrendingUp, TrendingDown, Eye, CheckCircle, XCircle, Clock, Search,
  LayoutDashboard, AlertTriangle, MessageSquare, Menu
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockProducts } from '../data/mockProducts';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AdminDashboardProps {
  onLogout: () => void;
}

const platformStats = [
  { label: 'Total Users', value: '1,284', change: '+12.5%', positive: true, icon: Users, color: 'bg-blue-100 text-blue-600' },
  { label: 'Active Sellers', value: '342', change: '+8.3%', positive: true, icon: ShieldCheck, color: 'bg-indigo-100 text-indigo-600' },
  { label: 'Total Listings', value: '1,071', change: '+15.2%', positive: true, icon: Package, color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Flagged Items', value: '7', change: '+2', positive: false, icon: Flag, color: 'bg-red-100 text-red-600' },
];

const monthlyGrowth = [
  { month: 'Jan', users: 800, sellers: 180 },
  { month: 'Feb', users: 950, sellers: 220 },
  { month: 'Mar', users: 1050, sellers: 265 },
  { month: 'Apr', users: 1180, sellers: 310 },
  { month: 'May', users: 1284, sellers: 342 },
];

const pendingVerifications = [
  { id: 1, name: 'Patricia Lim', dept: 'Computer Studies', submittedAt: '10 min ago', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
  { id: 2, name: 'Jose Miguel', dept: 'Engineering', submittedAt: '25 min ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  { id: 3, name: 'Anna Cruz', dept: 'Nursing', submittedAt: '1 hour ago', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
];

const flaggedProducts = [
  { id: 1, title: 'Suspicious Item Listing', seller: 'Unknown Seller', reason: 'Suspected fake product', reportCount: 3 },
  { id: 2, title: 'Overpriced Calculator', seller: 'JT Supplies', reason: 'Price manipulation', reportCount: 2 },
];

const recentActivity = [
  { id: 1, type: 'signup', text: 'New buyer registered: Mark Ramos', time: '2 min ago' },
  { id: 2, type: 'product', text: 'New product listed: Nursing Reviewer Set', time: '8 min ago' },
  { id: 3, type: 'flag', text: 'Product flagged by 2 users: Suspicious Item', time: '15 min ago' },
  { id: 4, type: 'verify', text: 'Seller verified: Maria Santos (BUShop)', time: '30 min ago' },
  { id: 5, type: 'order', text: 'Order completed: Coffee Bundle × 5', time: '45 min ago' },
];

type AdminView = 'overview' | 'users' | 'listings' | 'verifications' | 'reports' | 'settings';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'listings', label: 'Product Listings', icon: Package },
  { id: 'verifications', label: 'Verifications', icon: ShieldCheck, badge: pendingVerifications.length },
  { id: 'reports', label: 'Reports & Flags', icon: Flag, badge: flaggedProducts.length },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [verifications, setVerifications] = useState(pendingVerifications);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchUsers, setSearchUsers] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'buyer' | 'seller'>('all');

  const handleApprove = (id: number) => {
    setVerifications(prev => prev.filter(v => v.id !== id));
    alert('✅ Seller verified and approved!');
  };

  const handleReject = (id: number) => {
    setVerifications(prev => prev.filter(v => v.id !== id));
    alert('❌ Verification rejected. Applicant notified.');
  };

  const mockUsers = [
    { id: 1, name: 'Maria Santos', email: 'maria@bu.edu', role: 'seller', dept: 'Teacher Education', status: 'verified', joinedDate: '2024-08', orders: 85 },
    { id: 2, name: 'Juan Dela Cruz', email: 'juan@bu.edu', role: 'buyer', dept: 'Nursing', status: 'active', joinedDate: '2024-09', orders: 12 },
    { id: 3, name: 'Carlos Reyes', email: 'carlos@bu.edu', role: 'seller', dept: 'Engineering', status: 'verified', joinedDate: '2024-07', orders: 22 },
    { id: 4, name: 'Anna Lopez', email: 'anna@bu.edu', role: 'buyer', dept: 'Computer Studies', status: 'active', joinedDate: '2025-01', orders: 8 },
    { id: 5, name: 'Sofia Garcia', email: 'sofia@bu.edu', role: 'seller', dept: 'Technology', status: 'pending', joinedDate: '2025-05', orders: 0 },
    { id: 6, name: 'Miguel Torres', email: 'miguel@bu.edu', role: 'seller', dept: 'Engineering', status: 'verified', joinedDate: '2024-09', orders: 90 },
  ];

  const filteredUsers = mockUsers.filter(u => {
    const matchSearch = !searchUsers || u.name.toLowerCase().includes(searchUsers.toLowerCase()) || u.email.toLowerCase().includes(searchUsers.toLowerCase());
    const matchRole = userFilter === 'all' || u.role === userFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-900 min-h-screen flex flex-col transition-all duration-200 flex-shrink-0`}>
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <span>
                <span className="font-bold text-white text-xl font-[Archivo_Black]">BU</span>
                <span className="font-bold text-blue-400 text-xl font-[Archivo_Black]">M</span>
                <span className="text-blue-400 text-base font-[Archivo]">arket</span>
              </span>
              <p className="text-slate-500 text-xs mt-0.5">Admin Panel</p>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0">
            <Menu className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as AdminView)}
                title={!sidebarOpen ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </div>
                {sidebarOpen && item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <h2 className="text-slate-800 font-semibold capitalize">
            {navItems.find(n => n.id === activeView)?.label || 'Admin'}
          </h2>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-slate-100 rounded-full">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white text-sm font-medium">A</div>
          </div>
        </header>

        {/* Overview */}
        {activeView === 'overview' && (
          <div className="flex-1 overflow-auto p-6">
            {/* Platform Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {platformStats.map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                        {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Growth Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h3 className="text-slate-800 text-sm font-semibold mb-4">Platform Growth (Monthly)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2.5} name="Total Users" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="sellers" stroke="#6366f1" strokeWidth={2.5} name="Active Sellers" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h3 className="text-slate-800 text-sm font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-start gap-2.5">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        activity.type === 'flag' ? 'bg-red-500' :
                        activity.type === 'verify' ? 'bg-emerald-500' :
                        activity.type === 'signup' ? 'bg-blue-500' : 'bg-slate-300'
                      }`} />
                      <div>
                        <p className="text-xs text-slate-700">{activity.text}</p>
                        <p className="text-xs text-slate-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending Verifications Quick View */}
            {verifications.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h3 className="text-slate-800 text-sm font-semibold">Pending Seller Verifications ({verifications.length})</h3>
                  </div>
                  <button onClick={() => setActiveView('verifications')} className="text-xs text-blue-600 hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                  {verifications.map(v => (
                    <div key={v.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ImageWithFallback src={v.avatar} alt={v.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-sm text-slate-800">{v.name}</p>
                          <p className="text-xs text-slate-400">{v.dept} · {v.submittedAt}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(v.id)} className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                        <button onClick={() => handleReject(v.id)} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flagged Products Quick View */}
            {flaggedProducts.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Flag className="w-4 h-4 text-red-500" />
                  <h3 className="text-slate-800 text-sm font-semibold">Flagged Products ({flaggedProducts.length})</h3>
                </div>
                <div className="space-y-3">
                  {flaggedProducts.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                      <div>
                        <p className="text-sm text-slate-800 font-medium">{p.title}</p>
                        <p className="text-xs text-slate-500">Seller: {p.seller} · {p.reportCount} reports · {p.reason}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-white text-slate-600 text-xs rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Review</button>
                        <button className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-xl hover:bg-red-600 transition-colors">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users View */}
        {activeView === 'users' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchUsers}
                    onChange={e => setSearchUsers(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                {(['all', 'buyer', 'seller'] as const).map(f => (
                  <button key={f} onClick={() => setUserFilter(f)} className={`px-3 py-2.5 text-xs rounded-xl border transition-colors capitalize ${userFilter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {f === 'all' ? 'All Users' : f === 'buyer' ? 'Buyers' : 'Sellers'}
                  </button>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['User', 'Role', 'Department', 'Status', 'Joined', 'Actions'].map(col => (
                        <th key={col} className="text-left text-xs text-slate-500 font-medium px-3 py-3">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium flex-shrink-0">
                              {user.name[0]}
                            </div>
                            <div>
                              <p className="text-sm text-slate-800">{user.name}</p>
                              <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${user.role === 'seller' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-600">{user.dept}</td>
                        <td className="px-3 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                            user.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                            user.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-500">{user.joinedDate}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1.5">
                            <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><XCircle className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Listings View */}
        {activeView === 'listings' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-slate-800 text-sm font-semibold mb-5">All Product Listings ({mockProducts.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Product', 'Seller', 'Category', 'Price', 'Status', 'Actions'].map(col => (
                        <th key={col} className="text-left text-xs text-slate-500 font-medium px-3 py-3">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {mockProducts.slice(0, 10).map(product => (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <ImageWithFallback src={product.image} alt={product.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                            <p className="text-sm text-slate-800 line-clamp-1 max-w-xs">{product.title}</p>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-600">{product.seller}</td>
                        <td className="px-3 py-3">
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{product.category}</span>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-800 font-medium">₱{product.price.toLocaleString()}</td>
                        <td className="px-3 py-3">
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">Active</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1.5">
                            <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Flag className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Verifications */}
        {activeView === 'verifications' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-slate-800 text-sm font-semibold mb-5">Pending Seller Verification Requests</h3>
              {verifications.length > 0 ? (
                <div className="space-y-4">
                  {verifications.map(v => (
                    <div key={v.id} className="border border-slate-100 rounded-2xl p-5 flex items-center justify-between hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-4">
                        <ImageWithFallback src={v.avatar} alt={v.name} className="w-14 h-14 rounded-full object-cover" />
                        <div>
                          <p className="text-slate-800 font-medium">{v.name}</p>
                          <p className="text-slate-500 text-sm">{v.dept} Department</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-400">{v.submittedAt}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleApprove(v.id)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm">
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => handleReject(v.id)} className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm border border-red-100">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>All verifications processed!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports */}
        {activeView === 'reports' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-slate-800 text-sm font-semibold mb-5">Flagged & Reported Items</h3>
              <div className="space-y-4">
                {flaggedProducts.map(p => (
                  <div key={p.id} className="border border-red-100 rounded-2xl p-5 bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-800 font-medium">{p.title}</p>
                        <p className="text-slate-500 text-sm mt-0.5">Seller: {p.seller}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">{p.reportCount} reports</span>
                          <span className="text-xs text-slate-500">{p.reason}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-2 bg-white text-slate-600 text-sm rounded-xl border border-slate-200 hover:bg-slate-50">Review</button>
                        <button className="px-3 py-2 bg-amber-500 text-white text-sm rounded-xl hover:bg-amber-600">Warn Seller</button>
                        <button className="px-3 py-2 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="flex-1 p-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 max-w-lg shadow-sm">
              <h3 className="text-slate-800 font-semibold mb-4">Platform Settings</h3>
              <div className="space-y-4">
                {[
                  { label: 'Platform Name', value: 'BUMarket' },
                  { label: 'Admin Email', value: 'admin@bu.edu.ph' },
                  { label: 'Support Contact', value: 'bumarket@bu.edu.ph' },
                ].map(field => (
                  <div key={field.label}>
                    <label className="block text-sm text-slate-600 mb-1.5">{field.label}</label>
                    <input defaultValue={field.value} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                ))}
                <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm hover:bg-slate-800 transition-colors">Save Settings</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
