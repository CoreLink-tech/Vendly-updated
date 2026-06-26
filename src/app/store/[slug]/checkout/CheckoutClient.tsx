'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CartItem {
  product: { id: string; name: string; price: number; images: string[] };
  quantity: number;
}

interface Vendor {
  id: string;
  businessName: string;
  location: string;
}

export default function CheckoutClient({ slug }: { slug: string }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerLocation: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'full_payment' | 'payment_on_delivery'>(
    'full_payment'
  );
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState<{ orderNumber: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load cart from sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem(`cart_${slug}`);
      if (stored) setCart(JSON.parse(stored) as CartItem[]);
    }
    // Load vendor
    fetch(`/api/store/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        const data = d as { vendor: Vendor };
        setVendor(data.vendor);
      });
  }, [slug]);

  const subtotal = cart.reduce((sum, c) => sum + Number(c.product.price) * c.quantity, 0);

  const handlePlaceOrder = async () => {
    const { customerName, customerPhone, customerAddress, customerLocation } = form;
    if (!customerName || !customerPhone || !customerAddress || !customerLocation) {
      setError('Please fill in all fields');
      return;
    }
    if (!cart.length || !vendor) {
      setError('Your cart is empty');
      return;
    }

    setPlacing(true);
    setError(null);
    const items = cart.map((c) => ({ productId: c.product.id, quantity: c.quantity }));
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId: vendor.id, ...form, paymentMethod, items }),
    });
    const data = (await res.json()) as { orderNumber?: string; error?: string };
    if (!res.ok) {
      setError(data.error || 'Failed to place order');
      setPlacing(false);
      return;
    }
    // Clear cart
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(`cart_${slug}`);
    setSuccess({ orderNumber: data.orderNumber || '' });
    setPlacing(false);
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ backgroundColor: '#0d0d0d' }}
      >
        <div className="w-full max-w-md text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl"
            style={{ backgroundColor: '#22c55e20' }}
          ><span className="flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></span></div>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: '#f5f5f5' }}>
            Order Placed!
          </h1>
          <p className="text-sm mb-1" style={{ color: '#888888' }}>
            Your order number is:
          </p>
          <code className="text-lg font-mono font-bold" style={{ color: '#22c55e' }}>
            {success.orderNumber}
          </code>
          <p className="text-sm mt-4 leading-relaxed" style={{ color: '#888888' }}>
            {vendor?.businessName} has received your order. Keep your order number safe for
            tracking.
          </p>
          <Link
            href={`/store/${slug}`}
            className="inline-block mt-6 text-sm font-semibold px-6 py-2.5 rounded-lg"
            style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#0d0d0d', fontFamily: 'Inter, sans-serif' }}
    >
      {/* Header */}
      <div
        className="px-4 py-5 border-b"
        style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href={`/store/${slug}`} className="text-sm" style={{ color: '#888888' }}>
            ← Back
          </Link>
          <h1 className="text-base font-semibold" style={{ color: '#f5f5f5' }}>
            Checkout
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form */}
        <div>
          <h2 className="text-sm font-semibold mb-5" style={{ color: '#f5f5f5' }}>
            Delivery Information
          </h2>
          <div className="space-y-4">
            <label
              className="flex flex-col gap-1.5 text-xs font-medium"
              style={{ color: '#aaaaaa' }}
            >
              Full Name
              <input
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                className="rounded-lg border px-3 py-3 text-sm outline-none"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                placeholder="Your full name"
              />
            </label>
            <label
              className="flex flex-col gap-1.5 text-xs font-medium"
              style={{ color: '#aaaaaa' }}
            >
              Phone Number
              <input
                value={form.customerPhone}
                onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                className="rounded-lg border px-3 py-3 text-sm outline-none"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                placeholder="08012345678"
              />
            </label>
            <label
              className="flex flex-col gap-1.5 text-xs font-medium"
              style={{ color: '#aaaaaa' }}
            >
              Location / City
              <input
                value={form.customerLocation}
                onChange={(e) => setForm((f) => ({ ...f, customerLocation: e.target.value }))}
                className="rounded-lg border px-3 py-3 text-sm outline-none"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                placeholder="e.g. Lagos"
              />
            </label>
            <label
              className="flex flex-col gap-1.5 text-xs font-medium"
              style={{ color: '#aaaaaa' }}
            >
              Delivery Address
              <textarea
                value={form.customerAddress}
                onChange={(e) => setForm((f) => ({ ...f, customerAddress: e.target.value }))}
                rows={3}
                className="rounded-lg border px-3 py-3 text-sm outline-none resize-none"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                placeholder="Street, area, state"
              />
            </label>

            <div>
              <p className="text-xs font-medium mb-2" style={{ color: '#aaaaaa' }}>
                Payment Method
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: 'full_payment' as const, l: 'Full Payment', s: 'Pay before delivery' },
                  {
                    v: 'payment_on_delivery' as const,
                    l: 'Pay on Delivery',
                    s: 'Pay when received',
                  },
                ].map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => setPaymentMethod(opt.v)}
                    className="p-3 rounded-lg border text-left transition-colors"
                    style={{
                      borderColor: paymentMethod === opt.v ? '#22c55e' : '#2a2a2a',
                      backgroundColor: paymentMethod === opt.v ? '#22c55e10' : '#1a1a1a',
                    }}
                  >
                    <p
                      className="text-xs font-semibold"
                      style={{ color: paymentMethod === opt.v ? '#22c55e' : '#f5f5f5' }}
                    >
                      {opt.l}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#888888' }}>
                      {opt.s}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div>
          <h2 className="text-sm font-semibold mb-5" style={{ color: '#f5f5f5' }}>
            Order Summary
          </h2>
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            {cart.length === 0 ? (
              <p className="text-sm text-center" style={{ color: '#555555' }}>
                Cart is empty.{' '}
                <Link href={`/store/${slug}`} style={{ color: '#22c55e' }}>
                  Go back to store
                </Link>
              </p>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                        style={{ backgroundColor: '#0d0d0d' }}
                      >
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm"><span className="flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: '#f5f5f5' }}>
                          {item.product.name}
                        </p>
                        <p className="text-xs" style={{ color: '#888888' }}>
                          × {item.quantity}
                        </p>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: '#f5f5f5' }}>
                        ₦{(Number(item.product.price) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4" style={{ borderColor: '#2a2a2a' }}>
                  <div className="flex justify-between text-sm font-semibold">
                    <span style={{ color: '#f5f5f5' }}>Subtotal</span>
                    <span style={{ color: '#22c55e' }}>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#555555' }}>
                    Delivery fee will be agreed with vendor
                  </p>
                </div>
              </>
            )}
          </div>

          {error && (
            <p className="text-xs mt-3" style={{ color: '#ef4444' }}>
              {error}
            </p>
          )}

          <button
            onClick={() => {
              void handlePlaceOrder();
            }}
            disabled={placing || !cart.length}
            className="w-full mt-5 py-3.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
          >
            {placing ? 'Placing Order…' : 'Place Order'}
          </button>

          <p className="text-xs text-center mt-3" style={{ color: '#555555' }}>
            No account required. Your order goes directly to {vendor?.businessName || 'the vendor'}.
          </p>
        </div>
      </div>
    </div>
  );
}
