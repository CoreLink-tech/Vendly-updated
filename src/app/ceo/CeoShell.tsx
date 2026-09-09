'use client';
import { NavIcon, IconName } from '@/components/NavIcon';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { theme } from '@/lib/theme';

const NAV_ITEMS = [
  { href: '#overview', label: 'Business Overview', icon: 'dashboard' as IconName },
  { href: '#revenue', label: 'Revenue', icon: 'money' as IconName },
  { href: '#funnel', label: 'Customer Funnel', icon: 'users' as IconName },
  { href: '#subscriptions', label: 'Subscriptions', icon: 'card' as IconName },
  { href: '#financial', label: 'Financial Activity', icon: 'flag' as IconName },
];

export default function CeoShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/user/me', { cache: 'no-store' })
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="text-sm" style={{ color: theme.green }}>Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: theme.bg, fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r transition-transform duration-200 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 240, backgroundColor: theme.surface, borderColor: theme.line }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: theme.line }}>
          <div>
            <span className="text-xl font-semibold tracking-tight" style={{ color: theme.green }}>Vendly</span>
            <span
              className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: theme.greenSoft, color: theme.green }}
            >
              CEO
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden" style={{ color: theme.muted }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-colors"
              style={{ color: theme.muted }}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="px-4 py-4 border-t" style={{ borderColor: theme.line }}>
          <div className="mb-3">
            <p className="text-xs font-medium truncate" style={{ color: theme.ink }}>{user.name}</p>
            <p className="text-[10px] truncate" style={{ color: theme.faint }}>{user.email}</p>
          </div>
          <button
            onClick={() => { void handleSignOut(); }}
            className="w-full text-left text-xs px-3 py-2 rounded-lg"
            style={{ color: theme.muted }}
          >
            Sign out →
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center justify-between px-4 py-4 border-b md:hidden"
          style={{ borderColor: theme.line, backgroundColor: theme.surface }}
        >
          <button onClick={() => setSidebarOpen(true)} className="text-lg" style={{ color: theme.ink }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span className="text-base font-semibold" style={{ color: theme.green }}>CEO</span>
          <div className="w-6" />
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
