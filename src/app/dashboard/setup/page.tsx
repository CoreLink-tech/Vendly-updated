'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NIGERIAN_STATES } from '@/lib/states';

export default function VendorSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    businessName: '',
    phone: '',
    location: '',
    address: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  useEffect(() => {
    fetch('/api/vendor/profile')
      .then((r) => r.json())
      .then((data) => {
        const v = (data as { vendor: Record<string, string> | null }).vendor;
        if (v && v.businessName && v.phone && v.location && v.address) {
          // Already completed core setup — don't make them do it again.
          router.replace('/dashboard');
          return;
        }
        if (v) {
          setForm((f) => ({
            ...f,
            businessName: v.businessName || '',
            phone: v.phone || '',
            location: v.location || '',
            address: v.address || '',
            bankName: v.bankName || '',
            accountNumber: v.accountNumber || '',
            accountName: v.accountName || '',
          }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.businessName.trim() || !form.phone.trim() || !form.location || !form.address.trim()) {
      setError('Please fill in your business name, phone, state, and address.');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/vendor/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error || 'Something went wrong. Please try again.');
      setSaving(false);
      return;
    }
    router.replace('/dashboard');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0d0d' }}>
        <p className="text-sm" style={{ color: '#888888' }}>Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-4">
          <img src="/logo-full.png" alt="Vendly" className="h-16 w-auto" />
        </div>
        <h1 className="text-xl font-semibold text-center mb-1" style={{ color: '#f5f5f5' }}>
          Set up your store
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: '#888888' }}>
          A couple of quick details before your dashboard is ready.
        </p>

        <form onSubmit={onSubmit} className="space-y-5">
          <div
            className="p-5 rounded-xl border space-y-4"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#22c55e' }}>
              Business details
            </p>
            <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
              Business Name
              <input
                value={form.businessName}
                onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                placeholder="e.g. Tesy Fashion Store"
                className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
              Phone Number
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="e.g. 08012345678"
                className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
              State / Location
              <select
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: form.location ? '#f5f5f5' : '#666666' }}
              >
                <option value="">Select your state</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
              Business Address
              <textarea
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Street, area, city"
                rows={2}
                className="rounded-lg border px-3 py-2.5 text-sm outline-none resize-none"
                style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
              />
            </label>
          </div>

          <div
            className="p-5 rounded-xl border space-y-4"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#22c55e' }}>
                Bank account (optional)
              </p>
              <p className="text-xs mt-1" style={{ color: '#666666' }}>
                Add this now so you don&apos;t forget later. It&apos;s what customers pay into
                when they choose bank transfer at checkout. You can skip this if you only want
                Pay on Delivery, and add it anytime from Store Settings.
              </p>
            </div>
            <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
              Bank Name
              <input
                value={form.bankName}
                onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                placeholder="e.g. GTBank"
                className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
              Account Number
              <input
                value={form.accountNumber}
                onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                placeholder="10-digit account number"
                inputMode="numeric"
                className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
              Account Name
              <input
                value={form.accountName}
                onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
                placeholder="Name on the account"
                className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
              />
            </label>
          </div>

          {error && (
            <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
          >
            {saving ? 'Saving…' : 'Continue to Dashboard'}
          </button>
        </form>
      </div>
    </main>
  );
}
