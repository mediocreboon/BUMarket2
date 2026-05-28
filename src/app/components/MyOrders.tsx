import { useCallback, useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, MessageCircle, Search, RefreshCw } from 'lucide-react';
import {
  DbOrder,
  listOrdersForBuyer,
  listOrdersForSeller,
  updateOrderStatus,
  createNotification,
} from '../../lib/db';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MyOrdersProps {
  userType: 'buyer' | 'seller';
}

const statusConfig = {
  pending: { icon: Clock, color: 'bg-amber-100 text-amber-700', label: 'Pending' },
  confirmed: { icon: Package, color: 'bg-blue-100 text-blue-700', label: 'Confirmed' },
  completed: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700', label: 'Completed' },
  cancelled: { icon: Clock, color: 'bg-red-100 text-red-600', label: 'Cancelled' },
} as const;

type StatusFilter = 'all' | keyof typeof statusConfig;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function MyOrders({ userType }: MyOrdersProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const refresh = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const rows =
        userType === 'buyer' ? await listOrdersForBuyer(user.id) : await listOrdersForSeller(user.id);
      setOrders(rows);
    } finally {
      setIsLoading(false);
    }
  }, [user, userType]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleStatusChange = async (order: DbOrder, next: DbOrder['status']) => {
    const ok = await updateOrderStatus(order.id, next);
    if (!ok) return;
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
    if (user) {
      const product = order.product?.title || 'your order';
      if (next === 'confirmed') {
        await createNotification(order.buyer_id, `Your order for "${product}" was confirmed.`);
      } else if (next === 'completed') {
        await createNotification(order.buyer_id, `Your order for "${product}" was marked complete.`);
        if (order.product?.seller_id) {
          await createNotification(order.product.seller_id, `You completed an order for "${product}".`);
        }
      }
    }
  };

  const filtered = orders.filter((o) => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch =
      !search ||
      (o.product?.title || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-slate-800">{userType === 'buyer' ? 'My Orders' : 'Customer Orders'}</h2>
          <p className="text-slate-500 text-sm mt-1">
            {userType === 'buyer'
              ? 'Track your reservations and purchases.'
              : 'Confirm and complete orders from your buyers.'}
          </p>
        </div>
        <button
          onClick={refresh}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(['all', 'pending', 'confirmed', 'completed'] as const).map((s) => {
          const count = s === 'all' ? orders.length : orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`bg-white rounded-xl p-3 text-center border transition-all shadow-sm ${
                filter === s ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-200'
              }`}
            >
              <p className={`text-xl font-bold ${filter === s ? 'text-blue-600' : 'text-slate-800'}`}>
                {count}
              </p>
              <p className="text-xs text-slate-500 capitalize mt-0.5">{s === 'all' ? 'All Orders' : s}</p>
            </button>
          );
        })}
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      <div className="space-y-3">
        {isLoading && orders.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <RefreshCw className="w-10 h-10 mx-auto mb-3 opacity-30 animate-spin" />
            <p>Loading orders…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No orders here yet.</p>
            <p className="text-xs mt-1">
              {userType === 'buyer'
                ? 'Browse the marketplace and tap “Buy Now” to place your first order.'
                : 'Orders from buyers will appear here.'}
            </p>
          </div>
        ) : (
          filtered.map((order) => {
            const cfg = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
            const Icon = cfg.icon;
            const product = order.product;
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-blue-100 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <ImageWithFallback
                    src={product?.image_url || ''}
                    alt={product?.title || 'Product'}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-slate-800 font-medium truncate">
                          {product?.title || 'Product no longer available'}
                        </p>
                        <p className="text-slate-500 text-sm">
                          Payment:{' '}
                          <span className="capitalize">
                            {order.payment_method === 'buy_now' ? 'Buy Now' : 'Cash on Pickup'}
                          </span>
                        </p>
                      </div>
                      <span
                        className={`flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                      <span>#{order.id.slice(0, 8).toUpperCase()}</span>
                      <span>{formatDate(order.created_at)}</span>
                      {product?.location && <span>{product.location}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      <p className="text-blue-600 font-semibold">
                        ₱{Number(product?.price ?? 0).toLocaleString()}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {userType === 'seller' && order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(order, 'confirmed')}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-xl hover:bg-blue-700"
                          >
                            Confirm
                          </button>
                        )}
                        {userType === 'seller' && order.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(order, 'completed')}
                            className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-xl hover:bg-emerald-600"
                          >
                            Mark Completed
                          </button>
                        )}
                        {userType === 'buyer' && order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(order, 'cancelled')}
                            className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs rounded-xl hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        )}
                        {userType === 'buyer' && order.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(order, 'completed')}
                            className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-xl hover:bg-emerald-600 flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> Mark Received
                          </button>
                        )}
                        <button className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs rounded-xl hover:bg-slate-50 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> Message
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
