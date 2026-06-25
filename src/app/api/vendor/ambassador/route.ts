import { auth } from '@/lib/auth';
import sql from '@/app/api/utils/sql';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const vendors = await sql`SELECT id FROM vendors WHERE "userId" = ${session.user.id} LIMIT 1`;
  if (!vendors.length) return Response.json({ status: null });

  const ambassadors =
    await sql`SELECT * FROM ambassadors WHERE "vendorId" = ${vendors[0].id} ORDER BY "createdAt" DESC LIMIT 1`;
  if (!ambassadors.length) return Response.json({ status: null });

  const amb = ambassadors[0];

  if (amb.status !== 'approved') return Response.json({ status: amb.status });

  // Get ambassador stats
  const [referredVendors, earnings, withdrawals] = await sql.transaction([
    sql`SELECT COUNT(*)::int as count FROM ambassador_referrals WHERE "ambassadorId" = ${amb.id}`,
    sql`SELECT COALESCE(SUM(commission), 0)::numeric as total FROM ambassador_referrals WHERE "ambassadorId" = ${amb.id}`,
    sql`SELECT COALESCE(SUM(amount), 0)::numeric as total FROM withdrawals WHERE "vendorId" = ${vendors[0].id} AND type = 'ambassador' AND status IN ('completed', 'pending')`,
  ]);

  return Response.json({
    status: 'approved',
    ambassadorCode: amb.ambassadorCode,
    referredVendors: referredVendors[0].count,
    activeSubscriptions: referredVendors[0].count,
    recurringCommission: 1000, // simplified
    withdrawableBalance: Math.max(
      0,
      parseFloat(earnings[0].total) - parseFloat(withdrawals[0].total)
    ),
  });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const vendors = await sql`SELECT * FROM vendors WHERE "userId" = ${session.user.id} LIMIT 1`;
  if (!vendors.length) return Response.json({ error: 'Vendor profile not found' }, { status: 404 });
  if (vendors[0].status !== 'active')
    return Response.json({ error: 'Activate your store first' }, { status: 400 });

  const existing =
    await sql`SELECT id FROM ambassadors WHERE "vendorId" = ${vendors[0].id} AND status IN ('pending', 'approved')`;
  if (existing.length)
    return Response.json({ error: 'Application already submitted' }, { status: 400 });

  const body = (await request.json()) as {
    fullName: string;
    email: string;
    phone: string;
    businessName: string;
    reason: string;
  };

  const { fullName, email, phone, businessName, reason } = body;
  if (!fullName || !email || !phone || !businessName || !reason) {
    return Response.json({ error: 'All fields required' }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO ambassadors ("vendorId", "fullName", email, phone, "businessName", reason, status)
    VALUES (${vendors[0].id}, ${fullName}, ${email}, ${phone}, ${businessName}, ${reason}, 'pending')
    RETURNING *
  `;

  return Response.json({ ambassador: result[0] }, { status: 201 });
}
