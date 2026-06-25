import { auth } from '@/lib/auth';
import sql from '@/app/api/utils/sql';
import { headers } from 'next/headers';

async function requireAdmin(userId: string) {
  const users = await sql`SELECT role FROM "user" WHERE id = ${userId}`;
  if (!users.length || users[0].role !== 'admin') throw new Error('Forbidden');
}

function generateAmbassadorCode(name: string): string {
  const base =
    name
      .split(' ')[0]
      ?.toLowerCase()
      .replace(/[^a-z]/g, '')
      .slice(0, 6) || 'amb';
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${suffix}`;
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

  const ambassadors = status
    ? await sql(
        `SELECT a.*, v."businessName" as "vendorBusinessName" FROM ambassadors a JOIN vendors v ON v.id = a."vendorId" WHERE a.status = $1 ORDER BY a."createdAt" DESC`,
        [status]
      )
    : await sql`SELECT a.*, v."businessName" as "vendorBusinessName" FROM ambassadors a JOIN vendors v ON v.id = a."vendorId" ORDER BY a."createdAt" DESC`;

  return Response.json({ ambassadors });
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await requireAdmin(session.user.id);
  } catch {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json()) as { ambassadorId: string; action: 'approve' | 'decline' };
  const { ambassadorId, action } = body;

  if (action === 'approve') {
    const ambassadors = await sql`SELECT * FROM ambassadors WHERE id = ${ambassadorId}`;
    if (!ambassadors.length) return Response.json({ error: 'Not found' }, { status: 404 });
    const amb = ambassadors[0];
    const code = generateAmbassadorCode(amb.fullName);
    await sql`UPDATE ambassadors SET status = 'approved', "ambassadorCode" = ${code}, "approvedAt" = NOW(), "approvedBy" = ${session.user.id} WHERE id = ${ambassadorId}`;
  } else {
    await sql`UPDATE ambassadors SET status = 'declined' WHERE id = ${ambassadorId}`;
  }

  return Response.json({ success: true });
}
