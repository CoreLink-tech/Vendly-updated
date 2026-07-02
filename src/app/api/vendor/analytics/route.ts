import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

async function getVendorId(userId: string) {
  const { data } = await supabase.from('vendors').select('id').eq('userId', userId).single();
  return data?.id || null;
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ analytics: [], storeViews: { today: 0, week: 0, total: 0 } });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: analytics },
    { count: viewsToday },
    { count: viewsWeek },
    { count: viewsTotal },
  ] = await Promise.all([
    supabase.from('product_analytics').select('*').eq('vendorId', vendorId).order('totalViews', { ascending: false }),
    supabase.from('store_visits').select('*', { count: 'exact', head: true }).eq('vendorId', vendorId).gte('visitedAt', todayStart),
    supabase.from('store_visits').select('*', { count: 'exact', head: true }).eq('vendorId', vendorId).gte('visitedAt', weekStart),
    supabase.from('store_visits').select('*', { count: 'exact', head: true }).eq('vendorId', vendorId),
  ]);

  return Response.json({
    analytics: analytics || [],
    storeViews: {
      today: viewsToday ?? 0,
      week: viewsWeek ?? 0,
      total: viewsTotal ?? 0,
    },
  });
}
