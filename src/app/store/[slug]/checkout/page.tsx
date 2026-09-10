import { Suspense } from 'react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import CheckoutClient from './CheckoutClient';

// Checkout links aren't meant to be shared, so no OG image tuning here —
// just a title that reflects the vendor instead of the generic site default.
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('businessName')
      .eq('slug', slug.toLowerCase())
      .eq('status', 'active')
      .single();
    if (!vendor) return {};
    return { title: `Checkout — ${vendor.businessName}` };
  } catch (e) {
    console.error('[checkout] generateMetadata failed, using site defaults:', e instanceof Error ? e.message : e);
    return {};
  }
}

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: '#0d0d0d' }}
        >
          <div className="text-sm" style={{ color: '#22c55e' }}>
            Loading checkout…
          </div>
        </div>
      }
    >
      <CheckoutClient slug={slug} />
    </Suspense>
  );
}
