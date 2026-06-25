import { Suspense } from 'react';
import AdminShell from './AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: '#0d0d0d' }}
        >
          <div className="text-sm" style={{ color: '#39FF14' }}>
            Loading admin…
          </div>
        </div>
      }
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
