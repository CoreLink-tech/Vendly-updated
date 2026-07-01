import { supabase } from '@/lib/supabase';

// Runs daily via Vercel Cron (see vercel.json). Finds trial subscriptions
// past their trialEnd that are still marked active, and shuts the vendor
// down exactly the way the manual "deactivate" admin action does:
// vendor.status -> pending, subscription.status -> cancelled.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date().toISOString();

  const { data: expiredTrials, error } = await supabase
    .from('subscriptions')
    .select('id, vendorId, trialEnd, endDate')
    .eq('plan', 'trial')
    .eq('status', 'active')
    .lt('trialEnd', now);

  if (error) {
    console.error('[cron/expire-trials] lookup failed:', error.message);
    return Response.json({ error: 'Lookup failed' }, { status: 500 });
  }

  if (!expiredTrials || expiredTrials.length === 0) {
    return Response.json({ expired: 0 });
  }

  const vendorIds = expiredTrials.map((s) => s.vendorId);
  const subscriptionIds = expiredTrials.map((s) => s.id);

  const { error: subError } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled', updatedAt: now })
    .in('id', subscriptionIds);

  const { error: vendorError } = await supabase
    .from('vendors')
    .update({ status: 'pending', updatedAt: now })
    .in('id', vendorIds);

  if (subError || vendorError) {
    console.error('[cron/expire-trials] update failed:', subError?.message, vendorError?.message);
    return Response.json({ error: 'Update failed', expired: 0 }, { status: 500 });
  }

  return Response.json({ expired: vendorIds.length, vendorIds });
}
