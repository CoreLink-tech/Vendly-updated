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

  const orders = await sql`
    SELECT o.*, v."businessName" as "vendorName"
    FROM orders o
    JOIN vendors v ON v.id = o."vendorId"
    ORDER BY o."createdAt" DESC
    LIMIT 200
  `;

  return Response.json({ orders });
}
