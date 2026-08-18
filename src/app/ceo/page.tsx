'use client';

import { useEffect, useState } from 'react';

type CeoStats = {
  overview: {
    registered: number;
    activated: number;
    paidAccounts: number;
    mrr: number;
    arr: number;
    totalRevenue: number;
    churnRate: number;
    arpu: number;
  };
  revenue: {
    thisMonth: number;
    prevMonth: number;
    thisYear: number;
    allTime: number;
    growthPct: number | null;
  };
  funnel: { registered: number; activated: number; paid: number; retained: number };
  subscriptions: {
    active: number;
    monthly: number;
    yearly: number;
    expiringSoon: number;
    expired: number;
    cancelled: number;
  };
  planPerformance: { plan: string; customers: number; totalSales: number; revenue: number }[];
  financial: { pendingWithdrawals: number };
  dataNote: string;
};

function naira(n: number): string {
  return `₦${n.toLocaleString('en-NG')}`;
}

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border p-5" style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}>
      <div className="text-xs mb-1" style={{ color: '#888888' }}>{label}</div>
      <div className="text-2xl font-semibold" style={{ color: '#f5f5f5' }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: '#22c55e' }}>{sub}</div>}
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="mb-8 scroll-mt-4">
      <h2 className="text-sm font-semibold mb-3 tracking-wide" style={{ color: '#888888' }}>
        {title.toUpperCase()}
      </h2>
      {children}
    </div>
  );
}

export default function CeoDashboard() {
  const [stats, setStats] = useState<CeoStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/ceo/stats', { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || 'Failed to load');
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="text-sm" style={{ color: '#ef4444' }}>{error}</div>;
  }

  if (!stats) {
    return <div className="text-sm" style={{ color: '#888888' }}>Loading business data…</div>;
  }

  const { overview, revenue, funnel, subscriptions, planPerformance, financial } = stats;

  return (
    <div>
      <Section id="overview" title="Business Overview">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card label="MRR" value={naira(overview.mrr)} />
          <Card label="ARR" value={naira(overview.arr)} />
          <Card label="Total Revenue (all time)" value={naira(overview.totalRevenue)} />
          <Card label="ARPU" value={naira(overview.arpu)} />
          <Card label="Registered Accounts" value={overview.registered.toLocaleString()} />
          <Card label="Activated Accounts" value={overview.activated.toLocaleString()} />
          <Card label="Paid Accounts" value={overview.paidAccounts.toLocaleString()} />
          <Card label="Churn Rate" value={`${overview.churnRate}%`} />
        </div>
      </Section>

      <Section id="revenue" title="Revenue">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            label="This Month"
            value={naira(revenue.thisMonth)}
            sub={
              revenue.growthPct === null
                ? undefined
                : `${revenue.growthPct >= 0 ? '↑' : '↓'} ${Math.abs(revenue.growthPct)}% vs last month`
            }
          />
          <Card label="Last Month" value={naira(revenue.prevMonth)} />
          <Card label="This Year" value={naira(revenue.thisYear)} />
          <Card label="All Time" value={naira(revenue.allTime)} />
        </div>
      </Section>

      <Section id="funnel" title="Customer Funnel">
        <div className="rounded-lg border p-5 space-y-3" style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}>
          {[
            { label: 'Registered', value: funnel.registered },
            { label: 'Activated', value: funnel.activated },
            { label: 'Paid', value: funnel.paid },
            { label: 'Retained (renewed)', value: funnel.retained },
          ].map((row, i) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: i === 0 ? '#f5f5f5' : '#cccccc' }}>{row.label}</span>
              <span className="text-lg font-semibold" style={{ color: '#f5f5f5' }}>
                {row.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="subscriptions" title="Subscriptions">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <Card label="Active" value={subscriptions.active.toLocaleString()} />
          <Card label="Monthly" value={subscriptions.monthly.toLocaleString()} />
          <Card label="Yearly" value={subscriptions.yearly.toLocaleString()} />
          <Card label="Expiring (7 days)" value={subscriptions.expiringSoon.toLocaleString()} />
          <Card label="Expired" value={subscriptions.expired.toLocaleString()} />
          <Card label="Cancelled" value={subscriptions.cancelled.toLocaleString()} />
        </div>

        <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#2a2a2a' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#111111' }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: '#888888' }}>Plan</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: '#888888' }}>Active Customers</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: '#888888' }}>Total Sales</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: '#888888' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {planPerformance.map((p) => (
                <tr key={p.plan} className="border-t" style={{ borderColor: '#2a2a2a' }}>
                  <td className="px-4 py-3 capitalize" style={{ color: '#f5f5f5' }}>{p.plan}</td>
                  <td className="px-4 py-3" style={{ color: '#cccccc' }}>{p.customers}</td>
                  <td className="px-4 py-3" style={{ color: '#cccccc' }}>{p.totalSales}</td>
                  <td className="px-4 py-3" style={{ color: '#22c55e' }}>{naira(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="financial" title="Financial Activity">
        <div className="grid grid-cols-2 gap-4">
          <Card label="Pending Withdrawals" value={naira(financial.pendingWithdrawals)} />
        </div>
      </Section>

      <div className="text-xs mt-6 pt-4 border-t" style={{ borderColor: '#2a2a2a', color: '#666666' }}>
        {stats.dataNote}
      </div>
    </div>
  );
}
