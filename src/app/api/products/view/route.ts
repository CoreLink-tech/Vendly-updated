import { supabase } from '@/lib/supabase';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { productId: string; vendorId: string; sessionId?: string };
    const { productId, vendorId, sessionId } = body;
    if (!productId || !vendorId) return Response.json({ ok: false });

    // Deduplicate: don't count same session viewing same product within 30 mins
    if (sessionId) {
      const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: existing } = await supabase
        .from('product_views')
        .select('id')
        .eq('productId', productId)
        .eq('sessionId', sessionId)
        .gte('viewedAt', cutoff)
        .limit(1);
      if (existing?.length) return Response.json({ ok: true, deduped: true });
    }

    await supabase.from('product_views').insert({
      productId,
      vendorId,
      sessionId: sessionId || null,
      userAgent: request.headers.get('user-agent') || null,
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
