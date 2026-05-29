import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, Star, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ProductDetails } from './ProductDetails';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { categories, Product } from '../data/mockProducts';
import { useProducts } from '../data/useProducts';

interface MarketplaceProps {
  userName: string;
  userType: 'buyer' | 'seller';
  initialSearchQuery?: string;
  onSearchQueryApplied?: () => void;
}

const PRICE_RANGES = [
  { label: 'Any Price', min: 0, max: Infinity },
  { label: 'Under ₱100', min: 0, max: 100 },
  { label: '₱100 – ₱500', min: 100, max: 500 },
  { label: '₱500 – ₱1,000', min: 500, max: 1000 },
  { label: '₱1,000+', min: 1000, max: Infinity },
];

const CONDITIONS = ['All', 'new', 'like-new', 'used', 'service'];

export function Marketplace({
  userName,
  userType,
  initialSearchQuery = '',
  onSearchQueryApplied,
}: MarketplaceProps) {
  void userName;
  void userType;
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const { products, isLoading, error, refresh } = useProducts();

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
      onSearchQueryApplied?.();
    }
  }, [initialSearchQuery, onSearchQueryApplied]);

  const priceRange = PRICE_RANGES[selectedPriceRange];

  let filtered = products.filter((p) => {
    const matchSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchPrice = p.price >= priceRange.min && p.price <= priceRange.max;
    const matchCond = selectedCondition === 'All' || p.condition === selectedCondition;
    const matchVerified = !verifiedOnly || p.verified;
    const matchRating = minRating === null || p.rating >= minRating;
    return matchSearch && matchCat && matchPrice && matchCond && matchVerified && matchRating;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return b.soldCount - a.soldCount;
  });

  const activeFilterCount = [
    selectedCategory !== 'all',
    selectedPriceRange !== 0,
    selectedCondition !== 'All',
    minRating !== null,
    verifiedOnly,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedPriceRange(0);
    setSelectedCondition('All');
    setMinRating(null);
    setVerifiedOnly(false);
  };

  const currentProduct = selectedProduct
    ? products.find((p) => p.id === selectedProduct.id) ?? selectedProduct
    : null;

  if (currentProduct) {
    return (
      <ProductDetails
        product={currentProduct}
        products={products}
        onBack={() => setSelectedProduct(null)}
        onViewProduct={setSelectedProduct}
        onInventoryChanged={refresh}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-20">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, sellers, tags..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 bg-slate-50 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          <div className="relative flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={refresh}
            disabled={isLoading}
            title="Refresh"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-colors ${showFilters || activeFilterCount > 0 ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${showFilters || activeFilterCount > 0 ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {showFilters && (
          <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-100 p-5 flex-shrink-0 overflow-y-auto max-h-72 md:max-h-none">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-slate-800 text-sm font-semibold">Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">
                  Clear all
                </button>
              )}
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Price Range</p>
              <div className="space-y-2">
                {PRICE_RANGES.map((range, i) => (
                  <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPriceRange === i}
                      onChange={() => setSelectedPriceRange(i)}
                      className="w-3.5 h-3.5 text-blue-600"
                    />
                    <span className={`text-sm ${selectedPriceRange === i ? 'text-blue-600 font-medium' : 'text-slate-600 group-hover:text-slate-800'}`}>
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Condition</p>
              <div className="space-y-2">
                {CONDITIONS.map((cond) => (
                  <label key={cond} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="condition"
                      checked={selectedCondition === cond}
                      onChange={() => setSelectedCondition(cond)}
                      className="w-3.5 h-3.5 text-blue-600"
                    />
                    <span className={`text-sm capitalize ${selectedCondition === cond ? 'text-blue-600 font-medium' : 'text-slate-600 group-hover:text-slate-800'}`}>
                      {cond === 'All' ? 'All Conditions' : cond === 'service' ? 'Service' : cond === 'like-new' ? 'Like New' : cond.charAt(0).toUpperCase() + cond.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Seller</p>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 rounded"
                />
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-slate-600">Verified Sellers Only</span>
                </div>
              </label>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Min. Rating</p>
              <div className="space-y-2">
                {[4, 3, 2].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(minRating === r ? null : r)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      minRating === r ? 'text-blue-600 font-medium' : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= r ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <span>& up</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-6 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              {!isLoading && !error && (
                <>
                  {filtered.length} {filtered.length === 1 ? 'product' : 'products'} found
                  {searchQuery && (
                    <span>
                      {' '}
                      for "<strong className="text-slate-700">{searchQuery}</strong>"
                    </span>
                  )}
                </>
              )}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
              <p className="text-slate-700 mb-1">Could not load products</p>
              <p className="text-sm text-slate-500 mb-4">{error}</p>
              <button
                type="button"
                onClick={refresh}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map((product) => (
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
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="mb-2">No products found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="mt-3 text-blue-600 text-sm hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
