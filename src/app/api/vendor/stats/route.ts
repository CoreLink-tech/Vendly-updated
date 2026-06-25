import { auth } from '@/lib/auth';
import sql from '@/app/api/utils/sql';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const vendors = await sql`SELECT * FROM vendors WHERE "userId" = ${session.user.id} LIMIT 1`;
  if (!vendors.length) return Response.json({ error: 'Not found' }, { status: 404 });
  const vendor = vendors[0];

  const [totalProducts, totalOrders, recentOrders, pendingOrders] = await sql.transaction([
    sql`SELECT COUNT(*)::int as count FROM products WHERE "vendorId" = ${vendor.id}`,
    sql`SELECT COUNT(*)::int as count, COALESCE(SUM(total), 0)::numeric as revenue FROM orders WHERE "vendorId" = ${vendor.id} AND status = 'completed'`,
    sql`SELECT * FROM orders WHERE "vendorId" = ${vendor.id} ORDER BY "createdAt" DESC LIMIT 5`,
    sql`SELECT COUNT(*)::int as count FROM orders WHERE "vendorId" = ${vendor.id} AND status = 'new'`,
  ]);

  return Response.json({
    totalProducts: totalProducts[0].count,
    totalOrders: totalOrders[0].count,
    revenue: totalOrders[0].revenue,
    recentOrders,
    pendingOrders: pendingOrders[0].count,
  });
}
