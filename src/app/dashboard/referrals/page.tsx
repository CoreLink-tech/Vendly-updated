'use client';

import { useEffect, useState } from 'react';

interface ReferralData {
  slug: string;
  totalReferrals: number;
  successfulReferrals: number;
  earnings: number;
  withdrawableBalance: number;
  referrals: Array<{
    id: string;
    plan: string;
    commission: number;
    status: string;
    createdAt: string;
  }>;
  withdrawals: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    bankName: string;
    accountNumber: string;
  }>;
}

function fmtDate(str: string) {
  return str ? str.slice(0, 10) : '';
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [wForm, setWForm] = useState({ bankName: '', accountNumber: '', accountName: '' });
  const [wAmount, setWAmount] = useState('');
  const [wSaving, setWSaving] = useState(false);
  const [wMsg, setWMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/vendor/referrals')
      .then((r) => r.json())
      .then((d) => {
        setData(d as ReferralData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const referralLink = data?.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/account/signup?ref=${data.slug}`
    : '';

  const copyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const submitWithdrawal = async () => {
    if (!wForm.bankName || !wForm.accountNumber || !wForm.accountName || !wAmount) return;
    setWSaving(true);
    setWMsg(null);
    const res = await fetch('/api/vendor/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...wForm, amount: parseFloat(wAmount), type: 'referral' }),
    });
    const d = (await res.json()) as { error?: string };
    if (!res.ok) {
      setWMsg(d.error || 'Failed');
    } else {
      setWMsg('Withdrawal request submitted!');
      setShowWithdraw(false);
    }
    setWSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Referral Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>
          Earn ₦1,000 per monthly or ₦10,000 per yearly referral.
        </p>
      </div>

      {/* Referral link */}
      <div
        className="p-6 rounded-xl border mb-6"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <p className="text-xs font-medium mb-3" style={{ color: '#aaaaaa' }}>
          Your Referral Link
        </p>
        <div className="flex items-center gap-3">
          <code
            className="flex-1 text-xs font-mono truncate px-3 py-2 rounded-lg"
            style={{ backgroundColor: '#0d0d0d', color: '#22c55e' }}
          >
            {referralLink || 'Activate your store to get a referral link'}
          </code>
          {referralLink && (
            <button
              onClick={copyLink}
              className="shrink-0 text-xs px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: copied ? '#22c55e' : '#22c55e20',
                color: copied ? '#0d0d0d' : '#22c55e',
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Referrals', value: data?.totalReferrals ?? 0 },
          { label: 'Successful', value: data?.successfulReferrals ?? 0 },
          { label: 'Total Earned', value: `₦${Number(data?.earnings ?? 0).toLocaleString()}` },
          {
            label: 'Withdrawable',
            value: `₦${Number(data?.withdrawableBalance ?? 0).toLocaleString()}`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-xl border"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <p className="text-xs mb-1" style={{ color: '#888888' }}>
              {s.label}
            </p>
            <p className="text-xl font-semibold" style={{ color: '#f5f5f5' }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Withdraw button */}
      {(data?.withdrawableBalance ?? 0) > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowWithdraw(true)}
            className="text-sm font-semibold px-5 py-2.5 rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
          >
            Request Withdrawal
          </button>
          {wMsg && (
            <p className="text-xs mt-2" style={{ color: '#22c55e' }}>
              {wMsg}
            </p>
          )}
        </div>
      )}

      {/* Commission info */}
      <div
        className="p-4 rounded-xl border mb-6"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <p className="text-xs font-semibold mb-3" style={{ color: '#aaaaaa' }}>
          Commission Rates
        </p>
        <div className="flex gap-4">
          <div className="flex-1 text-center p-3 rounded-lg" style={{ backgroundColor: '#0d0d0d' }}>
            <p className="text-xs mb-1" style={{ color: '#888888' }}>
              Monthly plan
            </p>
            <p className="text-lg font-semibold" style={{ color: '#22c55e' }}>
              ₦1,000
            </p>
            <p className="text-[10px]" style={{ color: '#555555' }}>
              25% one-time
            </p>
          </div>
          <div className="flex-1 text-center p-3 rounded-lg" style={{ backgroundColor: '#0d0d0d' }}>
            <p className="text-xs mb-1" style={{ color: '#888888' }}>
              Yearly plan
            </p>
            <p className="text-lg font-semibold" style={{ color: '#22c55e' }}>
              ₦10,000
            </p>
            <p className="text-[10px]" style={{ color: '#555555' }}>
              25% one-time
            </p>
          </div>
        </div>
      </div>

      {/* Recent referrals */}
      {data?.referrals && data.referrals.length > 0 && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: '#2a2a2a' }}>
            <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
              Referral History
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: '#2a2a2a' }}>
            {data.referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-xs font-medium capitalize" style={{ color: '#f5f5f5' }}>
                    {r.plan} plan
                  </p>
                  <p className="text-[10px]" style={{ color: '#888888' }}>
                    {fmtDate(r.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>
                    ₦{Number(r.commission).toLocaleString()}
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full border capitalize"
                    style={{ borderColor: '#2a2a2a', color: '#888888' }}
                  >
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Withdrawal modal */}
      {showWithdraw && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
        >
          <div
            className="w-full max-w-md rounded-xl border p-6"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold" style={{ color: '#f5f5f5' }}>
                Request Withdrawal
              </h2>
              <button onClick={() => setShowWithdraw(false)} style={{ color: '#888888' }}>
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <label
                className="flex flex-col gap-1.5 text-xs font-medium"
                style={{ color: '#aaaaaa' }}
              >
                Amount (₦)
                <input
                  type="number"
                  value={wAmount}
                  onChange={(e) => setWAmount(e.target.value)}
                  max={data?.withdrawableBalance}
                  className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                  style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                />
              </label>
              <label
                className="flex flex-col gap-1.5 text-xs font-medium"
                style={{ color: '#aaaaaa' }}
              >
                Bank Name
                <input
                  value={wForm.bankName}
                  onChange={(e) => setWForm((f) => ({ ...f, bankName: e.target.value }))}
                  className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                  style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                />
              </label>
              <label
                className="flex flex-col gap-1.5 text-xs font-medium"
                style={{ color: '#aaaaaa' }}
              >
                Account Number
                <input
                  value={wForm.accountNumber}
                  onChange={(e) => setWForm((f) => ({ ...f, accountNumber: e.target.value }))}
                  className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                  style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                />
              </label>
              <label
                className="flex flex-col gap-1.5 text-xs font-medium"
                style={{ color: '#aaaaaa' }}
              >
                Account Name
                <input
                  value={wForm.accountName}
                  onChange={(e) => setWForm((f) => ({ ...f, accountName: e.target.value }))}
                  className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                  style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
                />
              </label>
              <button
                onClick={() => {
                  void submitWithdrawal();
                }}
                disabled={wSaving}
                className="w-full py-3 rounded-lg text-sm font-semibold disabled:opacity-50"
                style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
              >
                {wSaving ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
