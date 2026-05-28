import { useCallback, useEffect, useState } from 'react';
import {
  Users, Package, ShieldCheck, LogOut, Settings,
  LayoutDashboard, ShoppingCart, Search, RefreshCw, Menu,
} from 'lucide-react';
import {
  listProfiles, listProducts, listAllOrders,
  Profile, DbProduct, DbOrder,
} from '../../lib/db';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AdminDashboardProps {
  onLogout: () => void;
}

type AdminView = 'overview' | 'users' | 'products' | 'orders' | 'settings';

const navItems = [
  { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
  { id: 'users' as const, label: 'Users', icon: Users },
  { id: 'products' as const, label: 'Products', icon: Package },
  { id: 'orders' as const, label: 'Orders', icon: ShoppingCart },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

const orderStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'buyer' | 'seller' | 'admin'>('all');
  const [productSearch, setProductSearch] = useState('');

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pf, pr, or] = await Promise.all([listProfiles(), listProducts(), listAllOrders()]);
      setProfiles(pf);
      setProducts(pr);
      setOrders(or);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sellers = profiles.filter((p) => p.role === 'seller');
  const buyers = profiles.filter((p) => p.role === 'buyer');

  const filteredUsers = profiles.filter((u) => {
    const matchSearch =
      !userSearch ||
      u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userFilter === 'all' || u.role === userFilter;
    return matchSearch && matchRole;
  });

  const filteredProducts = products.filter(
    (p) => !productSearch || p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-slate-100">
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-slate-900 min-h-screen flex flex-col transition-all duration-200 flex-shrink-0`}
      >
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
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <Menu className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                title={!sidebarOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <h2 className="text-slate-800 font-semibold capitalize">
            {navItems.find((n) => n.id === activeView)?.label || 'Admin'}
          </h2>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </header>

        {activeView === 'overview' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Users', value: profiles.length, color: 'bg-blue-100 text-blue-600', icon: Users },
                { label: 'Sellers', value: sellers.length, color: 'bg-indigo-100 text-indigo-600', icon: ShieldCheck },
                { label: 'Products', value: products.length, color: 'bg-emerald-100 text-emerald-600', icon: Package },
                { label: 'Orders', value: orders.length, color: 'bg-amber-100 text-amber-600', icon: ShoppingCart },
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h3 className="text-slate-800 font-semibold mb-4">Recent Users</h3>
                {profiles.length === 0 ? (
                  <p className="text-sm text-slate-400">No users yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {profiles.slice(0, 5).map((u) => (
                      <li key={u.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                            {u.full_name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-sm text-slate-800">{u.full_name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full capitalize ${
                            u.role === 'admin'
                              ? 'bg-slate-200 text-slate-700'
                              : u.role === 'seller'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h3 className="text-slate-800 font-semibold mb-4">Latest Orders</h3>
                {orders.length === 0 ? (
                  <p className="text-sm text-slate-400">No orders yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {orders.slice(0, 5).map((o) => (
                      <li key={o.id} className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm text-slate-800 truncate">
                            {o.product?.title || 'Product unavailable'}
                          </p>
                          <p className="text-xs text-slate-400">
                            ₱{Number(o.product?.price ?? 0).toLocaleString()} ·{' '}
                            {o.payment_method === 'buy_now' ? 'Buy Now' : 'Cash on Pickup'}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full capitalize ${orderStatusColors[o.status]}`}
                        >
                          {o.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'users' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                {(['all', 'buyer', 'seller', 'admin'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setUserFilter(f)}
                    className={`px-3 py-2.5 text-xs rounded-xl border transition-colors capitalize ${
                      userFilter === f
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f === 'all' ? 'All' : f + 's'}
                  </button>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['User', 'Role', 'Verification', 'Department', 'Joined'].map((c) => (
                        <th key={c} className="text-left text-xs text-slate-500 font-medium px-3 py-3">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                              {u.full_name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-slate-800 truncate">{u.full_name}</p>
                              <p className="text-xs text-slate-400 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                              u.role === 'admin'
                                ? 'bg-slate-200 text-slate-700'
                                : u.role === 'seller'
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                              u.verification_status === 'verified'
                                ? 'bg-emerald-100 text-emerald-700'
                                : u.verification_status === 'pending'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {u.verification_status === 'verified'
                              ? 'Verified'
                              : u.verification_status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-600">{u.department || '—'}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{formatDate(u.created_at)}</td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-400 text-sm">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Showing {filteredUsers.length} / {profiles.length}. Verification status is
                visual-only for the demo (no user access is blocked).
              </p>
            </div>
          </div>
        )}

        {activeView === 'products' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <h3 className="text-slate-800 font-semibold">All Products ({products.length})</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 w-64"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Product', 'Seller', 'Category', 'Price', 'Stock'].map((c) => (
                        <th key={c} className="text-left text-xs text-slate-500 font-medium px-3 py-3">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <ImageWithFallback
                              src={p.image_url || ''}
                              alt={p.title}
                              className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-slate-100"
                            />
                            <p className="text-sm text-slate-800 line-clamp-1 max-w-xs">{p.title}</p>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-600">
                          {p.seller_name || p.seller_id.slice(0, 8)}
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-800 font-medium">
                          ₱{Number(p.price).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-600">{p.stock}</td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-400 text-sm">
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeView === 'orders' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-slate-800 font-semibold mb-4">All Orders ({orders.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Product', 'Buyer', 'Method', 'Status', 'Created'].map((c) => (
                        <th key={c} className="text-left text-xs text-slate-500 font-medium px-3 py-3">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-3">
                          <p className="text-sm text-slate-800 line-clamp-1">
                            {o.product?.title || 'Product unavailable'}
                          </p>
                          <p className="text-xs text-slate-400">
                            ₱{Number(o.product?.price ?? 0).toLocaleString()}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-600">
                          {o.buyer?.full_name || o.buyer_id.slice(0, 8)}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-600">
                          {o.payment_method === 'buy_now' ? 'Buy Now' : 'Cash on Pickup'}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full capitalize ${orderStatusColors[o.status]}`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-500">{formatDate(o.created_at)}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-400 text-sm">
                          No orders yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="flex-1 p-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 max-w-lg shadow-sm">
              <h3 className="text-slate-800 font-semibold mb-4">Platform Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">Platform</p>
                  <p className="text-slate-800">BUMarket — Capstone Demo</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Total accounts</p>
                  <p className="text-slate-800">{profiles.length}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Total listings</p>
                  <p className="text-slate-800">{products.length}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Total orders</p>
                  <p className="text-slate-800">{orders.length}</p>
                </div>
              </div>
              <div className="mt-5 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                Advanced platform analytics and moderation tools are tagged as{' '}
                <strong>Future Enhancement</strong> for this demo.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
