'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { theme } from '@/lib/theme';

interface Stats {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerAddress: string;
    vendorName: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
}

const STATUS_COLOR: Record<string, string> = {
  new: theme.orange,
  confirmed: '#3b82f6',
  processing: '#8b5cf6',
  shipped: theme.green,
  delivered: theme.green,
  cancelled: '#ef4444',
};

function fmtDate(str: string) {
  return new Date(str).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function LogisticsOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/logistics/stats')
      .then((r) => r.json())
      .then((d) => { setStats(d as Stats); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: theme.green, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: theme.ink }}>Logistics Overview</h1>
        <p className="text-sm mt-1" style={{ color: theme.muted }}>All delivery operations at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: stats?.total ?? 0, href: '/logistics/orders', color: theme.ink },
          { label: 'Pending Pickup', value: stats?.pending ?? 0, href: '/logistics/pending', color: theme.orange },
          { label: 'In Transit', value: stats?.inTransit ?? 0, href: '/logistics/in-transit', color: theme.green },
          { label: 'Delivered', value: stats?.delivered ?? 0, href: '/logistics/delivered', color: theme.green },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="p-5 rounded-xl border block transition-colors hover:border-green-900"
            style={{ backgroundColor: theme.surface, borderColor: theme.line }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: theme.faint }}>{card.label}</p>
            <p className="text-2xl font-bold tracking-tight" style={{ color: card.color }}>{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: theme.surface, borderColor: theme.line }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: theme.line }}>
          <p className="text-sm font-semibold" style={{ color: theme.ink }}>Recent Orders</p>
          <Link href="/logistics/orders" className="text-xs" style={{ color: theme.green }}>View all →</Link>
        </div>
        {!stats?.recentOrders?.length ? (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: theme.faint }}>No orders yet.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: theme.line }}>
            {stats.recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-4 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold truncate" style={{ color: theme.ink }}>{o.customerName}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: STATUS_COLOR[o.status] + '20', color: STATUS_COLOR[o.status] }}>
                      {o.status}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: theme.muted }}>{o.customerAddress}</p>
                  <p className="text-xs" style={{ color: theme.faint }}>From: {o.vendorName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold" style={{ color: theme.ink }}>₦{Number(o.total).toLocaleString()}</p>
                  <p className="text-xs" style={{ color: theme.faint }}>{fmtDate(o.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
