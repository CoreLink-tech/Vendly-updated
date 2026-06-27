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
  const search = searchParams.get('search') || '';

  let query = supabase.from('user').select('*').order('createdAt', { ascending: false }).limit(100);
  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);

  const { data: users } = await query;
  return Response.json({ users });
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const body = await request.json() as { userId: string; role: string };
  const validRoles = ['vendor', 'admin', 'logistics', 'customer'];
  if (!validRoles.includes(body.role)) return Response.json({ error: 'Invalid role' }, { status: 400 });

  await supabase.from('user').update({ role: body.role, updatedAt: new Date().toISOString() }).eq('id', body.userId);
  return Response.json({ success: true });
}
