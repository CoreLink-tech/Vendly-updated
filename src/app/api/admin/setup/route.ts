/**
 * One-time admin setup route.
 * Call this to make yourself admin: POST /api/admin/setup with { "email": "your@email.com", "secret": "vendly-admin-2026" }
 * Delete or disable this route after use in production.
 */
import sql from '@/app/api/utils/sql';

const SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || 'vendly-admin-2026';

export async function POST(request: Request) {
  const body = (await request.json()) as { email: string; secret: string };
  const { email, secret } = body;

  if (secret !== SETUP_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 403 });
  }

  const users = await sql`SELECT id FROM "user" WHERE email = ${email} LIMIT 1`;
  if (!users.length) {
    return Response.json({ error: 'User not found. Sign up first.' }, { status: 404 });
  }

  await sql`UPDATE "user" SET role = 'admin', "updatedAt" = NOW() WHERE id = ${users[0].id}`;
  return Response.json({ success: true, message: `${email} is now an admin.` });
}
