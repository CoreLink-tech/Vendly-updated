import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

async function requireAdmin(userId: string) {
  const { data } = await supabase.from('user').select('role').eq('id', userId).single();
  if (!data || data.role !== 'admin') throw new Error('Forbidden');
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const type = searchParams.get('type') || '';

  let query = supabase.from('vendors').select(`*, user(email, name), products(count), orders(count), subscriptions(plan, status, endDate, "trialEnd")`).order('createdAt', { ascending: false });
  if (status) query = query.eq('status', status);
  if (search) query = query.or(`businessName.ilike.%${search}%`);

  const { data: vendorsRaw } = await query;

  const now = Date.now();
  let vendors = (vendorsRaw || []).map((v) => {
    // Supabase returns the joined relation as an array; pick the most
    // recent subscription (active ones first) since a vendor can have
    // multiple over time (e.g. an old cancelled trial + a new paid one).
    const subs = (v.subscriptions || []) as { plan: string; status: string; endDate: string; trialEnd: string | null }[];
    const sub =
      subs.find((s) => s.status === 'active') ||
      [...subs].sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0] ||
      null;

    let accountType: 'paid' | 'trial' | 'trial_expired' | 'pending' | 'suspended' = 'pending';
    if (v.status === 'suspended') {
      accountType = 'suspended';
    } else if (v.status === 'active' && sub) {
      if (sub.plan === 'trial') {
        const expiry = sub.trialEnd || sub.endDate;
        accountType = expiry && new Date(expiry).getTime() < now ? 'trial_expired' : 'trial';
      } else {
        accountType = 'paid';
      }
    } else if (v.status === 'active') {
      accountType = 'paid'; // active with no subscription row (legacy/manual) — treat as paid, not trial
    }

    const { subscriptions: _drop, ...rest } = v;
    return { ...rest, subscription: sub, accountType };
  });

  if (type) vendors = vendors.filter((v) => v.accountType === type);

  return Response.json({ vendors });
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const body = await request.json() as { vendorId: string; action: 'activate' | 'suspend' | 'deactivate'; plan?: 'monthly' | 'yearly' };
  const { vendorId, action, plan } = body;

  if (action === 'activate') {
    if (!plan) return Response.json({ error: 'Plan required' }, { status: 400 });
    await supabase.from('vendors').update({ status: 'active', updatedAt: new Date().toISOString() }).eq('id', vendorId);
    const { data: existing } = await supabase.from('subscriptions').select('id').eq('vendorId', vendorId).eq('status', 'active').limit(1);
    if (!existing?.length) {
      const endDate = new Date();
      plan === 'yearly' ? endDate.setFullYear(endDate.getFullYear() + 1) : endDate.setMonth(endDate.getMonth() + 1);
      await supabase.from('subscriptions').insert({ vendorId, plan, status: 'active', startDate: new Date().toISOString(), endDate: endDate.toISOString(), activatedBy: session.user.id });
    }
  } else if (action === 'suspend') {
    await supabase.from('vendors').update({ status: 'suspended', updatedAt: new Date().toISOString() }).eq('id', vendorId);
  } else if (action === 'deactivate') {
    await supabase.from('vendors').update({ status: 'pending', updatedAt: new Date().toISOString() }).eq('id', vendorId);
    await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('vendorId', vendorId);
  }

  const { data: vendor } = await supabase.from('vendors').select('*').eq('id', vendorId).single();
  return Response.json({ vendor });
}
