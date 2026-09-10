import { supabase } from '@/lib/supabase';
import { withImagesList } from '@/lib/utils';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();

  // Core fields only — these have existed since launch. Keeping this query
  // minimal means a missing/renamed column elsewhere (e.g. a newer
  // customization field) can never take down the whole storefront.
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('id, businessName, description, logo, location, phone, address, slug, status, useLogistics, allowPayOnDelivery, bankName, accountNumber, accountName, user(email)')
    .eq('slug', normalizedSlug)
    .eq('status', 'active')
    .single();

  if (vendorError) console.error('[store/[slug]] vendor lookup failed:', vendorError.message);
  if (!vendor) return Response.json({ error: 'Store not found' }, { status: 404 });

  // Optional theme columns, fetched separately. If this errors (e.g. the
  // columns don't exist yet in this environment) we fall back to defaults
  // instead of breaking the storefront.
  let primaryColor = '#22c55e';
  let backgroundColor = '#0d0d0d';
  try {
    const { data: theme, error: themeError } = await supabase
      .from('vendors')
      .select('primaryColor, backgroundColor')
      .eq('id', vendor.id)
      .single();
    if (themeError) throw themeError;
    if (theme?.primaryColor) primaryColor = theme.primaryColor;
    if (theme?.backgroundColor) backgroundColor = theme.backgroundColor;
  } catch (e) {
    console.error('[store/[slug]] theme columns unavailable, using defaults:', e instanceof Error ? e.message : e);
  }

  // Same defensive pattern as the theme columns above — a storefront
  // should never 500 just because this migration hasn't landed yet in a
  // given environment.
  let bannerImage: string | null = null;
  try {
    const { data: banner, error: bannerError } = await supabase
      .from('vendors')
      .select('bannerImage')
      .eq('id', vendor.id)
      .single();
    if (bannerError) throw bannerError;
    if (banner?.bannerImage) bannerImage = banner.bannerImage;
  } catch (e) {
    console.error('[store/[slug]] bannerImage column unavailable, defaulting to none:', e instanceof Error ? e.message : e);
  }

  const { data: products } = await supabase.from('products').select('*, product_images(url, sortOrder)').eq('vendorId', vendor.id).eq('status', 'active').gt('stock', 0).order('createdAt', { ascending: false });

  // Aggregate rating per product in one query rather than one request per
  // card from the storefront. Defensive like the columns above — a
  // missing reviews table shouldn't break the storefront.
  let reviewStats = new Map<string, { avgRating: number; reviewCount: number }>();
  try {
    const { data: reviewRows, error: reviewsError } = await supabase
      .from('reviews')
      .select('productId, rating')
      .eq('vendorId', vendor.id)
      .eq('status', 'published');
    if (reviewsError) throw reviewsError;
    const byProduct = new Map<string, number[]>();
    for (const r of reviewRows || []) {
      const arr = byProduct.get(r.productId) || [];
      arr.push(r.rating);
      byProduct.set(r.productId, arr);
    }
    reviewStats = new Map(
      Array.from(byProduct.entries()).map(([productId, ratings]) => [
        productId,
        { avgRating: ratings.reduce((s, n) => s + n, 0) / ratings.length, reviewCount: ratings.length },
      ])
    );
  } catch (e) {
    console.error('[store/[slug]] reviews table unavailable, skipping ratings:', e instanceof Error ? e.message : e);
  }

  const productsWithReviews = withImagesList(products).map((p: any) => ({
    ...p,
    avgRating: reviewStats.get(p.id)?.avgRating ?? null,
    reviewCount: reviewStats.get(p.id)?.reviewCount ?? 0,
  }));

  // Platform-wide override — isolated the same way as the theme columns
  // above, so if this table/row is ever missing it fails safe (POD stays
  // available) rather than breaking the whole storefront.
  let platformPayOnDeliveryEnabled = true;
  try {
    const { data: setting } = await supabase.from('platform_settings').select('value').eq('key', 'pay_on_delivery_enabled').single();
    if (setting) platformPayOnDeliveryEnabled = setting.value;
  } catch (e) {
    console.error('[store/[slug]] platform_settings unavailable, defaulting to enabled:', e instanceof Error ? e.message : e);
  }

  return Response.json({
    vendor: { ...vendor, primaryColor, backgroundColor, bannerImage },
    products: productsWithReviews,
    platformPayOnDeliveryEnabled,
  });
}
