'use client';

import { useEffect, useState } from 'react';

interface Vendor {
  status: string;
  slug: string;
  businessName: string;
}

interface Subscription {
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
}

function fmtDate(dateStr: string) {
  // Safe: just slice the ISO string — no Date constructor in render
  return dateStr ? dateStr.slice(0, 10) : '';
}

export default function SubscriptionPage() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vendor/profile')
      .then((r) => r.json())
      .then((data) => {
        const d = data as { vendor: Vendor | null; subscription: Subscription | null };
        setVendor(d.vendor);
        setSubscription(d.subscription);
        setPageLoading(false);
      })
      .catch(() => setPageLoading(false));
  }, []);

  const handleActivateCode = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setMessage(null);
    const res = await fetch('/api/vendor/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage({ type: 'error', text: data.error || 'Activation failed' });
    } else {
      setMessage({ type: 'success', text: 'Store activated successfully! Refreshing…' });
      setTimeout(() => window.location.reload(), 1500);
    }
    setLoading(false);
  };

  const handleWhatsApp = (plan: 'monthly' | 'yearly') => {
    const msg = encodeURIComponent(
      `Hi, I'd like to activate my Vendly ${plan} plan (₦${plan === 'monthly' ? '4,000' : '40,000'}). My store slug: ${vendor?.slug || ''}`
    );
    window.open(`https://wa.me/2349168311809?text=${msg}`, '_blank');
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{ borderColor: '#39FF14', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Subscription
        </h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>
          Manage your Vendly plan and activation.
        </p>
      </div>

      {/* Current status */}
      {subscription ? (
        <div
          className="p-6 rounded-xl border mb-6"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#39FF1430' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-sm font-semibold" style={{ color: '#22c55e' }}>
              Active Subscription
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs" style={{ color: '#888888' }}>
                Plan
              </p>
              <p className="text-sm font-semibold capitalize mt-1" style={{ color: '#f5f5f5' }}>
                {subscription.plan}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#888888' }}>
                Status
              </p>
              <p className="text-sm font-semibold capitalize mt-1" style={{ color: '#f5f5f5' }}>
                {subscription.status}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#888888' }}>
                Started
              </p>
              <p className="text-sm font-semibold mt-1" style={{ color: '#f5f5f5' }}>
                {fmtDate(subscription.startDate)}
              </p>
            </div>
            {subscription.endDate && (
              <div>
                <p className="text-xs" style={{ color: '#888888' }}>
                  Renews
                </p>
                <p className="text-sm font-semibold mt-1" style={{ color: '#f5f5f5' }}>
                  {fmtDate(subscription.endDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div
              className="p-6 rounded-xl border"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            >
              <p
                className="text-xs font-medium uppercase tracking-wider mb-3"
                style={{ color: '#888888' }}
              >
                Monthly
              </p>
              <div className="flex items-end gap-1 mb-5">
                <span className="text-3xl font-semibold" style={{ color: '#f5f5f5' }}>
                  ₦4,000
                </span>
                <span className="text-xs mb-1.5" style={{ color: '#888888' }}>
                  /month
                </span>
              </div>
              <ul className="space-y-2 mb-6">
                {[
                  'Full store access',
                  'Unlimited products',
                  'Order management',
                  'Referral system',
                ].map((f) => (
                  <li key={f} className="text-xs flex gap-2" style={{ color: '#aaaaaa' }}>
                    <span style={{ color: '#39FF14' }}>-</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleWhatsApp('monthly')}
                className="w-full py-2.5 rounded-lg text-sm font-semibold border transition-colors"
                style={{ borderColor: '#39FF14', color: '#39FF14' }}
              >
                Activate Now → WhatsApp
              </button>
            </div>

            <div
              className="p-6 rounded-xl border relative"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#39FF14' }}
            >
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full"
                style={{ backgroundColor: '#39FF14', color: '#0d0d0d' }}
              >
                Best Value
              </div>
              <p
                className="text-xs font-medium uppercase tracking-wider mb-3"
                style={{ color: '#888888' }}
              >
                Yearly
              </p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-3xl font-semibold" style={{ color: '#f5f5f5' }}>
                  ₦40,000
                </span>
                <span className="text-xs mb-1.5" style={{ color: '#888888' }}>
                  /year
                </span>
              </div>
              <p className="text-xs mb-5" style={{ color: '#39FF14' }}>
                Save ₦8,000
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  'Full store access',
                  'Unlimited products',
                  'Order management',
                  'Referral system',
                ].map((f) => (
                  <li key={f} className="text-xs flex gap-2" style={{ color: '#aaaaaa' }}>
                    <span style={{ color: '#39FF14' }}>-</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleWhatsApp('yearly')}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#39FF14', color: '#0d0d0d' }}
              >
                Activate Now → WhatsApp
              </button>
            </div>
          </div>

          {/* Code activation */}
          <div
            className="p-6 rounded-xl border"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <h2 className="text-sm font-semibold mb-1" style={{ color: '#f5f5f5' }}>
              Have an activation code?
            </h2>
            <p className="text-xs mb-4" style={{ color: '#888888' }}>
              Enter your code below to instantly activate your store.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VDLY-2026-XXXX"
                className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-mono outline-none"
                style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
              />
              <button
                onClick={() => {
                  void handleActivateCode();
                }}
                disabled={loading || !code.trim()}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#39FF14', color: '#0d0d0d' }}
              >
                {loading ? '…' : 'Activate'}
              </button>
            </div>
            {message && (
              <p
                className="text-xs mt-3"
                style={{ color: message.type === 'success' ? '#22c55e' : '#ef4444' }}
              >
                {message.text}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
