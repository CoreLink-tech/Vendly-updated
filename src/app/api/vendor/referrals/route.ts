import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: vendor } = await supabase.from('vendors').select('*').eq('userId', session.user.id).single();
  if (!vendor) return Response.json({ slug: null, totalReferrals: 0, successfulReferrals: 0, earnings: 0, withdrawableBalance: 0, referrals: [], withdrawals: [] });

  const [{ data: referrals }, { data: withdrawals }] = await Promise.all([
    supabase.from('referrals').select('*').eq('referrerId', vendor.id).order('createdAt', { ascending: false }),
    supabase.from('withdrawals').select('*').eq('vendorId', vendor.id).eq('type', 'referral').order('createdAt', { ascending: false }),
  ]);

  const successful = (referrals || []).filter((r: { status: string }) => r.status === 'completed');
  const earnings = successful.reduce((s: number, r: { commission: string }) => s + parseFloat(r.commission || '0'), 0);
  const withdrawn = (withdrawals || []).filter((w: { status: string }) => w.status === 'completed').reduce((s: number, w: { amount: string }) => s + parseFloat(w.amount || '0'), 0);
  const pending = (withdrawals || []).filter((w: { status: string }) => w.status === 'pending').reduce((s: number, w: { amount: string }) => s + parseFloat(w.amount || '0'), 0);

  return Response.json({ slug: vendor.slug, totalReferrals: referrals?.length || 0, successfulReferrals: successful.length, earnings, withdrawableBalance: Math.max(0, earnings - withdrawn - pending), referrals, withdrawals });
}
