import { auth } from '@/lib/auth';
import sql from '@/app/api/utils/sql';
import { headers } from 'next/headers';

async function requireAdmin(userId: string) {
  const users = await sql`SELECT role FROM "user" WHERE id = ${userId}`;
  if (!users.length || users[0].role !== 'admin') throw new Error('Forbidden');
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
  const status = searchParams.get('status') || '';

  const requests = status
    ? await sql(
        `SELECT lr.*, v."businessName" as "vendorName" FROM logistics_requests lr JOIN vendors v ON v.id = lr."vendorId" WHERE lr.status = $1 ORDER BY lr."createdAt" DESC`,
        [status]
      )
    : await sql`SELECT lr.*, v."businessName" as "vendorName" FROM logistics_requests lr JOIN vendors v ON v.id = lr."vendorId" ORDER BY lr."createdAt" DESC LIMIT 100`;

  return Response.json({ requests });
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
    requestId: string;
    status: string;
    riderName?: string;
    riderPhone?: string;
  };
  const { requestId, status, riderName, riderPhone } = body;

  const setClauses: string[] = [`status = $1`, `"updatedAt" = NOW()`];
  const values: unknown[] = [status];
  let i = 2;

  if (riderName) {
    setClauses.push(`"riderName" = $${i++}`);
    values.push(riderName);
  }
  if (riderPhone) {
    setClauses.push(`"riderPhone" = $${i++}`);
    values.push(riderPhone);
  }
  if (status === 'rider_assigned') {
    setClauses.push(`"assignedAt" = NOW()`);
  }
  if (status === 'picked_up') {
    setClauses.push(`"pickedUpAt" = NOW()`);
  }
  if (status === 'delivered') {
    setClauses.push(`"deliveredAt" = NOW()`);
  }

  values.push(requestId);
  await sql(`UPDATE logistics_requests SET ${setClauses.join(', ')} WHERE id = $${i}`, values);

  // Update order status in sync
  const statusMap: Record<string, string> = {
    picked_up: 'picked_up',
    in_transit: 'in_transit',
    delivered: 'delivered',
  };
  if (statusMap[status]) {
    const req = await sql`SELECT "orderId" FROM logistics_requests WHERE id = ${requestId}`;
    if (req.length) {
      await sql`UPDATE orders SET status = ${statusMap[status]}, "updatedAt" = NOW() WHERE id = ${req[0].orderId}`;
    }
  }

  return Response.json({ success: true });
}
