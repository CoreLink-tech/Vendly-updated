'use client';

import { useEffect, useRef, useState } from 'react';
import useUpload from '@/utils/useUpload';

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
          });
        }
      });
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload({ file });
    if ('error' in result) {
      setMessage({ type: 'error', text: result.error ?? 'Upload failed' });
      return;
    }
    if (!result.url) {
      setMessage({ type: 'error', text: 'Upload failed' });
      return;
    }
    setForm((f) => ({ ...f, logo: result.url }));
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

  const storeUrl = form.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/store/${form.slug}`
    : '';

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
            href={`/store/${form.slug}`}
            target="_blank"
            className="text-xs font-mono truncate"
            style={{ color: '#22c55e' }}
          >
            {storeUrl}
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
      </div>
    </div>
  );
}
