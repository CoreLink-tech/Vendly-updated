import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id')?.trim();
  if (!id) return Response.json({ error: 'Order ID required' }, { status: 400 });

  const { data: order } = await supabase
    .from('orders')
    .select('id, orderNumber, customerName, status, createdAt, updatedAt')
    .eq('orderNumber', id)
    .single();

  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

  return Response.json({ order });
}
