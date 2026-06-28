import { supabase } from '@/lib/supabase';

function generateOrderNumber(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let num = 'VDL-';
  for (let i = 0; i < 8; i++) num += chars[Math.floor(Math.random() * chars.length)];
  return num;
}

export async function POST(request: Request) {
  const body = await request.json() as { vendorId: string; customerName: string; customerPhone: string; customerAddress: string; customerLocation: string; paymentMethod: 'full_payment' | 'payment_on_delivery'; items: Array<{ productId: string; quantity: number }>; deliveryFee?: number };
  const { vendorId, customerName, customerPhone, customerAddress, customerLocation, paymentMethod, items, deliveryFee = 0 } = body;

  if (!vendorId || !customerName || !customerPhone || !customerAddress || !items?.length) return Response.json({ error: 'Missing required fields' }, { status: 400 });

  const { data: products } = await supabase.from('products').select('*').in('id', items.map(i => i.productId));
  if (!products?.length) return Response.json({ error: 'Products not found' }, { status: 404 });

  let subtotal = 0;
  const orderItems = items.map(item => {
    const product = products.find((p: { id: string }) => p.id === item.productId);
    if (!product) return null;
    const total = Number(product.price) * item.quantity;
    subtotal += total;
    return { productId: item.productId, name: product.name, price: Number(product.price), quantity: item.quantity, total };
  }).filter(Boolean);

  const { data: order } = await supabase.from('orders').insert({ vendorId, orderNumber: generateOrderNumber(), customerName, customerPhone, customerAddress, customerLocation, paymentMethod, paymentStatus: 'pending', status: 'new', subtotal, deliveryFee, total: subtotal + deliveryFee }).select().single();
  if (!order) return Response.json({ error: 'Failed to create order' }, { status: 500 });

  await supabase.from('order_items').insert(orderItems.map(i => ({ ...i, orderId: order.id })));
  // Note: stock is intentionally NOT decremented here. Per the agreed model, stock
  // is only deducted once a sale is final — i.e. on delivery confirmation, handled
  // by settleOrderDelivery() in src/lib/orders.ts. This avoids holding stock hostage
  // to abandoned or unconfirmed orders.

  return Response.json({ order, orderNumber: order.orderNumber }, { status: 201 });
}
