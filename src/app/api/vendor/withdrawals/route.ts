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
  const { amount, bankName, accountNumber, accountName, type = 'referral' } = body;

  if (!amount || !bankName || !accountNumber || !accountName) {
    return Response.json({ error: 'All fields required' }, { status: 400 });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return Response.json({ error: 'Enter a valid amount' }, { status: 400 });
  }

  // Validate amount does not exceed withdrawable balance
  let withdrawableBalance = 0;

  if (type === 'ambassador') {
    const { data: amb } = await supabase.from('ambassadors').select('id').eq('vendorId', vendor.id).eq('status', 'approved').single();
    if (!amb) return Response.json({ error: 'No approved ambassador account found' }, { status: 400 });

    const [{ data: earnings }, { data: prevWithdrawals }] = await Promise.all([
      supabase.from('ambassador_referrals').select('commission').eq('ambassadorId', amb.id),
      supabase.from('withdrawals').select('amount').eq('vendorId', vendor.id).eq('type', 'ambassador').in('status', ['completed', 'pending']),
    ]);
    const totalEarnings = (earnings || []).reduce((s: number, r: { commission: number }) => s + Number(r.commission), 0);
    const totalWithdrawn = (prevWithdrawals || []).reduce((s: number, w: { amount: number }) => s + Number(w.amount), 0);
    withdrawableBalance = Math.max(0, totalEarnings - totalWithdrawn);
  } else {
    // referral type
    const [{ data: referrals }, { data: prevWithdrawals }] = await Promise.all([
      supabase.from('referrals').select('commission').eq('referrerId', vendor.id).eq('status', 'completed'),
      supabase.from('withdrawals').select('amount').eq('vendorId', vendor.id).eq('type', 'referral').in('status', ['completed', 'pending']),
    ]);
    const totalEarnings = (referrals || []).reduce((s: number, r: { commission: string }) => s + parseFloat(r.commission || '0'), 0);
    const totalWithdrawn = (prevWithdrawals || []).reduce((s: number, w: { amount: string }) => s + parseFloat(w.amount?.toString() || '0'), 0);
    withdrawableBalance = Math.max(0, totalEarnings - totalWithdrawn);
  }

  if (amount > withdrawableBalance) {
    return Response.json({
      error: `Amount exceeds your withdrawable balance of ₦${withdrawableBalance.toLocaleString()}`,
    }, { status: 400 });
  }

  const { data: withdrawal } = await supabase.from('withdrawals').insert({
    vendorId: vendor.id,
    amount,
    bankName,
    accountNumber,
    accountName,
    type,
    status: 'pending',
  }).select().single();

  return Response.json({ withdrawal }, { status: 201 });
}
