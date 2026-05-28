import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Search, Edit3, Trash2, Package, X, Upload, RefreshCw } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  DbProduct,
  listProductsBySeller,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '../../lib/db';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Food & Snacks', 'Academic', 'Apparel', 'Services', 'Electronics', 'Other'];

interface ProductForm {
  title: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  location: string;
  image_url: string;
}

const EMPTY_FORM: ProductForm = {
  title: '',
  description: '',
  price: '',
  category: 'Food & Snacks',
  stock: '1',
  location: '',
  image_url: '',
};

export function SellerInventory() {
  const { user } = useAuth();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const mountedRef = useRef(true);
  const requestRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestRef.current;
    const isActive = () => mountedRef.current && requestId === requestRef.current;
    if (!user) {
      if (isActive()) {
        setProducts([]);
        setIsLoading(false);
      }
      return;
    }
    if (isActive()) setIsLoading(true);
    try {
      const rows = await listProductsBySeller(user.id);
      if (isActive()) setProducts(rows);
    } catch {
      if (isActive()) setError('Failed to load inventory.');
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

  const filtered = products.filter(
    (p) => !search || p.title.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setError('');
    setShowFormModal(true);
  };

  const openEdit = (p: DbProduct) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description || '',
      price: String(p.price ?? 0),
      category: p.category || 'Other',
      stock: String(p.stock ?? 1),
      location: p.location || '',
      image_url: p.image_url || '',
    });
    setImageFile(null);
    setError('');
    setShowFormModal(true);
  };

  const handleDelete = async (p: DbProduct) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    setError('');
    const ok = await deleteProduct(p.id);
    if (!mountedRef.current) return;
    if (ok) {
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } else {
      setError('Failed to delete product.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!user) return;
    if (!form.title.trim()) return setError('Please enter a product title.');
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) return setError('Please enter a valid price.');
    const stock = Number(form.stock);
    if (!Number.isInteger(stock) || stock < 0) return setError('Please enter a valid whole-number stock quantity.');
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      return setError('Please choose an image smaller than 5MB.');
    }

    setIsSaving(true);
    try {
      let imageUrl = form.image_url;
      if (imageFile) {
        const uploaded = await uploadProductImage(imageFile, user.id);
        if (!uploaded) {
          if (mountedRef.current) setError('Failed to upload product image.');
          return;
        }
        imageUrl = uploaded;
      }

      const payload = {
        seller_id: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        price,
        category: form.category,
        image_url: imageUrl || null,
        stock,
        location: form.location.trim() || 'Campus',
      };

      if (editingId) {
        const ok = await updateProduct(editingId, payload);
        if (!ok) {
          if (mountedRef.current) setError('Failed to update product.');
          return;
        }
      } else {
        const created = await createProduct(payload);
        if (!created) {
          if (mountedRef.current) {
            setError(
              'Failed to create product. Make sure the Supabase schema has been applied (see supabase/schema.sql).'
            );
          }
          return;
        }
      }
      if (!mountedRef.current) return;
      setShowFormModal(false);
      setForm(EMPTY_FORM);
      setImageFile(null);
      setEditingId(null);
      await refresh();
    } finally {
      if (mountedRef.current) setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-6">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h2 className="text-slate-900">My Inventory</h2>
          <p className="text-slate-500 text-sm mt-1">{products.length} listings</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Listings', value: products.length, color: 'text-slate-700' },
          { label: 'In Stock', value: products.filter((p) => p.stock > 0).length, color: 'text-emerald-600' },
          { label: 'Sold Out', value: products.filter((p) => p.stock === 0).length, color: 'text-red-600' },
          {
            label: 'Categories',
            value: new Set(products.map((p) => p.category)).size,
            color: 'text-indigo-600',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {error && !showFormModal && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-xl mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading && products.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <RefreshCw className="w-10 h-10 mx-auto mb-3 opacity-30 animate-spin" />
            <p>Loading products…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{search ? 'No products match your search.' : 'No products yet.'}</p>
              {search ? (
                <button onClick={() => setSearch('')} className="mt-3 text-indigo-600 text-sm hover:underline">
                  Clear search
                </button>
              ) : (
                <button
                  onClick={openCreate}
                  className="mt-3 text-indigo-600 text-sm hover:underline"
                >
                  + Add your first product
                </button>
              )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Product</th>
                  <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Price</th>
                  <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 hidden sm:table-cell">
                    Stock
                  </th>
                  <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          src={p.image_url || ''}
                          alt={p.title}
                          className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-slate-100"
                        />
                        <div className="min-w-0">
                          <p className="text-sm text-slate-800 font-medium line-clamp-1">{p.title}</p>
                          <p className="text-xs text-slate-400 line-clamp-1">{p.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-800 font-medium">
                        ₱{Number(p.price).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className={`text-xs font-medium ${
                          p.stock === 0
                            ? 'text-red-600'
                            : p.stock <= 3
                              ? 'text-amber-600'
                              : 'text-slate-600'
                        }`}
                      >
                        {p.stock === 0 ? 'Sold out' : p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showFormModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFormModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-slate-900 font-semibold">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <label className="block">
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-indigo-300 transition-colors cursor-pointer">
                  {imageFile ? (
                    <p className="text-sm text-slate-700">Selected: {imageFile.name}</p>
                  ) : form.image_url ? (
                    <ImageWithFallback
                      src={form.image_url}
                      alt="current"
                      className="w-16 h-16 mx-auto rounded-xl object-cover"
                    />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Click to upload an image</p>
                      <p className="text-xs text-slate-400 mt-1">JPG / PNG up to 5MB (optional)</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </label>

              <div>
                <label className="block text-sm text-slate-700 mb-1.5">Or paste image URL</label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1.5">Product Title *</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Engineering Textbook Bundle"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your product in a sentence or two..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5">Price (₱) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5">Stock *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="1"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5">Meet-up Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g., Main Library"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 font-medium disabled:opacity-60"
                >
                  {isSaving ? 'Saving…' : editingId ? 'Save Changes' : 'Post Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
