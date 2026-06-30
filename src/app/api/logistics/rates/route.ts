import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

// Public — checkout needs this to compute the delivery fee for a given state.
export async function GET() {
  const { data: rates } = await supabase.from('logistics_rates').select('*').order('state', { ascending: true });
  return Response.json({ rates: rates || [] });
}

// Logistics/admin only — set the price for a state.
export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: requester } = await supabase.from('user').select('role').eq('id', session.user.id).single();
  if (!requester || !['admin', 'logistics'].includes(requester.role)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json() as { state?: string; price?: number; rates?: { state: string; price: number }[] };

  // Support both a single update and a bulk save (the dashboard saves all rows at once).
  const updates = body.rates && body.rates.length ? body.rates : (body.state ? [{ state: body.state, price: body.price ?? 0 }] : []);
  if (!updates.length) return Response.json({ error: 'No rates provided' }, { status: 400 });

  for (const u of updates) {
    await supabase.from('logistics_rates').update({ price: u.price, updatedAt: new Date().toISOString() }).eq('state', u.state);
  }

  const { data: rates } = await supabase.from('logistics_rates').select('*').order('state', { ascending: true });
  return Response.json({ rates: rates || [] });
}
