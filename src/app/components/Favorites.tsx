import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ProductDetails } from './ProductDetails';
import { Product } from '../data/mockProducts';
import { useProducts } from '../data/useProducts';

const FAVORITES_STORAGE_KEY = 'bumarket:favorites';

function readFavoriteIds(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function Favorites() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => readFavoriteIds());
  const { products, refresh } = useProducts();

  useEffect(() => {
    const syncFavorites = () => setFavoriteIds(readFavoriteIds());
    window.addEventListener('storage', syncFavorites);
    window.addEventListener('bumarket:favorites-updated', syncFavorites);
    return () => {
      window.removeEventListener('storage', syncFavorites);
      window.removeEventListener('bumarket:favorites-updated', syncFavorites);
    };
  }, []);

  const favoriteProducts = products.filter(p => favoriteIds.includes(p.id));

  if (selectedProduct) {
    return (
      <ProductDetails
        product={selectedProduct}
        products={products}
        onBack={() => setSelectedProduct(null)}
        onViewProduct={setSelectedProduct}
        onInventoryChanged={refresh}
      />
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          <h2 className="text-slate-800">My Favorites</h2>
        </div>
        <p className="text-slate-500 text-sm">{favoriteProducts.length} saved items</p>
      </div>

      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={setSelectedProduct}
              onInventoryChanged={refresh}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400">
          <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="mb-1">No favorites yet</p>
          <p className="text-sm">Click the heart icon on any product to save it here</p>
        </div>
      )}
    </div>
  );
}
