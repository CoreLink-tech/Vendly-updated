'use client';

import { useEffect, useState } from 'react';

interface LogisticsRequest {
  id: string;
  orderId: string;
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
  riderName: string | null;
  riderPhone: string | null;
  createdAt: string;
}

function fmtDate(str: string) {
  return str ? str.slice(0, 10) : '—';
}

const STATUS_COLORS: Record<string, string> = {
  awaiting_assignment: '#f59e0b',
  rider_assigned: '#3b82f6',
  picked_up: '#8b5cf6',
  in_transit: '#39FF14',
  delivered: '#22c55e',
};

export default function LogisticsPage() {
  const [requests, setRequests] = useState<LogisticsRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<LogisticsRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState('awaiting_assignment');
  const [riderName, setRiderName] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = () => {
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    fetch(`/api/admin/logistics${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setRequests((d as { requests: LogisticsRequest[] }).requests);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    await fetch('/api/admin/logistics', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: id,
        status,
        riderName: riderName || undefined,
        riderPhone: riderPhone || undefined,
      }),
    });
    load();
    setSelected(null);
    setUpdating(false);
  };

  const STATUSES = [
    { v: 'awaiting_assignment', l: 'Awaiting Assignment' },
    { v: 'rider_assigned', l: 'Rider Assigned' },
    { v: 'picked_up', l: 'Picked Up' },
    { v: 'in_transit', l: 'In Transit' },
    { v: 'delivered', l: 'Delivered' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Logistics
        </h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>
          Manage delivery requests and rider assignments.
        </p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[{ v: '', l: 'All' }, ...STATUSES].map((f) => (
          <button
            key={f.v}
            onClick={() => setStatusFilter(f.v)}
            className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border shrink-0"
            style={{
              borderColor: statusFilter === f.v ? '#39FF14' : '#2a2a2a',
              color: statusFilter === f.v ? '#39FF14' : '#888888',
              backgroundColor: statusFilter === f.v ? '#39FF1410' : 'transparent',
            }}
          >
            {f.l}
          </button>
        ))}
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-24">
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
        ) : requests.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: '#555555' }}>
              No logistics requests found.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#2a2a2a' }}>
            {requests.map((r) => (
              <div
                key={r.id}
                className="px-4 md:px-6 py-4 cursor-pointer hover:bg-[#1e1e1e] transition-colors"
                onClick={() => setSelected(r)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
                        {r.customerName}
                      </span>
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs"
                        style={{ borderColor: '#2a2a2a' }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[r.status] || '#888' }}
                        />
                        <span className="capitalize" style={{ color: '#aaaaaa' }}>
                          {r.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs" style={{ color: '#888888' }}>
                      From: {r.vendorName} → {r.customerAddress}
                    </p>
                    {r.riderName && (
                      <p className="text-xs mt-0.5" style={{ color: '#555555' }}>
                        Rider: {r.riderName} {r.riderPhone}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
                      ₦{Number(r.amount).toLocaleString()}
                    </p>
                    <p className="text-xs" style={{ color: '#555555' }}>
                      {fmtDate(r.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        >
          <div
            className="w-full max-w-md rounded-xl border"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: '#2a2a2a' }}
            >
              <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
                Delivery Request
              </p>
              <button onClick={() => setSelected(null)} style={{ color: '#888888' }}>
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p style={{ color: '#555555' }}>Vendor</p>
                  <p style={{ color: '#aaaaaa' }}>{selected.vendorName}</p>
                </div>
                <div>
                  <p style={{ color: '#555555' }}>Vendor Phone</p>
                  <p style={{ color: '#aaaaaa' }}>{selected.vendorPhone}</p>
                </div>
                <div>
                  <p style={{ color: '#555555' }}>Customer</p>
                  <p style={{ color: '#aaaaaa' }}>{selected.customerName}</p>
                </div>
                <div>
                  <p style={{ color: '#555555' }}>Customer Phone</p>
                  <p style={{ color: '#aaaaaa' }}>{selected.customerPhone}</p>
                </div>
                <div className="col-span-2">
                  <p style={{ color: '#555555' }}>Delivery To</p>
                  <p style={{ color: '#aaaaaa' }}>{selected.customerAddress}</p>
                </div>
                <div>
                  <p style={{ color: '#555555' }}>Amount</p>
                  <p style={{ color: '#aaaaaa' }}>₦{Number(selected.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ color: '#555555' }}>Payment</p>
                  <p className="capitalize" style={{ color: '#aaaaaa' }}>
                    {selected.paymentMethod.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              {/* Rider assignment */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: '#aaaaaa' }}>
                  Assign Rider
                </p>
                <div className="space-y-2">
                  <input
                    value={riderName}
                    onChange={(e) => setRiderName(e.target.value)}
                    placeholder="Rider name"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                  />
                  <input
                    value={riderPhone}
                    onChange={(e) => setRiderPhone(e.target.value)}
                    placeholder="Rider phone"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                  />
                </div>
              </div>

              {/* Status updates */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: '#aaaaaa' }}>
                  Update Status
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s.v}
                      onClick={() => {
                        void updateStatus(selected.id, s.v);
                      }}
                      disabled={updating || selected.status === s.v}
                      className="text-xs py-2 px-3 rounded-lg border transition-colors disabled:opacity-40"
                      style={{
                        borderColor: selected.status === s.v ? '#39FF14' : '#2a2a2a',
                        color: selected.status === s.v ? '#39FF14' : '#888888',
                        backgroundColor: selected.status === s.v ? '#39FF1410' : 'transparent',
                      }}
                    >
                      {s.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
