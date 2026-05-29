import { useEffect, useState } from 'react';
import { Heart, Star, MapPin, ShieldCheck } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from '../data/mockProducts';
import { BuyNowModal } from './BuyNowModal';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
  onInventoryChanged?: () => Promise<void> | void;
  compact?: boolean;
}

const FAVORITES_STORAGE_KEY = 'bumarket:favorites';

function readFavoriteIds(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeFavoriteIds(ids: string[]) {
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent('bumarket:favorites-updated'));
}

export function ProductCard({ product, onViewDetails, onInventoryChanged, compact = false }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const isSoldOut = product.stock <= 0;
  const canViewDetails = Boolean(onViewDetails);

  useEffect(() => {
    setIsFavorite(readFavoriteIds().includes(product.id));
  }, [product.id]);

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!canViewDetails) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onViewDetails?.(product);
    }
  };

  const conditionColor = {
    new: 'bg-emerald-100 text-emerald-700',
    'like-new': 'bg-blue-100 text-blue-700',
    used: 'bg-amber-100 text-amber-700',
    service: 'bg-purple-100 text-purple-700',
  }[product.condition];

  const conditionLabel = {
    new: 'New',
    'like-new': 'Like New',
    used: 'Used',
    service: 'Service',
  }[product.condition];

  return (
    <>
      <div
        role={canViewDetails ? 'button' : undefined}
        tabIndex={canViewDetails ? 0 : undefined}
        aria-label={canViewDetails ? `View details for ${product.title}` : undefined}
        onKeyDown={handleCardKeyDown}
        className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-slate-100 group ${
          canViewDetails ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300' : ''
        }`}
        onClick={() => onViewDetails?.(product)}
      >
        <div className={`relative overflow-hidden bg-slate-100 ${compact ? 'h-36' : 'h-48'}`}>
          <ImageWithFallback
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{product.discount}%
            </div>
          )}
          {product.isPopular && !product.discount && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
              Hot
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const ids = readFavoriteIds();
              const next = ids.includes(product.id)
                ? ids.filter((id) => id !== product.id)
                : [...ids, product.id];
              writeFavoriteIds(next);
              setIsFavorite(next.includes(product.id));
            }}
            aria-label={isFavorite ? `Remove ${product.title} from favorites` : `Save ${product.title} to favorites`}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
          </button>
          {product.stock <= 3 && product.stock > 0 && (
            <div className="absolute bottom-2 left-2 bg-red-600/90 text-white text-xs px-2 py-0.5 rounded-full">
              Only {product.stock} left!
            </div>
          )}
          {isSoldOut && (
            <div className="absolute bottom-2 left-2 bg-slate-900/85 text-white text-xs px-2 py-0.5 rounded-full">
              Sold out
            </div>
          )}
        </div>

        <div className={compact ? 'p-3' : 'p-4'}>
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{product.category}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${conditionColor}`}>{conditionLabel}</span>
          </div>

          <h4 className="text-slate-800 text-sm mb-1 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {product.title}
          </h4>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs text-slate-600">{product.rating}</span>
            </div>
            <span className="text-slate-300 text-xs">|</span>
            <span className="text-xs text-slate-500">{product.soldCount} sold</span>
          </div>

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

          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-blue-600 font-semibold text-base truncate">₱{product.price.toLocaleString()}</p>
              {product.originalPrice && (
                <p className="text-xs text-slate-400 line-through">₱{product.originalPrice.toLocaleString()}</p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isSoldOut) return;
                setShowBuyModal(true);
              }}
              disabled={isSoldOut}
              aria-label={isSoldOut ? `${product.title} is sold out` : `Buy ${product.title}`}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSoldOut ? 'Sold Out' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>

      {showBuyModal && (
        <BuyNowModal
          product={product}
          onClose={() => setShowBuyModal(false)}
          onOrderPlaced={onInventoryChanged}
        />
      )}
    </>
  );
}
