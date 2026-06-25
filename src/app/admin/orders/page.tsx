'use client';

import { useEffect, useState } from 'react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  vendorName: string;
  status: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
}

function fmtDate(str: string) {
  return str ? str.slice(0, 10) : '—';
}

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((d) => {
        setOrders((d as { orders: Order[] }).orders);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Orders
        </h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>
          {orders.length} total orders
        </p>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-32">
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
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: '#555555' }}>
              No orders yet.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#2a2a2a' }}>
            {orders.map((o) => (
              <div key={o.id} className="flex items-center gap-4 px-4 md:px-6 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
                      {o.orderNumber}
                    </span>
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs hidden md:flex"
                      style={{ borderColor: '#2a2a2a' }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: STATUS_COLOR[o.status] || '#888' }}
                      />
                      <span className="capitalize" style={{ color: '#aaaaaa' }}>
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs mt-0.5" style={{ color: '#888888' }}>
                    <span>{o.customerName}</span>
                    <span style={{ color: '#555555' }}>·</span>
                    <span>{o.vendorName}</span>
                    <span style={{ color: '#555555' }}>·</span>
                    <span>{fmtDate(o.createdAt)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
                    ₦{Number(o.total).toLocaleString()}
                  </p>
                  <p className="text-xs capitalize" style={{ color: '#555555' }}>
                    {o.paymentMethod.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
