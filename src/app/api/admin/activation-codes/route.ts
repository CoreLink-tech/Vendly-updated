import { auth } from '@/lib/auth';
import sql from '@/app/api/utils/sql';
import { headers } from 'next/headers';

async function requireAdmin(userId: string) {
  const users = await sql`SELECT role FROM "user" WHERE id = ${userId}`;
  if (!users.length || users[0].role !== 'admin') throw new Error('Forbidden');
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'VDLY-2026-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
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

  const codes = status
    ? await sql(
        `SELECT ac.*, v."businessName" as "usedByName" FROM activation_codes ac LEFT JOIN vendors v ON v.id = ac."usedBy" WHERE ac.status = $1 ORDER BY ac."createdAt" DESC`,
        [status]
      )
    : await sql`SELECT ac.*, v."businessName" as "usedByName" FROM activation_codes ac LEFT JOIN vendors v ON v.id = ac."usedBy" ORDER BY ac."createdAt" DESC`;

  return Response.json({ codes });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await requireAdmin(session.user.id);
  } catch {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json()) as { plan: 'monthly' | 'yearly'; count?: number };
  const { plan, count = 1 } = body;

  if (!plan) return Response.json({ error: 'Plan required' }, { status: 400 });

  const generatedCodes: string[] = [];
  for (let i = 0; i < Math.min(count, 50); i++) {
    let code = generateCode();
    // Ensure uniqueness
    let attempts = 0;
    while (attempts < 10) {
      const existing = await sql`SELECT id FROM activation_codes WHERE code = ${code} LIMIT 1`;
      if (!existing.length) break;
      code = generateCode();
      attempts++;
    }
    await sql`INSERT INTO activation_codes (code, plan, "createdBy") VALUES (${code}, ${plan}, ${session.user.id})`;
    generatedCodes.push(code);
  }

  return Response.json({ codes: generatedCodes }, { status: 201 });
}
