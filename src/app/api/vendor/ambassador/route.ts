import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: vendor } = await supabase.from('vendors').select('id').eq('userId', session.user.id).single();
  if (!vendor) return Response.json({ status: null });

  const { data: amb } = await supabase.from('ambassadors').select('*').eq('vendorId', vendor.id).order('createdAt', { ascending: false }).limit(1).single();
  if (!amb) return Response.json({ status: null });
  if (amb.status !== 'approved') return Response.json({ status: amb.status });

  const [{ count: referredCount }, { data: earnings }, { data: withdrawals }] = await Promise.all([
    supabase.from('ambassador_referrals').select('*', { count: 'exact', head: true }).eq('ambassadorId', amb.id),
    supabase.from('ambassador_referrals').select('commission').eq('ambassadorId', amb.id),
    supabase.from('withdrawals').select('amount').eq('vendorId', vendor.id).eq('type', 'ambassador').in('status', ['completed', 'pending']),
  ]);

  const totalEarnings = (earnings || []).reduce((s: number, r: { commission: number }) => s + Number(r.commission), 0);
  const totalWithdrawn = (withdrawals || []).reduce((s: number, w: { amount: number }) => s + Number(w.amount), 0);

  return Response.json({ status: 'approved', ambassadorCode: amb.ambassadorCode, referredVendors: referredCount, withdrawableBalance: Math.max(0, totalEarnings - totalWithdrawn) });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: vendor } = await supabase.from('vendors').select('*').eq('userId', session.user.id).single();
  if (!vendor) return Response.json({ error: 'Vendor profile not found' }, { status: 404 });
  if (vendor.status !== 'active') return Response.json({ error: 'Activate your store first' }, { status: 400 });

  const { data: existing } = await supabase.from('ambassadors').select('id').eq('vendorId', vendor.id).in('status', ['pending', 'approved']);
  if (existing?.length) return Response.json({ error: 'Application already submitted' }, { status: 400 });

  const body = await request.json() as { fullName: string; email: string; phone: string; businessName: string; reason: string };
  if (!body.fullName || !body.email || !body.phone || !body.businessName || !body.reason) return Response.json({ error: 'All fields required' }, { status: 400 });

  const { data: ambassador } = await supabase.from('ambassadors').insert({ vendorId: vendor.id, ...body, status: 'pending' }).select().single();
  return Response.json({ ambassador }, { status: 201 });
}
