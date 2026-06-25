import { auth } from '@/lib/auth';
import sql from '@/app/api/utils/sql';
import { headers } from 'next/headers';

async function requireAdmin(userId: string) {
  const users = await sql`SELECT role FROM "user" WHERE id = ${userId}`;
  if (!users.length || users[0].role !== 'admin') throw new Error('Forbidden');
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await requireAdmin(session.user.id);
  } catch {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [
    totalVendors,
    activeVendors,
    pendingVendors,
    totalOrders,
    totalProducts,
    pendingWithdrawals,
    recentVendors,
  ] = await sql.transaction([
    sql`SELECT COUNT(*)::int as count FROM vendors`,
    sql`SELECT COUNT(*)::int as count FROM vendors WHERE status = 'active'`,
    sql`SELECT COUNT(*)::int as count FROM vendors WHERE status = 'pending'`,
    sql`SELECT COUNT(*)::int as count FROM orders`,
    sql`SELECT COUNT(*)::int as count FROM products`,
    sql`SELECT COUNT(*)::int as count, COALESCE(SUM(amount), 0)::numeric as total FROM withdrawals WHERE status = 'pending'`,
    sql`
      SELECT v."businessName", v.status, v."createdAt", u.email
      FROM vendors v JOIN "user" u ON u.id = v."userId"
      ORDER BY v."createdAt" DESC LIMIT 5
    `,
  ]);

  return Response.json({
    totalVendors: totalVendors[0].count,
    activeVendors: activeVendors[0].count,
    pendingVendors: pendingVendors[0].count,
    totalOrders: totalOrders[0].count,
    totalProducts: totalProducts[0].count,
    pendingWithdrawals: pendingWithdrawals[0],
    recentVendors,
  });
}
