'use client';

import { useEffect, useRef, useState } from 'react';
import useUpload from '@/utils/useUpload';
import { SITE_URL } from '@/lib/site';

// A varied set of accent colors covering the common storefront palette —
// greens, blues, warm tones, purples/pinks, and neutrals — so vendors have
// real choices beyond the default green, plus custom hex/picker entry.
const ACCENT_PRESETS = [
  '#22c55e', '#16a34a', '#0ea5e9', '#2563eb', '#6366f1',
  '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#f59e0b',
  '#eab308', '#14b8a6', '#64748b', '#ffffff',
];

// Background presets: true dark, warm/cool near-blacks, and a couple of
// light options for vendors who want a bright storefront instead.
const BACKGROUND_PRESETS = [
  '#0d0d0d', '#111827', '#18181b', '#1c1917', '#0f172a',
  '#171717', '#292524', '#f5f5f4', '#ffffff', '#fafafa',
];

// Picks readable text (near-black or near-white) against a given hex color,
// mirroring the contrast logic used on the live storefront so this preview
// matches what buyers will actually see.
function getContrastText(hex: string): string {
  const normalized = (hex || '').replace('#', '');
  const full = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized;
  if (!/^[0-9a-f]{6}$/i.test(full)) return '#0d0d0d';
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#0d0d0d' : '#f5f5f5';
}

interface Vendor {
  id: string;
  businessName: string;
  slug: string;
  description: string;
  logo: string;
  location: string;
  phone: string;
  address: string;
  status: string;
  useLogistics: boolean;
  allowPayOnDelivery: boolean;
  bankName: string;
  accountNumber: string;
  accountName: string;
  primaryColor: string;
  backgroundColor: string;
}

