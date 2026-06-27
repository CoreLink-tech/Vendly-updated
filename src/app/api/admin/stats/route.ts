import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

async function requireAdmin(userId: string) {
  const { data } = await supabase.from('user').select('role').eq('id', userId).single();
  if (!data || data.role !== 'admin') throw new Error('Forbidden');
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const [
    { count: totalVendors },
    { count: activeVendors },
    { count: pendingVendors },
    { count: totalOrders },
    { count: totalProducts },
    { data: pendingWithdrawals },
    { data: recentVendors },
  ] = await Promise.all([
    supabase.from('vendors').select('*', { count: 'exact', head: true }),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('withdrawals').select('amount').eq('status', 'pending'),
    supabase.from('vendors').select('businessName, status, createdAt, user(email)').order('createdAt', { ascending: false }).limit(5),
  ]);

  const pendingTotal = (pendingWithdrawals || []).reduce((sum: number, w: { amount: number }) => sum + Number(w.amount), 0);

  return Response.json({
    totalVendors, activeVendors, pendingVendors,
    totalOrders, totalProducts,
    pendingWithdrawals: { count: (pendingWithdrawals || []).length, total: pendingTotal },
    recentVendors,
  });
}
