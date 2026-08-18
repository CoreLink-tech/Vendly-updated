'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function CeoShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => r.json())
      .then((data) => {
        const d = data as { user: { name: string; email: string; role: string } };
        if (!d.user || (d.user.role !== 'ceo' && d.user.role !== 'admin')) {
          router.push('/account/signin');
          return;
        }
        setUser(d.user);
      })
      .catch(() => router.push('/account/signin'));
  }, [router]);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0d0d' }}>
        <div className="text-sm" style={{ color: '#22c55e' }}>Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d0d0d', fontFamily: 'Inter, sans-serif' }}>
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight" style={{ color: '#22c55e' }}>
            Vendly
          </span>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}
          >
            CEO
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm hidden sm:inline" style={{ color: '#888888' }}>{user.email}</span>
          <button
            onClick={handleSignOut}
            className="text-sm px-3 py-1.5 rounded border"
            style={{ borderColor: '#2a2a2a', color: '#cccccc' }}
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="px-6 py-8 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
