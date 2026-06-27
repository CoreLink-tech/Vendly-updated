import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: vendor } = await supabase.from('vendors').select('*').eq('userId', session.user.id).single();
  if (!vendor) return Response.json({ error: 'Not found' }, { status: 404 });

  const [
    { count: totalProducts },
    { data: completedOrders },
    { data: recentOrders },
    { count: pendingOrders },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('vendorId', vendor.id),
    supabase.from('orders').select('total').eq('vendorId', vendor.id).eq('status', 'delivered'),
    supabase.from('orders').select('*').eq('vendorId', vendor.id).order('createdAt', { ascending: false }).limit(5),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('vendorId', vendor.id).eq('status', 'new'),
  ]);

  const revenue = (completedOrders || []).reduce((sum: number, o: { total: number }) => sum + Number(o.total), 0);

  return Response.json({ totalProducts, totalOrders: completedOrders?.length || 0, revenue, recentOrders, pendingOrders });
}
