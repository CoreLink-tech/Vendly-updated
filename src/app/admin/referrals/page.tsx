'use client';

import { useEffect, useState } from 'react';

interface Referral {
  id: string;
  referrerName: string;
  referredName: string;
  plan: string;
  commission: number;
  status: string;
  createdAt: string;
}

function fmtDate(str: string) {
  return str ? str.slice(0, 10) : '—';
}

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/referrals')
      .then((r) => r.json())
      .then((d) => {
        setReferrals((d as { referrals: Referral[] }).referrals);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalCommissions = referrals
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + Number(r.commission), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Referrals
        </h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>
          Total commissions paid:{' '}
          <span style={{ color: '#39FF14' }}>₦{totalCommissions.toLocaleString()}</span>
        </p>
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
        ) : referrals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: '#555555' }}>
              No referrals yet.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#2a2a2a' }}>
            <div
              className="hidden md:grid grid-cols-5 px-6 py-2 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: '#555555' }}
            >
              <span>Referrer</span>
              <span>Referred</span>
              <span>Plan</span>
              <span>Commission</span>
              <span>Date</span>
            </div>
            {referrals.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-2 md:grid-cols-5 px-4 md:px-6 py-3 items-center gap-2"
              >
                <span className="text-sm" style={{ color: '#f5f5f5' }}>
                  {r.referrerName || '—'}
                </span>
                <span className="text-xs" style={{ color: '#888888' }}>
                  {r.referredName || '—'}
                </span>
                <span className="text-xs capitalize" style={{ color: '#aaaaaa' }}>
                  {r.plan || '—'}
                </span>
                <span className="text-sm font-semibold" style={{ color: '#39FF14' }}>
                  ₦{Number(r.commission).toLocaleString()}
                </span>
                <span className="text-xs" style={{ color: '#555555' }}>
                  {fmtDate(r.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
