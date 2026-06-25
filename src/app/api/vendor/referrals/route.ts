import { auth } from '@/lib/auth';
import sql from '@/app/api/utils/sql';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const vendors = await sql`SELECT * FROM vendors WHERE "userId" = ${session.user.id} LIMIT 1`;
  if (!vendors.length)
    return Response.json({
      slug: null,
      totalReferrals: 0,
      successfulReferrals: 0,
      earnings: 0,
      withdrawableBalance: 0,
      referrals: [],
      withdrawals: [],
    });
  const vendor = vendors[0];

  const [referrals, withdrawals] = await sql.transaction([
    sql`SELECT * FROM referrals WHERE "referrerId" = ${vendor.id} ORDER BY "createdAt" DESC`,
    sql`SELECT * FROM withdrawals WHERE "vendorId" = ${vendor.id} AND type = 'referral' ORDER BY "createdAt" DESC`,
  ]);

  const totalReferrals = referrals.length;
  const successfulReferrals = referrals.filter(
    (r: { status: string }) => r.status === 'completed'
  ).length;
  const earnings = referrals
    .filter((r: { status: string }) => r.status === 'completed')
    .reduce((sum: number, r: { commission: string }) => sum + parseFloat(r.commission || '0'), 0);
  const withdrawn = withdrawals
    .filter((w: { status: string }) => w.status === 'completed')
    .reduce((sum: number, w: { amount: string }) => sum + parseFloat(w.amount || '0'), 0);
  const pendingWithdrawal = withdrawals
    .filter((w: { status: string }) => w.status === 'pending')
    .reduce((sum: number, w: { amount: string }) => sum + parseFloat(w.amount || '0'), 0);
  const withdrawableBalance = Math.max(0, earnings - withdrawn - pendingWithdrawal);

  return Response.json({
    slug: vendor.slug,
    totalReferrals,
    successfulReferrals,
    earnings,
    withdrawableBalance,
    referrals,
    withdrawals,
  });
}
