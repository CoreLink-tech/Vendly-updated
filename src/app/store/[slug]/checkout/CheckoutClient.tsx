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
  useLogistics: boolean;
  allowPayOnDelivery: boolean;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT (Abuja)','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
];

export default function CheckoutClient({ slug }: { slug: string }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerLocation: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'full_payment' | 'payment_on_delivery'>('payment_on_delivery');
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState<{ orderNumber: string; orderId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loadingFee, setLoadingFee] = useState(false);

  // Pay Now flow states
  const [showPayNowModal, setShowPayNowModal] = useState(false);
  const [payerBankName, setPayerBankName] = useState('');
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem(`cart_${slug}`);
      if (stored) setCart(JSON.parse(stored) as CartItem[]);
    }
    fetch(`/api/store/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        const data = d as { vendor: Vendor };
        setVendor(data.vendor);
        // default payment method based on vendor settings
        if (data.vendor.allowPayOnDelivery) {
          setPaymentMethod('payment_on_delivery');
        } else {
          setPaymentMethod('full_payment');
        }
      });
  }, [slug]);

  const subtotal = cart.reduce((sum, c) => sum + Number(c.product.price) * c.quantity, 0);
  const grandTotal = subtotal + deliveryFee;

  // Fetch logistics fee when state changes and vendor has logistics enabled
  useEffect(() => {
    if (!vendor?.useLogistics || !form.customerLocation) {
      setDeliveryFee(0);
      return;
    }
    setLoadingFee(true);
    fetch('/api/logistics/rates')
      .then((r) => r.json())
      .then((d) => {
        const data = d as { rates?: { state: string; price: number }[] };
        const match = (data.rates || []).find((r) => r.state === form.customerLocation);
        setDeliveryFee(match ? Number(match.price) : 0);
        setLoadingFee(false);
      })
      .catch(() => { setDeliveryFee(0); setLoadingFee(false); });
  }, [form.customerLocation, vendor]);

  // Step 1: place order (creates it in DB with pending payment status)
  const handlePlaceOrder = async () => {
    const { customerName, customerPhone, customerAddress, customerLocation } = form;
    if (!customerName || !customerPhone || !customerAddress || !customerLocation) {
      setError('Please fill in all fields');
      return;
    }
    if (!cart.length || !vendor) { setError('Your cart is empty'); return; }

    setPlacing(true);
    setError(null);
    const items = cart.map((c) => ({ productId: c.product.id, quantity: c.quantity }));
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId: vendor.id, ...form, paymentMethod, items, deliveryFee }),
    });
    const data = (await res.json()) as { orderNumber?: string; order?: { id: string }; error?: string };
    if (!res.ok) { setError(data.error || 'Failed to place order'); setPlacing(false); return; }

    if (paymentMethod === 'full_payment') {
      // Show pay now modal with vendor bank details
      setPendingOrderId(data.order?.id || '');
      setPendingOrderNumber(data.orderNumber || '');
      setShowPayNowModal(true);
      setPlacing(false);
    } else {
      // Pay on delivery — done
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(`cart_${slug}`);
      setSuccess({ orderNumber: data.orderNumber || '', orderId: data.order?.id || '' });
      setPlacing(false);
    }
  };

  // Step 2: buyer clicks "I Have Paid" and enters their bank name
  const handleConfirmPayment = async () => {
    if (!payerBankName.trim()) return;
    setConfirmingPayment(true);
    const res = await fetch('/api/orders/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: pendingOrderId, payerBankName: payerBankName.trim() }),
    });
    const data = (await res.json()) as { orderNumber?: string; error?: string };
    if (!res.ok) {
      setError(data.error || 'Failed to confirm payment');
      setConfirmingPayment(false);
      setShowPayNowModal(false);
      return;
    }
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(`cart_${slug}`);
    setShowPayNowModal(false);
    setSuccess({ orderNumber: pendingOrderNumber || data.orderNumber || '', orderId: pendingOrderId || '' });
    setConfirmingPayment(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#0d0d0d' }}>
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#22c55e20' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" style={{ color: '#22c55e' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: '#f5f5f5' }}>Order Confirmed!</h1>
          <p className="text-sm mb-1" style={{ color: '#888888' }}>Your Order ID is:</p>
          <code className="text-xl font-mono font-bold" style={{ color: '#22c55e' }}>{success.orderNumber}</code>
          <p className="text-xs mt-3 px-4 leading-relaxed" style={{ color: '#555' }}>
            Save this ID — you can use it to track your order from the store page.
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
    <div className="min-h-screen" style={{ backgroundColor: '#0d0d0d', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="px-4 py-5 border-b" style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}>
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href={`/store/${slug}`} className="text-sm" style={{ color: '#888888' }}>← Back</Link>
          <h1 className="text-base font-semibold" style={{ color: '#f5f5f5' }}>Checkout</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form */}
        <div>
          <h2 className="text-sm font-semibold mb-5" style={{ color: '#f5f5f5' }}>Delivery Information</h2>
          <div className="space-y-4">
            <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
              Full Name
              <input
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                className="rounded-lg border px-3 py-3 text-sm outline-none"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                placeholder="Your full name"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
              Phone Number
              <input
                value={form.customerPhone}
                onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                className="rounded-lg border px-3 py-3 text-sm outline-none"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                placeholder="08012345678"
              />
            </label>

            {/* State dropdown — used to calculate logistics fee */}
            <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
              State / Location
              <select
                value={form.customerLocation}
                onChange={(e) => setForm((f) => ({ ...f, customerLocation: e.target.value }))}
                className="rounded-lg border px-3 py-3 text-sm outline-none"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: form.customerLocation ? '#f5f5f5' : '#555' }}
              >
                <option value="">Select your state</option>
                {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
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

            {/* Payment method — only show full_payment if vendor has bank details; only show pay_on_delivery if vendor enabled it */}
            {vendor && (
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: '#aaaaaa' }}>Payment Method</p>
                <div className="grid grid-cols-2 gap-3">
                  {vendor.allowPayOnDelivery && (
                    <button
                      onClick={() => setPaymentMethod('payment_on_delivery')}
                      className="p-3 rounded-lg border text-left transition-colors"
                      style={{
                        borderColor: paymentMethod === 'payment_on_delivery' ? '#22c55e' : '#2a2a2a',
                        backgroundColor: paymentMethod === 'payment_on_delivery' ? '#22c55e10' : '#1a1a1a',
                      }}
                    >
                      <p className="text-xs font-semibold" style={{ color: paymentMethod === 'payment_on_delivery' ? '#22c55e' : '#f5f5f5' }}>Pay on Delivery</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#888888' }}>Pay when received</p>
                    </button>
                  )}
                  {vendor.bankName && vendor.accountNumber && (
                    <button
                      onClick={() => setPaymentMethod('full_payment')}
                      className="p-3 rounded-lg border text-left transition-colors"
                      style={{
                        borderColor: paymentMethod === 'full_payment' ? '#22c55e' : '#2a2a2a',
                        backgroundColor: paymentMethod === 'full_payment' ? '#22c55e10' : '#1a1a1a',
                      }}
                    >
                      <p className="text-xs font-semibold" style={{ color: paymentMethod === 'full_payment' ? '#22c55e' : '#f5f5f5' }}>Pay Now</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#888888' }}>Bank transfer</p>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div>
          <h2 className="text-sm font-semibold mb-5" style={{ color: '#f5f5f5' }}>Order Summary</h2>
          <div className="rounded-xl border p-5" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
            {cart.length === 0 ? (
              <p className="text-sm text-center" style={{ color: '#555555' }}>
                Cart is empty.{' '}
                <Link href={`/store/${slug}`} style={{ color: '#22c55e' }}>Go back to store</Link>
              </p>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: '#0d0d0d' }}>
                        {item.product.images?.[0] ? (
                          <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#333' }}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: '#f5f5f5' }}>{item.product.name}</p>
                        <p className="text-xs" style={{ color: '#888888' }}>× {item.quantity}</p>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: '#f5f5f5' }}>
                        ₦{(Number(item.product.price) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2" style={{ borderColor: '#2a2a2a' }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#aaaaaa' }}>Subtotal</span>
                    <span style={{ color: '#f5f5f5' }}>₦{subtotal.toLocaleString()}</span>
                  </div>
                  {vendor?.useLogistics && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#aaaaaa' }}>Delivery Fee</span>
                      <span style={{ color: loadingFee ? '#555' : '#f5f5f5' }}>
                        {loadingFee ? 'Calculating…' : deliveryFee > 0 ? `₦${deliveryFee.toLocaleString()}` : form.customerLocation ? 'Free / Not set' : '—'}
                      </span>
                    </div>
                  )}
                  {!vendor?.useLogistics && (
                    <p className="text-xs" style={{ color: '#555' }}>Delivery arranged directly with vendor</p>
                  )}
                  <div className="flex justify-between text-sm font-semibold pt-1 border-t" style={{ borderColor: '#2a2a2a' }}>
                    <span style={{ color: '#f5f5f5' }}>Total</span>
                    <span style={{ color: '#22c55e' }}>₦{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {error && <p className="text-xs mt-3" style={{ color: '#ef4444' }}>{error}</p>}

          <button
            onClick={() => void handlePlaceOrder()}
            disabled={placing || !cart.length}
            className="w-full mt-5 py-3.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
          >
            {placing ? 'Placing Order…' : paymentMethod === 'full_payment' ? 'Place Order & Pay Now' : 'Place Order'}
          </button>

          <p className="text-xs text-center mt-3" style={{ color: '#555555' }}>
            No account required. Your order goes directly to {vendor?.businessName || 'the vendor'}.
          </p>
        </div>
      </div>

      {/* Pay Now modal */}
      {showPayNowModal && vendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <div className="w-full max-w-md rounded-xl border p-6" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <h2 className="text-base font-semibold mb-1" style={{ color: '#f5f5f5' }}>Complete Your Payment</h2>
            <p className="text-xs mb-5" style={{ color: '#888' }}>Transfer the exact amount to the account below, then confirm below.</p>

            <div className="rounded-lg border p-4 mb-5 space-y-3" style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a' }}>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: '#888' }}>Bank</span>
                <span className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>{vendor.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: '#888' }}>Account Number</span>
                <span className="text-sm font-mono font-bold" style={{ color: '#22c55e' }}>{vendor.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: '#888' }}>Account Name</span>
                <span className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>{vendor.accountName}</span>
              </div>
              <div className="flex justify-between border-t pt-3" style={{ borderColor: '#2a2a2a' }}>
                <span className="text-xs" style={{ color: '#888' }}>Amount to Pay</span>
                <span className="text-base font-bold" style={{ color: '#22c55e' }}>₦{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <label className="flex flex-col gap-1.5 text-xs font-medium mb-4" style={{ color: '#aaaaaa' }}>
              Your Bank Name (for receipt)
              <input
                value={payerBankName}
                onChange={(e) => setPayerBankName(e.target.value)}
                placeholder="e.g. Opay, GTBank, Access Bank…"
                className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
              />
              <span style={{ color: '#555' }}>This will appear on your order receipt</span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowPayNowModal(false); setPendingOrderId(null); setPendingOrderNumber(null); }}
                className="flex-1 py-3 rounded-lg text-sm font-semibold border"
                style={{ borderColor: '#2a2a2a', color: '#888888', backgroundColor: 'transparent' }}
              >
                Cancel
              </button>
              <button
                onClick={() => void handleConfirmPayment()}
                disabled={!payerBankName.trim() || confirmingPayment}
                className="flex-1 py-3 rounded-lg text-sm font-semibold disabled:opacity-50"
                style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
              >
                {confirmingPayment ? 'Confirming…' : 'I Have Paid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
