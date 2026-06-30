'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

interface Vendor {
  id: string;
  businessName: string;
  description: string;
  logo: string;
  location: string;
  phone: string;
  address: string;
  logisticsEnabled: boolean;
  payLaterEnabled: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function StoreClient({ slug }: { slug: string }) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQty, setSelectedQty] = useState(1);
  const [trackOpen, setTrackOpen] = useState(false);
  const [trackId, setTrackId] = useState('');
  const [trackResult, setTrackResult] = useState<{ status: string; orderNumber: string; customerName: string; createdAt: string } | null>(null);
  const [trackError, setTrackError] = useState('');
  const [tracking, setTracking] = useState(false);

  // Session ID for deduplicating views
  const [sessionId] = useState(() => {
    if (typeof sessionStorage === 'undefined') return Math.random().toString(36).slice(2);
    const existing = sessionStorage.getItem('vendly_sid');
    if (existing) return existing;
    const id = Math.random().toString(36).slice(2);
    sessionStorage.setItem('vendly_sid', id);
    return id;
  });

  const trackView = (productId: string, vendorId: string) => {
    void fetch('/api/products/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, vendorId, sessionId }),
    });
  };


  useEffect(() => {
    fetch(`/api/store/${slug}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        const data = d as { vendor: Vendor; products: Product[] };
        setVendor(data.vendor);
        setProducts(data.products);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  const addToCart = (product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing)
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + qty } : c
        );
      return [...prev, { product, quantity: qty }];
    });
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty < 1) { removeFromCart(productId); return; }
    setCart((prev) => prev.map((c) => c.product.id === productId ? { ...c, quantity: qty } : c));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const handleTrack = async () => {
    if (!trackId.trim()) return;
    setTracking(true);
    setTrackError('');
    setTrackResult(null);
    try {
      const res = await fetch(`/api/orders/track?id=${encodeURIComponent(trackId.trim())}`);
      const data = await res.json() as { order?: { status: string; orderNumber: string; customerName: string; createdAt: string }; error?: string };
      if (!res.ok || data.error) { setTrackError(data.error || 'Order not found'); }
      else { setTrackResult(data.order!); }
    } catch { setTrackError('Something went wrong'); }
    setTracking(false);
  };

  const STATUS_LABELS: Record<string, string> = {
    new: 'Order Received',
    accepted: 'Accepted by Vendor',
    preparing_package: 'Preparing Package',
    ready_for_pickup: 'Ready for Pickup',
    logistics_assigned: 'Logistics Assigned',
    picked_up: 'Picked Up',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    completed: 'Completed',
  };

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const cartTotal = cart.reduce((sum, c) => sum + Number(c.product.price) * c.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0d0d' }}>
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (notFound || !vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#0d0d0d' }}>
        <h1 className="text-xl font-semibold" style={{ color: '#f5f5f5' }}>Store not found</h1>
        <p className="text-sm" style={{ color: '#888888' }}>This store doesn&apos;t exist or isn&apos;t active yet.</p>
        <Link href="/" className="text-sm" style={{ color: '#22c55e' }}>← Back to Vendly</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d0d0d', fontFamily: 'Inter, sans-serif' }}>
      {/* Store header */}
      <div className="border-b" style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl overflow-hidden border flex items-center justify-center" style={{ borderColor: '#2a2a2a', backgroundColor: '#1a1a1a' }}>
              {vendor.logo ? (
                <img src={vendor.logo} alt={vendor.businessName} className="w-full h-full object-cover" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" style={{ color: '#555' }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold" style={{ color: '#f5f5f5' }}>{vendor.businessName}</h1>
              <p className="text-sm mt-0.5 truncate" style={{ color: '#888888' }}>{vendor.description || 'Welcome to our store!'}</p>
              <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: '#555555' }}>
                {vendor.location && <span>{vendor.location}</span>}
                {vendor.phone && <span>{vendor.phone}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTrackOpen(true)}
                className="text-xs px-3 py-2 rounded-lg border font-medium"
                style={{ borderColor: '#2a2a2a', color: '#aaaaaa', backgroundColor: '#1a1a1a' }}
              >
                Track Order
              </button>
              <button
                onClick={() => setShowCart(true)}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                Cart{cartCount > 0 && <span className="font-bold">({cartCount})</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm" style={{ color: '#555555' }}>No products available yet.</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-wider mb-6" style={{ color: '#888888' }}>
              {products.length} Products
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border overflow-hidden cursor-pointer"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
                  onClick={() => { setSelectedProduct(p); setSelectedQty(1); if (vendor) trackView(p.id, vendor.id); }}
                >
                  <div className="aspect-square overflow-hidden" style={{ backgroundColor: '#0d0d0d' }}>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8" style={{ color: '#333' }}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold truncate" style={{ color: '#f5f5f5' }}>{p.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#888888' }}>{p.category || 'General'}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-semibold" style={{ color: '#22c55e' }}>₦{Number(p.price).toLocaleString()}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); addToCart(p, 1); }}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                        style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Product detail modal with quantity selector */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <div className="w-full max-w-lg rounded-xl border overflow-hidden" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <div className="aspect-video overflow-hidden" style={{ backgroundColor: '#0d0d0d' }}>
              {selectedProduct.images?.[0] ? (
                <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12" style={{ color: '#333' }}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#f5f5f5' }}>{selectedProduct.name}</h2>
                  <p className="text-xs mt-0.5" style={{ color: '#888888' }}>{selectedProduct.category}</p>
                </div>
                <button onClick={() => setSelectedProduct(null)} style={{ color: '#888888' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: '#aaaaaa' }}>{selectedProduct.description || 'No description available.'}</p>
              <div className="flex items-center justify-between mt-5">
                <span className="text-2xl font-semibold" style={{ color: '#22c55e' }}>₦{Number(selectedProduct.price).toLocaleString()}</span>
                <span className="text-xs" style={{ color: '#555555' }}>{selectedProduct.stock} in stock</span>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-3 mt-5">
                <p className="text-xs font-medium" style={{ color: '#aaaaaa' }}>Qty:</p>
                <div className="flex items-center gap-0 rounded-lg border overflow-hidden" style={{ borderColor: '#2a2a2a' }}>
                  <button
                    onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                    className="px-3 py-2 text-sm font-bold"
                    style={{ backgroundColor: '#0d0d0d', color: '#f5f5f5' }}
                  >−</button>
                  <input
                    type="number"
                    min={1}
                    max={selectedProduct.stock}
                    value={selectedQty}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v) && v >= 1 && v <= selectedProduct.stock) setSelectedQty(v);
                    }}
                    className="w-14 text-center text-sm py-2 outline-none"
                    style={{ backgroundColor: '#0d0d0d', color: '#f5f5f5' }}
                  />
                  <button
                    onClick={() => setSelectedQty(Math.min(selectedProduct.stock, selectedQty + 1))}
                    className="px-3 py-2 text-sm font-bold"
                    style={{ backgroundColor: '#0d0d0d', color: '#f5f5f5' }}
                  >+</button>
                </div>
                <span className="text-sm font-semibold" style={{ color: '#22c55e' }}>
                  = ₦{(Number(selectedProduct.price) * selectedQty).toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => {
                  addToCart(selectedProduct, selectedQty);
                  setSelectedProduct(null);
                  setShowCart(true);
                }}
                className="w-full mt-4 py-3 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
              >
                Add {selectedQty} to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="ml-auto h-full w-full max-w-sm flex flex-col border-l" style={{ backgroundColor: '#111111', borderColor: '#2a2a2a' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#2a2a2a' }}>
              <h2 className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Cart ({cartCount})</h2>
              <button onClick={() => setShowCart(false)} style={{ color: '#888888' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm" style={{ color: '#555555' }}>Your cart is empty.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: '#2a2a2a' }}>
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: '#0d0d0d' }}>
                        {item.product.images?.[0] ? (
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#333' }}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: '#f5f5f5' }}>{item.product.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#22c55e' }}>₦{Number(item.product.price).toLocaleString()}</p>
                        {/* Inline quantity controls in cart */}
                        <div className="flex items-center gap-1 mt-1.5">
                          <button
                            onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold border"
                            style={{ borderColor: '#2a2a2a', color: '#aaaaaa', backgroundColor: '#0d0d0d' }}
                          >−</button>
                          <span className="text-xs w-6 text-center" style={{ color: '#f5f5f5' }}>{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold border"
                            style={{ borderColor: '#2a2a2a', color: '#aaaaaa', backgroundColor: '#0d0d0d' }}
                          >+</button>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold" style={{ color: '#f5f5f5' }}>₦{(Number(item.product.price) * item.quantity).toLocaleString()}</p>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-xs mt-1" style={{ color: '#ef4444' }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t" style={{ borderColor: '#2a2a2a' }}>
                  <div className="flex justify-between text-sm font-semibold mb-4">
                    <span style={{ color: '#f5f5f5' }}>Total</span>
                    <span style={{ color: '#22c55e' }}>₦{cartTotal.toLocaleString()}</span>
                  </div>
                  <Link
                    href={`/store/${slug}/checkout`}
                    onClick={() => {
                      if (typeof sessionStorage !== 'undefined') {
                        sessionStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
                        sessionStorage.setItem(`vendor_${slug}`, JSON.stringify(vendor));
                      }
                    }}
                    className="block w-full text-center py-3 rounded-lg text-sm font-semibold"
                    style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
                  >
                    Checkout →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Track Order modal */}
      {trackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-md rounded-xl border p-6" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold" style={{ color: '#f5f5f5' }}>Track Your Order</h2>
              <button onClick={() => { setTrackOpen(false); setTrackResult(null); setTrackError(''); setTrackId(''); }} style={{ color: '#888888' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p className="text-xs mb-4" style={{ color: '#888888' }}>Enter your Order ID — you received it after completing your payment.</p>
            <div className="flex gap-2">
              <input
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="e.g. VDL-A1B2C3D4"
                className="flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none font-mono"
                style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleTrack(); }}
              />
              <button
                onClick={() => void handleTrack()}
                disabled={tracking || !trackId.trim()}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
                style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
              >
                {tracking ? '…' : 'Track'}
              </button>
            </div>

            {trackError && (
              <p className="text-xs mt-3" style={{ color: '#ef4444' }}>{trackError}</p>
            )}

            {trackResult && (
              <div className="mt-5 p-4 rounded-lg border" style={{ borderColor: '#2a2a2a', backgroundColor: '#0d0d0d' }}>
                <div className="flex items-center justify-between mb-3">
                  <code className="text-sm font-mono font-bold" style={{ color: '#22c55e' }}>{trackResult.orderNumber}</code>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>
                    {STATUS_LABELS[trackResult.status] || trackResult.status}
                  </span>
                </div>
                <p className="text-xs" style={{ color: '#888888' }}>Customer: {trackResult.customerName}</p>
                <p className="text-xs mt-0.5" style={{ color: '#555' }}>Placed: {new Date(trackResult.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border-t mt-12 py-6 text-center" style={{ borderColor: '#2a2a2a' }}>
        <p className="text-xs" style={{ color: '#555555' }}>
          Powered by{' '}
          <a href="/">
            <img src="/logo-full.png" alt="Vendly" style={{ height: 18, width: 'auto', objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle' }} />
          </a>
        </p>
      </div>
    </div>
  );
}
