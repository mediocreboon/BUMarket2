import { useState } from 'react';
import { Search, ArrowRight, ShieldCheck, Zap, Star, TrendingUp, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ProductDetails } from './ProductDetails';
import { categories, mockSellers, Product } from '../data/mockProducts';
import { useProducts } from '../data/useProducts';
import { ImageWithFallback } from './figma/ImageWithFallback';

const HERO_BG = 'https://scontent.fmnl3-2.fna.fbcdn.net/v/t39.30808-6/506598061_1193219059517264_1907555190436737450_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeGfuZ8Vs6Jp2NtRJF-NeRAYPXJehY0gZuk9cl6FjSBm6SD_kvoNY3RIPcDgJs-jt-dOY_LlRb3QrYcmLqYRlGOX&_nc_ohc=vssUgdR6-zwQ7kNvwFbV0kV&_nc_oc=AdrHrawBcb9OfhGPdcTTmTxtP12nkCmjsFmff546e7O_KSa9Hmry-lkS5nJrX1dzMYU&_nc_zt=23&_nc_ht=scontent.fmnl3-2.fna&_nc_gid=XRvzr8K03dkWXoYz8PWbEA&_nc_ss=7b2a8&oh=00_Af5RdMgdECnPeFJ7rUvZLVd-F4Ak3HJGiMGappVF1KJ3mg&oe=6A089670';

const ANNOUNCEMENTS = [
  { id: 1, title: '🎉 BUMarket Spring Sale!', desc: 'Up to 50% off on selected academic materials and supplies.', color: 'from-blue-500 to-indigo-600', date: 'May 11–15, 2026' },
  { id: 2, title: '📋 Seller Verification Drive', desc: 'New sellers: Submit your student ID for faster verification this week!', color: 'from-emerald-500 to-teal-600', date: 'May 12, 2026' },
  { id: 3, title: '🛡️ Safety Reminder', desc: 'Always meet in campus-approved areas. Stay safe!', color: 'from-purple-500 to-pink-600', date: 'Ongoing' },
];

interface BuyerHomeProps {
  userName: string;
  onNavigateToMarketplace: () => void;
  onNavigateToNotifications?: () => void;
}

export function BuyerHome({ userName, onNavigateToMarketplace, onNavigateToNotifications }: BuyerHomeProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const { products, refresh } = useProducts();

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const popularProducts = products.filter(p => p.isPopular).slice(0, 4);
  const announcement = ANNOUNCEMENTS[announcementIdx];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) onNavigateToMarketplace();
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
    <div className="flex-1 overflow-auto bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30 gap-2">
        <p className="text-sm text-slate-500 hidden md:block">Monday, May 11, 2026</p>
        <form onSubmit={handleSearch} className="flex-1 max-w-md md:mx-4 relative min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, sellers, services..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white transition-all"
          />
        </form>
        <button
          onClick={onNavigateToNotifications}
          title="Notifications"
          className="p-2 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
        >
          <Bell className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="px-4 md:px-6 py-6 max-w-7xl mx-auto space-y-8">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden h-52 md:h-64 shadow-xl">
          <ImageWithFallback src={HERO_BG} alt="BUMarket" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
            <p className="text-blue-200 text-sm mb-1">Welcome back, {userName}! 👋</p>
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-2 max-w-sm leading-tight">Your Campus Marketplace is Open</h2>
            <p className="text-blue-100 text-sm mb-4 max-w-xs">Discover verified student sellers, quality products, and campus services.</p>
            <button
              onClick={onNavigateToMarketplace}
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-blue-50 transition-colors w-fit shadow-md"
            >
              Browse Marketplace <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Quick Access */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-800">Browse Categories</h3>
            <button onClick={onNavigateToMarketplace} className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
              See all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.filter(c => c.id !== 'all').map((cat) => (
              <button
                key={cat.id}
                onClick={onNavigateToMarketplace}
                className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all border border-slate-100 shadow-sm group"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs text-slate-600 text-center group-hover:text-blue-600 transition-colors leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Announcement Banner */}
        <div className={`bg-gradient-to-r ${announcement.color} rounded-2xl p-4 text-white flex items-center justify-between shadow-md`}>
          <div className="flex-1">
            <p className="font-semibold text-sm">{announcement.title}</p>
            <p className="text-white/80 text-xs mt-0.5">{announcement.desc}</p>
            <p className="text-white/60 text-xs mt-1">📅 {announcement.date}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setAnnouncementIdx(Math.max(0, announcementIdx - 1))}
              disabled={announcementIdx === 0}
              className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-white/70">{announcementIdx + 1}/{ANNOUNCEMENTS.length}</span>
            <button
              onClick={() => setAnnouncementIdx(Math.min(ANNOUNCEMENTS.length - 1, announcementIdx + 1))}
              disabled={announcementIdx === ANNOUNCEMENTS.length - 1}
              className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Featured Products */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="text-slate-800">Featured Today</h3>
            </div>
            <button onClick={onNavigateToMarketplace} className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={setSelectedProduct}
                onInventoryChanged={refresh}
              />
            ))}
          </div>
        </div>

        {/* Popular Products */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              <h3 className="text-slate-800">🔥 Trending Now</h3>
            </div>
            <button onClick={onNavigateToMarketplace} className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={setSelectedProduct}
                onInventoryChanged={refresh}
              />
            ))}
          </div>
        </div>

        {/* Top Sellers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <h3 className="text-slate-800">Top Verified Sellers</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockSellers.map((seller) => (
              <div key={seller.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group">
                <div className="relative inline-block mb-3">
                  <ImageWithFallback
                    src={seller.avatar}
                    alt={seller.name}
                    className="w-14 h-14 rounded-full object-cover mx-auto ring-2 ring-blue-100"
                  />
                  {seller.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                      <ShieldCheck className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-slate-800 text-sm font-medium">{seller.shop}</p>
                <p className="text-slate-400 text-xs mb-2">{seller.dept}</p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-slate-600">{seller.rating}</span>
                  <span className="text-slate-300 text-xs">•</span>
                  <span className="text-xs text-slate-500">{seller.sales} sales</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust & Safety Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="text-slate-800 mb-4 text-center">Why Choose BUMarket?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🛡️', title: 'Verified Sellers', desc: 'All sellers are verified BU students with valid student IDs.' },
              { icon: '📍', title: 'Safe Meet-ups', desc: 'Campus-approved meet-up spots for safe transactions.' },
              { icon: '⭐', title: 'Rated & Reviewed', desc: 'Real reviews from fellow students to help you decide.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-4 text-center shadow-sm">
                <span className="text-3xl block mb-2">{item.icon}</span>
                <p className="text-slate-800 text-sm font-medium mb-1">{item.title}</p>
                <p className="text-slate-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
