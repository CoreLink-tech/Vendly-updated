'use client';

import { useEffect, useRef, useState } from 'react';
import useUpload from '@/utils/useUpload';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: string;
  images: string[];
}

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Food',
  'Health',
  'Beauty',
  'Home',
  'Sports',
  'Education',
  'Other',
];

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
  images: [] as string[],
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upload, { loading: uploading }] = useUpload();
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    fetch('/api/vendor/products')
      .then((r) => r.json())
      .then((d) => {
        setProducts((d as { products: Product[] }).products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      category: p.category,
      stock: String(p.stock),
      images: p.images || [],
    });
    setError(null);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload({ file });
    if ('error' in result) {
      setError(result.error ?? 'Upload failed');
      return;
    }
    if (!result.url) {
      setError('Upload failed');
      return;
    }
    setForm((f) => ({ ...f, images: [...f.images, result.url] }));
  };

  const removeImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      setError('Name and price are required');
      return;
    }
    setSaving(true);
    setError(null);
    const body = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      stock: parseInt(form.stock) || 0,
      images: form.images,
    };
    const res = editProduct
      ? await fetch(`/api/vendor/products/${editProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      : await fetch('/api/vendor/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error || 'Failed to save');
      setSaving(false);
      return;
    }
    load();
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/vendor/products/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
            Products
          </h1>
          <p className="text-sm mt-1" style={{ color: '#888888' }}>
            {products.length} product{products.length !== 1 ? 's' : ''} in your catalogue
          </p>
        </div>
        <button
          onClick={openAdd}
          className="text-sm font-semibold px-5 py-2.5 rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
        >
          + Add Product
        </button>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div
            className="w-5 h-5 border-2 rounded-full"
            style={{
              borderColor: '#22c55e',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <style jsx global>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      ) : products.length === 0 ? (
        <div
          className="text-center py-20 rounded-xl border"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <p className="flex items-center justify-center mb-4"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></p>
          <p className="text-sm font-semibold mb-1" style={{ color: '#f5f5f5' }}>
            No products yet
          </p>
          <p className="text-xs mb-5" style={{ color: '#888888' }}>
            Add your first product to start selling.
          </p>
          <button
            onClick={openAdd}
            className="text-sm font-semibold px-5 py-2.5 rounded-lg"
            style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
          >
            Add Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border overflow-hidden"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            >
              {/* Image */}
              <div
                className="aspect-video relative overflow-hidden"
                style={{ backgroundColor: '#0d0d0d' }}
              >
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl"><span className="flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span></div>
                )}
                <div
                  className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full border"
                  style={{
                    borderColor: p.status === 'active' ? '#22c55e40' : '#ef444440',
                    color: p.status === 'active' ? '#22c55e' : '#ef4444',
                    backgroundColor: p.status === 'active' ? '#22c55e10' : '#ef444410',
                  }}
                >
                  {p.status}
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold truncate" style={{ color: '#f5f5f5' }}>
                  {p.name}
                </p>
                <p className="text-xs mt-0.5 truncate" style={{ color: '#888888' }}>
                  {p.category || 'Uncategorized'}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-base font-semibold" style={{ color: '#22c55e' }}>
                    ₦{Number(p.price).toLocaleString()}
                  </span>
                  <span className="text-xs" style={{ color: '#888888' }}>
                    Stock: {p.stock}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 text-xs py-1.5 rounded-lg border transition-colors"
                    style={{ borderColor: '#2a2a2a', color: '#aaaaaa' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      void handleDelete(p.id);
                    }}
                    className="flex-1 text-xs py-1.5 rounded-lg border transition-colors"
                    style={{ borderColor: '#ef444430', color: '#ef4444' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
        >
          <div
            className="w-full max-w-lg rounded-xl border p-6"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold" style={{ color: '#f5f5f5' }}>
                {editProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ color: '#888888' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <label
                className="flex flex-col gap-1.5 text-xs font-medium"
                style={{ color: '#aaaaaa' }}
              >
                Product Name *
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                  style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                />
              </label>

              <label
                className="flex flex-col gap-1.5 text-xs font-medium"
                style={{ color: '#aaaaaa' }}
              >
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="rounded-lg border px-3 py-2.5 text-sm outline-none resize-none"
                  style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label
                  className="flex flex-col gap-1.5 text-xs font-medium"
                  style={{ color: '#aaaaaa' }}
                >
                  Price (₦) *
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                    style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                  />
                </label>
                <label
                  className="flex flex-col gap-1.5 text-xs font-medium"
                  style={{ color: '#aaaaaa' }}
                >
                  Stock
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                    style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                  />
                </label>
              </div>

              <label
                className="flex flex-col gap-1.5 text-xs font-medium"
                style={{ color: '#aaaaaa' }}
              >
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                  style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              {/* Images */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: '#aaaaaa' }}>
                  Product Images
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.images.map((url, i) => (
                    <div
                      key={i}
                      className="relative w-16 h-16 rounded-lg overflow-hidden border"
                      style={{ borderColor: '#2a2a2a' }}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center text-xs rounded-bl-lg"
                        style={{ backgroundColor: '#0d0d0d', color: '#ef4444' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center text-xs transition-colors"
                    style={{ borderColor: '#2a2a2a', color: '#888888' }}
                  >
                    {uploading ? '…' : '+'}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      void handleImageUpload(e);
                    }}
                  />
                </div>
                <p className="text-[10px]" style={{ color: '#555555' }}>
                  Images are automatically compressed and optimised.
                </p>
              </div>

              {error && (
                <p className="text-xs" style={{ color: '#ef4444' }}>
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm border"
                  style={{ borderColor: '#2a2a2a', color: '#888888' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    void handleSave();
                  }}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
                >
                  {saving ? 'Saving…' : editProduct ? 'Update' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
