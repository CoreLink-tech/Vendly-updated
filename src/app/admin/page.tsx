'use client';
import { NavIcon, IconName } from '@/components/NavIcon';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { theme } from '@/lib/theme';

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
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: theme.ink }}>
          Admin Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: theme.muted }}>
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
            style={{ backgroundColor: theme.surface, borderColor: theme.line }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: theme.muted }}>
              {card.label}
            </p>
            <p className="text-xl font-semibold tracking-tight" style={{ color: theme.ink }}>
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Generate Codes', href: '/admin/activations', icon: 'key' as const },
          { label: 'Activate Vendor', href: '/admin/vendors', icon: 'check' as const },
          { label: 'Review Withdrawals', href: '/admin/withdrawals', icon: 'money' as const },
          { label: 'View Ambassadors', href: '/admin/ambassadors', icon: 'ambassador' as const },
        ].map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-colors"
            style={{ backgroundColor: theme.surface, borderColor: theme.line }}
          >
            <NavIcon name={a.icon} />
            <p className="text-xs font-medium" style={{ color: theme.muted }}>
              {a.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent vendors */}
      <div
        className="rounded-xl border"
        style={{ backgroundColor: theme.surface, borderColor: theme.line }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: theme.line }}
        >
          <h2 className="text-sm font-semibold" style={{ color: theme.ink }}>
            Recent Vendors
          </h2>
          <Link href="/admin/vendors" className="text-xs" style={{ color: theme.green }}>
            View all →
          </Link>
        </div>
        {!stats?.recentVendors?.length ? (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: theme.faint }}>
              No vendors yet.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: theme.line }}>
            {stats.recentVendors.map((v, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: theme.ink }}>
                    {v.businessName || '—'}
                  </p>
                  <p className="text-xs" style={{ color: theme.muted }}>
                    {v.email}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs"
                    style={{ borderColor: theme.line }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          v.status === 'active'
                            ? theme.green
                            : v.status === 'pending'
                              ? theme.orange
                              : '#ef4444',
                      }}
                    />
                    <span className="capitalize" style={{ color: theme.muted }}>
                      {v.status}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: theme.faint }}>
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
