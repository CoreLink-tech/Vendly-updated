import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

async function getVendorId(userId: string) {
  const { data } = await supabase.from('vendors').select('id').eq('userId', userId).single();
  return data?.id || null;
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ analytics: [] });

  const { data: analytics } = await supabase
    .from('product_analytics')
    .select('*')
    .eq('vendorId', vendorId)
    .order('totalViews', { ascending: false });

  return Response.json({ analytics: analytics || [] });
}
