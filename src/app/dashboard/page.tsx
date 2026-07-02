'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  pendingOrders: number;
  recentOrders: Order[];
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  total: number;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  accepted: '#8b5cf6',
  preparing_package: '#f59e0b',
  ready_for_pickup: '#f97316',
  logistics_assigned: '#06b6d4',
  picked_up: '#6366f1',
  in_transit: '#22c55e',
  delivered: '#22c55e',
  completed: '#22c55e',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New Order',
  accepted: 'Accepted',
  preparing_package: 'Preparing',
  ready_for_pickup: 'Ready for Pickup',
  logistics_assigned: 'Logistics Assigned',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  completed: 'Completed',
};


function StoreLinkBanner() {
  const [storeUrl, setStoreUrl] = useState('');

  useEffect(() => {
    fetch('/api/vendor/profile')
      .then((r) => r.json())
      .then((d) => {
        const data = d as { vendor: { slug?: string } | null };
        if (data.vendor?.slug) {
          setStoreUrl(`${window.location.origin}/store/${data.vendor.slug}`);
        }
      });
  }, []);

  if (!storeUrl) return null;

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg border mb-6"
      style={{ backgroundColor: '#111', borderColor: '#2a2a2a' }}
    >
      <span className="text-xs shrink-0" style={{ color: '#888888' }}>Your store:</span>
      <a
        href={storeUrl}
        target="_blank"
        className="text-xs font-mono truncate flex-1"
        style={{ color: '#22c55e' }}
      >
        {storeUrl}
      </a>
      <button
        onClick={() => { void navigator.clipboard.writeText(storeUrl); }}
        className="shrink-0 text-xs px-2 py-1 rounded border"
        style={{ borderColor: '#2a2a2a', color: '#888888' }}
      >
        Copy
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeViews, setStoreViews] = useState<{ today: number; week: number; total: number } | null>(null);

  useEffect(() => {
    fetch('/api/vendor/stats')
      .then((r) => r.json())
      .then((data) => { setStats(data as Stats); setLoading(false); })
      .catch(() => setLoading(false));

    fetch('/api/vendor/analytics')
      .then((r) => r.json())
      .then((data) => {
        const d = data as { storeViews?: { today: number; week: number; total: number } };
        if (d.storeViews) setStoreViews(d.storeViews);
      })
      .catch(() => {});
  }, []);

  const formatCurrency = (n: number) =>
    `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>
          Welcome back — here&apos;s an overview of your store.
        </p>
      </div>

      {/* Store link */}
      <StoreLinkBanner />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          { label: 'Total Products', value: stats?.totalProducts ?? 0, unit: '', href: '/dashboard/products' },
          { label: 'New Orders', value: stats?.pendingOrders ?? 0, unit: '', href: '/dashboard/orders' },
          { label: 'Total Orders', value: stats?.totalOrders ?? 0, unit: '', href: '/dashboard/orders' },
          { label: 'Revenue', value: formatCurrency(stats?.revenue ?? 0), unit: '', href: '/dashboard/orders' },
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
            <p className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Store views */}
      {storeViews !== null && (
        <div className="rounded-xl border p-4 mb-8" style={{ backgroundColor: '#111111', borderColor: '#2a2a2a' }}>
          <div className="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#22c55e' }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span className="text-xs font-semibold" style={{ color: '#f5f5f5' }}>Store Views</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Today', value: storeViews.today },
              { label: 'This Week', value: storeViews.week },
              { label: 'All Time', value: storeViews.total },
            ].map((v) => (
              <div key={v.label} className="rounded-lg p-3 text-center" style={{ backgroundColor: '#1a1a1a' }}>
                <p className="text-xl font-bold" style={{ color: '#22c55e' }}>{v.value.toLocaleString()}</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#888888' }}>{v.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/dashboard/products"
          className="flex items-center gap-4 p-4 rounded-xl border transition-colors"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <span className="flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
              Add Product
            </p>
            <p className="text-xs" style={{ color: '#888888' }}>
              Expand your catalogue
            </p>
          </div>
        </Link>
        <Link
          href="/dashboard/store-settings"
          className="flex items-center gap-4 p-4 rounded-xl border transition-colors"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <span className="flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
              Edit Store
            </p>
            <p className="text-xs" style={{ color: '#888888' }}>
              Update your store info
            </p>
          </div>
        </Link>
        <Link
          href="/dashboard/referrals"
          className="flex items-center gap-4 p-4 rounded-xl border transition-colors"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <span className="flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></span>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
              Refer & Earn
            </p>
            <p className="text-xs" style={{ color: '#888888' }}>
              Share your referral link
            </p>
          </div>
        </Link>
      </div>

      {/* Recent orders */}
      <div
        className="rounded-xl border"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: '#2a2a2a' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
            Recent Orders
          </h2>
          <Link href="/dashboard/orders" className="text-xs" style={{ color: '#22c55e' }}>
            View all →
          </Link>
        </div>
        {!stats?.recentOrders?.length ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: '#555555' }}>
              No orders yet. Share your store link to start selling!
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#2a2a2a' }}>
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#f5f5f5' }}>
                    {order.orderNumber}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#888888' }}>
                    {order.customerName}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs"
                    style={{ borderColor: '#2a2a2a' }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[order.status] || '#888888' }}
                    />
                    <span style={{ color: '#aaaaaa' }}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
                    ₦{Number(order.total).toLocaleString()}
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
