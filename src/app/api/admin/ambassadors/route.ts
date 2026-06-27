import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

async function requireAdmin(userId: string) {
  const { data } = await supabase.from('user').select('role').eq('id', userId).single();
  if (!data || data.role !== 'admin') throw new Error('Forbidden');
}

function generateAmbassadorCode(name: string): string {
  const base = name.split(' ')[0]?.toLowerCase().replace(/[^a-z]/g, '').slice(0, 6) || 'amb';
  return `${base}${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';

  let query = supabase.from('ambassadors').select('*, vendors(businessName)').order('createdAt', { ascending: false });
  if (status) query = query.eq('status', status);

  const { data: ambassadors } = await query;
  return Response.json({ ambassadors });
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const body = await request.json() as { ambassadorId: string; action: 'approve' | 'decline' };
  const { ambassadorId, action } = body;

  if (action === 'approve') {
    const { data: amb } = await supabase.from('ambassadors').select('*').eq('id', ambassadorId).single();
    if (!amb) return Response.json({ error: 'Not found' }, { status: 404 });
    const code = generateAmbassadorCode(amb.fullName);
    await supabase.from('ambassadors').update({ status: 'approved', ambassadorCode: code, reviewedAt: new Date().toISOString(), reviewedBy: session.user.id }).eq('id', ambassadorId);
  } else {
    await supabase.from('ambassadors').update({ status: 'declined' }).eq('id', ambassadorId);
  }

  return Response.json({ success: true });
}
