import { Suspense } from 'react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import StoreClient from './StoreClient';

// Queried directly against Supabase (same minimal shape as
// api/store/[slug]/route.ts) rather than self-fetching our own API route —
// self-fetching a Next.js API from a server component adds an extra
// network hop that's unreliable in serverless and needs a NEXT_PUBLIC_SITE_URL
// env var this project doesn't otherwise set. Falls back to the site
// defaults (from layout.tsx) on any error/missing vendor rather than
// throwing — a bad OG preview is fine, a broken storefront isn't.
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
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

    const title = `${vendor.businessName} — Vendly`;
    const description = vendor.description?.trim() || `Shop ${vendor.businessName} on Vendly.`;
    // Prefer bannerImage (wider, more representative of the store) over
    // logo for the OG image; fall back to the site default if neither is set.
    const image = bannerImage || vendor.logo || undefined;

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
