'use client';

import { useEffect, useState } from 'react';

interface Ambassador {
  id: string;
  vendorId: string;
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  reason: string;
  status: string;
  ambassadorCode: string | null;
  createdAt: string;
  vendorBusinessName: string;
}

function fmtDate(str: string) {
  return str ? str.slice(0, 10) : '—';
}

export default function AmbassadorsPage() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  const load = () => {
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    fetch(`/api/admin/ambassadors${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setAmbassadors((d as { ambassadors: Ambassador[] }).ambassadors);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const processApp = async (id: string, action: 'approve' | 'decline') => {
    setProcessing(id);
    await fetch('/api/admin/ambassadors', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ambassadorId: id, action }),
    });
    load();
    setProcessing(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Ambassadors
        </h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>
          Review and manage ambassador applications.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { v: 'pending', l: 'Pending' },
          { v: 'approved', l: 'Approved' },
          { v: 'declined', l: 'Declined' },
          { v: '', l: 'All' },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setStatusFilter(f.v)}
            className="text-xs px-3 py-1.5 rounded-full border"
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

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div
              className="w-5 h-5 border-2 rounded-full"
              style={{
                borderColor: '#22c55e',
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
        ) : ambassadors.length === 0 ? (
          <div
            className="text-center py-12 rounded-xl border"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <p className="text-sm" style={{ color: '#555555' }}>
              No ambassador applications found.
            </p>
          </div>
        ) : (
          ambassadors.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border p-5"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
                      {a.fullName}
                    </p>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full border capitalize"
                      style={{
                        borderColor:
                          a.status === 'approved'
                            ? '#22c55e40'
                            : a.status === 'pending'
                              ? '#f59e0b40'
                              : '#ef444440',
                        color:
                          a.status === 'approved'
                            ? '#22c55e'
                            : a.status === 'pending'
                              ? '#f59e0b'
                              : '#ef4444',
                      }}
                    >
                      {a.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
                    {[
                      ['Email', a.email],
                      ['Phone', a.phone],
                      ['Business', a.businessName],
                      ['Applied', fmtDate(a.createdAt)],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p style={{ color: '#555555' }}>{k}</p>
                        <p style={{ color: '#aaaaaa' }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#0d0d0d' }}>
                    <p className="text-xs" style={{ color: '#888888' }}>
                      <span style={{ color: '#555555' }}>Reason: </span>
                      {a.reason}
                    </p>
                  </div>
                  {a.ambassadorCode && (
                    <p className="text-xs mt-2" style={{ color: '#888888' }}>
                      Code: <code style={{ color: '#22c55e' }}>{a.ambassadorCode}</code>
                    </p>
                  )}
                </div>
                {a.status === 'pending' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => {
                        void processApp(a.id, 'approve');
                      }}
                      disabled={processing === a.id}
                      className="text-xs px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                      style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        void processApp(a.id, 'decline');
                      }}
                      disabled={processing === a.id}
                      className="text-xs px-4 py-2 rounded-lg border"
                      style={{ borderColor: '#ef444430', color: '#ef4444' }}
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
