import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

async function requireAdmin(userId: string) {
  const { data } = await supabase.from('user').select('role').eq('id', userId).single();
  if (!data || data.role !== 'admin') throw new Error('Forbidden');
}

// GET /api/admin/logistics-users - list all logistics users
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const { data: users } = await supabase
    .from('user')
    .select('id, name, email, role, createdAt')
    .eq('role', 'logistics')
    .order('createdAt', { ascending: false });

  return Response.json({ users });
}

// POST /api/admin/logistics-users - assign logistics role to existing user by email
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const body = await request.json() as { email: string };
  if (!body.email) return Response.json({ error: 'Email required' }, { status: 400 });

  const { data: user } = await supabase.from('user').select('id, email, role').eq('email', body.email).single();
  if (!user) return Response.json({ error: 'User not found. They must sign up first.' }, { status: 404 });

  await supabase.from('user').update({ role: 'logistics', updatedAt: new Date().toISOString() }).eq('id', user.id);
  return Response.json({ success: true, message: `${body.email} is now a logistics user.` });
}

// DELETE /api/admin/logistics-users - remove logistics role
export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const body = await request.json() as { userId: string };
  await supabase.from('user').update({ role: 'vendor', updatedAt: new Date().toISOString() }).eq('id', body.userId);
  return Response.json({ success: true });
}
