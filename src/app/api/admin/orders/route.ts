import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

async function requireAdmin(userId: string) {
  const { data } = await supabase.from('user').select('role').eq('id', userId).single();
  if (!data || data.role !== 'admin') throw new Error('Forbidden');
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const { data: orders } = await supabase.from('orders').select('*, vendors(businessName)').order('createdAt', { ascending: false }).limit(200);
  return Response.json({ orders });
}
