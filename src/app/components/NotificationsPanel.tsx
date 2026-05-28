import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Check, CheckCheck, RefreshCw } from 'lucide-react';
import {
  DbNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../lib/db';
import { useAuth } from '../context/AuthContext';

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return d.toLocaleDateString();
};

export function NotificationsPanel() {
  const { user } = useAuth();
  const [items, setItems] = useState<DbNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const mountedRef = useRef(true);
  const requestRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestRef.current;
    const isActive = () => mountedRef.current && requestId === requestRef.current;
    if (!user) {
      if (isActive()) {
        setItems([]);
        setIsLoading(false);
      }
      return;
    }
    if (isActive()) {
      setIsLoading(true);
      setError('');
    }
    try {
      const rows = await listNotifications(user.id);
      if (isActive()) setItems(rows);
    } catch {
      if (isActive()) setError('Failed to load notifications.');
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

  const handleMarkRead = async (n: DbNotification) => {
    if (n.is_read) return;
    setUpdatingId(n.id);
    setError('');
    try {
      const ok = await markNotificationRead(n.id);
      if (!ok) {
        if (mountedRef.current) setError('Unable to mark this notification as read.');
        return;
      }
      if (mountedRef.current) {
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      }
    } finally {
      if (mountedRef.current) setUpdatingId(null);
    }
  };

  const handleMarkAll = async () => {
    if (!user) return;
    setUpdatingId('all');
    setError('');
    try {
      const ok = await markAllNotificationsRead(user.id);
      if (!ok) {
        if (mountedRef.current) setError('Unable to mark notifications as read.');
        return;
      }
      if (mountedRef.current) {
        setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
      }
    } finally {
      if (mountedRef.current) setUpdatingId(null);
    }
  };

  const unreadCount = items.filter((i) => !i.is_read).length;

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div>
            <h2 className="text-slate-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" /> Notifications
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refresh}
              disabled={isLoading}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={updatingId === 'all'}
                className="px-3 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                {updatingId === 'all' ? 'Updating…' : 'Mark all read'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading && items.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <RefreshCw className="w-10 h-10 mx-auto mb-3 opacity-30 animate-spin" />
              <p className="text-sm">Loading notifications…</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No notifications yet.</p>
              <p className="text-xs mt-1">
                You will receive updates here when orders are placed, confirmed, or completed.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((n) => (
                <li
                  key={n.id}
                  onClick={() => handleMarkRead(n)}
                  className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                    n.is_read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center ${
                      n.is_read ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {n.is_read ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${n.is_read ? 'text-slate-600' : 'text-slate-800 font-medium'}`}
                    >
                      {n.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatTime(n.created_at)}</p>
                  </div>
                  {updatingId === n.id ? (
                    <RefreshCw className="w-3 h-3 text-blue-500 animate-spin mt-1.5 flex-shrink-0" />
                  ) : !n.is_read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
