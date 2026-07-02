import { supabase } from '@/lib/supabase';

function generateOrderNumber(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let num = 'VDL-';
  for (let i = 0; i < 8; i++) num += chars[Math.floor(Math.random() * chars.length)];
  return num;
}

export async function POST(request: Request) {
  const body = await request.json() as {
    vendorId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerLocation: string; // state — used to look up the logistics rate
    paymentMethod: 'full_payment' | 'payment_on_delivery';
    payerBankName?: string; // required for full_payment — the bank the buyer says they paid from
    items: Array<{ productId: string; quantity: number }>;
  };
  const { vendorId, customerName, customerPhone, customerAddress, customerLocation, paymentMethod, payerBankName, items } = body;

  if (!vendorId || !customerName || !customerPhone || !customerAddress || !customerLocation || !items?.length) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: vendor } = await supabase.from('vendors').select('useLogistics, allowPayOnDelivery, bankName, accountNumber, accountName').eq('id', vendorId).single();
  if (!vendor) return Response.json({ error: 'Store not found' }, { status: 404 });

  if (paymentMethod === 'payment_on_delivery' && !vendor.allowPayOnDelivery) {
    return Response.json({ error: 'This store does not accept Pay on Delivery' }, { status: 400 });
  }
  if (paymentMethod === 'full_payment') {
    if (!vendor.bankName || !vendor.accountNumber || !vendor.accountName) {
      return Response.json({ error: 'This store has not set up Pay Now yet' }, { status: 400 });
    }
    if (!payerBankName) {
      return Response.json({ error: 'Please confirm which bank you paid from' }, { status: 400 });
    }
  }

  for (const item of items) {
    if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000) {
      return Response.json({ error: 'Invalid item quantity' }, { status: 400 });
    }
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('vendorId', vendorId)
    .in('id', items.map(i => i.productId));
  if (!products?.length || products.length !== new Set(items.map(i => i.productId)).size) {
    return Response.json({ error: 'One or more products are unavailable' }, { status: 400 });
  }

  let subtotal = 0;
  const orderItems = items.map(item => {
    const product = products.find((p: { id: string }) => p.id === item.productId);
    if (!product) return null;
    const total = Number(product.price) * item.quantity;
    subtotal += total;
    return { productId: item.productId, name: product.name, price: Number(product.price), quantity: item.quantity, total };
  }).filter(Boolean);

  // Delivery fee is computed server-side — never trust a client-supplied amount.
  // Vendors who opted out of Vendly Logistics handle their own delivery, so no fee here.
  let deliveryFee = 0;
  if (vendor.useLogistics) {
    const { data: rate } = await supabase.from('logistics_rates').select('price').eq('state', customerLocation).single();
    deliveryFee = rate ? Number(rate.price) : 0;
  }

  const { data: order } = await supabase.from('orders').insert({
    vendorId,
    orderNumber: generateOrderNumber(),
    customerName,
    customerPhone,
    customerAddress,
    customerLocation,
    paymentMethod,
    paymentStatus: paymentMethod === 'full_payment' ? 'awaiting_confirmation' : 'pending',
    payerBankName: paymentMethod === 'full_payment' ? payerBankName : null,
    status: 'new',
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  }).select().single();
  if (!order) return Response.json({ error: 'Failed to create order' }, { status: 500 });

  await supabase.from('order_items').insert(orderItems.map(i => ({ ...i, orderId: order.id })));
  // Note: stock is intentionally NOT decremented here. Per the agreed model, stock
  // is only deducted once a sale is final — i.e. on delivery confirmation, handled
  // by settleOrderDelivery() in src/lib/orders.ts. This avoids holding stock hostage
  // to abandoned or unconfirmed orders.

  return Response.json({ order, orderNumber: order.orderNumber }, { status: 201 });
}
