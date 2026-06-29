'use client';

import { useEffect, useState } from 'react';

interface ProductAnalytic {
  productId: string;
  vendorId: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  totalViews: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  totalUnitsSold: number;
  totalRevenue: number;
  totalOrders: number;
}

type SortKey = 'totalViews' | 'totalUnitsSold' | 'totalRevenue' | 'viewsLast7Days';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<ProductAnalytic[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>('totalViews');

  useEffect(() => {
    fetch('/api/vendor/analytics')
      .then((r) => r.json())
      .then((d) => {
        setAnalytics((d as { analytics: ProductAnalytic[] }).analytics);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sorted = [...analytics].sort((a, b) => Number(b[sort]) - Number(a[sort]));
  const maxViews = Math.max(...analytics.map((a) => Number(a.totalViews)), 1);
  const totalViews = analytics.reduce((s, a) => s + Number(a.totalViews), 0);
  const totalRevenue = analytics.reduce((s, a) => s + Number(a.totalRevenue), 0);
  const totalSold = analytics.reduce((s, a) => s + Number(a.totalUnitsSold), 0);

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => setSort(k)}
      className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors"
      style={{
        borderColor: sort === k ? '#22c55e' : '#2a2a2a',
        color: sort === k ? '#22c55e' : '#888888',
        backgroundColor: sort === k ? '#22c55e10' : 'transparent',
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>Product Analytics</h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>How your products are performing — views, sales, and revenue.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Views', value: totalViews.toLocaleString() },
          { label: 'Units Sold', value: totalSold.toLocaleString() },
          { label: 'Product Revenue', value: `₦${Number(totalRevenue).toLocaleString()}` },
        ].map((c) => (
          <div key={c.label} className="p-5 rounded-xl border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <p className="text-xs font-medium mb-2" style={{ color: '#888888' }}>{c.label}</p>
            <p className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs" style={{ color: '#555' }}>Sort by:</span>
        <SortBtn k="totalViews" label="All-time Views" />
        <SortBtn k="viewsLast7Days" label="Views (7 days)" />
        <SortBtn k="totalUnitsSold" label="Units Sold" />
        <SortBtn k="totalRevenue" label="Revenue" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }} />
        </div>
      ) : analytics.length === 0 ? (
        <div className="text-center py-20 rounded-xl border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: '#f5f5f5' }}>No analytics yet</p>
          <p className="text-xs" style={{ color: '#888888' }}>Analytics will appear once buyers start viewing your products.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b text-xs font-medium" style={{ borderColor: '#2a2a2a', color: '#555555' }}>
            <div className="col-span-4">Product</div>
            <div className="col-span-2 text-right">Views (total)</div>
            <div className="col-span-2 text-right">Views (7d)</div>
            <div className="col-span-1 text-right">Sold</div>
            <div className="col-span-2 text-right">Revenue</div>
            <div className="col-span-1 text-right">Orders</div>
          </div>

          {sorted.map((item, idx) => (
            <div key={item.productId} className="grid grid-cols-12 gap-4 px-5 py-4 border-b items-center" style={{ borderColor: '#2a2a2a' }}>
              {/* Rank + name */}
              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono shrink-0 w-5 text-right" style={{ color: '#555' }}>#{idx + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#f5f5f5' }}>{item.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#555' }}>₦{Number(item.price).toLocaleString()} · Stock: {item.stock}</p>
                  {/* View bar */}
                  <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#2a2a2a', width: '100%' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(Number(item.totalViews) / maxViews) * 100}%`, backgroundColor: '#22c55e' }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2 text-right">
                <span className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>{Number(item.totalViews).toLocaleString()}</span>
              </div>

              <div className="col-span-2 text-right">
                <span className="text-sm" style={{ color: Number(item.viewsLast7Days) > 0 ? '#22c55e' : '#555' }}>
                  {Number(item.viewsLast7Days).toLocaleString()}
                </span>
              </div>

              <div className="col-span-1 text-right">
                <span className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>{Number(item.totalUnitsSold).toLocaleString()}</span>
              </div>

              <div className="col-span-2 text-right">
                <span className="text-sm font-semibold" style={{ color: '#22c55e' }}>₦{Number(item.totalRevenue).toLocaleString()}</span>
              </div>

              <div className="col-span-1 text-right">
                <span className="text-sm" style={{ color: '#888' }}>{Number(item.totalOrders).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
