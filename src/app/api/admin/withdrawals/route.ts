import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

async function requireAdmin(userId: string) {
  const { data } = await supabase.from('user').select('role').eq('id', userId).single();
  if (!data || data.role !== 'admin') throw new Error('Forbidden');
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';

  let query = supabase.from('withdrawals').select('*, vendors(businessName)').order('createdAt', { ascending: false });
  if (status) query = query.eq('status', status);

  const { data: withdrawals } = await query;
  return Response.json({ withdrawals });
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const body = await request.json() as { withdrawalId: string; action: 'approve' | 'reject'; notes?: string };
  const newStatus = body.action === 'approve' ? 'completed' : 'rejected';
  await supabase.from('withdrawals').update({ status: newStatus, processedAt: new Date().toISOString(), processedBy: session.user.id, notes: body.notes || '' }).eq('id', body.withdrawalId);
  return Response.json({ success: true });
}
