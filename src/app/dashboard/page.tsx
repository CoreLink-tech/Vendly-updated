'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty';
import {
  Package,
  ShoppingBag,
  Wallet,
  Clock,
  Eye,
  Plus,
  Store,
  Share2,
  Copy,
  Check,
} from 'lucide-react';

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

interface ProductAnalytic {
  productId: string;
  name: string;
  stock: number;
  totalUnitsSold: number;
  totalRevenue: number;
}

function formatCurrency(n: number) {
  return `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
}

function StoreLinkBanner() {
  const [storeUrl, setStoreUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/vendor/profile')
      .then((r) => r.json())
      .then((d) => {
        const data = d as { vendor: { slug?: string } | null };
        if (data.vendor?.slug) {
          setStoreUrl(`${SITE_URL}/store/${data.vendor.slug}`);
        }
      });
  }, []);

  if (!storeUrl) return null;

  return (
    <Card className="mb-6 flex-row items-center gap-3 p-3">
      <Store className="size-4 shrink-0 text-muted-foreground" />
      <span className="shrink-0 text-xs text-muted-foreground">Your store:</span>
      <a
        href={storeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 truncate font-mono text-xs text-primary"
      >
        {storeUrl}
      </a>
      <button
        onClick={() => {
          void navigator.clipboard.writeText(storeUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent"
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <div className="mb-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  {
    href: '/dashboard/products',
    label: 'Add Product',
    desc: 'Expand your catalogue',
    icon: Plus,
  },
  {
    href: '/dashboard/store-settings',
    label: 'Edit Store',
    desc: 'Update your store info',
    icon: Store,
  },
  {
    href: '/dashboard/referrals',
    label: 'Refer & Earn',
    desc: 'Share your referral link',
    icon: Share2,
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<ProductAnalytic[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeViews, setStoreViews] = useState<{ today: number; week: number; total: number } | null>(null);

  useEffect(() => {
    fetch('/api/vendor/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(data as Stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/vendor/analytics')
      .then((r) => r.json())
      .then((data) => {
        const d = data as {
          storeViews?: { today: number; week: number; total: number };
          analytics?: ProductAnalytic[];
        };
        if (d.storeViews) setStoreViews(d.storeViews);
        if (d.analytics) setAnalytics(d.analytics);
      })
      .catch(() => {});
  }, []);

  if (loading) return <DashboardSkeleton />;

  const topProducts = [...analytics]
    .sort((a, b) => Number(b.totalRevenue) - Number(a.totalRevenue))
    .slice(0, 5)
    .filter((p) => Number(p.totalRevenue) > 0 || Number(p.totalUnitsSold) > 0);

  const lowStock = analytics
    .filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 5)
    .sort((a, b) => Number(a.stock) - Number(b.stock))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome back — here's an overview of your store."
      />

      <StoreLinkBanner />

      {/* Stat cards */}
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatCurrency(stats?.revenue ?? 0)}
          href="/dashboard/orders"
          icon={<Wallet className="size-4" />}
        />
        <StatCard
          label="Total Orders"
          value={stats?.totalOrders ?? 0}
          href="/dashboard/orders"
          icon={<ShoppingBag className="size-4" />}
        />
        <StatCard
          label="New Orders"
          value={stats?.pendingOrders ?? 0}
          trend={stats?.pendingOrders ? 'Needs your attention' : undefined}
          href="/dashboard/orders"
          icon={<Clock className="size-4" />}
        />
        <StatCard
          label="Products"
          value={stats?.totalProducts ?? 0}
          href="/dashboard/products"
          icon={<Package className="size-4" />}
        />
      </div>

      {/* Store views */}
      {storeViews !== null && (
        <Card className="mb-6 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Eye className="size-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Store Views</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Today', value: storeViews.today },
              { label: 'This Week', value: storeViews.week },
              { label: 'All Time', value: storeViews.total },
            ].map((v) => (
              <div key={v.label} className="rounded-lg p-2 text-center">
                <p className="text-xl font-bold text-primary">{v.value.toLocaleString()}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{v.label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick actions */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {QUICK_ACTIONS.map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="flex-row items-center gap-4 p-4 transition-colors hover:border-primary/40">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Top products + Recent orders */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Top products (real analytics data, sorted by revenue) */}
        <Card className="gap-0 p-0 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">Top Products</h2>
            <Link href="/dashboard/analytics" className="text-xs text-primary">
              View all →
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <Empty className="border-none py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Package />
                </EmptyMedia>
                <EmptyTitle>No sales data yet</EmptyTitle>
                <EmptyDescription>
                  Top products by revenue will show up here once you make your first sale.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="divide-y divide-border">
              {topProducts.map((p) => (
                <div key={p.productId} className="flex items-center justify-between px-6 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.totalUnitsSold} sold
                      {Number(p.stock) <= 5 && (
                        <span className="text-destructive"> · low stock ({p.stock} left)</span>
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-foreground">
                    {formatCurrency(p.totalRevenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent orders */}
        <Card className="gap-0 p-0">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-xs text-primary">
              View all →
            </Link>
          </div>
          {!stats?.recentOrders?.length ? (
            <Empty className="border-none py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShoppingBag />
                </EmptyMedia>
                <EmptyTitle>No orders yet</EmptyTitle>
                <EmptyDescription>
                  Share your store link to start selling.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="divide-y divide-border">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="px-6 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
                    <span className="text-sm font-semibold text-foreground">
                      ₦{Number(order.total).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{order.customerName}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card className="mt-4 gap-0 p-0">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">Low Stock</h2>
          </div>
          <div className="divide-y divide-border">
            {lowStock.map((p) => (
              <div key={p.productId} className="flex items-center justify-between px-6 py-3">
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <span className="text-xs font-semibold text-destructive">{p.stock} left</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
