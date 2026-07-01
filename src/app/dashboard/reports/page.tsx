'use client';

import { useEffect, useState } from 'react';

interface Report {
  id: string;
  customerName: string;
  customerPhone: string;
  message: string;
  createdAt: string;
}

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

function timeLeftLabel(createdAt: string) {
  const expiresAt = new Date(createdAt).getTime() + THREE_DAYS_MS;
  const msLeft = expiresAt - Date.now();
  if (msLeft <= 0) return 'Expiring…';
  const hoursLeft = Math.floor(msLeft / (60 * 60 * 1000));
  if (hoursLeft < 1) return 'Expires in <1h';
  if (hoursLeft < 24) return `Expires in ${hoursLeft}h`;
  const daysLeft = Math.floor(hoursLeft / 24);
  return `Expires in ${daysLeft}d ${hoursLeft % 24}h`;
}

function fmtDate(str: string) {
  return new Date(str).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Report | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    fetch('/api/vendor/reports')
      .then((r) => r.json())
      .then((d) => {
        setReports((d as { reports: Report[] }).reports || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    await fetch(`/api/vendor/reports?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    setSelected(null);
    setDeleting(false);
    load();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Reports
        </h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>
          Complaints and messages submitted by buyers on your storefront. Reports are automatically removed 3 days after they&apos;re sent.
        </p>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div
              className="w-5 h-5 border-2 rounded-full"
              style={{ borderColor: '#22c55e', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}
            />
            <style jsx global>{`
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: '#555555' }}>No reports right now.</p>
            <p className="text-xs mt-1" style={{ color: '#555555' }}>
              Buyers can submit a report from the &quot;Report an Issue&quot; button on your storefront.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#2a2a2a' }}>
            {reports.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-4 px-4 md:px-6 py-4 cursor-pointer hover:bg-[#1e1e1e] transition-colors"
                onClick={() => setSelected(r)}
              >
                <div
                  className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}
                >
                  {(r.customerName || '?')[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#f5f5f5' }}>
                    {r.customerName}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#888888' }}>
                    {r.message}
                  </p>
                </div>
                <div className="hidden md:flex flex-col items-end gap-0.5 shrink-0">
                  <span className="text-xs" style={{ color: '#888888' }}>{fmtDate(r.createdAt)}</span>
                  <span className="text-[10px]" style={{ color: '#f59e0b' }}>{timeLeftLabel(r.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        >
          <div className="w-full max-w-md rounded-xl border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#2a2a2a' }}>
              <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Report</p>
              <button onClick={() => setSelected(null)} style={{ color: '#888888' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs" style={{ color: '#888888' }}>Name</p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: '#f5f5f5' }}>{selected.customerName}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#888888' }}>Phone</p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: '#f5f5f5' }}>{selected.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#888888' }}>Submitted</p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: '#f5f5f5' }}>{fmtDate(selected.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#888888' }}>Status</p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: '#f59e0b' }}>{timeLeftLabel(selected.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs mb-1.5" style={{ color: '#888888' }}>Message</p>
                <p className="text-sm leading-relaxed p-3 rounded-lg" style={{ backgroundColor: '#0d0d0d', color: '#f5f5f5' }}>
                  {selected.message}
                </p>
              </div>

              <a
                href={`tel:${selected.customerPhone}`}
                className="block text-center text-xs py-2.5 rounded-lg font-semibold"
                style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
              >
                Call {selected.customerName.split(' ')[0]}
              </a>

              <button
                onClick={() => void handleDelete(selected.id)}
                disabled={deleting}
                className="w-full py-2.5 rounded-lg text-sm font-semibold border disabled:opacity-50"
                style={{ borderColor: '#ef444430', color: '#ef4444' }}
              >
                {deleting ? 'Deleting…' : 'Delete Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
