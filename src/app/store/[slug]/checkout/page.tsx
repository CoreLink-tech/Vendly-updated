import { Suspense } from 'react';
import CheckoutClient from './CheckoutClient';

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: '#0d0d0d' }}
        >
          <div className="text-sm" style={{ color: '#39FF14' }}>
            Loading checkout…
          </div>
        </div>
      }
    >
      <CheckoutClient slug={slug} />
    </Suspense>
  );
}
