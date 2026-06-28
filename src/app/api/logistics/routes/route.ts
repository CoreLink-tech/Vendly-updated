import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from')?.trim();
  const to = searchParams.get('to')?.trim();

  if (!from || !to) return Response.json({ route: null });

  const { data: route } = await supabase
    .from('logistics_routes')
    .select('price')
    .eq('fromState', from)
    .eq('toState', to)
    .single();

  return Response.json({ route: route || null });
}

// Admin: list all routes
export async function POST(request: Request) {
  const body = await request.json() as { fromState: string; toState: string; price: number };
  const { fromState, toState, price } = body;
  if (!fromState || !toState || price === undefined) {
    return Response.json({ error: 'Missing fields' }, { status: 400 });
  }
  const { data } = await supabase
    .from('logistics_routes')
    .upsert({ fromState, toState, price, updatedAt: new Date().toISOString() }, { onConflict: 'fromState,toState' })
    .select()
    .single();
  return Response.json({ route: data });
}
