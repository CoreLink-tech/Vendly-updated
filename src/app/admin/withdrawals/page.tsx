'use client';

import { useEffect, useState } from 'react';
import { theme } from '@/lib/theme';

interface Withdrawal {
  id: string;
  vendorId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: string;
  type: string;
  createdAt: string;
  processedAt: string | null;
  notes: string;
}

function fmtDate(str: string | null) {
  return str ? str.slice(0, 10) : '—';
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  const load = () => {
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    fetch(`/api/admin/withdrawals${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setWithdrawals((d as { withdrawals: Withdrawal[] }).withdrawals);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const processWithdrawal = async (id: string, action: 'approve' | 'reject') => {
    setProcessing(id);
    await fetch('/api/admin/withdrawals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawalId: id, action }),
    });
    load();
    setProcessing(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: theme.ink }}>
          Withdrawals
        </h1>
        <p className="text-sm mt-1" style={{ color: theme.muted }}>
          Review and process withdrawal requests.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { v: 'pending', l: 'Pending' },
          { v: 'completed', l: 'Completed' },
          { v: 'rejected', l: 'Rejected' },
          { v: '', l: 'All' },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setStatusFilter(f.v)}
            className="text-xs px-3 py-1.5 rounded-full border"
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
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: theme.faint }}>
              No withdrawals found.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: theme.line }}>
            {withdrawals.map((w) => (
              <div key={w.id} className="px-4 md:px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold" style={{ color: theme.ink }}>
                        ₦{Number(w.amount).toLocaleString()}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full border capitalize"
                        style={{ borderColor: theme.line, color: theme.muted }}
                      >
                        {w.type}
                      </span>
                    </div>
                    <div className="text-xs space-y-0.5" style={{ color: theme.muted }}>
                      <p>
                        <span style={{ color: theme.faint }}>Bank:</span> {w.bankName}
                      </p>
                      <p>
                        <span style={{ color: theme.faint }}>Account:</span> {w.accountNumber}
                      </p>
                      <p>
                        <span style={{ color: theme.faint }}>Name:</span> {w.accountName}
                      </p>
                      <p>
                        <span style={{ color: theme.faint }}>Date:</span> {fmtDate(w.createdAt)}
                      </p>
                    </div>
                  </div>
                  {w.status === 'pending' && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => {
                          void processWithdrawal(w.id, 'approve');
                        }}
                        disabled={processing === w.id}
                        className="text-xs px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                        style={{ backgroundColor: theme.green, color: theme.bg }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          void processWithdrawal(w.id, 'reject');
                        }}
                        disabled={processing === w.id}
                        className="text-xs px-4 py-2 rounded-lg border"
                        style={{ borderColor: '#ef444430', color: '#ef4444' }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {w.status !== 'pending' && (
                    <span
                      className="text-xs font-semibold capitalize"
                      style={{ color: w.status === 'completed' ? theme.green : '#ef4444' }}
                    >
                      {w.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
