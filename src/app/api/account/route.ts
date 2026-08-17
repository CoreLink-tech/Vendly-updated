import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';
import { deleteVendorCascade } from '@/lib/delete-vendor';

// DELETE /api/account — vendor deletes their own account
export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as { confirm: string };
  if (body.confirm !== 'DELETE MY ACCOUNT') {
    return Response.json({ error: 'Type DELETE MY ACCOUNT to confirm' }, { status: 400 });
  }

  const { data: vendor } = await supabase.from('vendors').select('id').eq('userId', session.user.id).single();

  if (vendor) {
    const { errors } = await deleteVendorCascade(vendor.id, session.user.id);
    if (errors.length) {
      // Best-effort by design — most steps that fail here are non-fatal
      // (a row that was already gone, a storage file that 404s). Surfacing
      // this rather than silently claiming full success either way, since
      // this is a permanent-delete promise and partial failure is worth
      // knowing about even if it doesn't block the account from closing.
      return Response.json({ success: true, warning: 'Account deleted, but some data may not have fully cleared. Contact support if you notice anything unexpected.' });
    }
  } else {
    // No vendor profile — just delete auth records
    await supabase.from('account').delete().eq('userId', session.user.id);
    await supabase.from('session').delete().eq('userId', session.user.id);
    await supabase.from('user').delete().eq('id', session.user.id);
  }

  return Response.json({ success: true });
}
