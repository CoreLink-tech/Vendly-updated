import { auth } from '@/lib/auth';
import sql from '@/app/api/utils/sql';
import { headers } from 'next/headers';

async function getVendorId(userId: string): Promise<string | null> {
  const vendors = await sql`SELECT id FROM vendors WHERE "userId" = ${userId} LIMIT 1`;
  return vendors[0]?.id || null;
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ orders: [] });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';

  const orders = status
    ? await sql(
        `
        SELECT o.*,
          (SELECT json_agg(oi.*) FROM order_items oi WHERE oi."orderId" = o.id) as items
        FROM orders o WHERE o."vendorId" = $1 AND o.status = $2 ORDER BY o."createdAt" DESC
      `,
        [vendorId, status]
      )
    : await sql(
        `
        SELECT o.*,
          (SELECT json_agg(oi.*) FROM order_items oi WHERE oi."orderId" = o.id) as items
        FROM orders o WHERE o."vendorId" = $1 ORDER BY o."createdAt" DESC
      `,
        [vendorId]
      );

  return Response.json({ orders });
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ error: 'Not found' }, { status: 404 });

  const body = (await request.json()) as { orderId: string; status: string };
  const { orderId, status } = body;

  // Verify ownership
  const orderCheck =
    await sql`SELECT id FROM orders WHERE id = ${orderId} AND "vendorId" = ${vendorId}`;
  if (!orderCheck.length) return Response.json({ error: 'Order not found' }, { status: 404 });

  await sql`UPDATE orders SET status = ${status}, "updatedAt" = NOW() WHERE id = ${orderId}`;

  // If setting to ready_for_pickup, create logistics request
  if (status === 'ready_for_pickup') {
    const [order, vendor] = await Promise.all([
      sql`SELECT * FROM orders WHERE id = ${orderId}`,
      sql`SELECT * FROM vendors WHERE id = ${vendorId}`,
    ]);
    const o = order[0];
    const v = vendor[0];

    const existing =
      await sql`SELECT id FROM logistics_requests WHERE "orderId" = ${orderId} LIMIT 1`;
    if (!existing.length) {
      await sql`
        INSERT INTO logistics_requests (
          "orderId", "vendorId", "vendorName", "vendorAddress", "vendorPhone",
          "customerName", "customerAddress", "customerPhone",
          "paymentMethod", amount, "deliveryFee", status
        ) VALUES (
          ${orderId}, ${vendorId}, ${v.businessName}, ${v.address}, ${v.phone},
          ${o.customerName}, ${o.customerAddress}, ${o.customerPhone},
          ${o.paymentMethod}, ${o.total}, ${o.deliveryFee}, 'awaiting_assignment'
        )
      `;
    }
  }

  const updated = await sql`SELECT * FROM orders WHERE id = ${orderId}`;
  return Response.json({ order: updated[0] });
}
