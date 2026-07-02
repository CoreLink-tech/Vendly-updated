import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as { code: string };
  if (!body.code) return Response.json({ error: 'Activation code required' }, { status: 400 });

  const { data: vendor } = await supabase.from('vendors').select('*').eq('userId', session.user.id).single();
  if (!vendor) return Response.json({ error: 'Vendor profile not found' }, { status: 404 });

  const { data: activationCode } = await supabase.from('activation_codes').select('*').eq('code', body.code.toUpperCase()).eq('status', 'unused').single();
  if (!activationCode) return Response.json({ error: 'Invalid or already used activation code' }, { status: 400 });

  // Atomic claim: only succeeds if the code is still 'unused' at the moment of
  // this write. If two requests race for the same code, only one UPDATE can
  // match the WHERE status='unused' condition — the loser gets back no row
  // and bails out here instead of both proceeding to create a subscription.
  const { data: claimed } = await supabase
    .from('activation_codes')
    .update({ status: 'used', usedBy: vendor.id, usedAt: new Date().toISOString() })
    .eq('id', activationCode.id)
    .eq('status', 'unused')
    .select()
    .single();
  if (!claimed) return Response.json({ error: 'This code was just claimed by someone else. Please request a new one.' }, { status: 409 });

  await supabase.from('vendors').update({ status: 'active', updatedAt: new Date().toISOString() }).eq('id', vendor.id);

  const endDate = new Date();
  activationCode.plan === 'yearly' ? endDate.setFullYear(endDate.getFullYear() + 1) : endDate.setMonth(endDate.getMonth() + 1);
  await supabase.from('subscriptions').insert({ vendorId: vendor.id, plan: activationCode.plan, status: 'active', startDate: new Date().toISOString(), endDate: endDate.toISOString(), activationCode: body.code.toUpperCase() });

  if (vendor.referredBy) {
    const { data: referrer } = await supabase.from('vendors').select('id').eq('slug', vendor.referredBy.toLowerCase()).eq('status', 'active').single();
    if (referrer) {
      const commission = activationCode.plan === 'yearly' ? 10000 : 1000;
      await supabase.from('referrals').upsert({ referrerId: referrer.id, referredVendorId: vendor.id, status: 'completed', commission, plan: activationCode.plan, paidAt: new Date().toISOString() }, { onConflict: 'referrerId,referredVendorId' });
    }
  }

  const { data: updatedVendor } = await supabase.from('vendors').select('*').eq('id', vendor.id).single();
  return Response.json({ success: true, vendor: updatedVendor });
}
