import { auth } from '@/lib/auth';
import sql from '@/app/api/utils/sql';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const vendors = await sql`SELECT id FROM vendors WHERE "userId" = ${session.user.id} LIMIT 1`;
  if (!vendors.length) return Response.json({ withdrawals: [] });

  const withdrawals =
    await sql`SELECT * FROM withdrawals WHERE "vendorId" = ${vendors[0].id} ORDER BY "createdAt" DESC`;
  return Response.json({ withdrawals });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const vendors = await sql`SELECT id FROM vendors WHERE "userId" = ${session.user.id} LIMIT 1`;
  if (!vendors.length) return Response.json({ error: 'Not found' }, { status: 404 });
  const vendorId = vendors[0].id;

  const body = (await request.json()) as {
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    type?: string;
  };
  const { amount, bankName, accountNumber, accountName, type = 'referral' } = body;

  if (!amount || !bankName || !accountNumber || !accountName) {
    return Response.json({ error: 'All fields required' }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO withdrawals ("vendorId", amount, "bankName", "accountNumber", "accountName", type, status)
    VALUES (${vendorId}, ${amount}, ${bankName}, ${accountNumber}, ${accountName}, ${type}, 'pending')
    RETURNING *
  `;

  return Response.json({ withdrawal: result[0] }, { status: 201 });
}
