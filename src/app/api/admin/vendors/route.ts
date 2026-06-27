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

  let query = supabase.from('vendors').select(`*, user(email, name), products(count), orders(count), subscriptions(plan, status, endDate)`).order('createdAt', { ascending: false });
  if (status) query = query.eq('status', status);
  if (search) query = query.or(`businessName.ilike.%${search}%`);

  const { data: vendors } = await query;
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
