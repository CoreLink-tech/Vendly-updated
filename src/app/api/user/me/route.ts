import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabase.from('user').select('*').eq('id', session.user.id).single();
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

  const { data: vendor } = await supabase.from('vendors').select('*').eq('userId', session.user.id).single();
  let subscription = null;
  if (vendor) {
    const { data: sub } = await supabase.from('subscriptions').select('*').eq('vendorId', vendor.id).eq('status', 'active').order('createdAt', { ascending: false }).limit(1).single();
    subscription = sub || null;
  }

  let ambassadorStatus: string | null = null;
  if (vendor) {
    const { data: amb } = await supabase
      .from('ambassadors')
      .select('status')
      .eq('vendorId', vendor.id)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();
    ambassadorStatus = amb?.status || null;
  }

  return Response.json({ user, vendor: vendor || null, subscription, ambassadorStatus });
}
