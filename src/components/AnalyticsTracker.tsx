'use client';

import { useEffect } from 'react';

/**
 * Fire-and-forget pageview to /api/track (server holds the archive API key).
 * Runs once per mount; does not block UI.
 */
export function AnalyticsTracker() {
  useEffect(() => {
    try {
      const path = window.location.pathname || '/';
      void fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
        keepalive: true,
      }).catch(() => {
        // fail soft — analytics must never break the app
      });
    } catch {
      // ignore
    }
  }, []);

  return null;
}
