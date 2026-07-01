import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

const REPORT_TTL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

async function getVendorId(userId: string) {
  const { data } = await supabase.from('vendors').select('id').eq('userId', userId).single();
  return data?.id || null;
}

// Deletes reports older than 3 days for this vendor. Called on every GET so
// the dashboard self-cleans without needing a separate cron job.
async function purgeExpired(vendorId: string) {
  const cutoff = new Date(Date.now() - REPORT_TTL_MS).toISOString();
  await supabase.from('reports').delete().eq('vendorId', vendorId).lt('createdAt', cutoff);
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ reports: [] });

  await purgeExpired(vendorId);

  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .eq('vendorId', vendorId)
    .order('createdAt', { ascending: false });

  return Response.json({ reports: reports || [] });
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const vendorId = await getVendorId(session.user.id);
  if (!vendorId) return Response.json({ error: 'Not found' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'Report id required' }, { status: 400 });

  await supabase.from('reports').delete().eq('id', id).eq('vendorId', vendorId);
  return Response.json({ success: true });
}
