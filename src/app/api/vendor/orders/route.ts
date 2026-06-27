import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

async function getVendorId(userId: string) {
  const { data } = await supabase.from('vendors').select('id').eq('userId', userId).single();
  return data?.id || null;
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ orders: [] });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';

  let query = supabase.from('orders').select('*, order_items(*)').eq('vendorId', vendorId).order('createdAt', { ascending: false });
  if (status) query = query.eq('status', status);

  const { data: orders } = await query;
  return Response.json({ orders });
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json() as { orderId: string; status: string };
  const { orderId, status } = body;

  const { data: orderCheck } = await supabase.from('orders').select('id').eq('id', orderId).eq('vendorId', vendorId).single();
  if (!orderCheck) return Response.json({ error: 'Order not found' }, { status: 404 });

  await supabase.from('orders').update({ status, updatedAt: new Date().toISOString() }).eq('id', orderId);

  const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
  return Response.json({ order });
}
