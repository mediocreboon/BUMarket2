import { useState } from 'react';
import { CheckCircle2, MapPin, Wallet, Banknote, X, AlertTriangle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from '../data/mockProducts';
import { useAuth } from '../context/AuthContext';
import { createOrder, createNotification, DbProduct } from '../../lib/db';
import { dbProductToUiProduct } from '../data/productFeed';

interface BuyNowModalProps {
  product: Product;
  onClose: () => void;
  onOrderPlaced?: () => Promise<void> | void;
}

type PaymentMethod = 'buy_now' | 'cash_on_pickup';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function BuyNowModal({ product, onClose, onOrderPlaced }: BuyNowModalProps) {
  const { user } = useAuth();
  const [method, setMethod] = useState<PaymentMethod>('cash_on_pickup');
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isRealProduct = UUID_RE.test(product.id); // only DB products can be ordered for real
  const isOwnProduct = !!user && user.id === product.sellerId;

  const handleConfirm = async () => {
    setError('');

    if (!user) {
      setError('Please sign in to place an order.');
      return;
    }
    if (user.role === 'admin') {
      setError('Admins cannot place orders on the demo.');
      return;
    }
    if (isOwnProduct) {
      setError('You cannot order your own product.');
      return;
    }
    if (product.stock <= 0) {
      setError('This product is currently out of stock.');
      return;
    }

    setIsPlacing(true);
    try {
      if (isRealProduct) {
        const order = await createOrder({
          buyer_id: user.id,
          product_id: product.id,
          payment_method: method,
        });
        if (!order) {
          setError(
            "Couldn't place your order. The product may be out of stock, or the Supabase schema may need to be updated."
          );
          return;
        }
        // Notify buyer + seller
        await createNotification(user.id, `Order placed for "${product.title}". Waiting for seller confirmation.`);
        await createNotification(
          product.sellerId,
          `New order received: "${product.title}" from ${user.fullName}.`
        );
      } else {
        // Mock product — show success without persisting (demo only)
        await new Promise((r) => setTimeout(r, 400));
      }
      await onOrderPlaced?.();
      setSuccess(true);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.');
    } finally {
      setIsPlacing(false);
    }
  };

  if (success) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl max-w-sm w-full p-7 text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-slate-900 font-semibold mb-1">Order placed!</h3>
          <p className="text-slate-500 text-sm mb-5">
            The seller will confirm your order shortly. Track it under <strong>My Orders</strong>.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-slate-900 font-semibold">Confirm Order</h3>
            <p className="text-slate-500 text-xs">Choose a simple payment method.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="flex gap-3 mb-4">
          <ImageWithFallback
            src={product.image}
            alt={product.title}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-slate-800 text-sm font-medium line-clamp-2">{product.title}</p>
            <p className="text-blue-600 font-semibold">₱{product.price.toLocaleString()}</p>
            <p className="text-slate-500 text-xs truncate">Seller: {product.seller}</p>
            <p className="text-slate-400 text-xs">
              {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <button
            onClick={() => setMethod('cash_on_pickup')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors text-left ${
              method === 'cash_on_pickup'
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Banknote className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-800 font-medium">Cash on Pickup</p>
              <p className="text-xs text-slate-500">Pay in person at meet-up.</p>
            </div>
          </button>

          <button
            onClick={() => setMethod('buy_now')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors text-left ${
              method === 'buy_now' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-800 font-medium">Buy Now</p>
              <p className="text-xs text-slate-500">
                Reserve instantly. <span className="text-slate-400">(Online payment coming soon.)</span>
              </p>
            </div>
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 flex gap-2">
          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            Meet-up at <strong>{product.location}</strong>. The seller will message you to confirm.
          </p>
        </div>

        {!isRealProduct && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              This is a demo product. The order won&apos;t be saved to the database.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-xl mb-3">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPlacing}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPlacing || product.stock <= 0}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-60"
          >
            {isPlacing ? 'Placing…' : product.stock <= 0 ? 'Out of Stock' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Adapter so DB products can be passed via the same modal directly when needed.
export function dbProductForModal(p: DbProduct): Product {
  return dbProductToUiProduct(p);
}
