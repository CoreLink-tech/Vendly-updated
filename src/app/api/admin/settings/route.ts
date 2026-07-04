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

  const { data } = await supabase.from('platform_settings').select('*');
  const settings: Record<string, boolean> = {};
  for (const row of data || []) settings[row.key] = row.value;

  return Response.json({ settings });
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const body = await request.json() as { key: string; value: boolean };
  if (!body.key || typeof body.value !== 'boolean') {
    return Response.json({ error: 'key and boolean value required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('platform_settings')
    .upsert({ key: body.key, value: body.value, updatedAt: new Date().toISOString() }, { onConflict: 'key' });

  if (error) return Response.json({ error: 'Failed to save setting' }, { status: 500 });
  return Response.json({ success: true });
}
