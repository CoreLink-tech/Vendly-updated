import { auth } from '@/lib/auth';
import sql from '@/app/api/utils/sql';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Get user with role
  const users = await sql`SELECT * FROM "user" WHERE id = ${userId}`;
  if (!users.length) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  const user = users[0];

  // Get vendor profile if exists
  const vendors = await sql`SELECT * FROM vendors WHERE "userId" = ${userId} LIMIT 1`;
  const vendor = vendors[0] || null;

  // If vendor, get subscription
  let subscription = null;
  if (vendor) {
    const subs = await sql`
      SELECT * FROM subscriptions WHERE "vendorId" = ${vendor.id} AND status = 'active' ORDER BY "createdAt" DESC LIMIT 1
    `;
    subscription = subs[0] || null;
  }

  return Response.json({ user, vendor, subscription });
}
