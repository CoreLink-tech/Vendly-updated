'use client';

import { useEffect, useState, useCallback } from 'react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  vendorName: string;
  vendorPhone: string;
  vendorAddress: string;
  paymentMethod: string;
  status: string;
  total: number;
  deliveryFee: number;
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  new: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#22c55e',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

const STATUS_LABEL: Record<string, string> = {
  new: 'New',
  confirmed: 'Confirmed',
  processing: 'Picked Up',
  shipped: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const NEXT_STATUS: Record<string, { status: string; label: string }> = {
  new: { status: 'confirmed', label: 'Confirm Order' },
  confirmed: { status: 'processing', label: 'Mark Picked Up' },
  processing: { status: 'shipped', label: 'Mark In Transit' },
  shipped: { status: 'delivered', label: 'Mark Delivered' },
};

function fmtDate(str: string) {
  return new Date(str).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function OrdersList({ statusFilter }: { statusFilter?: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(() => {
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    fetch(`/api/admin/logistics${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setOrders((d as { requests: Order[] }).requests || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex items-center justify-center h-40 rounded-xl border" style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}>
        <p className="text-sm" style={{ color: '#555555' }}>No orders found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {orders.map((o) => (
          <div
            key={o.id}
            onClick={() => setSelected(o)}
            className="rounded-xl border p-4 cursor-pointer transition-colors hover:border-green-900"
            style={{ backgroundColor: '#111111', borderColor: '#2a2a2a' }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>{o.customerName}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: (STATUS_COLOR[o.status] || '#888') + '20', color: STATUS_COLOR[o.status] || '#888' }}>
                    {STATUS_LABEL[o.status] || o.status}
                  </span>
                </div>
                <p className="text-xs" style={{ color: '#888888' }}>{o.customerPhone}</p>
              </div>
              <p className="text-sm font-bold shrink-0" style={{ color: '#f5f5f5' }}>₦{Number(o.total).toLocaleString()}</p>
            </div>
            <div className="space-y-1 mb-3">
              <div className="flex gap-2 text-xs">
                <span style={{ color: '#555555', minWidth: 44 }}>From</span>
                <span className="truncate" style={{ color: '#aaaaaa' }}>{o.vendorName}</span>
              </div>
              <div className="flex gap-2 text-xs">
                <span style={{ color: '#555555', minWidth: 44 }}>To</span>
                <span className="truncate" style={{ color: '#aaaaaa' }}>{o.customerAddress}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: '#555555' }}>{fmtDate(o.createdAt)}</span>
              {NEXT_STATUS[o.status] && (
                <button
                  onClick={(e) => { e.stopPropagation(); void updateStatus(o.id, NEXT_STATUS[o.status].status); }}
                  disabled={updating}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
                  style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}
                >
                  {NEXT_STATUS[o.status].label}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full md:max-w-md rounded-t-2xl md:rounded-xl border overflow-y-auto max-h-[90vh]" style={{ backgroundColor: '#111111', borderColor: '#2a2a2a' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0" style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>#{selected.orderNumber}</p>
                <span className="text-xs" style={{ color: STATUS_COLOR[selected.status] || '#888' }}>{STATUS_LABEL[selected.status] || selected.status}</span>
              </div>
              <button onClick={() => setSelected(null)} style={{ color: '#888888' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Pickup */}
              <div className="rounded-lg p-4" style={{ backgroundColor: '#1a1a1a' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#555555' }}>Pickup From</p>
                <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>{selected.vendorName}</p>
                <p className="text-xs mt-0.5" style={{ color: '#aaaaaa' }}>{selected.vendorAddress}</p>
                <a href={`tel:${selected.vendorPhone}`} className="text-xs mt-1 inline-block" style={{ color: '#22c55e' }}>{selected.vendorPhone}</a>
              </div>

              {/* Delivery */}
              <div className="rounded-lg p-4" style={{ backgroundColor: '#1a1a1a' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#555555' }}>Deliver To</p>
                <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>{selected.customerName}</p>
                <p className="text-xs mt-0.5" style={{ color: '#aaaaaa' }}>{selected.customerAddress}</p>
                <a href={`tel:${selected.customerPhone}`} className="text-xs mt-1 inline-block" style={{ color: '#22c55e' }}>{selected.customerPhone}</a>
              </div>

              {/* Payment */}
              <div className="rounded-lg p-4" style={{ backgroundColor: '#1a1a1a' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#555555' }}>Payment</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs capitalize" style={{ color: '#aaaaaa' }}>{selected.paymentMethod.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-bold" style={{ color: '#f5f5f5' }}>₦{Number(selected.total).toLocaleString()}</span>
                </div>
                {selected.paymentMethod === 'payment_on_delivery' && (
                  <p className="text-xs mt-2 px-2 py-1 rounded" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>Collect payment on delivery</p>
                )}
              </div>

              {/* Status actions */}
              {NEXT_STATUS[selected.status] && (
                <button
                  onClick={() => { void updateStatus(selected.id, NEXT_STATUS[selected.status].status); }}
                  disabled={updating}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
                >
                  {updating ? 'Updating…' : NEXT_STATUS[selected.status].label}
                </button>
              )}

              {selected.status !== 'cancelled' && selected.status !== 'delivered' && (
                <button
                  onClick={() => { void updateStatus(selected.id, 'cancelled'); }}
                  disabled={updating}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold border disabled:opacity-50"
                  style={{ borderColor: '#ef444430', color: '#ef4444' }}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
