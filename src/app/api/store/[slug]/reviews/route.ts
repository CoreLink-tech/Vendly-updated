import { supabase } from '@/lib/supabase';
import { getClientIp } from '@/lib/request';

// Statuses in orders.status that count as "done" — the delivery is
// complete enough that the customer has actually had the product in
// hand. There's no DB check constraint on this column (verified against
// the live schema), so this list is the real source of truth, and it
// mirrors STATUS_LABELS in StoreClient.tsx rather than the older, more
// generic set in the committed schema file.
const ELIGIBLE_STATUSES = ['delivered', 'completed'];

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  if (!productId) return Response.json({ error: 'productId is required' }, { status: 400 });

  const { data: vendor } = await supabase.from('vendors').select('id').eq('slug', slug.toLowerCase()).eq('status', 'active').single();
  if (!vendor) return Response.json({ error: 'Store not found' }, { status: 404 });

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, customerName, rating, comment, createdAt')
    .eq('productId', productId)
    .eq('vendorId', vendor.id)
    .eq('status', 'published')
    .order('createdAt', { ascending: false });

  const list = reviews || [];
  const avgRating = list.length ? list.reduce((sum, r) => sum + r.rating, 0) / list.length : null;

  return Response.json({ reviews: list, avgRating, count: list.length });
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await request.json() as {
    orderNumber?: string;
    productId?: string;
    customerName?: string;
    rating?: number;
    comment?: string;
  };

  const orderNumber = (body.orderNumber || '').trim();
  const productId = body.productId || '';
  const customerName = (body.customerName || '').trim().slice(0, 100);
  const comment = (body.comment || '').trim().slice(0, 1000);
  const rating = Math.round(Number(body.rating));

  if (!orderNumber || !productId || !customerName) {
    return Response.json({ error: 'Order number, product, and name are required' }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
  }

  const { data: vendor } = await supabase.from('vendors').select('id').eq('slug', slug.toLowerCase()).eq('status', 'active').single();
  if (!vendor) return Response.json({ error: 'Store not found' }, { status: 404 });

  // Eligibility: the order must belong to this vendor, be far enough
  // along to count as done, and actually contain this product.
  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('orderNumber', orderNumber)
    .eq('vendorId', vendor.id)
    .single();

  if (!order) {
    return Response.json({ error: "We couldn't find that order number for this store" }, { status: 400 });
  }
  if (!ELIGIBLE_STATUSES.includes(order.status)) {
    return Response.json({ error: 'This order needs to be delivered before you can review it' }, { status: 400 });
  }

  const { data: item } = await supabase
    .from('order_items')
    .select('id')
    .eq('orderId', order.id)
    .eq('productId', productId)
    .single();
  if (!item) {
    return Response.json({ error: "This product wasn't part of that order" }, { status: 400 });
  }

  // Rate-limit by IP, same pattern as store/[slug]/report/route.ts — 3
  // submissions/hour per vendor, generous for a real customer leaving a
  // few reviews, restrictive for a scripted flood.
  const ip = getClientIp(request);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('vendorId', vendor.id)
    .eq('ipAddress', ip)
    .gte('createdAt', oneHourAgo);
  if ((recentCount || 0) >= 3) {
    return Response.json({ error: 'Too many reviews submitted. Please try again later.' }, { status: 429 });
  }

  const { error } = await supabase.from('reviews').insert({
    productId,
    vendorId: vendor.id,
    orderId: order.id,
    customerName,
    rating,
    comment,
    ipAddress: ip,
  });

  if (error) {
    // The (orderId, productId) unique constraint is what actually blocks
    // a duplicate review — surface that as a friendly message instead of
    // a raw DB error.
    if (error.code === '23505') {
      return Response.json({ error: "You've already reviewed this item" }, { status: 400 });
    }
    return Response.json({ error: 'Failed to submit review' }, { status: 500 });
  }

  return Response.json({ success: true }, { status: 201 });
}
