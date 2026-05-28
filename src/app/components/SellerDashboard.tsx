import { useState } from 'react';
import {
  DollarSign, Star, Calendar, AlertTriangle, Clock, MapPin, CheckCircle,
  RefreshCw, Package, PauseCircle, LayoutDashboard, MessageCircle, Box,
  CalendarDays, User, Settings, LogOut, ChevronDown, X, Upload, Save,
  TrendingUp, BarChart2, ShieldCheck, Bell, Menu
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SellerInventory } from './SellerInventory';
import { SellerMessages } from './SellerMessages';
import { SellerAnalytics } from './SellerAnalytics';
import { AIChatbot } from './AIChatbot';

interface SellerDashboardProps {
  userName: string;
  onLogout: () => void;
}

const todaysMeetups = [
  { id: 1, time: '1:00 PM', location: 'Main Library', buyer: 'Sarah Chen', item: 'Scientific Calculator', itemImage: 'https://images.unsplash.com/photo-1599652301647-d5ee6100b577?w=200', status: 'pending' },
  { id: 2, time: '3:30 PM', location: 'Student Center', buyer: 'Mark Rodriguez', item: 'Engineering Textbook', itemImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200', status: 'pending' },
  { id: 3, time: '5:00 PM', location: 'Cafeteria', buyer: 'Emma Wilson', item: 'Campus Hoodie', itemImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200', status: 'pending' },
];

const recentMessages = [
  { id: 1, buyer: 'John Davis', message: 'Is this still available?', time: '5 min ago', unread: true },
  { id: 2, buyer: 'Lisa Wong', message: 'Can we meet at 2pm instead?', time: '15 min ago', unread: true },
  { id: 3, buyer: 'Michael Brown', message: 'Thanks! See you tomorrow.', time: '1 hour ago', unread: false },
];

const recentOrders = [
  { id: 'ORD-001', product: 'Homemade Strawberry Cake', buyer: 'Alyssa Santos', amount: 250, status: 'pending', date: 'May 11' },
  { id: 'ORD-002', product: 'Coffee & Pastry Bundle', buyer: 'Karl Tan', amount: 150, status: 'completed', date: 'May 10' },
  { id: 'ORD-003', product: 'Nursing Reviewer Set', buyer: 'Mia Cruz', amount: 350, status: 'confirmed', date: 'May 10' },
  { id: 'ORD-004', product: 'Scientific Calculator', buyer: 'Ryan Go', amount: 800, status: 'pending', date: 'May 9' },
];

const orderStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
};

type SellerView = 'dashboard' | 'messages' | 'inventory' | 'schedule' | 'analytics' | 'settings';

export function SellerDashboard({ userName, onLogout }: SellerDashboardProps) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [completedMeetups, setCompletedMeetups] = useState<number[]>([]);
  const [activeView, setActiveView] = useState<SellerView>('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileData, setProfileData] = useState({
    displayName: userName,
    bio: 'Engineering Student | Selling old books and school supplies',
    locations: { cafeteria: true, library: true, gate1: false, studentCenter: true },
    paymentMethods: { gcash: '', maya: '' },
  });

  const unreadCount = recentMessages.filter(m => m.unread).length;

  const sidebarItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadCount },
    { id: 'inventory', label: 'My Inventory', icon: Box },
    { id: 'schedule', label: 'Meet-up Schedule', icon: CalendarDays },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-slate-100 min-h-screen flex flex-col transition-all duration-200 flex-shrink-0`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          {sidebarOpen && (
            <span>
              <span className="font-bold text-slate-900 text-[26px] font-[Archivo_Black]">BU</span>
              <span className="font-bold text-blue-600 text-[26px] font-[Archivo_Black]">M</span>
              <span className="text-blue-600 text-[20px] font-[Archivo]">arket</span>
            </span>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0">
            <Menu className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-slate-800 text-sm font-medium truncate">{userName}</p>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <p className="text-xs text-emerald-500">Verified Seller</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Availability Toggle */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs text-slate-400 mb-2">Availability</p>
            <div className="flex gap-1.5">
              <button onClick={() => setIsAvailable(true)} className={`flex-1 py-1.5 rounded-lg text-xs transition-all ${isAvailable ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                🟢 Online
              </button>
              <button onClick={() => setIsAvailable(false)} className={`flex-1 py-1.5 rounded-lg text-xs transition-all ${!isAvailable ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                🔴 In Class
              </button>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as SellerView)}
                title={!sidebarOpen ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </div>
                {sidebarOpen && item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button onClick={onLogout} title={!sidebarOpen ? 'Logout' : undefined} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div>
            <p className="text-slate-800 font-medium">
              {activeView === 'dashboard' ? 'Dashboard Overview' :
               activeView === 'messages' ? 'Messages' :
               activeView === 'inventory' ? 'My Inventory' :
               activeView === 'schedule' ? 'Meet-up Schedule' :
               activeView === 'analytics' ? 'Analytics' : 'Settings'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 hover:bg-slate-50 rounded-xl p-1.5 transition-colors">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-50">
                  <button onClick={() => { setShowEditProfileModal(true); setShowUserMenu(false); }} className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" /> Edit Profile
                  </button>
                  <button onClick={onLogout} className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Views */}
        {activeView === 'dashboard' && (
          <div className="flex-1 overflow-auto p-6">
            {/* Welcome + Stats */}
            <div className="mb-6">
              <h2 className="text-slate-900 mb-1">Welcome back, {userName}! 👋</h2>
              <p className="text-slate-500 text-sm">Here's what's happening with your shop today.</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Revenue', value: '₱12,450', sub: '↑ 18% this week', icon: DollarSign, color: 'bg-blue-100 text-blue-600' },
                { label: 'Reputation', value: '4.9 ★', sub: '98% punctuality', icon: Star, color: 'bg-amber-100 text-amber-600' },
                { label: 'Active Orders', value: '3', sub: `${todaysMeetups.filter(m => !completedMeetups.includes(m.id)).length} pending today`, icon: Calendar, color: 'bg-indigo-100 text-indigo-600' },
                { label: 'Low Stock Items', value: '3', sub: '1 out of stock', icon: AlertTriangle, color: 'bg-red-100 text-red-500' },
              ].map(card => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">{card.value}</p>
                    <p className="text-xs text-slate-500">{card.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Upcoming Meet-ups */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-slate-800">Today's Meet-ups</h3>
                    <span className="text-xs text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="space-y-3">
                    {todaysMeetups.map(meetup => {
                      const isCompleted = completedMeetups.includes(meetup.id);
                      return (
                        <div key={meetup.id} className={`border rounded-2xl p-4 transition-all ${isCompleted ? 'bg-emerald-50 border-emerald-100 opacity-60' : 'border-slate-100 hover:border-indigo-100'}`}>
                          <div className="flex items-center gap-3">
                            <div className="bg-indigo-50 rounded-xl px-3 py-2 text-center min-w-[70px]">
                              <Clock className="w-3.5 h-3.5 text-indigo-500 mx-auto mb-0.5" />
                              <p className="text-xs text-indigo-600">{meetup.time}</p>
                            </div>
                            <ImageWithFallback src={meetup.itemImage} alt={meetup.item} className="w-12 h-12 object-cover rounded-xl" />
                            <div className="flex-1">
                              <p className="text-slate-800 text-sm font-medium">{meetup.item}</p>
                              <p className="text-slate-500 text-xs">{meetup.buyer}</p>
                              <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                <MapPin className="w-3 h-3" /> {meetup.location}
                              </div>
                            </div>
                            {!isCompleted ? (
                              <button onClick={() => setCompletedMeetups([...completedMeetups, meetup.id])} className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Done
                              </button>
                            ) : (
                              <div className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Completed
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-800">Recent Orders</h3>
                    <button className="text-xs text-indigo-600 hover:underline">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {['Order', 'Product', 'Amount', 'Status'].map(col => (
                            <th key={col} className="text-left text-xs text-slate-400 font-medium pb-3 pr-4">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {recentOrders.map(order => (
                          <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 pr-4">
                              <p className="text-xs text-slate-500">{order.id}</p>
                              <p className="text-xs text-slate-400">{order.date}</p>
                            </td>
                            <td className="py-2.5 pr-4">
                              <p className="text-sm text-slate-700 line-clamp-1">{order.product}</p>
                              <p className="text-xs text-slate-400">{order.buyer}</p>
                            </td>
                            <td className="py-2.5 pr-4">
                              <p className="text-sm text-slate-800 font-medium">₱{order.amount}</p>
                            </td>
                            <td className="py-2.5">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${orderStatusColors[order.status]}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Quick Actions + Messages */}
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="text-slate-800 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    {[
                      { icon: Package, label: 'Add New Product', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100', action: () => setActiveView('inventory') },
                      { icon: RefreshCw, label: 'Restock Items', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', action: () => {} },
                      { icon: Clock, label: 'Update Schedule', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100', action: () => setActiveView('schedule') },
                      { icon: PauseCircle, label: 'Exam Mode (Pause)', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100', action: () => setIsAvailable(false) },
                    ].map(action => {
                      const Icon = action.icon;
                      return (
                        <button key={action.label} onClick={action.action} className={`w-full flex items-center gap-3 px-4 py-3 ${action.color} rounded-xl transition-colors text-sm`}>
                          <Icon className="w-4 h-4" />
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Messages Widget */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-800">Recent Messages</h3>
                    <button onClick={() => setActiveView('messages')} className="text-xs text-indigo-600 hover:underline">View All</button>
                  </div>
                  <div className="space-y-3">
                    {recentMessages.map(msg => (
                      <div key={msg.id} className={`p-3 rounded-xl border transition-colors ${msg.unread ? 'bg-indigo-50 border-indigo-100' : 'border-slate-100'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-slate-800 font-medium">{msg.buyer}</p>
                          {msg.unread && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
                        </div>
                        <p className="text-xs text-slate-500 mb-1">{msg.message}</p>
                        <p className="text-xs text-slate-400">{msg.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'messages' && <SellerMessages />}
        {activeView === 'inventory' && <SellerInventory />}
        {activeView === 'analytics' && <SellerAnalytics />}

        {activeView === 'schedule' && (
          <div className="flex-1 p-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-slate-800 mb-2">Meet-up Schedule</h3>
              <p className="text-slate-500 text-sm">Full calendar scheduling feature coming soon.</p>
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="flex-1 p-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-lg">
              <h3 className="text-slate-800 mb-5">Account Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Display Name</label>
                  <input type="text" defaultValue={userName} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Shop Bio</label>
                  <textarea rows={3} defaultValue="Engineering Student | Selling old books and school supplies" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">GCash Number</label>
                  <input type="tel" placeholder="+63 9XX XXX XXXX" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <button className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AIChatbot />

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditProfileModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 p-5 flex items-center justify-between">
              <h3 className="text-slate-900">Edit Shop Profile</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-1.5">Display Name</label>
                <input type="text" value={profileData.displayName} onChange={e => setProfileData({...profileData, displayName: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1.5">Bio</label>
                <textarea rows={3} value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">Preferred Meet-up Locations</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['cafeteria', 'Cafeteria'], ['library', 'Main Library'], ['gate1', 'Gate 1'], ['studentCenter', 'Student Center']].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={profileData.locations[key as keyof typeof profileData.locations]} onChange={e => setProfileData({...profileData, locations: {...profileData.locations, [key]: e.target.checked}})} className="rounded text-indigo-600" />
                      <span className="text-sm text-slate-600">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowEditProfileModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50">Cancel</button>
                <button onClick={() => setShowEditProfileModal(false)} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
