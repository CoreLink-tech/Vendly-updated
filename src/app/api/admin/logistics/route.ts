import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';
import { settleOrderDelivery } from '@/lib/orders';

async function requireLogisticsStaff(userId: string) {
  const { data } = await supabase.from('user').select('role').eq('id', userId).single();
  if (!data || !['admin', 'logistics'].includes(data.role)) throw new Error('Forbidden');
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireLogisticsStaff(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';

  let query = supabase
    .from('orders')
    .select('*, vendors(businessName, phone, address)')
    .order('createdAt', { ascending: false })
    .limit(200);

  if (status) query = query.eq('status', status);

  const { data: orders } = await query;

  const requests_list = (orders || []).map((o: any) => ({
    id: o.id,
    orderId: o.orderNumber,
    vendorName: o.vendors?.businessName || '—',
    vendorAddress: o.vendors?.address || '—',
    vendorPhone: o.vendors?.phone || '—',
    customerName: o.customerName,
    customerAddress: o.customerAddress,
    customerPhone: o.customerPhone,
    paymentMethod: o.paymentMethod,
    amount: o.total,
    deliveryFee: o.deliveryFee,
    status: o.status,
    riderName: null,
    riderPhone: null,
    createdAt: o.createdAt,
  }));

  return Response.json({ requests: requests_list });
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireLogisticsStaff(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const body = await request.json() as { requestId: string; status: string; riderName?: string; riderPhone?: string };

  if (body.status === 'delivered') {
    const result = await settleOrderDelivery(body.requestId);
    if (!result.ok) return Response.json({ error: result.error }, { status: 404 });
    return Response.json({ success: true, oversold: 'oversold' in result ? result.oversold : false });
  }

  await supabase.from('orders').update({ status: body.status, updatedAt: new Date().toISOString() }).eq('id', body.requestId);
  return Response.json({ success: true });
}
