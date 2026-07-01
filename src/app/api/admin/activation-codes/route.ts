import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

async function requireAdmin(userId: string) {
  const { data } = await supabase.from('user').select('role').eq('id', userId).single();
  if (!data || data.role !== 'admin') throw new Error('Forbidden');
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'VDLY-2026-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';

  let query = supabase.from('activation_codes').select('*, vendors(businessName)').order('createdAt', { ascending: false });
  if (status) query = query.eq('status', status);

  const { data: codes } = await query;
  return Response.json({ codes });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const body = await request.json() as { plan: 'monthly' | 'yearly'; count?: number; isFounding?: boolean };
  const { plan, count = 1, isFounding = false } = body;
  if (!plan) return Response.json({ error: 'Plan required' }, { status: 400 });

  if (isFounding) {
    const { count: usedFoundingCount } = await supabase
      .from('activation_codes')
      .select('id', { count: 'exact', head: true })
      .eq('isFounding', true)
      .eq('status', 'used');
    const { count: unusedFoundingCount } = await supabase
      .from('activation_codes')
      .select('id', { count: 'exact', head: true })
      .eq('isFounding', true)
      .eq('status', 'unused');
    const claimed = (usedFoundingCount || 0) + (unusedFoundingCount || 0);
    if (claimed + count > 100) {
      return Response.json(
        { error: `Only ${Math.max(0, 100 - claimed)} founding slot(s) left. Reduce quantity or uncheck founding.` },
        { status: 400 }
      );
    }
  }

  const generatedCodes: string[] = [];
  const failures: string[] = [];
  for (let i = 0; i < Math.min(count, 50); i++) {
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const { data } = await supabase.from('activation_codes').select('id').eq('code', code).limit(1);
      if (!data?.length) break;
      code = generateCode();
      attempts++;
    }
    const { error: insertError } = await supabase
      .from('activation_codes')
      .insert({ code, plan, createdBy: session.user.id, isFounding });
    if (insertError) {
      console.error('[activation-codes] insert failed:', insertError.message);
      failures.push(code);
      continue;
    }
    generatedCodes.push(code);
  }

  if (failures.length > 0 && generatedCodes.length === 0) {
    return Response.json(
      { error: `Failed to save any codes to the database: ${failures.length} attempt(s) failed. Nothing was generated.` },
      { status: 500 }
    );
  }
  if (failures.length > 0) {
    return Response.json(
      { codes: generatedCodes, warning: `${failures.length} code(s) failed to save and were not generated.` },
      { status: 201 }
    );
  }

  return Response.json({ codes: generatedCodes }, { status: 201 });
}
