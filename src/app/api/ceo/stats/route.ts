import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MONTHLY_PRICE = 4000;
const YEARLY_PRICE = 40000;

function priceFor(plan: string): number {
  return plan === 'yearly' ? YEARLY_PRICE : MONTHLY_PRICE;
}

async function requireCeo(userId: string) {
  const { data } = await supabase.from('user').select('role').eq('id', userId).single();
  if (!data || (data.role !== 'ceo' && data.role !== 'admin')) throw new Error('Forbidden');
}

function startOfMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function startOfPrevMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString();
}

function startOfYear(): string {
  const d = new Date();
  return new Date(d.getFullYear(), 0, 1).toISOString();
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await requireCeo(session.user.id);
  } catch {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [
    { count: registered },
    { count: activated },
    { data: allUsedCodes },
    { data: activeSubs },
    { data: allSubsEver },
    { data: withdrawalsPending },
  ] = await Promise.all([
    supabase.from('vendors').select('*', { count: 'exact', head: true }),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('activation_codes').select('plan, usedAt, usedBy').eq('status', 'used'),
    supabase.from('subscriptions').select('id, plan, status, vendorId, startDate, endDate').eq('status', 'active'),
    supabase.from('subscriptions').select('id, plan, status, vendorId, startDate, endDate'),
    supabase.from('withdrawals').select('amount').eq('status', 'pending'),
  ]);

  const usedCodes = allUsedCodes || [];
  const subsEver = allSubsEver || [];
  const active = activeSubs || [];

  // ---- Revenue (derived from used activation codes = actual completed sales) ----
  const totalRevenue = usedCodes.reduce((sum, c) => sum + priceFor(c.plan), 0);

  const monthStart = startOfMonth();
  const prevMonthStart = startOfPrevMonth();
  const yearStart = startOfYear();

  const revenueThisMonth = usedCodes
    .filter((c) => c.usedAt && c.usedAt >= monthStart)
    .reduce((sum, c) => sum + priceFor(c.plan), 0);

  const revenuePrevMonth = usedCodes
    .filter((c) => c.usedAt && c.usedAt >= prevMonthStart && c.usedAt < monthStart)
    .reduce((sum, c) => sum + priceFor(c.plan), 0);

  const revenueThisYear = usedCodes
    .filter((c) => c.usedAt && c.usedAt >= yearStart)
    .reduce((sum, c) => sum + priceFor(c.plan), 0);

  const revenueGrowthPct =
    revenuePrevMonth > 0 ? ((revenueThisMonth - revenuePrevMonth) / revenuePrevMonth) * 100 : null;

  // ---- Paid accounts / MRR ----
  const activeMonthly = active.filter((s) => s.plan === 'monthly');
  const activeYearly = active.filter((s) => s.plan === 'yearly');
  const paidAccounts = active.length;
  const mrr = activeMonthly.length * MONTHLY_PRICE + (activeYearly.length * YEARLY_PRICE) / 12;
  const arr = mrr * 12;
  const arpu = paidAccounts > 0 ? totalRevenue / usedCodes.length : 0;

  // ---- Churn: subscriptions that ended vs total ever created ----
  const endedSubs = subsEver.filter((s) => s.status === 'expired' || s.status === 'cancelled');
  const churnRate = subsEver.length > 0 ? (endedSubs.length / subsEver.length) * 100 : 0;

  // ---- Retention: vendors with more than one subscription row (renewed) ----
  const subsByVendor = new Map<string, number>();
  for (const s of subsEver) {
    subsByVendor.set(s.vendorId, (subsByVendor.get(s.vendorId) || 0) + 1);
  }
  const retained = Array.from(subsByVendor.values()).filter((n) => n > 1).length;

  // ---- Expiring soon (next 7 days) ----
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const expiringSoon = active.filter((s) => s.endDate && s.endDate <= in7Days).length;

  // ---- Plan breakdown by revenue ----
  const monthlySalesCount = usedCodes.filter((c) => c.plan === 'monthly').length;
  const yearlySalesCount = usedCodes.filter((c) => c.plan === 'yearly').length;

  const pendingWithdrawalsTotal = (withdrawalsPending || []).reduce(
    (sum: number, w: { amount: number }) => sum + Number(w.amount),
    0
  );

  return Response.json({
    overview: {
      registered: registered || 0,
      activated: activated || 0,
      paidAccounts,
      mrr: Math.round(mrr),
      arr: Math.round(arr),
      totalRevenue,
      churnRate: Number(churnRate.toFixed(1)),
      arpu: Math.round(arpu),
    },
    revenue: {
      thisMonth: revenueThisMonth,
      prevMonth: revenuePrevMonth,
      thisYear: revenueThisYear,
      allTime: totalRevenue,
      growthPct: revenueGrowthPct === null ? null : Number(revenueGrowthPct.toFixed(1)),
    },
    funnel: {
      registered: registered || 0,
      activated: activated || 0,
      paid: paidAccounts,
      retained,
    },
    subscriptions: {
      active: paidAccounts,
      monthly: activeMonthly.length,
      yearly: activeYearly.length,
      expiringSoon,
      expired: subsEver.filter((s) => s.status === 'expired').length,
      cancelled: subsEver.filter((s) => s.status === 'cancelled').length,
    },
    planPerformance: [
      {
        plan: 'monthly',
        customers: activeMonthly.length,
        totalSales: monthlySalesCount,
        revenue: monthlySalesCount * MONTHLY_PRICE,
      },
      {
        plan: 'yearly',
        customers: activeYearly.length,
        totalSales: yearlySalesCount,
        revenue: yearlySalesCount * YEARLY_PRICE,
      },
    ],
    financial: {
      pendingWithdrawals: pendingWithdrawalsTotal,
    },
    dataNote:
      'Revenue figures are derived from used activation codes at fixed plan prices — Vendly has no payment gateway, so failed/pending/refunded transactions cannot be tracked.',
  });
}
