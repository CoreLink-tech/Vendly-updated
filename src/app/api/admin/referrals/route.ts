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

  const referrals = await sql`
    SELECT r.*, 
      rv."businessName" as "referrerName",
      rfd."businessName" as "referredName"
    FROM referrals r
    LEFT JOIN vendors rv ON rv.id = r."referrerId"
    LEFT JOIN vendors rfd ON rfd.id = r."referredVendorId"
    ORDER BY r."createdAt" DESC
    LIMIT 200
  `;

  return Response.json({ referrals });
}
