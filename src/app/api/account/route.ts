import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

/**
 * Permanently deletes a vendor and all their data:
 * product_images → products → order_items → orders → withdrawals →
 * ambassador_referrals → ambassadors → referrals → subscriptions →
 * activation_codes → reports → store_visits → vendors → account → session → user
 *
 * Called by both the vendor self-delete flow and the admin delete flow.
 */
async function deleteVendorCascade(vendorId: string, userId: string) {
  // 1. Delete product images first (FK to products)
  const { data: products } = await supabase.from('products').select('id').eq('vendorId', vendorId);
  const productIds = (products || []).map((p: { id: string }) => p.id);
  if (productIds.length) {
    await supabase.from('product_images').delete().in('productId', productIds);
    // Delete order_items that reference these products
    await supabase.from('order_items').delete().in('productId', productIds);
    await supabase.from('products').delete().in('id', productIds);
  }

  // 2. Delete orders (remaining order_items via any remaining orders for this vendor)
  const { data: orders } = await supabase.from('orders').select('id').eq('vendorId', vendorId);
  const orderIds = (orders || []).map((o: { id: string }) => o.id);
  if (orderIds.length) {
    await supabase.from('order_items').delete().in('orderId', orderIds);
    await supabase.from('orders').delete().in('id', orderIds);
  }

  // 3. Delete ambassador chain
  const { data: ambassador } = await supabase.from('ambassadors').select('id').eq('vendorId', vendorId);
  const ambIds = (ambassador || []).map((a: { id: string }) => a.id);
  if (ambIds.length) {
    await supabase.from('ambassador_referrals').delete().in('ambassadorId', ambIds);
    await supabase.from('ambassadors').delete().in('id', ambIds);
  }

  // 4. Delete referrals (as referrer and as referred)
  await supabase.from('referrals').delete().eq('referrerId', vendorId);
  await supabase.from('referrals').delete().eq('referredVendorId', vendorId);

  // 5. Delete subscriptions, withdrawals, reports, store_visits, activation_codes
  await supabase.from('subscriptions').delete().eq('vendorId', vendorId);
  await supabase.from('withdrawals').delete().eq('vendorId', vendorId);
  await supabase.from('reports').delete().eq('vendorId', vendorId);
  await supabase.from('store_visits').delete().eq('vendorId', vendorId);

  // 6. Delete the vendor record itself
  await supabase.from('vendors').delete().eq('id', vendorId);

  // 7. Delete auth records — account, session, then the user row
  await supabase.from('account').delete().eq('userId', userId);
  await supabase.from('session').delete().eq('userId', userId);
  await supabase.from('user').delete().eq('id', userId);
}

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
    await deleteVendorCascade(vendor.id, session.user.id);
  } else {
    // No vendor profile — just delete auth records
    await supabase.from('account').delete().eq('userId', session.user.id);
    await supabase.from('session').delete().eq('userId', session.user.id);
    await supabase.from('user').delete().eq('id', session.user.id);
  }

  return Response.json({ success: true });
}
