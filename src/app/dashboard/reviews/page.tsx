'use client';

import { useEffect, useState } from 'react';
import { theme } from '@/lib/theme';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  products: { name: string } | null;
}

function fmtDate(str: string) {
  return new Date(str).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={i < rating ? theme.green : 'none'}
          stroke={theme.green}
          strokeWidth="2"
          className="w-3.5 h-3.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = () => {
    fetch('/api/vendor/reviews')
      .then((r) => r.json())
      .then((d) => {
        setReviews((d as { reviews: Review[] }).reviews || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async (review: Review) => {
    setUpdatingId(review.id);
    const newStatus = review.status === 'published' ? 'hidden' : 'published';
    await fetch(`/api/vendor/reviews/${review.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setReviews((rs) => rs.map((r) => (r.id === review.id ? { ...r, status: newStatus } : r)));
    setUpdatingId(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: theme.ink }}>
          Reviews
        </h1>
        <p className="text-sm mt-1" style={{ color: theme.muted }}>
          Reviews left by customers on your products. Hidden reviews stay off your storefront but aren&apos;t deleted.
        </p>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: theme.surface, borderColor: theme.line }}>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div
              className="w-5 h-5 border-2 rounded-full"
              style={{ borderColor: theme.green, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}
            />
            <style jsx global>{`
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: theme.faint }}>No reviews yet.</p>
            <p className="text-xs mt-1" style={{ color: theme.faint }}>
              Customers can leave a review from a completed order on your storefront.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: theme.line }}>
            {reviews.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-4 px-4 md:px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold" style={{ color: theme.ink }}>{r.customerName}</p>
                    <Stars rating={r.rating} />
                    {r.status === 'hidden' && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#ef444420', color: '#ef4444' }}>
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: theme.muted }}>
                    {r.products?.name || 'Product removed'} · {fmtDate(r.createdAt)}
                  </p>
                  {r.comment && (
                    <p className="text-sm mt-2" style={{ color: theme.muted }}>{r.comment}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    void toggleStatus(r);
                  }}
                  disabled={updatingId === r.id}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50"
                  style={{ borderColor: theme.line, color: theme.muted }}
                >
                  {r.status === 'published' ? 'Hide' : 'Unhide'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
