'use client';

import { useEffect, useState } from 'react';
import { theme } from '@/lib/theme';

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
  awaiting_assignment: theme.orange,
  rider_assigned: '#3b82f6',
  picked_up: '#8b5cf6',
  in_transit: theme.green,
  delivered: theme.green,
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
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: theme.ink }}>
          Logistics
        </h1>
        <p className="text-sm mt-1" style={{ color: theme.muted }}>
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
              borderColor: statusFilter === f.v ? theme.green : theme.line,
              color: statusFilter === f.v ? theme.green : theme.muted,
              backgroundColor: statusFilter === f.v ? theme.greenSoft : 'transparent',
            }}
          >
            {f.l}
          </button>
        ))}
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: theme.surface, borderColor: theme.line }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div
              className="w-5 h-5 border-2 rounded-full"
              style={{
                borderColor: theme.green,
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
            <p className="text-sm" style={{ color: theme.faint }}>
              No logistics requests found.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: theme.line }}>
            {requests.map((r) => (
              <div
                key={r.id}
                className="px-4 md:px-6 py-4 cursor-pointer hover:bg-[#1e1e1e] transition-colors"
                onClick={() => setSelected(r)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold" style={{ color: theme.ink }}>
                        {r.customerName}
                      </span>
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs"
                        style={{ borderColor: theme.line }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[r.status] || theme.muted }}
                        />
                        <span className="capitalize" style={{ color: theme.muted }}>
                          {r.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs" style={{ color: theme.muted }}>
                      From: {r.vendorName} → {r.customerAddress}
                    </p>
                    {r.riderName && (
                      <p className="text-xs mt-0.5" style={{ color: theme.faint }}>
                        Rider: {r.riderName} {r.riderPhone}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                      ₦{Number(r.amount).toLocaleString()}
                    </p>
                    <p className="text-xs" style={{ color: theme.faint }}>
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
            style={{ backgroundColor: theme.surface, borderColor: theme.line }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: theme.line }}
            >
              <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                Delivery Request
              </p>
              <button onClick={() => setSelected(null)} style={{ color: theme.muted }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p style={{ color: theme.faint }}>Vendor</p>
                  <p style={{ color: theme.muted }}>{selected.vendorName}</p>
                </div>
                <div>
                  <p style={{ color: theme.faint }}>Vendor Phone</p>
                  <p style={{ color: theme.muted }}>{selected.vendorPhone}</p>
                </div>
                <div>
                  <p style={{ color: theme.faint }}>Customer</p>
                  <p style={{ color: theme.muted }}>{selected.customerName}</p>
                </div>
                <div>
                  <p style={{ color: theme.faint }}>Customer Phone</p>
                  <p style={{ color: theme.muted }}>{selected.customerPhone}</p>
                </div>
                <div className="col-span-2">
                  <p style={{ color: theme.faint }}>Delivery To</p>
                  <p style={{ color: theme.muted }}>{selected.customerAddress}</p>
                </div>
                <div>
                  <p style={{ color: theme.faint }}>Amount</p>
                  <p style={{ color: theme.muted }}>₦{Number(selected.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ color: theme.faint }}>Payment</p>
                  <p className="capitalize" style={{ color: theme.muted }}>
                    {selected.paymentMethod.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              {/* Rider assignment */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: theme.muted }}>
                  Assign Rider
                </p>
                <div className="space-y-2">
                  <input
                    value={riderName}
                    onChange={(e) => setRiderName(e.target.value)}
                    placeholder="Rider name"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: theme.bg, borderColor: theme.line, color: theme.ink }}
                  />
                  <input
                    value={riderPhone}
                    onChange={(e) => setRiderPhone(e.target.value)}
                    placeholder="Rider phone"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: theme.bg, borderColor: theme.line, color: theme.ink }}
                  />
                </div>
              </div>

              {/* Status updates */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: theme.muted }}>
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
                        borderColor: selected.status === s.v ? theme.green : theme.line,
                        color: selected.status === s.v ? theme.green : theme.muted,
                        backgroundColor: selected.status === s.v ? theme.greenSoft : 'transparent',
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
