import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DollarSign, Star, Package, CheckCircle, AlertTriangle, LayoutDashboard, Box,
  User, Settings, LogOut, ChevronDown, Save, ShieldCheck, Bell, Menu, ShoppingCart,
} from 'lucide-react';
import { SellerInventory } from './SellerInventory';
import { MyOrders } from './MyOrders';
import { NotificationsPanel } from './NotificationsPanel';
import { AIChatbot } from './AIChatbot';
import { useAuth } from '../context/AuthContext';
import {
  DbOrder,
  DbProduct,
  listOrdersForSeller,
  listProductsBySeller,
  updateOrderStatus,
} from '../../lib/db';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SellerDashboardProps {
  userName: string;
  onLogout: () => void;
}

type SellerView = 'dashboard' | 'inventory' | 'orders' | 'notifications' | 'settings';

const orderStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

export function SellerDashboard({ userName, onLogout }: SellerDashboardProps) {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<SellerView>('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const requestRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestRef.current;
    const isActive = () => mountedRef.current && requestId === requestRef.current;
    if (!user) {
      if (isActive()) {
        setOrders([]);
        setProducts([]);
        setIsLoading(false);
      }
      return;
    }
    if (isActive()) setIsLoading(true);
    try {
      const [o, p] = await Promise.all([listOrdersForSeller(user.id), listProductsBySeller(user.id)]);
      if (isActive()) {
        setOrders(o);
        setProducts(p);
      }
    } finally {
      if (isActive()) setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalRevenue = completedOrders.reduce(
    (sum, o) => sum + Number(o.product?.price ?? 0),
    0
  );

  const sidebarItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, badge: 0 },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: pendingOrders.length },
    { id: 'inventory', label: 'My Inventory', icon: Box, badge: 0 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: 0 },
    { id: 'settings', label: 'Settings', icon: Settings, badge: 0 },
  ];

  const handleConfirm = async (order: DbOrder) => {
    setUpdatingOrderId(order.id);
    try {
      const ok = await updateOrderStatus(order.id, 'confirmed');
      if (!ok) return;
      await refresh();
    } finally {
      if (mountedRef.current) setUpdatingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-white border-r border-slate-100 min-h-screen flex flex-col transition-all duration-200 flex-shrink-0`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          {sidebarOpen && (
            <span>
              <span className="font-bold text-slate-900 text-[26px] font-[Archivo_Black]">BU</span>
              <span className="font-bold text-blue-600 text-[26px] font-[Archivo_Black]">M</span>
              <span className="text-blue-600 text-[20px] font-[Archivo]">arket</span>
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
          >
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
                  <p className="text-xs text-emerald-500">
                    {user?.verificationStatus === 'verified' ? 'Verified Seller' : 'Pending Verification'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {sidebarItems.map((item) => {
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
                {sidebarOpen && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button
            onClick={onLogout}
            title={!sidebarOpen ? 'Logout' : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <p className="text-slate-800 font-medium capitalize">
            {sidebarItems.find((s) => s.id === activeView)?.label || 'Dashboard'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('notifications')}
              className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {pendingOrders.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-slate-50 rounded-xl p-1.5 transition-colors"
              >
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-50">
                  <button
                    onClick={() => {
                      setActiveView('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-sm"
                  >
                    <User className="w-4 h-4" /> Profile Settings
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {activeView === 'dashboard' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="mb-6">
              <h2 className="text-slate-900">Welcome back, {userName}!</h2>
              <p className="text-slate-500 text-sm">Here&apos;s a quick look at your shop.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: 'Total Revenue',
                  value: `₱${totalRevenue.toLocaleString()}`,
                  icon: DollarSign,
                  color: 'bg-blue-100 text-blue-600',
                },
                {
                  label: 'Active Listings',
                  value: products.length,
                  icon: Package,
                  color: 'bg-indigo-100 text-indigo-600',
                },
                {
                  label: 'Pending Orders',
                  value: pendingOrders.length,
                  icon: AlertTriangle,
                  color: 'bg-amber-100 text-amber-600',
                },
                {
                  label: 'Completed Orders',
                  value: completedOrders.length,
                  icon: CheckCircle,
                  color: 'bg-emerald-100 text-emerald-600',
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-800 font-semibold">Recent Orders</h3>
                  <button onClick={() => setActiveView('orders')} className="text-xs text-indigo-600 hover:underline">
                    View all
                  </button>
                </div>
                {orders.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{isLoading ? 'Loading…' : 'No orders yet.'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors"
                      >
                        <ImageWithFallback
                          src={order.product?.image_url || ''}
                          alt={order.product?.title || 'Product'}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 truncate">
                            {order.product?.title || 'Product'}
                          </p>
                          <p className="text-xs text-slate-400">
                            ₱{Number(order.product?.price ?? 0).toLocaleString()} ·{' '}
                            {order.payment_method === 'buy_now' ? 'Buy Now' : 'Cash on Pickup'}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${orderStatusColors[order.status]}`}
                        >
                          {order.status}
                        </span>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleConfirm(order)}
                            disabled={updatingOrderId === order.id}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-xl hover:bg-blue-700 disabled:opacity-60"
                          >
                            {updatingOrderId === order.id ? 'Updating…' : 'Confirm'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="text-slate-800 font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveView('inventory')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-sm"
                  >
                    <Package className="w-4 h-4" /> Add / Edit Products
                  </button>
                  <button
                    onClick={() => setActiveView('orders')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" /> Manage Orders
                  </button>
                  <button
                    onClick={() => setActiveView('notifications')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm"
                  >
                    <Bell className="w-4 h-4" /> View Notifications
                  </button>
                </div>

                <div className="mt-5 pt-5 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Coming Soon</p>
                  <div className="text-xs text-slate-500 space-y-1.5">
                    <p className="flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-amber-400" /> Detailed analytics
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-amber-400" /> Buyer chat & reviews
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'orders' && <MyOrders userType="seller" onOrdersChanged={refresh} />}
        {activeView === 'inventory' && <SellerInventory />}
        {activeView === 'notifications' && <NotificationsPanel />}

        {activeView === 'settings' && (
          <div className="flex-1 p-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-lg">
              <h3 className="text-slate-800 font-semibold mb-5">Account Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Display Name</label>
                  <input
                    type="text"
                    defaultValue={userName}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Shop Bio</label>
                  <textarea
                    rows={3}
                    defaultValue="Student Entrepreneur on BUMarket."
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-500 resize-none"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                  Profile editing is a future enhancement. Demo accounts use the values seeded in
                  Supabase.
                </div>
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AIChatbot context="seller" />
    </div>
  );
}
