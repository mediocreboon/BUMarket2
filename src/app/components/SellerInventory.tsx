import { useState } from 'react';
import { Plus, Search, Edit3, Trash2, Eye, TrendingUp, Package, X, Upload } from 'lucide-react';
import { mockProducts, Product } from '../data/mockProducts';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface InventoryProduct extends Product {
  status: 'active' | 'paused' | 'sold-out';
  views: number;
}

const initialProducts: InventoryProduct[] = mockProducts.slice(0, 5).map((p, i) => ({
  ...p,
  sellerId: 'my_seller',
  seller: 'My Shop',
  status: i === 3 ? 'sold-out' : i === 4 ? 'paused' : 'active',
  views: Math.floor(Math.random() * 200) + 20,
}));

interface SellerInventoryProps {}

export function SellerInventory({}: SellerInventoryProps) {
  const [products, setProducts] = useState<InventoryProduct[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'sold-out'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Food & Snacks',
    condition: 'new' as Product['condition'],
    stock: '',
    location: '',
    tags: '',
  });

  const filtered = products.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleToggleStatus = (id: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newStatus = p.status === 'active' ? 'paused' : 'active';
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: InventoryProduct = {
      id: Date.now().toString(),
      title: newProduct.title,
      description: newProduct.description,
      price: parseFloat(newProduct.price) || 0,
      category: newProduct.category,
      seller: 'My Shop',
      sellerId: 'my_seller',
      sellerDept: 'Computer Studies',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      images: [],
      verified: true,
      location: newProduct.location,
      rating: 0,
      reviewCount: 0,
      soldCount: 0,
      stock: parseInt(newProduct.stock) || 0,
      tags: newProduct.tags.split(',').map(t => t.trim()).filter(Boolean),
      condition: newProduct.condition,
      status: 'active',
      views: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts(prev => [product, ...prev]);
    setShowAddModal(false);
    setNewProduct({ title: '', description: '', price: '', category: 'Food & Snacks', condition: 'new', stock: '', location: '', tags: '' });
  };

  const statusBadge = {
    active: 'bg-emerald-100 text-emerald-700',
    paused: 'bg-amber-100 text-amber-700',
    'sold-out': 'bg-red-100 text-red-600',
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-slate-900">My Inventory</h2>
          <p className="text-slate-500 text-sm mt-1">{products.filter(p => p.status === 'active').length} active listings</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Listings', value: products.length, color: 'text-slate-700', bg: 'bg-white' },
          { label: 'Active', value: products.filter(p => p.status === 'active').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Paused', value: products.filter(p => p.status === 'paused').length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Sold Out', value: products.filter(p => p.status === 'sold-out').length, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-slate-100 shadow-sm`}>
            <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'paused', 'sold-out'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 text-xs rounded-xl border transition-colors capitalize ${filterStatus === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {s === 'sold-out' ? 'Sold Out' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Product</th>
                  <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Price</th>
                  <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 hidden sm:table-cell">Stock</th>
                  <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 hidden lg:table-cell">Views</th>
                  <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Status</th>
                  <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ImageWithFallback src={product.image} alt={product.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                        <div>
                          <p className="text-sm text-slate-800 font-medium line-clamp-1">{product.title}</p>
                          <p className="text-xs text-slate-400">{product.soldCount} sold</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{product.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-800 font-medium">₱{product.price.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs font-medium ${product.stock === 0 ? 'text-red-600' : product.stock <= 3 ? 'text-amber-600' : 'text-slate-600'}`}>
                        {product.stock === 0 ? 'None' : product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-xs">{product.views}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusBadge[product.status]}`}>
                        {product.status === 'sold-out' ? 'Sold Out' : product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleStatus(product.id)}
                          className={`p-1.5 rounded-lg transition-colors text-xs ${product.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                          title={product.status === 'active' ? 'Pause' : 'Activate'}
                        >
                          {product.status === 'active' ? '⏸' : '▶'}
                        </button>
                        <button className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No products found</p>
            <button onClick={() => setShowAddModal(true)} className="mt-3 text-indigo-600 text-sm hover:underline">
              + Add your first product
            </button>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-slate-900">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              {/* Image Upload Placeholder */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-300 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Click to upload product image</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1.5">Product Title *</label>
                <input
                  required
                  type="text"
                  value={newProduct.title}
                  onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                  placeholder="e.g., Engineering Textbook Bundle"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1.5">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Describe your product in detail..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5">Price (₱) *</label>
                  <input
                    required
                    type="number"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5">Stock Qty *</label>
                  <input
                    required
                    type="number"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                    placeholder="1"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  >
                    {['Food & Snacks', 'Academic', 'Apparel', 'Services', 'Electronics'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5">Condition *</label>
                  <select
                    value={newProduct.condition}
                    onChange={e => setNewProduct({...newProduct, condition: e.target.value as Product['condition']})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  >
                    <option value="new">New</option>
                    <option value="like-new">Like New</option>
                    <option value="used">Used</option>
                    <option value="service">Service</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1.5">Meet-up Location *</label>
                <input
                  required
                  type="text"
                  value={newProduct.location}
                  onChange={e => setNewProduct({...newProduct, location: e.target.value})}
                  placeholder="e.g., Main Library, Cafeteria"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1.5">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newProduct.tags}
                  onChange={e => setNewProduct({...newProduct, tags: e.target.value})}
                  placeholder="e.g., textbook, engineering, used"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors font-medium">
                  Post Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
