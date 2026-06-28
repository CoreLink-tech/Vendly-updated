import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

async function requireAdmin(userId: string) {
  const { data } = await supabase.from('user').select('role').eq('id', userId).single();
  if (!data || !['admin', 'logistics'].includes(data.role)) throw new Error('Forbidden');
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const { data: routes } = await supabase
    .from('logistics_routes')
    .select('*')
    .order('fromState')
    .order('toState');

  return Response.json({ routes: routes || [] });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const body = await request.json() as { fromState: string; toState: string; price: number };
  const { fromState, toState, price } = body;
  if (!fromState || !toState || price === undefined) return Response.json({ error: 'Missing fields' }, { status: 400 });

  const { data, error } = await supabase
    .from('logistics_routes')
    .upsert({ fromState, toState, price, updatedAt: new Date().toISOString() }, { onConflict: 'fromState,toState' })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ route: data });
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const body = await request.json() as { id: string };
  await supabase.from('logistics_routes').delete().eq('id', body.id);
  return Response.json({ success: true });
}
