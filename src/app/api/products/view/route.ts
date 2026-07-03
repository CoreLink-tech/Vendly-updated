import { supabase } from '@/lib/supabase';
import { getClientIp } from '@/lib/request';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { productId: string; vendorId: string; sessionId?: string };
    const { productId, vendorId, sessionId } = body;
    if (!productId || !vendorId) return Response.json({ ok: false });

    const ip = getClientIp(request);

    // Dedupe on IP first — this is the backstop that can't be bypassed by a
    // client simply omitting or randomizing sessionId, which the old logic
    // allowed. sessionId dedup still runs on top for legitimate same-IP
    // households/offices with multiple real visitors.
    const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: recentFromIp } = await supabase
      .from('product_views')
      .select('id')
      .eq('productId', productId)
      .eq('ipAddress', ip)
      .gte('viewedAt', cutoff)
      .limit(1);
    if (recentFromIp?.length) return Response.json({ ok: true, deduped: true });

    if (sessionId) {
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
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || null,
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
