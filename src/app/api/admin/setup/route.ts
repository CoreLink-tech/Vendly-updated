import { supabase } from '@/lib/supabase';

const SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || 'vendly-admin-2026';

export async function POST(request: Request) {
  const body = await request.json() as { email: string; secret: string };
  if (body.secret !== SETUP_SECRET) return Response.json({ error: 'Invalid secret' }, { status: 403 });

  const { data: user } = await supabase.from('user').select('id').eq('email', body.email).single();
  if (!user) return Response.json({ error: 'User not found. Sign up first.' }, { status: 404 });

  await supabase.from('user').update({ role: 'admin', updatedAt: new Date().toISOString() }).eq('id', user.id);
  return Response.json({ success: true, message: `${body.email} is now an admin.` });
}
