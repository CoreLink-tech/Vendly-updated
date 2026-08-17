import { supabase } from '@/lib/supabase';
import { deleteImageByUrl } from '@/lib/storage-path';

/**
 * Permanently deletes a vendor and everything belonging to them.
 *
 * Every FK pointing at vendors.id or user.id is CASCADE or SET NULL at the
 * database level (verified against the live schema), so deleting the
 * vendor and user rows alone is actually enough to remove every related
 * database row — ambassador_referrals, ambassadors, orders, order_items,
 * product_images, products, referrals, reports, store_visits,
 * subscriptions, withdrawals, account, session all cascade automatically.
 * The explicit per-table deletes below aren't strictly required for
 * correctness, but are kept for clarity and to control ordering.
 *
 * What the database CANNOT do automatically: delete the actual image
 * files sitting in storage (R2 or legacy Supabase Storage). A DB row
 * disappearing doesn't touch the file it pointed to. That has to happen
 * here, before the rows referencing those URLs are gone.
 */
export async function deleteVendorCascade(vendorId: string, userId: string): Promise<{ errors: string[] }> {
  const errors: string[] = [];
  const track = (label: string, error: { message: string } | null) => {
    if (error) errors.push(`${label}: ${error.message}`);
  };

  // Clean up storage BEFORE deleting the rows that hold the URLs.
  const { data: productImages } = await supabase.from('product_images').select('url, productId').in(
    'productId',
    (await supabase.from('products').select('id').eq('vendorId', vendorId)).data?.map((p: { id: string }) => p.id) || []
  );
  const { data: vendorRow } = await supabase.from('vendors').select('logo').eq('id', vendorId).single();

  await Promise.all([
    ...(productImages || []).map((img: { url: string }) => deleteImageByUrl(img.url, 'product-images')),
    ...(vendorRow?.logo ? [deleteImageByUrl(vendorRow.logo, 'vendor-logos')] : []),
  ]);

  const { data: products } = await supabase.from('products').select('id').eq('vendorId', vendorId);
  const productIds = (products || []).map((p: { id: string }) => p.id);
  if (productIds.length) {
    track('product_images', (await supabase.from('product_images').delete().in('productId', productIds)).error);
    track('order_items (by product)', (await supabase.from('order_items').delete().in('productId', productIds)).error);
    track('products', (await supabase.from('products').delete().in('id', productIds)).error);
  }

  const { data: orders } = await supabase.from('orders').select('id').eq('vendorId', vendorId);
  const orderIds = (orders || []).map((o: { id: string }) => o.id);
  if (orderIds.length) {
    track('order_items (by order)', (await supabase.from('order_items').delete().in('orderId', orderIds)).error);
    track('orders', (await supabase.from('orders').delete().in('id', orderIds)).error);
  }

  const { data: ambassador } = await supabase.from('ambassadors').select('id').eq('vendorId', vendorId);
  const ambIds = (ambassador || []).map((a: { id: string }) => a.id);
  if (ambIds.length) {
    track('ambassador_referrals', (await supabase.from('ambassador_referrals').delete().in('ambassadorId', ambIds)).error);
    track('ambassadors', (await supabase.from('ambassadors').delete().in('id', ambIds)).error);
  }

  track('referrals (as referrer)', (await supabase.from('referrals').delete().eq('referrerId', vendorId)).error);
  track('referrals (as referred)', (await supabase.from('referrals').delete().eq('referredVendorId', vendorId)).error);
  track('subscriptions', (await supabase.from('subscriptions').delete().eq('vendorId', vendorId)).error);
  track('withdrawals', (await supabase.from('withdrawals').delete().eq('vendorId', vendorId)).error);
  track('reports', (await supabase.from('reports').delete().eq('vendorId', vendorId)).error);
  track('store_visits', (await supabase.from('store_visits').delete().eq('vendorId', vendorId)).error);
  track('vendors', (await supabase.from('vendors').delete().eq('id', vendorId)).error);
  track('account', (await supabase.from('account').delete().eq('userId', userId)).error);
  track('session', (await supabase.from('session').delete().eq('userId', userId)).error);
  track('user', (await supabase.from('user').delete().eq('id', userId)).error);

  if (errors.length) console.error('[deleteVendorCascade] partial failure:', errors.join('; '));

  return { errors };
}
