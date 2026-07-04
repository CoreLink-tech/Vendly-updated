'use client';

import { useEffect, useState } from 'react';

interface SettingDef {
  key: string;
  label: string;
  description: string;
}

const SETTINGS: SettingDef[] = [
  {
    key: 'pay_on_delivery_enabled',
    label: 'Pay on Delivery (platform-wide)',
    description:
      'When off, Pay on Delivery is hidden at checkout on every store, regardless of each vendor\u2019s own setting. Vendor preferences are preserved and take effect again if you turn this back on.',
  },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        setValues((d as { settings: Record<string, boolean> }).settings || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggle = async (key: string, current: boolean) => {
    setError(null);
    setSavingKey(key);
    const next = !current;
    setValues((v) => ({ ...v, [key]: next }));
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: next }),
    });
    if (!res.ok) {
      setValues((v) => ({ ...v, [key]: current })); // revert on failure
      setError('Failed to save. Please try again.');
    }
    setSavingKey(null);
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-1" style={{ color: '#f5f5f5' }}>Platform Settings</h1>
      <p className="text-sm mb-6" style={{ color: '#888888' }}>
        Platform-wide switches. These override individual vendor settings when turned off.
      </p>

      {error && <p className="text-xs mb-4" style={{ color: '#ef4444' }}>{error}</p>}

      {loading ? (
        <p className="text-sm" style={{ color: '#888888' }}>Loading…</p>
      ) : (
        <div className="rounded-xl border divide-y" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          {SETTINGS.map((s) => {
            const on = values[s.key] ?? true;
            return (
              <div key={s.key} className="flex items-center justify-between gap-4 p-5" style={{ borderColor: '#2a2a2a' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#f5f5f5' }}>{s.label}</p>
                  <p className="text-xs mt-1" style={{ color: '#888888' }}>{s.description}</p>
                  {savingKey === s.key && (
                    <p className="text-xs mt-1" style={{ color: '#22c55e' }}>Saving…</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void toggle(s.key, on)}
                  disabled={savingKey === s.key}
                  className="shrink-0 w-11 h-6 rounded-full relative transition-colors disabled:opacity-60"
                  style={{ backgroundColor: on ? '#22c55e' : '#2a2a2a' }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                    style={{ transform: on ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
