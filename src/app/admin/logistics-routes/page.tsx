'use client';

import { useEffect, useState } from 'react';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
];

interface Route {
  id: string;
  fromState: string;
  toState: string;
  price: number;
  updatedAt: string;
}

export default function LogisticsRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ fromState: '', toState: '', price: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [search, setSearch] = useState('');

  const loadRoutes = () => {
    fetch('/api/admin/logistics-routes')
      .then((r) => r.json())
      .then((d) => { setRoutes((d as { routes: Route[] }).routes); setLoading(false); });
  };

  useEffect(() => { loadRoutes(); }, []);

  const handleSave = async () => {
    if (!form.fromState || !form.toState || !form.price) {
      setMessage({ type: 'error', text: 'Fill in all fields' });
      return;
    }
    setSaving(true);
    setMessage(null);
    const res = await fetch('/api/admin/logistics-routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromState: form.fromState, toState: form.toState, price: parseFloat(form.price) }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) { setMessage({ type: 'error', text: data.error || 'Failed' }); }
    else { setMessage({ type: 'success', text: 'Route saved!' }); setForm({ fromState: '', toState: '', price: '' }); loadRoutes(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this route?')) return;
    await fetch('/api/admin/logistics-routes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadRoutes();
  };

  const filtered = routes.filter((r) =>
    !search || r.fromState.toLowerCase().includes(search.toLowerCase()) || r.toState.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>Logistics Routes</h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>Set delivery prices between states. Vendors using Vendly logistics will show these fees to buyers.</p>
      </div>

      {/* Add route form */}
      <div className="rounded-xl border p-6 mb-6" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#f5f5f5' }}>Add / Update Route</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
            From State
            <select
              value={form.fromState}
              onChange={(e) => setForm((f) => ({ ...f, fromState: e.target.value }))}
              className="rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: form.fromState ? '#f5f5f5' : '#555' }}
            >
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
            To State
            <select
              value={form.toState}
              onChange={(e) => setForm((f) => ({ ...f, toState: e.target.value }))}
              className="rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: form.toState ? '#f5f5f5' : '#555' }}
            >
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
            Price (₦)
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="e.g. 3500"
              className="rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
            />
          </label>
        </div>
        {message && (
          <p className="text-xs mb-3" style={{ color: message.type === 'success' ? '#22c55e' : '#ef4444' }}>{message.text}</p>
        )}
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
          style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
        >
          {saving ? 'Saving…' : 'Save Route'}
        </button>
      </div>

      {/* Routes table */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#2a2a2a' }}>
          <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>{routes.length} Routes</p>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by state…"
            className="rounded-lg border px-3 py-1.5 text-xs outline-none w-44"
            style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: '#555' }}>No routes yet. Add one above.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#2a2a2a' }}>
            {filtered.map((route) => (
              <div key={route.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ color: '#f5f5f5' }}>{route.fromState}</span>
                  <span style={{ color: '#555' }}>→</span>
                  <span className="text-sm" style={{ color: '#f5f5f5' }}>{route.toState}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold" style={{ color: '#22c55e' }}>₦{Number(route.price).toLocaleString()}</span>
                  <button
                    onClick={() => void handleDelete(route.id)}
                    className="text-xs px-2 py-1 rounded border"
                    style={{ borderColor: '#ef444430', color: '#ef4444', backgroundColor: '#ef444410' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
