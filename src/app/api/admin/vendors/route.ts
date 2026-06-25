import { auth } from '@/lib/auth';
import sql from '@/app/api/utils/sql';
import { headers } from 'next/headers';

async function requireAdmin(userId: string) {
  const users = await sql`SELECT role FROM "user" WHERE id = ${userId}`;
  if (!users.length || users[0].role !== 'admin') {
    throw new Error('Forbidden');
  }
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await requireAdmin(session.user.id);
  } catch {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  // Build dynamic query safely
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(
      `(LOWER(v."businessName") LIKE LOWER($${paramIdx}) OR LOWER(u.email) LIKE LOWER($${paramIdx}))`
    );
    values.push(`%${search}%`);
    paramIdx++;
  }
  if (status) {
    conditions.push(`v.status = $${paramIdx}`);
    values.push(status);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const vendors = await sql(
    `
    SELECT v.*, u.email, u.name as "userName",
      (SELECT row_to_json(s.*) FROM subscriptions s WHERE s."vendorId" = v.id AND s.status = 'active' ORDER BY s."createdAt" DESC LIMIT 1) as subscription,
      (SELECT COUNT(*) FROM products p WHERE p."vendorId" = v.id)::int as "productCount",
      (SELECT COUNT(*) FROM orders o WHERE o."vendorId" = v.id)::int as "orderCount"
    FROM vendors v
    JOIN "user" u ON u.id = v."userId"
    ${whereClause}
    ORDER BY v."createdAt" DESC
  `,
    values
  );

  return Response.json({ vendors });
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await requireAdmin(session.user.id);
  } catch {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json()) as {
    vendorId: string;
    action: 'activate' | 'suspend' | 'deactivate';
    plan?: 'monthly' | 'yearly';
  };
  const { vendorId, action, plan } = body;

  if (action === 'activate') {
    if (!plan) return Response.json({ error: 'Plan required' }, { status: 400 });

    await sql`UPDATE vendors SET status = 'active', "updatedAt" = NOW() WHERE id = ${vendorId}`;

    const existing =
      await sql`SELECT id FROM subscriptions WHERE "vendorId" = ${vendorId} AND status = 'active' LIMIT 1`;
    if (!existing.length) {
      if (plan === 'yearly') {
        await sql`
          INSERT INTO subscriptions ("vendorId", plan, status, "startDate", "endDate", "activatedBy")
          VALUES (${vendorId}, 'yearly', 'active', NOW(), NOW() + INTERVAL '1 year', ${session.user.id})
        `;
      } else {
        await sql`
          INSERT INTO subscriptions ("vendorId", plan, status, "startDate", "endDate", "activatedBy")
          VALUES (${vendorId}, 'monthly', 'active', NOW(), NOW() + INTERVAL '1 month', ${session.user.id})
        `;
      }
    }
  } else if (action === 'suspend') {
    await sql`UPDATE vendors SET status = 'suspended', "updatedAt" = NOW() WHERE id = ${vendorId}`;
  } else if (action === 'deactivate') {
    await sql`UPDATE vendors SET status = 'pending', "updatedAt" = NOW() WHERE id = ${vendorId}`;
    await sql`UPDATE subscriptions SET status = 'cancelled' WHERE "vendorId" = ${vendorId}`;
  }

  const updated = await sql`SELECT * FROM vendors WHERE id = ${vendorId}`;
  return Response.json({ vendor: updated[0] });
}
