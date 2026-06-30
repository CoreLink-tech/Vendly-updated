import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const body = await request.json() as { orderId: string; payerBankName: string };
  const { orderId, payerBankName } = body;

  if (!orderId || !payerBankName?.trim()) {
    return Response.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, orderNumber, vendorId')
    .eq('id', orderId)
    .single();

  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

  await supabase.from('orders').update({
    payerBankName: payerBankName.trim(),
    paymentStatus: 'awaiting_confirmation',
    updatedAt: new Date().toISOString(),
  }).eq('id', orderId);

  return Response.json({ success: true, orderNumber: order.orderNumber });
}
