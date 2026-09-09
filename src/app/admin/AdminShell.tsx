'use client';
import { NavIcon, IconName } from '@/components/NavIcon';
import { theme } from '@/lib/theme';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authClient } from '@/lib/auth-client';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' as IconName },
  { href: '/admin/users', label: 'Users', icon: 'users' as IconName },
  { href: '/admin/vendors', label: 'Vendors', icon: 'store' as IconName },
  { href: '/admin/activations', label: 'Activations', icon: 'key' as IconName },
  { href: '/admin/orders', label: 'Orders', icon: 'orders' as IconName },
  { href: '/admin/logistics', label: 'Logistics', icon: 'truck' as IconName },
  { href: '/admin/logistics-users', label: 'Logistics Users', icon: 'users' as IconName },
  { href: '/admin/referrals', label: 'Referrals', icon: 'link' as IconName },
  { href: '/admin/ambassadors', label: 'Ambassadors', icon: 'ambassador' as IconName },
  { href: '/admin/logistics-routes', label: 'Route Pricing', icon: 'truck' as IconName },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: 'money' as IconName },
  { href: '/admin/support', label: 'Support', icon: 'chat' as IconName },
  { href: '/admin/settings', label: 'Settings', icon: 'settings' as IconName },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
    fetch('/api/user/me')
      .then((r) => r.json())
      .then((data) => {
        const d = data as { user: { name: string; email: string; role: string } };
        if (!d.user || d.user.role !== 'admin') {
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.bg }}
      >
        <div className="text-sm" style={{ color: theme.green }}>
          Loading admin…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: theme.bg, color: theme.ink }}>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r transition-transform duration-200 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 260, backgroundColor: theme.surface, borderColor: theme.line }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: theme.line }}
        >
          <div className="flex items-center gap-2">
            <Image src="/logo-full.png" alt="Vendly" width={100} height={32} className="h-8 w-auto" priority />
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: theme.greenSoft, color: theme.green }}
            >
              ADMIN
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg"
            style={{ color: theme.muted }}
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm transition-colors"
                style={{
                  backgroundColor: isActive ? theme.greenSoft : 'transparent',
                  color: isActive ? theme.green : theme.muted,
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t" style={{ borderColor: theme.line }}>
          {user && (
            <div className="mb-3">
              <p className="text-sm font-medium truncate" style={{ color: theme.ink }}>
                {user.name}
              </p>
              <p className="text-[11px] truncate" style={{ color: theme.faint }}>
                {user.email}
              </p>
            </div>
          )}
          <button
            onClick={() => {
              void handleSignOut();
            }}
            className="w-full text-left text-sm px-3 py-2 rounded-xl transition-colors hover:bg-black/[0.03]"
            style={{ color: theme.muted }}
          >
            Sign out →
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center justify-between px-4 py-3 border-b md:hidden"
          style={{ borderColor: theme.line, backgroundColor: theme.surface }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg"
            style={{ color: theme.ink }}
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span className="text-sm font-semibold" style={{ color: theme.green }}>
            Admin
          </span>
          <div className="w-8" />
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
