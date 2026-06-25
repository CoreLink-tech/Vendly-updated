import { auth } from '@/lib/auth';
import sql from '@/app/api/utils/sql';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as { code: string };
  const { code } = body;

  if (!code) {
    return Response.json({ error: 'Activation code required' }, { status: 400 });
  }

  // Find vendor
  const vendors = await sql`SELECT * FROM vendors WHERE "userId" = ${session.user.id} LIMIT 1`;
  if (!vendors.length) {
    return Response.json({ error: 'Vendor profile not found' }, { status: 404 });
  }
  const vendor = vendors[0];

  // Check code
  const codes =
    await sql`SELECT * FROM activation_codes WHERE code = ${code.toUpperCase()} AND status = 'unused' LIMIT 1`;
  if (!codes.length) {
    return Response.json({ error: 'Invalid or already used activation code' }, { status: 400 });
  }
  const activationCode = codes[0];

  // Activate vendor
  await sql`UPDATE vendors SET status = 'active', "updatedAt" = NOW() WHERE id = ${vendor.id}`;
  await sql`UPDATE activation_codes SET status = 'used', "usedBy" = ${vendor.id}, "usedAt" = NOW() WHERE id = ${activationCode.id}`;

  // Create subscription with correct end date
  if (activationCode.plan === 'yearly') {
    await sql`
      INSERT INTO subscriptions ("vendorId", plan, status, "startDate", "endDate", "activationCode")
      VALUES (${vendor.id}, 'yearly', 'active', NOW(), NOW() + INTERVAL '1 year', ${code.toUpperCase()})
    `;
  } else {
    await sql`
      INSERT INTO subscriptions ("vendorId", plan, status, "startDate", "endDate", "activationCode")
      VALUES (${vendor.id}, 'monthly', 'active', NOW(), NOW() + INTERVAL '1 month', ${code.toUpperCase()})
    `;
  }

  const updatedVendors = await sql`SELECT * FROM vendors WHERE id = ${vendor.id}`;

  // Handle referral commission
  if (vendor.referredBy) {
    const referrer =
      await sql`SELECT id FROM vendors WHERE slug = ${vendor.referredBy} AND status = 'active' LIMIT 1`;
    if (referrer.length) {
      const commission = activationCode.plan === 'yearly' ? 10000 : 1000;
      await sql`
        INSERT INTO referrals ("referrerId", "referredVendorId", status, commission, plan, "paidAt")
        VALUES (${referrer[0].id}, ${vendor.id}, 'completed', ${commission}, ${activationCode.plan}, NOW())
        ON CONFLICT DO NOTHING
      `;
    }
  }

  return Response.json({ success: true, vendor: updatedVendors[0] });
}
