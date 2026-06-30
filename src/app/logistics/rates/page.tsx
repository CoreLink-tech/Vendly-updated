'use client';

import { useEffect, useState } from 'react';

interface Rate {
  id: string;
  state: string;
  price: number;
}

export default function LogisticsRatesPage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/logistics/rates')
      .then((r) => r.json())
      .then((d) => {
        setRates((d as { rates: Rate[] }).rates || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (state: string, value: string) => {
    setEdited((e) => ({ ...e, [state]: value }));
    setSaved(false);
  };

  const handleSaveAll = async () => {
    const updates = rates.map((r) => ({
      state: r.state,
      price: edited[r.state] !== undefined ? Number(edited[r.state]) || 0 : Number(r.price),
    }));
    setSaving(true);
    const res = await fetch('/api/logistics/rates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rates: updates }),
    });
    if (res.ok) {
      const d = (await res.json()) as { rates: Rate[] };
      setRates(d.rates || []);
      setEdited({});
      setSaved(true);
    }
    setSaving(false);
  };

  const hasChanges = Object.keys(edited).length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>Delivery Rates</h1>
          <p className="text-sm mt-1" style={{ color: '#888888' }}>
            Set the delivery price per state. This is what gets added to a buyer&apos;s order
            at checkout for vendors using Vendly Logistics.
          </p>
        </div>
        <button
          onClick={() => { void handleSaveAll(); }}
          disabled={!hasChanges || saving}
          className="text-sm font-semibold px-5 py-2.5 rounded-lg disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: '#22c55e15', color: '#22c55e' }}>
          Rates saved.
        </div>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#111111', borderColor: '#2a2a2a' }}>
        <div className="grid grid-cols-2 divide-x" style={{ borderColor: '#2a2a2a' }}>
          {[0, 1].map((col) => (
            <div key={col} className="divide-y" style={{ borderColor: '#2a2a2a' }}>
              {rates
                .filter((_, i) => i % 2 === col)
                .map((r) => (
                  <div key={r.state} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="text-sm" style={{ color: '#f5f5f5' }}>{r.state}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs" style={{ color: '#555555' }}>₦</span>
                      <input
                        type="number"
                        min={0}
                        value={edited[r.state] !== undefined ? edited[r.state] : String(r.price)}
                        onChange={(e) => handleChange(r.state, e.target.value)}
                        className="w-24 rounded-lg border px-2 py-1.5 text-sm text-right outline-none"
                        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
