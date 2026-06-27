import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabase.from('user').select('role').eq('id', session.user.id).single();
  if (!user || !['admin', 'logistics'].includes(user.role)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [
    { count: total },
    { count: pending },
    { count: inTransit },
    { count: delivered },
    { count: cancelled },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['new', 'confirmed']),
    supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['processing', 'shipped']),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
    supabase.from('orders').select('id, orderNumber, customerName, customerAddress, total, status, createdAt, vendors(businessName)').order('createdAt', { ascending: false }).limit(10),
  ]);

  return Response.json({
    total, pending, inTransit, delivered, cancelled,
    recentOrders: (recentOrders || []).map((o: any) => ({
      ...o,
      vendorName: o.vendors?.businessName || '—',
    })),
  });
}
