import { supabase } from '@/lib/supabase';
import { getClientIp } from '@/lib/request';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { vendorId: string; sessionId?: string };
    const { vendorId, sessionId } = body;
    if (!vendorId) return Response.json({ ok: false });

    const ip = getClientIp(request);
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: recentFromIp } = await supabase
      .from('store_visits')
      .select('id')
      .eq('vendorId', vendorId)
      .eq('ipAddress', ip)
      .gte('visitedAt', cutoff)
      .limit(1);
    if (recentFromIp?.length) return Response.json({ ok: true, deduped: true });

    if (sessionId) {
      const { data: existing } = await supabase
        .from('store_visits')
        .select('id')
        .eq('vendorId', vendorId)
        .eq('sessionId', sessionId)
        .gte('visitedAt', cutoff)
        .limit(1);
      if (existing?.length) return Response.json({ ok: true, deduped: true });
    }

    await supabase.from('store_visits').insert({
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
