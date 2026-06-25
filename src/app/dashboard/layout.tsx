import { Suspense } from 'react';
import DashboardShell from './DashboardShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: '#0d0d0d' }}
        >
          <div className="text-sm" style={{ color: '#39FF14' }}>
            Loading…
          </div>
        </div>
      }
    >
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
