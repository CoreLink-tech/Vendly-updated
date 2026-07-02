import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';
import { settleOrderDelivery } from '@/lib/orders';

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

  const body = await request.json() as { orderId: string; status?: string; paymentStatus?: string };
  const { orderId, status, paymentStatus } = body;

  const { data: orderCheck } = await supabase
    .from('orders')
    .select('id, paymentMethod, paymentStatus')
    .eq('id', orderId)
    .eq('vendorId', vendorId)
    .single();
  if (!orderCheck) return Response.json({ error: 'Order not found' }, { status: 404 });

  if (paymentStatus === 'paid') {
    if (orderCheck.paymentMethod !== 'full_payment') {
      return Response.json({ error: 'Only bank transfer (Pay Now) orders can be marked paid this way' }, { status: 400 });
    }
    if (orderCheck.paymentStatus === 'paid') {
      return Response.json({ error: 'Already marked as paid' }, { status: 400 });
    }
    await supabase.from('orders').update({ paymentStatus: 'paid', paymentConfirmedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).eq('id', orderId);
  }

  if (status === 'delivered') {
    await settleOrderDelivery(orderId);
  } else if (status) {
    await supabase.from('orders').update({ status, updatedAt: new Date().toISOString() }).eq('id', orderId);
  }

  const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
  return Response.json({ order });
}
