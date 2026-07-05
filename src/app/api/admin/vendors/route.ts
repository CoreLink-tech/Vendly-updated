import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

async function requireAdmin(userId: string) {
  const { data } = await supabase.from('user').select('role').eq('id', userId).single();
  if (!data || data.role !== 'admin') throw new Error('Forbidden');
}

async function deleteVendorCascade(vendorId: string, userId: string) {
  const { data: products } = await supabase.from('products').select('id').eq('vendorId', vendorId);
  const productIds = (products || []).map((p: { id: string }) => p.id);
  if (productIds.length) {
    await supabase.from('product_images').delete().in('productId', productIds);
    await supabase.from('order_items').delete().in('productId', productIds);
    await supabase.from('products').delete().in('id', productIds);
  }
  const { data: orders } = await supabase.from('orders').select('id').eq('vendorId', vendorId);
  const orderIds = (orders || []).map((o: { id: string }) => o.id);
  if (orderIds.length) {
    await supabase.from('order_items').delete().in('orderId', orderIds);
    await supabase.from('orders').delete().in('id', orderIds);
  }
  const { data: ambassador } = await supabase.from('ambassadors').select('id').eq('vendorId', vendorId);
  const ambIds = (ambassador || []).map((a: { id: string }) => a.id);
  if (ambIds.length) {
    await supabase.from('ambassador_referrals').delete().in('ambassadorId', ambIds);
    await supabase.from('ambassadors').delete().in('id', ambIds);
  }
  await supabase.from('referrals').delete().eq('referrerId', vendorId);
  await supabase.from('referrals').delete().eq('referredVendorId', vendorId);
  await supabase.from('subscriptions').delete().eq('vendorId', vendorId);
  await supabase.from('withdrawals').delete().eq('vendorId', vendorId);
  await supabase.from('reports').delete().eq('vendorId', vendorId);
  await supabase.from('store_visits').delete().eq('vendorId', vendorId);
  await supabase.from('vendors').delete().eq('id', vendorId);
  await supabase.from('account').delete().eq('userId', userId);
  await supabase.from('session').delete().eq('userId', userId);
  await supabase.from('user').delete().eq('id', userId);
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

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get('vendorId');
  if (!vendorId) return Response.json({ error: 'vendorId required' }, { status: 400 });

  const { data: vendor } = await supabase.from('vendors').select('id, userId').eq('id', vendorId).single();
  if (!vendor) return Response.json({ error: 'Vendor not found' }, { status: 404 });

  await deleteVendorCascade(vendor.id, vendor.userId);
  return Response.json({ success: true });
}
