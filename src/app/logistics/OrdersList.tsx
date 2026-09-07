'use client';

import { useEffect, useState, useCallback } from 'react';
import { theme } from '@/lib/theme';

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
  new: theme.orange,
  confirmed: '#3b82f6',
  processing: '#8b5cf6',
  shipped: theme.green,
  delivered: theme.green,
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
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: theme.green, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex items-center justify-center h-40 rounded-xl border" style={{ borderColor: theme.line, backgroundColor: theme.surface }}>
        <p className="text-sm" style={{ color: theme.faint }}>No orders found.</p>
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
            style={{ backgroundColor: theme.surface, borderColor: theme.line }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold" style={{ color: theme.ink }}>{o.customerName}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: (STATUS_COLOR[o.status] || theme.muted) + '20', color: STATUS_COLOR[o.status] || theme.muted }}>
                    {STATUS_LABEL[o.status] || o.status}
                  </span>
                </div>
                <p className="text-xs" style={{ color: theme.muted }}>{o.customerPhone}</p>
              </div>
              <p className="text-sm font-bold shrink-0" style={{ color: theme.ink }}>₦{Number(o.total).toLocaleString()}</p>
            </div>
            <div className="space-y-1 mb-3">
              <div className="flex gap-2 text-xs">
                <span style={{ color: theme.faint, minWidth: 44 }}>From</span>
                <span className="truncate" style={{ color: theme.muted }}>{o.vendorName}</span>
              </div>
              <div className="flex gap-2 text-xs">
                <span style={{ color: theme.faint, minWidth: 44 }}>To</span>
                <span className="truncate" style={{ color: theme.muted }}>{o.customerAddress}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: theme.faint }}>{fmtDate(o.createdAt)}</span>
              {NEXT_STATUS[o.status] && (
                <button
                  onClick={(e) => { e.stopPropagation(); void updateStatus(o.id, NEXT_STATUS[o.status].status); }}
                  disabled={updating}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
                  style={{ backgroundColor: theme.greenSoft, color: theme.green }}
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
          <div className="w-full md:max-w-md rounded-t-2xl md:rounded-xl border overflow-y-auto max-h-[90vh]" style={{ backgroundColor: theme.surface, borderColor: theme.line }}>
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0" style={{ borderColor: theme.line, backgroundColor: theme.surface }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: theme.ink }}>#{selected.orderNumber}</p>
                <span className="text-xs" style={{ color: STATUS_COLOR[selected.status] || theme.muted }}>{STATUS_LABEL[selected.status] || selected.status}</span>
              </div>
              <button onClick={() => setSelected(null)} style={{ color: theme.muted }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Pickup */}
              <div className="rounded-lg p-4" style={{ backgroundColor: theme.surface }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: theme.faint }}>Pickup From</p>
                <p className="text-sm font-semibold" style={{ color: theme.ink }}>{selected.vendorName}</p>
                <p className="text-xs mt-0.5" style={{ color: theme.muted }}>{selected.vendorAddress}</p>
                <a href={`tel:${selected.vendorPhone}`} className="text-xs mt-1 inline-block" style={{ color: theme.green }}>{selected.vendorPhone}</a>
              </div>

              {/* Delivery */}
              <div className="rounded-lg p-4" style={{ backgroundColor: theme.surface }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: theme.faint }}>Deliver To</p>
                <p className="text-sm font-semibold" style={{ color: theme.ink }}>{selected.customerName}</p>
                <p className="text-xs mt-0.5" style={{ color: theme.muted }}>{selected.customerAddress}</p>
                <a href={`tel:${selected.customerPhone}`} className="text-xs mt-1 inline-block" style={{ color: theme.green }}>{selected.customerPhone}</a>
              </div>

              {/* Payment */}
              <div className="rounded-lg p-4" style={{ backgroundColor: theme.surface }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: theme.faint }}>Payment</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs capitalize" style={{ color: theme.muted }}>{selected.paymentMethod.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-bold" style={{ color: theme.ink }}>₦{Number(selected.total).toLocaleString()}</span>
                </div>
                {selected.paymentMethod === 'payment_on_delivery' && (
                  <p className="text-xs mt-2 px-2 py-1 rounded" style={{ backgroundColor: '#f59e0b20', color: theme.orange }}>Collect payment on delivery</p>
                )}
              </div>

              {/* Status actions */}
              {NEXT_STATUS[selected.status] && (
                <button
                  onClick={() => { void updateStatus(selected.id, NEXT_STATUS[selected.status].status); }}
                  disabled={updating}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ backgroundColor: theme.green, color: theme.bg }}
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
