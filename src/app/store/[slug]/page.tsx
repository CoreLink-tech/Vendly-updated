import { Suspense } from 'react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { sanitizeSearchInput } from '@/lib/sanitize';
import StoreClient from './StoreClient';

// Queried directly against Supabase (same minimal shape as
// api/store/[slug]/route.ts) rather than self-fetching our own API route —
// self-fetching a Next.js API from a server component adds an extra
// network hop that's unreliable in serverless and needs a NEXT_PUBLIC_SITE_URL
// env var this project doesn't otherwise set. Falls back to the site
// defaults (from layout.tsx) on any error/missing vendor rather than
// throwing — a bad OG preview is fine, a broken storefront isn't.
export async function generateMetadata(
  { params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ product?: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const { product: productCode } = await searchParams;
  try {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id, businessName, description, logo')
      .eq('slug', slug.toLowerCase())
      .eq('status', 'active')
      .single();

    if (!vendor) return {};

    // bannerImage is fetched separately, same defensive pattern as
    // api/store/[slug]/route.ts — this column doesn't exist in every
    // environment yet, and a missing column here shouldn't take down
    // metadata generation for the whole store.
    let bannerImage: string | null = null;
    try {
      const { data: banner, error: bannerError } = await supabase
        .from('vendors')
        .select('bannerImage')
        .eq('id', vendor.id)
        .single();
      if (bannerError) throw bannerError;
      if (banner?.bannerImage) bannerImage = banner.bannerImage;
    } catch {
      // column unavailable in this environment — fall through, logo/default still work
    }

    let title = `${vendor.businessName} — Vendly`;
    let description = vendor.description?.trim() || `Shop ${vendor.businessName} on Vendly.`;
    // Prefer bannerImage (wider, more representative of the store) over
    // logo for the OG image; fall back to the site default if neither is set.
    let image = bannerImage || vendor.logo || undefined;

    // Shared product link (?product=<shareCode>) — swap in that product's
    // own name/price/photo so the WhatsApp/social preview shows what's
    // actually being shared instead of generic store branding. Falls back
    // to raw id too for links shared before shareCode existed. Same
    // defensive pattern as everything else here: any failure just falls
    // through to the store-level metadata above rather than breaking the page.
    const safeProductCode = productCode ? sanitizeSearchInput(productCode) : '';
    if (safeProductCode) {
      try {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('name, description, price, status, product_images(url, sortOrder)')
          .eq('vendorId', vendor.id)
          .or(`shareCode.eq.${safeProductCode},id.eq.${safeProductCode}`)
          .single();
        if (productError) throw productError;
        if (product && product.status === 'active') {
          const images = (product.product_images || []).sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder);
          title = `${product.name} — ${vendor.businessName}`;
          description = `₦${Number(product.price).toLocaleString()} — ${product.description?.trim() || `Available on ${vendor.businessName}'s Vendly store.`}`;
          if (images[0]?.url) image = images[0].url;
        }
      } catch (e) {
        console.error('[store/[slug]] product metadata unavailable, using store defaults:', e instanceof Error ? e.message : e);
      }
    }

    return {
      title,
      description,
      openGraph: { title, description, images: image ? [image] : undefined },
      twitter: { card: 'summary_large_image', title, description, images: image ? [image] : undefined },
    };
  } catch (e) {
    console.error('[store/[slug]] generateMetadata failed, using site defaults:', e instanceof Error ? e.message : e);
    return {};
  }
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: '#0d0d0d' }}
        >
          <div className="text-sm" style={{ color: '#22c55e' }}>
            Loading store…
          </div>
        </div>
      }
    >
      <StoreClient slug={slug} />
    </Suspense>
  );
}
