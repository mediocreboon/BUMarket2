import { useState } from 'react';
import { ArrowLeft, Star, ShieldCheck, MapPin, MessageCircle, Heart, Share2, Tag, Package, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Product, mockProducts, mockReviews } from '../data/mockProducts';
import { ProductCard } from './ProductCard';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
}

export function ProductDetails({ product, onBack }: ProductDetailsProps) {
  const [currentImg, setCurrentImg] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'seller'>('details');
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const reviews = mockReviews.filter(r => r.productId === product.id);
  const related = mockProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const images = product.images?.length ? product.images : [product.image];

  const handleReserveConfirm = () => {
    setShowReserveModal(false);
    alert(`✅ Reservation confirmed for "${product.title}"!\nThe seller will contact you to arrange a campus meet-up.`);
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex-1">
          <p className="text-slate-500 text-sm">Product Details</p>
        </div>
        <button onClick={() => setIsFavorite(!isFavorite)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
        </button>
        <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <Share2 className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div>
            <div className="relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm h-72 md:h-80">
              <ImageWithFallback
                src={images[currentImg]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImg(Math.max(0, currentImg - 1))}
                    disabled={currentImg === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentImg(Math.min(images.length - 1, currentImg + 1))}
                    disabled={currentImg === images.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              {product.discount && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                  -{product.discount}% OFF
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${currentImg === i ? 'border-blue-500' : 'border-transparent'}`}
                  >
                    <ImageWithFallback src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{product.category}</span>
              {product.isPopular && (
                <span className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Popular
                </span>
              )}
            </div>

            <h2 className="text-slate-900 mb-3 leading-tight">{product.title}</h2>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                ))}
                <span className="text-sm text-slate-600 ml-1">{product.rating}</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-sm text-slate-500">{product.reviewCount} reviews</span>
              <span className="text-slate-300">|</span>
              <span className="text-sm text-slate-500">{product.soldCount} sold</span>
            </div>

            {/* Price */}
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-blue-600 text-3xl font-bold">₱{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-slate-400 text-sm line-through">₱{product.originalPrice.toLocaleString()}</span>
                )}
              </div>
              {product.discount && (
                <p className="text-green-600 text-xs mt-1">You save ₱{((product.originalPrice || 0) - product.price).toLocaleString()} ({product.discount}% off)</p>
              )}
            </div>

            {/* Stock & Condition */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1.5 text-sm">
                <Package className="w-4 h-4 text-slate-400" />
                <span className={`${product.stock > 5 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
              <span className="text-slate-200">|</span>
              <div className="flex items-center gap-1.5 text-sm">
                <Tag className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 capitalize">{product.condition}</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-5">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Meet-up: <strong>{product.location}</strong></span>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {product.tags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowReserveModal(true)}
                disabled={product.stock === 0}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Reserve Now'}
              </button>
              <button className="px-4 py-3 border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`px-4 py-3 border rounded-xl transition-colors ${isFavorite ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="flex border-b border-slate-100">
            {[
              { id: 'details', label: 'Description' },
              { id: 'reviews', label: `Reviews (${product.reviewCount})` },
              { id: 'seller', label: 'Seller Info' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'details' && (
              <div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{product.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-slate-400 text-xs mb-1">Category</p>
                    <p className="text-slate-700">{product.category}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-slate-400 text-xs mb-1">Condition</p>
                    <p className="text-slate-700 capitalize">{product.condition}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-slate-400 text-xs mb-1">Department</p>
                    <p className="text-slate-700">{product.sellerDept}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-slate-400 text-xs mb-1">Meet-up Location</p>
                    <p className="text-slate-700">{product.location}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.length > 0 ? reviews.map(review => (
                  <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-xs text-indigo-600 font-semibold">{review.buyer[0]}</span>
                        </div>
                        <p className="text-sm text-slate-700 font-medium">{review.buyer}</p>
                      </div>
                      <p className="text-xs text-slate-400">{review.date}</p>
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600">{review.comment}</p>
                  </div>
                )) : (
                  <div className="text-center py-6 text-slate-400">
                    <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'seller' && (
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl text-blue-600 font-bold">{product.seller[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-slate-800 font-medium">{product.seller}</p>
                      {product.verified && (
                        <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm">{product.sellerDept} Department</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs text-slate-600">{product.rating} · {product.soldCount} items sold</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-slate-600">
                    <strong>Meet-up Location:</strong> {product.location}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setChatMessage('')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm"
                  >
                    <MessageCircle className="w-4 h-4" /> Message Seller
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm">
                    View Shop
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h3 className="text-slate-800 mb-4">More in {product.category}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reserve Modal */}
      {showReserveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReserveModal(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-slate-900 mb-1">Confirm Reservation</h3>
            <p className="text-slate-500 text-sm mb-4">You're about to reserve this item.</p>

            <div className="flex gap-3 mb-5">
              <ImageWithFallback src={product.image} alt={product.title} className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <p className="text-slate-800 text-sm font-medium">{product.title}</p>
                <p className="text-blue-600 font-bold">₱{product.price.toLocaleString()}</p>
                <p className="text-slate-500 text-xs">Seller: {product.seller}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5">
              <p className="text-xs text-blue-700">
                📍 Meet-up at: <strong>{product.location}</strong><br />
                The seller will contact you to confirm the schedule.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowReserveModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm">
                Cancel
              </button>
              <button onClick={handleReserveConfirm} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
