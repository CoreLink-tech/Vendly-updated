'use client';

import { useEffect, useState } from 'react';

interface AmbassadorData {
  status: string | null; // null = not applied, 'pending', 'approved', 'declined'
  ambassadorCode?: string;
  referredVendors?: number;
  activeSubscriptions?: number;
  recurringCommission?: number;
  withdrawableBalance?: number;
}

function fmtDate(str: string) {
  return str ? str.slice(0, 10) : '';
}

export default function AmbassadorPage() {
  const [data, setData] = useState<AmbassadorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    reason: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/vendor/ambassador')
      .then((r) => r.json())
      .then((d) => {
        setData(d as AmbassadorData);
        setLoading(false);
      })
      .catch(() => {
        setData({ status: null });
        setLoading(false);
      });
  }, []);

  const handleApply = async () => {
    const { fullName, email, phone, businessName, reason } = form;
    if (!fullName || !email || !phone || !businessName || !reason) {
      setMsg({ type: 'error', text: 'All fields required' });
      return;
    }
    setSaving(true);
    setMsg(null);
    const res = await fetch('/api/vendor/ambassador', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const d = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMsg({ type: 'error', text: d.error || 'Failed to submit' });
    } else {
      setMsg({ type: 'success', text: "Application submitted! We'll review and notify you." });
      setData({ status: 'pending' });
    }
    setSaving(false);
  };

  const ambassadorLink = data?.ambassadorCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/account/signup?amb=${data.ambassadorCode}`
    : '';

  const copyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(ambassadorLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Ambassador
        </h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>
          Earn recurring monthly commissions by bringing vendors to Vendly.
        </p>
      </div>

      {data?.status === 'approved' ? (
        <>
          {/* Ambassador portal */}
          <div
            className="p-6 rounded-xl border mb-6"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#22c55e30' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e' }} />
              <span className="text-sm font-semibold" style={{ color: '#22c55e' }}>
                Active Ambassador
              </span>
            </div>
            <p className="text-xs font-medium mb-2" style={{ color: '#aaaaaa' }}>
              Your Ambassador Link
            </p>
            <div className="flex items-center gap-3">
              <code
                className="flex-1 text-xs font-mono truncate px-3 py-2 rounded-lg"
                style={{ backgroundColor: '#0d0d0d', color: '#22c55e' }}
              >
                {ambassadorLink}
              </code>
              <button
                onClick={copyLink}
                className="shrink-0 text-xs px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: copied ? '#22c55e' : '#22c55e20',
                  color: copied ? '#0d0d0d' : '#22c55e',
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Referred Vendors', value: data.referredVendors ?? 0 },
              { label: 'Active Subscriptions', value: data.activeSubscriptions ?? 0 },
              {
                label: 'Recurring/month',
                value: `₦${Number(data.recurringCommission ?? 0).toLocaleString()}`,
              },
              {
                label: 'Withdrawable',
                value: `₦${Number(data.withdrawableBalance ?? 0).toLocaleString()}`,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="p-4 rounded-xl border"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
              >
                <p className="text-xs mb-1" style={{ color: '#888888' }}>
                  {s.label}
                </p>
                <p className="text-xl font-semibold" style={{ color: '#f5f5f5' }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          <div
            className="p-4 rounded-xl border"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: '#aaaaaa' }}>
              How It Works
            </p>
            <ul className="space-y-1.5">
              {[
                'Vendor signs up via your ambassador link',
                'Vendor activates a subscription',
                'You earn ₦1,000/month (monthly) or ₦10,000 recurring (yearly) for every renewal',
              ].map((s) => (
                <li key={s} className="text-xs flex gap-2" style={{ color: '#888888' }}>
                  <span style={{ color: '#22c55e' }}>-</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : data?.status === 'pending' ? (
        <div
          className="p-6 rounded-xl border"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#f59e0b30' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
            <span className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
              Application Under Review
            </span>
          </div>
          <p className="text-sm" style={{ color: '#888888' }}>
            Your ambassador application has been submitted and is under review. We&apos;ll notify
            you once approved.
          </p>
        </div>
      ) : data?.status === 'declined' ? (
        <div
          className="p-6 rounded-xl border mb-6"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#ef444430' }}
        >
          <p className="text-sm" style={{ color: '#ef4444' }}>
            Your application was not approved. You may re-apply below.
          </p>
        </div>
      ) : (
        <>
          {/* Ambassador program info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Monthly commission', value: '₦1,000', sub: 'per active vendor/month' },
              { label: 'Yearly commission', value: '₦10,000', sub: 'per renewal/year' },
              { label: 'Recurring', value: 'Forever', sub: 'earn on every renewal' },
            ].map((s) => (
              <div
                key={s.label}
                className="p-4 rounded-xl border text-center"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
              >
                <p className="text-xs mb-2" style={{ color: '#888888' }}>
                  {s.label}
                </p>
                <p className="text-2xl font-semibold" style={{ color: '#22c55e' }}>
                  {s.value}
                </p>
                <p className="text-[10px] mt-1" style={{ color: '#555555' }}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Application form */}
          <div
            className="rounded-xl border p-6"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <h2 className="text-base font-semibold mb-1" style={{ color: '#f5f5f5' }}>
              Become An Ambassador
            </h2>
            <p className="text-xs mb-5" style={{ color: '#888888' }}>
              Tell us about yourself. Our team reviews all applications.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className="flex flex-col gap-1.5 text-xs font-medium"
                  style={{ color: '#aaaaaa' }}
                >
                  Full Name
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                    style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                  />
                </label>
                <label
                  className="flex flex-col gap-1.5 text-xs font-medium"
                  style={{ color: '#aaaaaa' }}
                >
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                    style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                  />
                </label>
                <label
                  className="flex flex-col gap-1.5 text-xs font-medium"
                  style={{ color: '#aaaaaa' }}
                >
                  Phone
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                    style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                  />
                </label>
                <label
                  className="flex flex-col gap-1.5 text-xs font-medium"
                  style={{ color: '#aaaaaa' }}
                >
                  Business Name
                  <input
                    value={form.businessName}
                    onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                    className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                    style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                  />
                </label>
              </div>
              <label
                className="flex flex-col gap-1.5 text-xs font-medium"
                style={{ color: '#aaaaaa' }}
              >
                Why do you want to be an ambassador?
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  rows={4}
                  className="rounded-lg border px-3 py-2.5 text-sm outline-none resize-none"
                  style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                />
              </label>
              {msg && (
                <p
                  className="text-xs"
                  style={{ color: msg.type === 'success' ? '#22c55e' : '#ef4444' }}
                >
                  {msg.text}
                </p>
              )}
              <button
                onClick={() => {
                  void handleApply();
                }}
                disabled={saving}
                className="w-full py-3 rounded-lg text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
              >
                {saving ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
