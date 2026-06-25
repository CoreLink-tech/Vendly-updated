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

  const withdrawals = status
    ? await sql(
        `SELECT w.*, v."businessName" FROM withdrawals w JOIN vendors v ON v.id = w."vendorId" WHERE w.status = $1 ORDER BY w."createdAt" DESC`,
        [status]
      )
    : await sql`SELECT w.*, v."businessName" FROM withdrawals w JOIN vendors v ON v.id = w."vendorId" ORDER BY w."createdAt" DESC`;

  return Response.json({ withdrawals });
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
    withdrawalId: string;
    action: 'approve' | 'reject';
    notes?: string;
  };
  const { withdrawalId, action, notes } = body;

  const newStatus = action === 'approve' ? 'completed' : 'rejected';
  await sql`
    UPDATE withdrawals SET status = ${newStatus}, "processedAt" = NOW(), "processedBy" = ${session.user.id}, notes = ${notes || ''} WHERE id = ${withdrawalId}
  `;

  return Response.json({ success: true });
}
