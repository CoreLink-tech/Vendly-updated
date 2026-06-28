'use client';

import { useEffect, useState } from 'react';

interface Settings {
  logisticsEnabled: boolean;
  payLaterEnabled: boolean;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export default function VendorSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    logisticsEnabled: false,
    payLaterEnabled: true,
    bankName: '',
    accountNumber: '',
    accountName: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/vendor/settings')
      .then((r) => r.json())
      .then((d) => {
        const data = d as { settings: Settings | null };
        if (data.settings) setSettings(data.settings);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const res = await fetch('/api/vendor/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage({ type: 'error', text: data.error || 'Failed to save' });
    } else {
      setMessage({ type: 'success', text: 'Settings saved!' });
    }
    setSaving(false);
  };

  const Toggle = ({ label, sublabel, value, onChange }: { label: string; sublabel: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: '#2a2a2a' }}>
      <div>
        <p className="text-sm font-medium" style={{ color: '#f5f5f5' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: '#888' }}>{sublabel}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-colors shrink-0"
        style={{ backgroundColor: value ? '#22c55e' : '#2a2a2a' }}
      >
        <span
          className="absolute top-1 w-4 h-4 rounded-full transition-transform"
          style={{ backgroundColor: '#fff', left: value ? '1.25rem' : '0.25rem' }}
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>Store Settings</h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>Manage delivery, payment, and bank details.</p>
      </div>

      {/* Delivery Settings */}
      <div className="rounded-xl border p-6 mb-5" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <h2 className="text-sm font-semibold mb-1" style={{ color: '#f5f5f5' }}>Delivery</h2>
        <p className="text-xs mb-4" style={{ color: '#888' }}>Control how orders are delivered to customers.</p>

        <Toggle
          label="Vendly Logistics"
          sublabel="Use Vendly's logistics network for deliveries. Pricing set per state route."
          value={settings.logisticsEnabled}
          onChange={(v) => setSettings((s) => ({ ...s, logisticsEnabled: v }))}
        />
        <div className="pt-2 pb-1">
          <p className="text-xs" style={{ color: '#555' }}>
            {settings.logisticsEnabled
              ? 'Logistics is on. Delivery fees will be shown to buyers based on their state.'
              : 'Logistics is off. You handle delivery directly with your customers.'}
          </p>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="rounded-xl border p-6 mb-5" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <h2 className="text-sm font-semibold mb-1" style={{ color: '#f5f5f5' }}>Payment Options</h2>
        <p className="text-xs mb-4" style={{ color: '#888' }}>Choose what payment methods buyers can use.</p>

        <Toggle
          label="Pay on Delivery"
          sublabel="Allow buyers to pay when they receive their order."
          value={settings.payLaterEnabled}
          onChange={(v) => setSettings((s) => ({ ...s, payLaterEnabled: v }))}
        />
        <div className="pt-3">
          <p className="text-xs mb-3" style={{ color: '#888' }}>
            Pay Now is always available when you have bank details set below.
          </p>
        </div>
      </div>

      {/* Bank Details */}
      <div className="rounded-xl border p-6 mb-5" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <h2 className="text-sm font-semibold mb-1" style={{ color: '#f5f5f5' }}>Bank Details</h2>
        <p className="text-xs mb-5" style={{ color: '#888' }}>
          Required for Pay Now. Buyers will see this when they choose to pay by transfer.
        </p>

        <div className="space-y-4">
          <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
            Bank Name
            <input
              value={settings.bankName}
              onChange={(e) => setSettings((s) => ({ ...s, bankName: e.target.value }))}
              placeholder="e.g. GTBank, Access Bank, Opay"
              className="rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
            Account Number
            <input
              value={settings.accountNumber}
              onChange={(e) => setSettings((s) => ({ ...s, accountNumber: e.target.value }))}
              placeholder="0123456789"
              maxLength={10}
              className="rounded-lg border px-3 py-2.5 text-sm outline-none font-mono"
              style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
            Account Name
            <input
              value={settings.accountName}
              onChange={(e) => setSettings((s) => ({ ...s, accountName: e.target.value }))}
              placeholder="Full name on account"
              className="rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
            />
          </label>
        </div>
      </div>

      {message && (
        <p className="text-xs mb-4" style={{ color: message.type === 'success' ? '#22c55e' : '#ef4444' }}>
          {message.text}
        </p>
      )}

      <button
        onClick={() => void handleSave()}
        disabled={saving}
        className="w-full py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
      >
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  );
}
