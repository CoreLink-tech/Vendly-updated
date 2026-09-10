import { supabase } from '@/lib/supabase';

// Runs daily via Vercel Cron (see vercel.json). Finds ANY subscription past
// its endDate that's still marked active — a paid activation code (monthly
// or yearly) just as much as the 3-day free trial, since a trial's endDate
// is set equal to its trialEnd at creation — and shuts the vendor down
// exactly the way the manual "deactivate" admin action does: vendor.status
// -> pending, subscription.status -> expired.
//
// Replaces the old /api/cron/expire-trials, which only matched
// plan='trial' and left paid subscriptions running forever past their
// endDate.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date().toISOString();

  const { data: expiredSubs, error } = await supabase
    .from('subscriptions')
    .select('id, vendorId, plan, endDate')
    .eq('status', 'active')
    .lt('endDate', now);

  if (error) {
    console.error('[cron/expire-subscriptions] lookup failed:', error.message);
    return Response.json({ error: 'Lookup failed' }, { status: 500 });
  }

  if (!expiredSubs || expiredSubs.length === 0) {
    return Response.json({ expired: 0 });
  }

  const vendorIds = expiredSubs.map((s) => s.vendorId);
  const subscriptionIds = expiredSubs.map((s) => s.id);

  const { error: subError } = await supabase
    .from('subscriptions')
    .update({ status: 'expired', updatedAt: now })
    .in('id', subscriptionIds);

  const { error: vendorError } = await supabase
    .from('vendors')
    .update({ status: 'pending', updatedAt: now })
    .in('id', vendorIds);

  if (subError || vendorError) {
    console.error('[cron/expire-subscriptions] update failed:', subError?.message, vendorError?.message);
    return Response.json({ error: 'Update failed', expired: 0 }, { status: 500 });
  }

  return Response.json({ expired: vendorIds.length, vendorIds });
}
