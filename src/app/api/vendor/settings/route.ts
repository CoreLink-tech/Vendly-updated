import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: vendor } = await supabase
    .from('vendors')
    .select('logisticsEnabled, payLaterEnabled, bankName, accountNumber, accountName')
    .eq('userId', session.user.id)
    .single();

  return Response.json({ settings: vendor || null });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as {
    logisticsEnabled?: boolean;
    payLaterEnabled?: boolean;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  };

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (body.logisticsEnabled !== undefined) updates.logisticsEnabled = body.logisticsEnabled;
  if (body.payLaterEnabled !== undefined) updates.payLaterEnabled = body.payLaterEnabled;
  if (body.bankName !== undefined) updates.bankName = body.bankName;
  if (body.accountNumber !== undefined) updates.accountNumber = body.accountNumber;
  if (body.accountName !== undefined) updates.accountName = body.accountName;

  const { data } = await supabase
    .from('vendors')
    .update(updates)
    .eq('userId', session.user.id)
    .select('logisticsEnabled, payLaterEnabled, bankName, accountNumber, accountName')
    .single();

  return Response.json({ settings: data });
}
