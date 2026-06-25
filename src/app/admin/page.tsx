'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalVendors: number;
  activeVendors: number;
  pendingVendors: number;
  totalOrders: number;
  totalProducts: number;
  pendingWithdrawals: { count: number; total: number };
  recentVendors: Array<{ businessName: string; status: string; createdAt: string; email: string }>;
}

function fmtDate(str: string) {
  return str ? str.slice(0, 10) : '';
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => {
        setStats(d as Stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Admin Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>
          Platform overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Vendors', value: stats?.totalVendors ?? 0, href: '/admin/vendors' },
          { label: 'Active Vendors', value: stats?.activeVendors ?? 0, href: '/admin/vendors' },
          {
            label: 'Pending Activation',
            value: stats?.pendingVendors ?? 0,
            href: '/admin/vendors',
          },
          { label: 'Total Orders', value: stats?.totalOrders ?? 0, href: '/admin/orders' },
          { label: 'Total Products', value: stats?.totalProducts ?? 0, href: '/admin/vendors' },
          {
            label: 'Pending Withdrawals',
            value: `${stats?.pendingWithdrawals?.count ?? 0} (₦${Number(stats?.pendingWithdrawals?.total ?? 0).toLocaleString()})`,
            href: '/admin/withdrawals',
          },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="p-5 rounded-xl border block transition-colors"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: '#888888' }}>
              {card.label}
            </p>
            <p className="text-xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Generate Codes', href: '/admin/activations', icon: '🔑' },
          { label: 'Activate Vendor', href: '/admin/vendors', icon: '✅' },
          { label: 'Review Withdrawals', href: '/admin/withdrawals', icon: '💰' },
          { label: 'View Ambassadors', href: '/admin/ambassadors', icon: '🤝' },
        ].map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-colors"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <span className="text-2xl">{a.icon}</span>
            <p className="text-xs font-medium" style={{ color: '#aaaaaa' }}>
              {a.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent vendors */}
      <div
        className="rounded-xl border"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: '#2a2a2a' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
            Recent Vendors
          </h2>
          <Link href="/admin/vendors" className="text-xs" style={{ color: '#39FF14' }}>
            View all →
          </Link>
        </div>
        {!stats?.recentVendors?.length ? (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: '#555555' }}>
              No vendors yet.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#2a2a2a' }}>
            {stats.recentVendors.map((v, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#f5f5f5' }}>
                    {v.businessName || '—'}
                  </p>
                  <p className="text-xs" style={{ color: '#888888' }}>
                    {v.email}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs"
                    style={{ borderColor: '#2a2a2a' }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          v.status === 'active'
                            ? '#22c55e'
                            : v.status === 'pending'
                              ? '#f59e0b'
                              : '#ef4444',
                      }}
                    />
                    <span className="capitalize" style={{ color: '#aaaaaa' }}>
                      {v.status}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: '#555555' }}>
                    {fmtDate(v.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
