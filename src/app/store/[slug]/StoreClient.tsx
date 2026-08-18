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
  primaryColor?: string;
  backgroundColor?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

// --- Theme helpers -----------------------------------------------------
// The storefront's whole look (panels, borders, text) is derived from the
// vendor's chosen background + accent color, rather than hardcoded dark-mode
// grays. That keeps every combination — dark, light, or colorful — coherent,
// instead of fixed dark panels/borders clashing against a light background.

function normalizeHex(hex: string): string | null {
  const h = (hex || '').replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return /^[0-9a-f]{6}$/i.test(full) ? full.toLowerCase() : null;
}

function hexToRgb(hex: string): [number, number, number] {
  const full = normalizeHex(hex) || '0d0d0d';
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function isDarkColor(hex: string): boolean {
  return relativeLuminance(hex) < 0.5;
}

// Blends `hex` toward `target` (white or black) by `weight` (0-1) — used to
// derive elevated surfaces and borders that stay proportionate to any base
// background color, light or dark.
function mixHex(hex: string, target: string, weight: number): string {
  const [r1, g1, b1] = hexToRgb(hex);
  const [r2, g2, b2] = hexToRgb(target);
  return rgbToHex(r1 + (r2 - r1) * weight, g1 + (g2 - g1) * weight, b1 + (b2 - b1) * weight);
}

// Picks readable text (near-black or near-white) against a given hex
// background so custom accent colors stay legible for any vendor's choice.
function getContrastText(hex: string): string {
  const full = normalizeHex(hex);
  if (!full) return '#0d0d0d';
  return relativeLuminance(`#${full}`) > 0.6 ? '#0d0d0d' : '#f5f5f5';
}

// Appends an alpha suffix to a hex color for tinted backgrounds (e.g. "20"
// for ~12% opacity), normalizing 3-digit hex to 6-digit first.
function hexWithAlpha(hex: string, alpha: string): string {
  const full = normalizeHex(hex);
  return full ? `#${full}${alpha}` : `${hex}${alpha}`;
}

// Builds the full derived palette for a given background color.
function buildTheme(bg: string) {
  const dark = isDarkColor(bg);
  const toward = dark ? '#ffffff' : '#000000';
  return {
    dark,
    text: dark ? '#f5f5f5' : '#171717',
    textMuted: dark ? '#a3a3a3' : '#6b7280',
    textFaint: dark ? '#707070' : '#9ca3af',
    icon: dark ? '#4a4a4a' : '#cbd5e1',
    surface: mixHex(bg, toward, dark ? 0.08 : 0.06),
    surfaceHigh: mixHex(bg, toward, dark ? 0.14 : 0.10),
    border: mixHex(bg, toward, dark ? 0.22 : 0.18),
    inputBg: mixHex(bg, toward, dark ? 0.07 : 0.05),
  };
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

  const [sessionId] = useState(() => {
    if (typeof sessionStorage === 'undefined') return Math.random().toString(36).slice(2);
    const existing = sessionStorage.getItem('vendly_sid');
    if (existing) return existing;
    const id = Math.random().toString(36).slice(2);
    sessionStorage.setItem('vendly_sid', id);
    return id;
  });

  // Track store visit on mount (deduplicated per session per 24h server-side)
  useEffect(() => {
    if (vendor?.id) {
      void fetch('/api/store/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId: vendor.id, sessionId }),
      });
    }
  }, [vendor?.id, sessionId]);

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

  const accent = vendor.primaryColor || '#22c55e';
  const bg = vendor.backgroundColor || '#0d0d0d';
  const accentText = getContrastText(accent);
  const accentTint = hexWithAlpha(accent, '20');
  const t = buildTheme(bg);

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg, fontFamily: 'Inter, sans-serif' }}>
      {/* Store header */}
      <div className="border-b" style={{ borderColor: t.border, backgroundColor: t.surface }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl overflow-hidden border flex items-center justify-center" style={{ borderColor: t.border, backgroundColor: t.surfaceHigh }}>
              {vendor.logo ? (
                <img src={vendor.logo} alt={vendor.businessName} className="w-full h-full object-cover" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" style={{ color: t.icon }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold" style={{ color: t.text }}>{vendor.businessName}</h1>
              <p className="text-sm mt-0.5 truncate" style={{ color: t.textMuted }}>{vendor.description || 'Welcome to our store!'}</p>
              <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: t.textFaint }}>
                {vendor.location && <span>{vendor.location}</span>}
                {vendor.phone && <span>{vendor.phone}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTrackOpen(true)}
                className="text-xs px-3 py-2 rounded-lg border font-medium"
                style={{ borderColor: t.border, color: t.textMuted, backgroundColor: t.surfaceHigh }}
              >
                Track Order
              </button>
              <button
                onClick={() => setShowCart(true)}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: accent, color: accentText }}
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
            <p className="text-sm" style={{ color: t.textFaint }}>No products available yet.</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-wider mb-6" style={{ color: t.textMuted }}>
              {products.length} Products
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border overflow-hidden cursor-pointer transition-shadow hover:shadow-lg"
                  style={{ backgroundColor: t.surface, borderColor: t.border }}
                  onClick={() => { setSelectedProduct(p); setSelectedQty(1); if (vendor) trackView(p.id, vendor.id); }}
                >
                  <div className="aspect-square overflow-hidden" style={{ backgroundColor: t.surfaceHigh }}>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8" style={{ color: t.icon }}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold truncate" style={{ color: t.text }}>{p.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>{p.category || 'General'}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-semibold" style={{ color: accent }}>₦{Number(p.price).toLocaleString()}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); addToCart(p, 1); }}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                        style={{ backgroundColor: accentTint, color: accent }}
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
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="w-full max-w-lg rounded-xl border overflow-hidden" style={{ backgroundColor: t.surfaceHigh, borderColor: t.border }}>
            <div className="aspect-video overflow-hidden" style={{ backgroundColor: t.surface }}>
              {selectedProduct.images?.[0] ? (
                <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12" style={{ color: t.icon }}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: t.text }}>{selectedProduct.name}</h2>
                  <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>{selectedProduct.category}</p>
                </div>
                <button onClick={() => setSelectedProduct(null)} style={{ color: t.textMuted }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: t.textMuted }}>{selectedProduct.description || 'No description available.'}</p>
              <div className="flex items-center justify-between mt-5">
                <span className="text-2xl font-semibold" style={{ color: accent }}>₦{Number(selectedProduct.price).toLocaleString()}</span>
                <span className="text-xs" style={{ color: t.textFaint }}>{selectedProduct.stock} in stock</span>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-3 mt-5">
                <p className="text-xs font-medium" style={{ color: t.textMuted }}>Qty:</p>
                <div className="flex items-center gap-0 rounded-lg border overflow-hidden" style={{ borderColor: t.border }}>
                  <button
                    onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                    className="px-3 py-2 text-sm font-bold"
                    style={{ backgroundColor: t.inputBg, color: t.text }}
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
                    style={{ backgroundColor: t.inputBg, color: t.text }}
                  />
                  <button
                    onClick={() => setSelectedQty(Math.min(selectedProduct.stock, selectedQty + 1))}
                    className="px-3 py-2 text-sm font-bold"
                    style={{ backgroundColor: t.inputBg, color: t.text }}
                  >+</button>
                </div>
                <span className="text-sm font-semibold" style={{ color: accent }}>
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
                style={{ backgroundColor: accent, color: accentText }}
              >
                Add {selectedQty} to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="ml-auto h-full w-full max-w-sm flex flex-col border-l" style={{ backgroundColor: t.surfaceHigh, borderColor: t.border }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: t.border }}>
              <h2 className="text-sm font-semibold" style={{ color: t.text }}>Cart ({cartCount})</h2>
              <button onClick={() => setShowCart(false)} style={{ color: t.textMuted }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm" style={{ color: t.textFaint }}>Your cart is empty.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: t.border }}>
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: t.surface }}>
                        {item.product.images?.[0] ? (
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: t.icon }}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: t.text }}>{item.product.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: accent }}>₦{Number(item.product.price).toLocaleString()}</p>
                        {/* Inline quantity controls in cart */}
                        <div className="flex items-center gap-1 mt-1.5">
                          <button
                            onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold border"
                            style={{ borderColor: t.border, color: t.textMuted, backgroundColor: t.inputBg }}
                          >−</button>
                          <span className="text-xs w-6 text-center" style={{ color: t.text }}>{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold border"
                            style={{ borderColor: t.border, color: t.textMuted, backgroundColor: t.inputBg }}
                          >+</button>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold" style={{ color: t.text }}>₦{(Number(item.product.price) * item.quantity).toLocaleString()}</p>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-xs mt-1" style={{ color: '#ef4444' }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t" style={{ borderColor: t.border }}>
                  <div className="flex justify-between text-sm font-semibold mb-4">
                    <span style={{ color: t.text }}>Total</span>
                    <span style={{ color: accent }}>₦{cartTotal.toLocaleString()}</span>
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
                    style={{ backgroundColor: accent, color: accentText }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="w-full max-w-md rounded-xl border p-6" style={{ backgroundColor: t.surfaceHigh, borderColor: t.border }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold" style={{ color: t.text }}>Track Your Order</h2>
              <button onClick={() => { setTrackOpen(false); setTrackResult(null); setTrackError(''); setTrackId(''); }} style={{ color: t.textMuted }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p className="text-xs mb-4" style={{ color: t.textMuted }}>Enter your Order ID — you received it after completing your payment.</p>
            <div className="flex gap-2">
              <input
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="e.g. VDL-A1B2C3D4"
                className="flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none font-mono"
                style={{ backgroundColor: t.inputBg, borderColor: t.border, color: t.text }}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleTrack(); }}
              />
              <button
                onClick={() => void handleTrack()}
                disabled={tracking || !trackId.trim()}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
                style={{ backgroundColor: accent, color: accentText }}
              >
                {tracking ? '…' : 'Track'}
              </button>
            </div>

            {trackError && (
              <p className="text-xs mt-3" style={{ color: '#ef4444' }}>{trackError}</p>
            )}

            {trackResult && (
              <div className="mt-5 p-4 rounded-lg border" style={{ borderColor: t.border, backgroundColor: t.surface }}>
                <div className="flex items-center justify-between mb-3">
                  <code className="text-sm font-mono font-bold" style={{ color: accent }}>{trackResult.orderNumber}</code>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: accentTint, color: accent }}>
                    {STATUS_LABELS[trackResult.status] || trackResult.status}
                  </span>
                </div>
                <p className="text-xs" style={{ color: t.textMuted }}>Customer: {trackResult.customerName}</p>
                <p className="text-xs mt-0.5" style={{ color: t.textFaint }}>Placed: {new Date(trackResult.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border-t mt-12 py-6 text-center" style={{ borderColor: t.border }}>
        <p className="text-xs" style={{ color: t.textFaint }}>
          Powered by{' '}
          <a href="/">
            <img src="/logo-full.png" alt="Vendly" style={{ height: 18, width: 'auto', objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle' }} />
          </a>
        </p>
      </div>
    </div>
  );
}
