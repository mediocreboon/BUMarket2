import { useState } from 'react';
import { Heart, Star, MapPin, ShieldCheck, Tag } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from '../data/mockProducts';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
  compact?: boolean;
}

export function ProductCard({ product, onViewDetails, compact = false }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);

  const conditionColor = {
    'new': 'bg-emerald-100 text-emerald-700',
    'like-new': 'bg-blue-100 text-blue-700',
    'used': 'bg-amber-100 text-amber-700',
    'service': 'bg-purple-100 text-purple-700',
  }[product.condition];

  const conditionLabel = {
    'new': 'New',
    'like-new': 'Like New',
    'used': 'Used',
    'service': 'Service',
  }[product.condition];

  const handleReserveConfirm = () => {
    setShowReserveModal(false);
    alert(`Reservation confirmed for "${product.title}"!\nThe seller will contact you soon to arrange meet-up. 🎉`);
  };

  return (
    <>
      <div
        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-slate-100 group cursor-pointer"
        onClick={() => onViewDetails?.(product)}
      >
        {/* Image */}
        <div className={`relative overflow-hidden bg-slate-100 ${compact ? 'h-36' : 'h-48'}`}>
          <ImageWithFallback
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Discount Badge */}
          {product.discount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{product.discount}%
            </div>
          )}

          {/* Popular Badge */}
          {product.isPopular && !product.discount && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
              🔥 Hot
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
          </button>

          {/* Stock Indicator */}
          {product.stock <= 3 && product.stock > 0 && (
            <div className="absolute bottom-2 left-2 bg-red-600/90 text-white text-xs px-2 py-0.5 rounded-full">
              Only {product.stock} left!
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`p-3 ${compact ? '' : 'p-4'}`}>
          {/* Category & Condition */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{product.category}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${conditionColor}`}>{conditionLabel}</span>
          </div>

          {/* Title */}
          <h4 className="text-slate-800 text-sm mb-1 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{product.title}</h4>

          {/* Rating & Sales */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs text-slate-600">{product.rating}</span>
            </div>
            <span className="text-slate-300 text-xs">|</span>
            <span className="text-xs text-slate-500">{product.soldCount} sold</span>
          </div>

          {/* Seller */}
          <div className="flex items-center gap-1 mb-3">
            {product.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
            <span className="text-xs text-slate-500 truncate">{product.seller}</span>
          </div>

          {!compact && (
            <div className="flex items-center gap-1 mb-3">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-400 truncate">{product.location}</span>
            </div>
          )}

          {/* Price & Action */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-semibold text-base">₱{product.price.toLocaleString()}</p>
              {product.originalPrice && (
                <p className="text-xs text-slate-400 line-through">₱{product.originalPrice.toLocaleString()}</p>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setShowReserveModal(true); }}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs hover:bg-blue-700 transition-colors font-medium"
            >
              Reserve
            </button>
          </div>
        </div>
      </div>

      {/* Reserve Modal */}
      {showReserveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReserveModal(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-slate-900 mb-1">Confirm Reservation</h3>
            <p className="text-slate-500 text-sm mb-4">You're about to reserve this item:</p>

            <div className="flex gap-3 mb-5">
              <ImageWithFallback src={product.image} alt={product.title} className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <p className="text-slate-800 text-sm">{product.title}</p>
                <p className="text-blue-600 font-semibold">₱{product.price.toLocaleString()}</p>
                <p className="text-slate-500 text-xs mt-1">Seller: {product.seller}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5">
              <p className="text-xs text-blue-700">
                📍 The seller will be notified and will contact you to arrange a meet-up at <strong>{product.location}</strong>.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowReserveModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm">
                Cancel
              </button>
              <button onClick={handleReserveConfirm} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
