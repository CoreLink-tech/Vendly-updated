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

  useEffect(() => {
    fetch(`/api/store/${slug}`)
      .then((r) => {
        if (!r.ok) {
          setNotFound(true);
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        const data = d as { vendor: Vendor; products: Product[] };
        setVendor(data.vendor);
        setProducts(data.products);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
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

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const cartTotal = cart.reduce((sum, c) => sum + Number(c.product.price) * c.quantity, 0);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0d0d0d' }}
      >
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
    );
  }

  if (notFound || !vendor) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: '#0d0d0d' }}
      >
        <p className="flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></p>
        <h1 className="text-xl font-semibold" style={{ color: '#f5f5f5' }}>
          Store not found
        </h1>
        <p className="text-sm" style={{ color: '#888888' }}>
          This store doesn&apos;t exist or isn&apos;t active yet.
        </p>
        <Link href="/" className="text-sm" style={{ color: '#22c55e' }}>
          ← Back to Vendly
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#0d0d0d', fontFamily: 'Inter, sans-serif' }}
    >
      {/* Store header */}
      <div className="border-b" style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-xl overflow-hidden border flex items-center justify-center text-2xl"
              style={{ borderColor: '#2a2a2a', backgroundColor: '#1a1a1a' }}
            >
              {vendor.logo ? (
                <img
                  src={vendor.logo}
                  alt={vendor.businessName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold" style={{ color: '#f5f5f5' }}>
                {vendor.businessName}
              </h1>
              <p className="text-sm mt-0.5 truncate" style={{ color: '#888888' }}>
                {vendor.description || 'Welcome to our store!'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: '#555555' }}>
                {vendor.location && <span><span className="inline-flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{vendor.location}</span></span>}
                {vendor.phone && <span><span className="inline-flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>{vendor.phone}</span></span>}
              </div>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
            >
              <span className="inline-flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> Cart</span>
              {cartCount > 0 && <span className="font-bold">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="flex items-center justify-center mb-4"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></p>
            <p className="text-sm" style={{ color: '#555555' }}>
              No products available yet.
            </p>
          </div>
        ) : (
          <>
            <p
              className="text-xs font-medium uppercase tracking-wider mb-6"
              style={{ color: '#888888' }}
            >
              {products.length} Products
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border overflow-hidden cursor-pointer"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
                  onClick={() => setSelectedProduct(p)}
                >
                  <div
                    className="aspect-square overflow-hidden"
                    style={{ backgroundColor: '#0d0d0d' }}
                  >
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl"><span className="flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span></div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold truncate" style={{ color: '#f5f5f5' }}>
                      {p.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#888888' }}>
                      {p.category || 'General'}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-semibold" style={{ color: '#22c55e' }}>
                        ₦{Number(p.price).toLocaleString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p);
                        }}
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

      {/* Product detail modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
        >
          <div
            className="w-full max-w-lg rounded-xl border overflow-hidden"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <div className="aspect-video overflow-hidden" style={{ backgroundColor: '#0d0d0d' }}>
              {selectedProduct.images?.[0] ? (
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl"><span className="flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span></div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#f5f5f5' }}>
                    {selectedProduct.name}
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: '#888888' }}>
                    {selectedProduct.category}
                  </p>
                </div>
                <button onClick={() => setSelectedProduct(null)} style={{ color: '#888888' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: '#aaaaaa' }}>
                {selectedProduct.description || 'No description available.'}
              </p>
              <div className="flex items-center justify-between mt-5">
                <span className="text-2xl font-semibold" style={{ color: '#22c55e' }}>
                  ₦{Number(selectedProduct.price).toLocaleString()}
                </span>
                <span className="text-xs" style={{ color: '#555555' }}>
                  {selectedProduct.stock} in stock
                </span>
              </div>
              <button
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                  setShowCart(true);
                }}
                className="w-full mt-4 py-3 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div
            className="ml-auto h-full w-full max-w-sm flex flex-col border-l"
            style={{ backgroundColor: '#111111', borderColor: '#2a2a2a' }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: '#2a2a2a' }}
            >
              <h2 className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
                Cart ({cartCount})
              </h2>
              <button onClick={() => setShowCart(false)} style={{ color: '#888888' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm" style={{ color: '#555555' }}>
                  Your cart is empty.
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                      style={{ borderColor: '#2a2a2a' }}
                    >
                      <div
                        className="w-12 h-12 rounded-lg overflow-hidden shrink-0"
                        style={{ backgroundColor: '#0d0d0d' }}
                      >
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><span className="flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: '#f5f5f5' }}>
                          {item.product.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#22c55e' }}>
                          ₦{Number(item.product.price).toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-xs shrink-0"
                        style={{ color: '#ef4444' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
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

      {/* Footer */}
      <div className="border-t mt-12 py-6 text-center" style={{ borderColor: '#2a2a2a' }}>
        <p className="text-xs" style={{ color: '#555555' }}>
          Powered by{' '}
          <a href="/" style={{ color: '#22c55e' }}>
            Vendly
          </a>
        </p>
      </div>
    </div>
  );
}

