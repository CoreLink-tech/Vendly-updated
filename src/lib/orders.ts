import { supabase } from './supabase';

/**
 * Call this whenever an order transitions to status "delivered" — whether
 * triggered from the vendor dashboard or the logistics dashboard.
 *
 * Per the agreed stock/payment model:
 * - Stock is only decremented once a sale is final (i.e. on delivery), not
 *   at checkout. This avoids holding stock hostage to abandoned/unconfirmed
 *   orders, at the cost of a possible oversell between order placement and
 *   delivery — which we flag on the order rather than silently swallow.
 * - For Pay on Delivery orders, the rider collects cash and hands it
 *   straight to the vendor, so the moment of delivery is also the moment
 *   the order is considered paid. (Pay Now orders are settled by the
 *   payment webhook instead, once that's built — this helper leaves
 *   paymentStatus alone if it's already "paid".)
 *
 * Idempotent: calling this on an order that's already "delivered" is a
 * no-op so stock never gets decremented twice.
 */
export async function settleOrderDelivery(orderId: string) {
  const { data: order } = await supabase
    .from('orders')
    .select('id, status, paymentMethod, paymentStatus, notes')
    .eq('id', orderId)
    .single();

  if (!order) return { ok: false as const, error: 'Order not found' };
  if (order.status === 'delivered') return { ok: true as const, alreadySettled: true };

  const { data: items } = await supabase
    .from('order_items')
    .select('productId, quantity')
    .eq('orderId', orderId);

  let oversold = false;
  for (const item of items || []) {
    if (!item.productId) continue;
    const { data: product } = await supabase.from('products').select('stock').eq('id', item.productId).single();
    if (!product) continue;
    const remaining = product.stock - item.quantity;
    if (remaining < 0) oversold = true;
    await supabase.from('products').update({ stock: Math.max(remaining, 0) }).eq('id', item.productId);
  }

  const updates: Record<string, unknown> = {
    status: 'delivered',
    updatedAt: new Date().toISOString(),
  };

  if (order.paymentMethod === 'payment_on_delivery' && order.paymentStatus !== 'paid') {
    updates.paymentStatus = 'paid';
  }

  if (oversold) {
    const flag = '⚠ Stock was insufficient by the time this was marked delivered — please reconcile with the customer/vendor.';
    updates.notes = order.notes ? `${order.notes}\n${flag}` : flag;
  }

  await supabase.from('orders').update(updates).eq('id', orderId);
  return { ok: true as const, oversold };
}
