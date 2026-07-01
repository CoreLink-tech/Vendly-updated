'use client';

import { useEffect, useState } from 'react';

interface FoundingStatus {
  used: number;
  claimed: number;
  total: number;
  isOpen: boolean;
}

export function FoundingCounter() {
  const [status, setStatus] = useState<FoundingStatus | null>(null);

  useEffect(() => {
    fetch('/api/public/founding-status')
      .then((r) => r.json())
      .then((d) => setStatus(d as FoundingStatus))
      .catch(() => setStatus(null));
  }, []);

  if (!status) return null;

  const remaining = Math.max(0, status.total - status.claimed);
  const pct = Math.min(100, Math.round((status.claimed / status.total) * 100));

  if (!status.isOpen) {
    return (
      <div className="max-w-sm mx-auto mb-2">
        <p className="text-sm font-semibold" style={{ color: '#888888' }}>
          All 100 Founding slots have been claimed
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mb-2">
      <div className="flex items-center justify-between mb-2 text-xs">
        <span className="font-semibold" style={{ color: '#22c55e' }}>
          {status.claimed}/{status.total} claimed
        </span>
        <span style={{ color: '#888888' }}>{remaining} left</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#2a2a2a' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: '#22c55e' }}
        />
      </div>
    </div>
  );
}
