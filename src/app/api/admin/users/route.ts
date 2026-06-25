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
  const search = searchParams.get('search') || '';

  const users = search
    ? await sql(
        `SELECT * FROM "user" WHERE LOWER(name) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1) ORDER BY "createdAt" DESC LIMIT 100`,
        [`%${search}%`]
      )
    : await sql`SELECT * FROM "user" ORDER BY "createdAt" DESC LIMIT 100`;

  return Response.json({ users });
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await requireAdmin(session.user.id);
  } catch {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json()) as { userId: string; role: string };
  const { userId, role } = body;

  const validRoles = ['vendor', 'admin', 'logistics', 'customer'];
  if (!validRoles.includes(role)) return Response.json({ error: 'Invalid role' }, { status: 400 });

  await sql`UPDATE "user" SET role = ${role}, "updatedAt" = NOW() WHERE id = ${userId}`;
  return Response.json({ success: true });
}
