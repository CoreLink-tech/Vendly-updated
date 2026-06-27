import { Suspense } from 'react';
import LogisticsShell from './LogisticsShell';

export default function LogisticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0d0d' }}>
          <div className="text-sm" style={{ color: '#22c55e' }}>Loading…</div>
        </div>
      }
    >
      <LogisticsShell>{children}</LogisticsShell>
    </Suspense>
  );
}
