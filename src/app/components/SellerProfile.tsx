import { useState } from 'react';
import { CheckCircle, MapPin, CreditCard, Clock, ChevronDown, ChevronUp, MessageCircle, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function SellerProfile() {
  const [bioExpanded, setBioExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

  const sampleListings = [
    {
      id: 1,
      name: 'Scientific Calculator',
      price: 450,
      image: 'https://images.unsplash.com/photo-1694753736023-ddad6cfc8263?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbnRpZmljJTIwY2FsY3VsYXRvciUyMGRlc2t8ZW58MXx8fHwxNzY2MjQzNjk0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      condition: 'Like New'
    },
    {
      id: 2,
      name: 'Pre-loved Uniform',
      price: 350,
      image: 'https://images.unsplash.com/photo-1763521011179-42c1576d6f4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjB1bmlmb3JtJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzY2MjQzNjk0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      condition: 'Good'
    }
  ];

  const sampleReviews = [
    {
      id: 1,
      buyer: 'Sarah L.',
      rating: 5,
      comment: 'Super responsive and met me on time! The calculator works perfectly.',
      date: '2 days ago'
    },
    {
      id: 2,
      buyer: 'Mark D.',
      rating: 5,
      comment: 'Great seller! Very professional and the item was exactly as described.',
      date: '1 week ago'
    },
    {
      id: 3,
      buyer: 'Jessica T.',
      rating: 4,
      comment: 'Good transaction overall. Slight delay but the seller communicated well.',
      date: '2 weeks ago'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1765648636065-fd5c0884b629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzY2MTU2NjE0fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Seller profile"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-100"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-slate-900">Maria Santos</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-sm">
                <CheckCircle className="w-3.5 h-3.5" />
                Verified Student
              </span>
            </div>
            <p className="text-slate-500 mb-3">BS Computer Science - 3rd Year</p>

            {/* Status Bar */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <span className="text-lg">🟢</span>
              <span className="text-green-700">Free for Meet-ups</span>
            </div>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
          <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl">
            <Clock className="w-5 h-5 text-indigo-600 mb-2" />
            <p className="text-slate-900">98% On-Time</p>
            <p className="text-xs text-slate-500">Punctuality</p>
          </div>
          <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl">
            <MapPin className="w-5 h-5 text-indigo-600 mb-2" />
            <p className="text-slate-900">Main Library</p>
            <p className="text-xs text-slate-500">Location</p>
          </div>
          <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl">
            <CreditCard className="w-5 h-5 text-indigo-600 mb-2" />
            <p className="text-slate-900">Cash / GCash</p>
            <p className="text-xs text-slate-500">Payment</p>
          </div>
          <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl">
            <MessageCircle className="w-5 h-5 text-indigo-600 mb-2" />
            <p className="text-slate-900">&lt;10m</p>
            <p className="text-xs text-slate-500">Response Time</p>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <button
          onClick={() => setBioExpanded(!bioExpanded)}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
        >
          <h2 className="text-slate-900">Shop Rules & Policies</h2>
          {bioExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-500" />
          )}
        </button>
        
        {bioExpanded && (
          <div className="px-6 pb-6 text-slate-600 space-y-2 border-t border-slate-100 pt-6">
            <p>📦 <strong>Meet-up Policy:</strong> Prefer to meet at Main Library or Student Center. Flexible on weekdays after 3 PM.</p>
            <p>💰 <strong>Payment:</strong> Cash or GCash accepted. Payment upon meet-up.</p>
            <p>🔄 <strong>Returns:</strong> Inspection allowed during meet-up. No returns after transaction is complete.</p>
            <p>💬 <strong>Communication:</strong> I usually reply within 10 minutes during the day. Please be patient if I&apos;m in class!</p>
            <p>⭐ <strong>Quality Guarantee:</strong> All items are as described. Feel free to ask for more photos!</p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex-1 px-6 py-4 transition-all ${
              activeTab === 'listings'
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Active Listings
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 px-6 py-4 transition-all ${
              activeTab === 'reviews'
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Reviews
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'listings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleListings.map((listing) => (
                <div key={listing.id} className="bg-slate-50 rounded-2xl p-4 hover:shadow-md transition-shadow border border-slate-200">
                  <ImageWithFallback
                    src={listing.image}
                    alt={listing.name}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                  <div className="space-y-2">
                    <h3 className="text-slate-900">{listing.name}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-600">₱{listing.price}</p>
                        <p className="text-xs text-slate-500">{listing.condition}</p>
                      </div>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Chat Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {sampleReviews.map((review) => (
                <div key={review.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-slate-900">{review.buyer}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{review.date}</span>
                  </div>
                  <p className="text-slate-600">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