export default function StoreSettingsPage() {
  const [form, setForm] = useState({
    businessName: '',
    slug: '',
    description: '',
    logo: '',
    location: '',
    phone: '',
    address: '',
    useLogistics: true,
    allowPayOnDelivery: true,
    bankName: '',
    accountNumber: '',
    accountName: '',
    primaryColor: '#22c55e',
    backgroundColor: '#0d0d0d',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [upload, { loading: uploading }] = useUpload();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/vendor/profile')
      .then((r) => r.json())
      .then((d) => {
        const data = d as { vendor: Vendor | null };
        if (data.vendor) {
          setForm({
            businessName: data.vendor.businessName || '',
            slug: data.vendor.slug || '',
            description: data.vendor.description || '',
            logo: data.vendor.logo || '',
            location: data.vendor.location || '',
            phone: data.vendor.phone || '',
            address: data.vendor.address || '',
            useLogistics: data.vendor.useLogistics ?? true,
            allowPayOnDelivery: data.vendor.allowPayOnDelivery ?? true,
            bankName: data.vendor.bankName || '',
            accountNumber: data.vendor.accountNumber || '',
            accountName: data.vendor.accountName || '',
            primaryColor: data.vendor.primaryColor || '#22c55e',
            backgroundColor: data.vendor.backgroundColor || '#0d0d0d',
          });
        }
      })
      .catch(() => {
        setMessage({ type: 'error', text: 'Failed to load your store settings. Please refresh the page.' });
      });
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload({ file, bucket: 'vendor-logos' } as any);
    if ('error' in result) {
      setMessage({ type: 'error', text: result.error ?? 'Upload failed' });
      return;
    }
    if (!result.url) {
      setMessage({ type: 'error', text: 'Upload failed' });
      return;
    }
    const url: string = result.url;
    setForm((f) => ({ ...f, logo: url }));
  };

  // These two toggles save immediately on click rather than waiting for
  // the main Save button. They flip visually the instant you tap them, so
  // if that didn't also persist, a vendor reasonably assumes it's done and
  // navigates away — which is exactly how "I turned off Pay on Delivery
  // but it still showed on my storefront" happens. Whether a payment
  // method is offered shouldn't depend on remembering a separate save step.
  const [toggleSaving, setToggleSaving] = useState<string | null>(null);
  const saveToggle = async (key: 'useLogistics' | 'allowPayOnDelivery', value: boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
    setToggleSaving(key);
    await fetch('/api/vendor/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value }),
    });
    setToggleSaving(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const res = await fetch('/api/vendor/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage({ type: 'error', text: data.error || 'Failed to save' });
    } else {
      setMessage({ type: 'success', text: 'Store settings saved!' });
    }
    setSaving(false);
  };

  const storeUrl = form.slug ? `${SITE_URL}/store/${form.slug}` : '';

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Store Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>
          Customize your public storefront.
        </p>
      </div>

      {storeUrl && (
        <div
          className="flex items-center gap-3 p-3 rounded-lg border mb-6"
          style={{ backgroundColor: '#111', borderColor: '#2a2a2a' }}
        >
          <span className="text-xs" style={{ color: '#888888' }}>
            Your store:
          </span>
          <a
            href={storeUrl}
            target="_blank"
            className="text-xs font-mono truncate flex-1"
            style={{ color: '#22c55e' }}
          >
            {storeUrl}
          </a>
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs px-2.5 py-1 rounded border font-semibold"
            style={{ borderColor: '#22c55e30', backgroundColor: '#22c55e10', color: '#22c55e' }}
          >
            View Storefront ↗
          </a>
          <button
            onClick={() => {
              if (typeof navigator !== 'undefined') navigator.clipboard.writeText(storeUrl);
            }}
            className="shrink-0 text-xs px-2 py-1 rounded border"
            style={{ borderColor: '#2a2a2a', color: '#888888' }}
          >
            Copy
          </button>
        </div>
      )}

      <div
        className="rounded-xl border p-6 space-y-5"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        {/* Logo */}
        <div>
          <p className="text-xs font-medium mb-3" style={{ color: '#aaaaaa' }}>
            Store Logo
          </p>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl overflow-hidden border flex items-center justify-center"
              style={{ borderColor: '#2a2a2a', backgroundColor: '#0d0d0d' }}
            >
              {form.logo ? (
                <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
              )}
            </div>
            <div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-xs px-4 py-2 rounded-lg border transition-colors"
                style={{ borderColor: '#2a2a2a', color: '#aaaaaa' }}
              >
                {uploading ? 'Uploading…' : 'Upload Logo'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void handleLogoUpload(e);
                }}
              />
              <p className="text-[10px] mt-1" style={{ color: '#555555' }}>
                Automatically compressed and optimised
              </p>
            </div>
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
          Business Name
          <input
            value={form.businessName}
            onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
            className="rounded-lg border px-3 py-2.5 text-sm outline-none"
            style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
          Store URL Slug
          <div
            className="flex items-center gap-0 rounded-lg border overflow-hidden"
            style={{ borderColor: '#2a2a2a' }}
          >
            <span
              className="px-3 py-2.5 text-xs"
              style={{ backgroundColor: '#0d0d0d', color: '#555555' }}
            >
              vendly.com/store/
            </span>
            <input
              value={form.slug}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                }))
              }
              className="flex-1 px-3 py-2.5 text-sm outline-none"
              style={{ backgroundColor: '#0d0d0d', color: '#f5f5f5' }}
              placeholder="your-store-name"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
          Description
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="rounded-lg border px-3 py-2.5 text-sm outline-none resize-none"
            style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
            placeholder="Tell customers about your business…"
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
            Location / City
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
              placeholder="e.g. Lagos"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
            Phone Number
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
              placeholder="e.g. 08012345678"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
          Full Address
          <input
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="rounded-lg border px-3 py-2.5 text-sm outline-none"
            style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
            placeholder="Street address for pickup"
          />
        </label>

        <div className="border-t pt-5" style={{ borderColor: '#2a2a2a' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#f5f5f5' }}>Store Colors</p>
          <p className="text-[11px] mb-3" style={{ color: '#888888' }}>
            Customize the accent color and background of your public storefront. The preview below updates as you type.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
              Accent Color
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg border cursor-pointer"
                  style={{ borderColor: '#2a2a2a', backgroundColor: '#0d0d0d', padding: 2 }}
                />
                <input
                  value={form.primaryColor}
                  onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                  className="flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none font-mono"
                  style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                  placeholder="#22c55e"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {ACCENT_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onClick={() => setForm((f) => ({ ...f, primaryColor: c }))}
                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: form.primaryColor.toLowerCase() === c.toLowerCase() ? '#f5f5f5' : '#2a2a2a',
                    }}
                  />
                ))}
              </div>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
              Background Color
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.backgroundColor}
                  onChange={(e) => setForm((f) => ({ ...f, backgroundColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg border cursor-pointer"
                  style={{ borderColor: '#2a2a2a', backgroundColor: '#0d0d0d', padding: 2 }}
                />
                <input
                  value={form.backgroundColor}
                  onChange={(e) => setForm((f) => ({ ...f, backgroundColor: e.target.value }))}
                  className="flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none font-mono"
                  style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                  placeholder="#0d0d0d"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {BACKGROUND_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onClick={() => setForm((f) => ({ ...f, backgroundColor: c }))}
                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: form.backgroundColor.toLowerCase() === c.toLowerCase() ? '#f5f5f5' : '#2a2a2a',
                    }}
                  />
                ))}
              </div>
            </label>
          </div>

          {/* Live storefront preview — mirrors the actual public store layout so
              vendors can see the real effect of their color choices, not just a swatch. */}
          <div className="mt-4">
            <p className="text-[11px] font-medium mb-2" style={{ color: '#888888' }}>Live Preview</p>
            <div
              className="rounded-xl border overflow-hidden"
              style={{ backgroundColor: form.backgroundColor, borderColor: '#2a2a2a' }}
            >
              {/* mock header */}
              <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: '#ffffff15' }}>
                <div
                  className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border"
                  style={{ borderColor: '#ffffff15', backgroundColor: '#00000020' }}
                >
                  {form.logo ? (
                    <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span style={{ color: getContrastText(form.backgroundColor) + '80' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: getContrastText(form.backgroundColor) }}>
                    {form.businessName || 'Your Store'}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: getContrastText(form.backgroundColor) + '99' }}>
                    {form.description || 'Welcome to our store!'}
                  </p>
                </div>
                <span
                  className="shrink-0 text-[11px] px-3 py-1.5 rounded-lg font-semibold"
                  style={{ backgroundColor: form.primaryColor, color: getContrastText(form.primaryColor) }}
                >
                  Cart
                </span>
              </div>

              {/* mock product card */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3 max-w-xs">
                  {[1, 2].map((i) => (
                    <div key={i} className="rounded-lg border overflow-hidden" style={{ borderColor: '#ffffff15', backgroundColor: '#00000020' }}>
                      <div className="aspect-square" style={{ backgroundColor: '#00000030' }} />
                      <div className="p-2">
                        <p className="text-[11px] font-medium truncate" style={{ color: getContrastText(form.backgroundColor) }}>
                          Sample Product
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[11px] font-semibold" style={{ color: form.primaryColor }}>₦{i}0,000</span>
                          <span
                            className="text-[10px] px-2 py-1 rounded font-semibold"
                            style={{ backgroundColor: form.primaryColor + '20', color: form.primaryColor }}
                          >
                            Add
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-5" style={{ borderColor: '#2a2a2a' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: '#f5f5f5' }}>Delivery &amp; Payment</p>

          <div className="flex items-center justify-between gap-4 py-2.5">
            <div>
              <p className="text-xs font-medium" style={{ color: '#f5f5f5' }}>Use Vendly Logistics</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#888888' }}>
                Off if you handle your own pickup/delivery — your orders won&apos;t go to the logistics dashboard.
                {toggleSaving === 'useLogistics' && ' Saving…'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void saveToggle('useLogistics', !form.useLogistics)}
              disabled={toggleSaving === 'useLogistics'}
              className="shrink-0 w-11 h-6 rounded-full relative transition-colors disabled:opacity-60"
              style={{ backgroundColor: form.useLogistics ? '#22c55e' : '#2a2a2a' }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                style={{ transform: form.useLogistics ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 py-2.5">
            <div>
              <p className="text-xs font-medium" style={{ color: '#f5f5f5' }}>Allow Pay on Delivery</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#888888' }}>
                Off to require payment upfront only — buyers will only see &quot;Pay Now&quot;.
                {toggleSaving === 'allowPayOnDelivery' && ' Saving…'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void saveToggle('allowPayOnDelivery', !form.allowPayOnDelivery)}
              disabled={toggleSaving === 'allowPayOnDelivery'}
              className="shrink-0 w-11 h-6 rounded-full relative transition-colors disabled:opacity-60"
              style={{ backgroundColor: form.allowPayOnDelivery ? '#22c55e' : '#2a2a2a' }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                style={{ transform: form.allowPayOnDelivery ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
          </div>
        </div>

        <div className="border-t pt-5" style={{ borderColor: '#2a2a2a' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#f5f5f5' }}>Bank Account (for Pay Now)</p>
          <p className="text-[11px] mb-3" style={{ color: '#888888' }}>
            Shown to buyers who choose &quot;Pay Now&quot; so they can transfer directly to you. Required for Pay Now to appear at checkout.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
              Bank Name
              <input
                value={form.bankName}
                onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                placeholder="e.g. GTBank"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
              Account Number
              <input
                value={form.accountNumber}
                onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value.replace(/[^0-9]/g, '') }))}
                className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                placeholder="0123456789"
                maxLength={10}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-xs font-medium mt-4" style={{ color: '#aaaaaa' }}>
            Account Name
            <input
              value={form.accountName}
              onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
              className="rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
              placeholder="Name on the account"
            />
          </label>
        </div>

        {message && (
          <p
            className="text-xs"
            style={{ color: message.type === 'success' ? '#22c55e' : '#ef4444' }}
          >
            {message.text}
          </p>
        )}

        <button
          onClick={() => {
            void handleSave();
          }}
          disabled={saving}
          className="w-full py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>

        {/* Danger zone */}
        <DeleteAccountSection />
      </div>
    </div>
  );
}

function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirm !== 'DELETE MY ACCOUNT') { setError('Type DELETE MY ACCOUNT exactly to confirm'); return; }
    setDeleting(true); setError(null);
    const res = await fetch('/api/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm }),
    });
    const d = (await res.json()) as { error?: string; warning?: string };
    if (!res.ok) { setError(d.error || 'Failed to delete account'); setDeleting(false); return; }
    if (d.warning) alert(d.warning);
    window.location.href = '/';
  };

  return (
    <div className="border-t pt-6 mt-2" style={{ borderColor: '#2a2a2a' }}>
      <p className="text-xs font-semibold mb-1" style={{ color: '#ef4444' }}>Danger Zone</p>
      <p className="text-xs mb-3" style={{ color: '#888888' }}>
        Permanently deletes your account, all products, orders, and data. This cannot be undone.
      </p>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-xs font-semibold px-4 py-2 rounded-lg border"
          style={{ borderColor: '#ef4444', color: '#ef4444' }}
        >
          Delete My Account
        </button>
      ) : (
        <div className="space-y-3 p-4 rounded-xl border" style={{ borderColor: '#ef444430', backgroundColor: '#1a0000' }}>
          <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>
            This will permanently delete your store, all products, orders, and your login. Type{' '}
            <span className="font-mono">DELETE MY ACCOUNT</span> to confirm.
          </p>
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE MY ACCOUNT"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none font-mono"
            style={{ backgroundColor: '#0d0d0d', borderColor: '#ef444460', color: '#f5f5f5' }}
          />
          {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => void handleDelete()}
              disabled={deleting || confirm !== 'DELETE MY ACCOUNT'}
              className="flex-1 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
              style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
            >
              {deleting ? 'Deleting…' : 'Permanently Delete'}
            </button>
            <button onClick={() => { setOpen(false); setConfirm(''); setError(null); }}
              className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: '#2a2a2a', color: '#888888' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
