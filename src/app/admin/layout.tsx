import { Suspense } from 'react';
import AdminShell from './AdminShell';
import { theme } from '@/lib/theme';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: theme.bg }}
        >
          <div className="text-sm" style={{ color: theme.green }}>
            Loading admin…
          </div>
        </div>
      }
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
