import { Suspense } from 'react';
import DashboardShell from './DashboardShell';
import { theme } from '@/lib/theme';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: theme.bg }}
        >
          <div className="text-sm" style={{ color: theme.green }}>
            Loading…
          </div>
        </div>
      }
    >
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
