import sql from '@/app/api/utils/sql';

function generateOrderNumber(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let num = 'VDL-';
  for (let i = 0; i < 8; i++) {
    num += chars[Math.floor(Math.random() * chars.length)];
  }
  return num;
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    vendorId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerLocation: string;
    paymentMethod: 'full_payment' | 'payment_on_delivery';
    items: Array<{ productId: string; quantity: number }>;
    deliveryFee?: number;
  };

  const {
    vendorId,
    customerName,
    customerPhone,
    customerAddress,
    customerLocation,
    paymentMethod,
    items,
    deliveryFee = 0,
  } = body;

  if (!vendorId || !customerName || !customerPhone || !customerAddress || !items?.length) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Get product details
  const productIds = items.map((i) => i.productId);
  const placeholders = productIds.map((_, idx) => `$${idx + 1}`).join(', ');
  const products = await sql(`SELECT * FROM products WHERE id IN (${placeholders})`, productIds);

  if (!products.length) {
    return Response.json({ error: 'Products not found' }, { status: 404 });
  }

  // Calculate totals
  let subtotal = 0;
  const orderItems: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }> = [];

  for (const item of items) {
    const product = products.find((p: { id: string }) => p.id === item.productId);
    if (!product) continue;
    const itemTotal = parseFloat(product.price) * item.quantity;
    subtotal += itemTotal;
    orderItems.push({
      productId: item.productId,
      name: product.name,
      price: parseFloat(product.price),
      quantity: item.quantity,
      total: itemTotal,
    });
  }

  const total = subtotal + deliveryFee;
  const orderNumber = generateOrderNumber();

  // Create order
  const orderResult = await sql`
    INSERT INTO orders (
      "vendorId", "orderNumber", "customerName", "customerPhone",
      "customerAddress", "customerLocation", "paymentMethod",
      "paymentStatus", status, subtotal, "deliveryFee", total
    ) VALUES (
      ${vendorId}, ${orderNumber}, ${customerName}, ${customerPhone},
      ${customerAddress}, ${customerLocation}, ${paymentMethod},
      'pending', 'new', ${subtotal}, ${deliveryFee}, ${total}
    ) RETURNING *
  `;

  const order = orderResult[0];

  // Insert order items
  for (const item of orderItems) {
    await sql`
      INSERT INTO order_items ("orderId", "productId", name, price, quantity, total)
      VALUES (${order.id}, ${item.productId}, ${item.name}, ${item.price}, ${item.quantity}, ${item.total})
    `;
    // Decrement stock
    await sql`UPDATE products SET stock = GREATEST(stock - ${item.quantity}, 0) WHERE id = ${item.productId}`;
  }

  return Response.json({ order, orderNumber }, { status: 201 });
}
