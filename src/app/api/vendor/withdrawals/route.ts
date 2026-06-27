import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: vendor } = await supabase.from('vendors').select('id').eq('userId', session.user.id).single();
  if (!vendor) return Response.json({ withdrawals: [] });

  const { data: withdrawals } = await supabase.from('withdrawals').select('*').eq('vendorId', vendor.id).order('createdAt', { ascending: false });
  return Response.json({ withdrawals });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: vendor } = await supabase.from('vendors').select('id').eq('userId', session.user.id).single();
  if (!vendor) return Response.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json() as { amount: number; bankName: string; accountNumber: string; accountName: string; type?: string };
  if (!body.amount || !body.bankName || !body.accountNumber || !body.accountName) return Response.json({ error: 'All fields required' }, { status: 400 });

  const { data: withdrawal } = await supabase.from('withdrawals').insert({ vendorId: vendor.id, amount: body.amount, bankName: body.bankName, accountNumber: body.accountNumber, accountName: body.accountName, type: body.type || 'referral', status: 'pending' }).select().single();
  return Response.json({ withdrawal }, { status: 201 });
}
