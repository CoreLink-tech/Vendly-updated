'use client';

import { useEffect, useState, useCallback } from 'react';

interface Delivery {
  id: string;
  orderId: string;
  orderNumber: string;
  vendorName: string;
  vendorAddress: string;
  vendorPhone: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  paymentMethod: string;
  amount: number;
  deliveryFee: number;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#22c55e',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const ACTIVE_STATUSES = ['new', 'confirmed', 'processing', 'shipped'];

function fmtDate(str: string) {
  return str ? new Date(str).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
}

export default function LogisticsPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = useCallback(() => {
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    fetch(`/api/admin/logistics${qs}`)
      .then((r) => r.json())
      .then((d) => {
        const all = (d as { requests: Delivery[] }).requests || [];
        setDeliveries(all.filter((o) => ACTIVE_STATUSES.includes(o.status)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    await fetch('/api/admin/logistics', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: id, status }),
    });
    load();
    setSelected(null);
    setUpdating(false);
  };

  const NEXT_STATUS: Record<string, { status: string; label: string }> = {
    new: { status: 'confirmed', label: 'Confirm Pickup' },
    confirmed: { status: 'processing', label: 'Mark as Picked Up' },
    processing: { status: 'shipped', label: 'Mark In Transit' },
    shipped: { status: 'delivered', label: 'Mark Delivered' },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Active Deliveries
        </h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>
          {deliveries.length} active {deliveries.length === 1 ? 'delivery' : 'deliveries'}
        </p>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { v: '', l: 'All Active' },
          { v: 'new', l: 'New' },
          { v: 'confirmed', l: 'Confirmed' },
          { v: 'processing', l: 'Picked Up' },
          { v: 'shipped', l: 'In Transit' },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setStatusFilter(f.v)}
            className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border shrink-0 transition-colors"
            style={{
              borderColor: statusFilter === f.v ? '#22c55e' : '#2a2a2a',
              color: statusFilter === f.v ? '#22c55e' : '#888888',
              backgroundColor: statusFilter === f.v ? '#22c55e10' : 'transparent',
            }}
          >
            {f.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }} />
        </div>
      ) : deliveries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 rounded-xl border" style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}>
          <p className="text-sm" style={{ color: '#555555' }}>No active deliveries.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deliveries.map((d) => (
            <div
              key={d.id}
              onClick={() => setSelected(d)}
              className="rounded-xl border p-4 cursor-pointer transition-colors hover:border-green-900"
              style={{ backgroundColor: '#111111', borderColor: '#2a2a2a' }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>{d.customerName}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#888888' }}>{d.customerPhone}</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs shrink-0" style={{ borderColor: '#2a2a2a' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.status] || '#888' }} />
                  <span style={{ color: '#aaaaaa' }}>{STATUS_LABELS[d.status] || d.status}</span>
                </div>
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="flex gap-2 text-xs">
                  <span style={{ color: '#555555', minWidth: 40 }}>From</span>
                  <span style={{ color: '#aaaaaa' }}>{d.vendorName} — {d.vendorAddress}</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span style={{ color: '#555555', minWidth: 40 }}>To</span>
                  <span style={{ color: '#aaaaaa' }}>{d.customerAddress}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#555555' }}>{fmtDate(d.createdAt)}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold" style={{ color: '#f5f5f5' }}>
                    ₦{Number(d.amount).toLocaleString()}
                  </span>
                  {NEXT_STATUS[d.status] && (
                    <button
                      onClick={(e) => { e.stopPropagation(); void updateStatus(d.id, NEXT_STATUS[d.status].status); }}
                      disabled={updating}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50 transition-colors"
                      style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}
                    >
                      {NEXT_STATUS[d.status].label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full md:max-w-md rounded-t-2xl md:rounded-xl border overflow-y-auto max-h-[90vh]" style={{ backgroundColor: '#111111', borderColor: '#2a2a2a' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0" style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}>
              <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Order #{selected.orderNumber}</p>
              <button onClick={() => setSelected(null)} style={{ color: '#888888' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Vendor */}
              <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: '#1a1a1a' }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#555555' }}>Pickup From</p>
                <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>{selected.vendorName}</p>
                <p className="text-xs" style={{ color: '#aaaaaa' }}>{selected.vendorAddress}</p>
                <a href={`tel:${selected.vendorPhone}`} className="flex items-center gap-2 text-xs mt-1" style={{ color: '#22c55e' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  {selected.vendorPhone}
                </a>
              </div>

              {/* Customer */}
              <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: '#1a1a1a' }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#555555' }}>Deliver To</p>
                <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>{selected.customerName}</p>
                <p className="text-xs" style={{ color: '#aaaaaa' }}>{selected.customerAddress}</p>
                <a href={`tel:${selected.customerPhone}`} className="flex items-center gap-2 text-xs mt-1" style={{ color: '#22c55e' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  {selected.customerPhone}
                </a>
              </div>

              {/* Payment */}
              <div className="rounded-lg p-4" style={{ backgroundColor: '#1a1a1a' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#555555' }}>Payment</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs capitalize" style={{ color: '#aaaaaa' }}>
                    {selected.paymentMethod.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-bold" style={{ color: '#f5f5f5' }}>
                    ₦{Number(selected.amount).toLocaleString()}
                  </span>
                </div>
                {selected.paymentMethod === 'payment_on_delivery' && (
                  <p className="text-xs mt-2 px-2 py-1 rounded" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>
                    Collect payment on delivery
                  </p>
                )}
              </div>

              {/* Status update */}
              {NEXT_STATUS[selected.status] && (
                <button
                  onClick={() => { void updateStatus(selected.id, NEXT_STATUS[selected.status].status); }}
                  disabled={updating}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
                >
                  {updating ? 'Updating…' : NEXT_STATUS[selected.status].label}
                </button>
              )}

              {selected.status === 'shipped' && (
                <button
                  onClick={() => { void updateStatus(selected.id, 'delivered'); }}
                  disabled={updating}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
                >
                  {updating ? 'Confirming…' : 'Confirm Delivery'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
