import { Suspense } from 'react';
import StoreClient from './StoreClient';

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
