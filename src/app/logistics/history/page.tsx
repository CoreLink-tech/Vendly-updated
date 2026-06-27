'use client';

import { useEffect, useState } from 'react';

interface Delivery {
  id: string;
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  vendorName: string;
  amount: number;
  status: string;
  createdAt: string;
}

function fmtDate(str: string) {
  return str ? new Date(str).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

export default function LogisticsHistoryPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/logistics?status=delivered')
      .then((r) => r.json())
      .then((d) => {
        setDeliveries((d as { requests: Delivery[] }).requests || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>Delivery History</h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>{deliveries.length} completed deliveries</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }} />
        </div>
      ) : deliveries.length === 0 ? (
        <div className="flex items-center justify-center h-40 rounded-xl border" style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}>
          <p className="text-sm" style={{ color: '#555555' }}>No completed deliveries yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#111111', borderColor: '#2a2a2a' }}>
          <div className="divide-y" style={{ borderColor: '#2a2a2a' }}>
            {deliveries.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-4 py-4 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#f5f5f5' }}>{d.customerName}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: '#888888' }}>{d.customerAddress}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#555555' }}>From: {d.vendorName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>₦{Number(d.amount).toLocaleString()}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#555555' }}>{fmtDate(d.createdAt)}</p>
                  <span className="text-xs" style={{ color: '#22c55e' }}>Delivered</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
