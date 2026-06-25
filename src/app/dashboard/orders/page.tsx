'use client';

import { useEffect, useState } from 'react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLocation: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  items: OrderItem[] | null;
}

const STATUSES = [
  { value: 'new', label: 'New Order' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'preparing_package', label: 'Preparing Package' },
  { value: 'ready_for_pickup', label: 'Ready For Pickup' },
  { value: 'logistics_assigned', label: 'Logistics Assigned' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
];

const STATUS_COLOR: Record<string, string> = {
  new: '#3b82f6',
  accepted: '#8b5cf6',
  preparing_package: '#f59e0b',
  ready_for_pickup: '#f97316',
  logistics_assigned: '#06b6d4',
  picked_up: '#6366f1',
  in_transit: '#39FF14',
  delivered: '#22c55e',
  completed: '#22c55e',
};

function fmtDate(str: string) {
  return str ? str.slice(0, 10) : '';
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const load = () => {
    const qs = filterStatus ? `?status=${filterStatus}` : '';
    fetch(`/api/vendor/orders${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setOrders((d as { orders: Order[] }).orders);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(true);
    const res = await fetch('/api/vendor/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    });
    const data = (await res.json()) as { order: Order };
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o)));
      if (selected?.id === orderId)
        setSelected((prev) => (prev ? { ...prev, ...data.order } : null));
    }
    setUpdating(false);
  };

  const nextStatus = (current: string): string | null => {
    const idx = STATUSES.findIndex((s) => s.value === current);
    if (idx >= 0 && idx < STATUSES.length - 1) return STATUSES[idx + 1].value;
    return null;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
            Orders
          </h1>
          <p className="text-sm mt-1" style={{ color: '#888888' }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[{ value: '', label: 'All' }, ...STATUSES].map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(s.value)}
            className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border transition-colors shrink-0"
            style={{
              borderColor: filterStatus === s.value ? '#39FF14' : '#2a2a2a',
              color: filterStatus === s.value ? '#39FF14' : '#888888',
              backgroundColor: filterStatus === s.value ? '#39FF1410' : 'transparent',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div
            className="w-5 h-5 border-2 rounded-full"
            style={{
              borderColor: '#39FF14',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <style jsx global>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      ) : orders.length === 0 ? (
        <div
          className="text-center py-20 rounded-xl border"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <p className="text-3xl mb-4">🧾</p>
          <p className="text-sm" style={{ color: '#555555' }}>
            No orders yet.
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <div className="divide-y" style={{ borderColor: '#2a2a2a' }}>
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-4 px-4 md:px-6 py-4 cursor-pointer hover:bg-[#1e1e1e] transition-colors"
                onClick={() => setSelected(order)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
                      {order.orderNumber}
                    </span>
                    <div
                      className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs"
                      style={{ borderColor: '#2a2a2a' }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: STATUS_COLOR[order.status] || '#888' }}
                      />
                      <span style={{ color: '#aaaaaa' }}>
                        {STATUSES.find((s) => s.value === order.status)?.label || order.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#888888' }}>
                    {order.customerName} · {fmtDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
                    ₦{Number(order.total).toLocaleString()}
                  </p>
                  <p className="text-xs" style={{ color: '#555555' }}>
                    {order.paymentMethod === 'full_payment' ? 'Full' : 'On Delivery'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        >
          <div
            className="w-full max-w-lg rounded-xl border"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: '#2a2a2a' }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
                  {selected.orderNumber}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLOR[selected.status] }}
                  />
                  <span className="text-xs" style={{ color: '#888888' }}>
                    {STATUSES.find((s) => s.value === selected.status)?.label}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ color: '#888888' }}>
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Customer info */}
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: '#555555' }}
                >
                  Customer
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Name', selected.customerName],
                    ['Phone', selected.customerPhone],
                    ['Location', selected.customerLocation],
                    ['Address', selected.customerAddress],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs" style={{ color: '#888888' }}>
                        {k}
                      </p>
                      <p className="text-sm mt-0.5" style={{ color: '#f5f5f5' }}>
                        {v}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items */}
              {selected.items && selected.items.length > 0 && (
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: '#555555' }}
                  >
                    Items
                  </p>
                  <div className="space-y-2">
                    {selected.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span style={{ color: '#aaaaaa' }}>
                          {item.name} × {item.quantity}
                        </span>
                        <span style={{ color: '#f5f5f5' }}>
                          ₦{Number(item.total).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div
                      className="border-t pt-2 flex justify-between text-sm font-semibold"
                      style={{ borderColor: '#2a2a2a' }}
                    >
                      <span style={{ color: '#f5f5f5' }}>Total</span>
                      <span style={{ color: '#39FF14' }}>
                        ₦{Number(selected.total).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment */}
              <div className="flex items-center gap-4 text-sm">
                <div
                  className="flex-1 py-2.5 px-3 rounded-lg"
                  style={{ backgroundColor: '#0d0d0d' }}
                >
                  <p className="text-xs mb-0.5" style={{ color: '#888888' }}>
                    Payment
                  </p>
                  <p style={{ color: '#f5f5f5' }}>
                    {selected.paymentMethod === 'full_payment' ? 'Full Payment' : 'On Delivery'}
                  </p>
                </div>
                <div
                  className="flex-1 py-2.5 px-3 rounded-lg"
                  style={{ backgroundColor: '#0d0d0d' }}
                >
                  <p className="text-xs mb-0.5" style={{ color: '#888888' }}>
                    Status
                  </p>
                  <p className="capitalize" style={{ color: '#f5f5f5' }}>
                    {selected.paymentStatus}
                  </p>
                </div>
              </div>

              {/* Order pipeline */}
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: '#555555' }}
                >
                  Update Status
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => {
                        void updateStatus(selected.id, s.value);
                      }}
                      disabled={updating || selected.status === s.value}
                      className="text-xs py-2 px-3 rounded-lg border transition-colors disabled:opacity-40 text-left"
                      style={{
                        borderColor: selected.status === s.value ? '#39FF14' : '#2a2a2a',
                        color: selected.status === s.value ? '#39FF14' : '#888888',
                        backgroundColor: selected.status === s.value ? '#39FF1410' : 'transparent',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {nextStatus(selected.status) && (
                <button
                  onClick={() => {
                    const next = nextStatus(selected.status);
                    if (next) void updateStatus(selected.id, next);
                  }}
                  disabled={updating}
                  className="w-full py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#39FF14', color: '#0d0d0d' }}
                >
                  {updating
                    ? 'Updating…'
                    : `Move to: ${STATUSES.find((s) => s.value === nextStatus(selected.status))?.label}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
