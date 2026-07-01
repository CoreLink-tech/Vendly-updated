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

  const { data: products } = await supabase.from('products').select('*, product_images(url, sortOrder)').eq('vendorId', vendor.id).eq('status', 'active').gt('stock', 0).order('createdAt', { ascending: false });

  return Response.json({ vendor: { ...vendor, primaryColor, backgroundColor }, products: withImagesList(products) });
}
