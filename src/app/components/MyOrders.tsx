import { useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, MessageCircle, Search } from 'lucide-react';

interface MyOrdersProps {
  userType: 'buyer' | 'seller';
}

const orders = [
  { id: 'ORD-001', product: 'Homemade Strawberry Cake', seller: 'Maria Santos', buyer: 'You', price: 250, status: 'pending', date: 'May 11, 2026', location: 'Main Campus Building A', image: 'https://images.unsplash.com/photo-1599629974232-2365495b9ef2?w=200' },
  { id: 'ORD-002', product: 'Engineering Textbook Bundle', seller: 'Carlos Reyes', buyer: 'You', price: 1200, status: 'confirmed', date: 'May 10, 2026', location: 'Engineering Building', image: 'https://images.unsplash.com/photo-1614607421391-8d1228bae188?w=200' },
  { id: 'ORD-003', product: 'University Varsity Jacket', seller: 'Sofia Garcia', buyer: 'You', price: 1500, status: 'completed', date: 'May 7, 2026', location: 'Student Housing', image: 'https://images.unsplash.com/photo-1763888359320-cc764365e3c7?w=200' },
  { id: 'ORD-004', product: 'Coffee & Pastry Bundle', seller: 'Cafe Luna', buyer: 'You', price: 150, status: 'cancelled', date: 'May 5, 2026', location: 'Library Ground Floor', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200' },
];

const statusConfig = {
  pending: { icon: Clock, color: 'bg-amber-100 text-amber-700', label: 'Pending' },
  confirmed: { icon: Package, color: 'bg-blue-100 text-blue-700', label: 'Confirmed' },
  completed: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'bg-red-100 text-red-600', label: 'Cancelled' },
};

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export function MyOrders({ userType }: MyOrdersProps) {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.product.toLowerCase().includes(search.toLowerCase()) || o.seller.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-6">
      <div className="mb-6">
        <h2 className="text-slate-800">My Orders</h2>
        <p className="text-slate-500 text-sm mt-1">Track your reservations and purchases</p>
      </div>

      {/* Summary Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(['all', 'pending', 'confirmed', 'completed'] as const).map(s => {
          const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`bg-white rounded-xl p-3 text-center border transition-all shadow-sm ${filter === s ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}
            >
              <p className={`text-xl font-bold ${filter === s ? 'text-blue-600' : 'text-slate-800'}`}>{count}</p>
              <p className="text-xs text-slate-500 capitalize mt-0.5">{s === 'all' ? 'All Orders' : s}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search orders..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      <div className="space-y-3">
        {filtered.map(order => {
          const cfg = statusConfig[order.status as keyof typeof statusConfig];
          const Icon = cfg.icon;
          return (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-blue-100 transition-colors">
              <div className="flex items-start gap-4">
                <img src={order.image} alt={order.product} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-slate-800 font-medium">{order.product}</p>
                      <p className="text-slate-500 text-sm">
                        {userType === 'buyer' ? `Seller: ${order.seller}` : `Buyer: ${order.buyer}`}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>#{order.id}</span>
                    <span>📅 {order.date}</span>
                    <span>📍 {order.location}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-blue-600 font-semibold">₱{order.price.toLocaleString()}</p>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <>
                          <button className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-xl hover:bg-blue-700 transition-colors">
                            {userType === 'buyer' ? 'Contact Seller' : 'Confirm'}
                          </button>
                          <button className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs rounded-xl hover:bg-slate-50 transition-colors">
                            Cancel
                          </button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <>
                          <button className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-xl hover:bg-emerald-600 transition-colors">
                            {userType === 'buyer' ? 'Mark Received' : 'Mark Complete'}
                          </button>
                          <button className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs rounded-xl hover:bg-slate-50 flex items-center gap-1 transition-colors">
                            <MessageCircle className="w-3 h-3" /> Message
                          </button>
                        </>
                      )}
                      {order.status === 'completed' && (
                        <button className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs rounded-xl hover:bg-slate-50 transition-colors">
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
