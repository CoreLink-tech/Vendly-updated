'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👤' },
  { href: '/admin/vendors', label: 'Vendors', icon: '🏪' },
  { href: '/admin/activations', label: 'Activations', icon: '🔑' },
  { href: '/admin/orders', label: 'Orders', icon: '🧾' },
  { href: '/admin/logistics', label: 'Logistics', icon: '🚚' },
  { href: '/admin/referrals', label: 'Referrals', icon: '🔗' },
  { href: '/admin/ambassadors', label: 'Ambassadors', icon: '🤝' },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: '💰' },
  { href: '/admin/support', label: 'Support', icon: '💬' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => r.json())
      .then((data) => {
        const d = data as { user: { name: string; email: string; role: string } };
        if (!d.user || d.user.role !== 'admin') {
          router.push('/dashboard');
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

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: '#0d0d0d', fontFamily: 'Inter, sans-serif' }}
    >
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r transition-transform duration-200 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 240, backgroundColor: '#111111', borderColor: '#2a2a2a' }}
      >
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: '#2a2a2a' }}
        >
          <div>
            <span className="text-xl font-semibold tracking-tight" style={{ color: '#39FF14' }}>
              Vendly
            </span>
            <span
              className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: '#39FF1420', color: '#39FF14' }}
            >
              ADMIN
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
            style={{ color: '#888888' }}
          >
            ✕
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-colors"
                style={{
                  backgroundColor: isActive ? '#39FF1415' : 'transparent',
                  color: isActive ? '#39FF14' : '#888888',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t" style={{ borderColor: '#2a2a2a' }}>
          {user && (
            <div className="mb-3">
              <p className="text-xs font-medium truncate" style={{ color: '#f5f5f5' }}>
                {user.name}
              </p>
              <p className="text-[10px] truncate" style={{ color: '#555555' }}>
                {user.email}
              </p>
            </div>
          )}
          <button
            onClick={() => {
              void handleSignOut();
            }}
            className="w-full text-left text-xs px-3 py-2 rounded-lg"
            style={{ color: '#888888' }}
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
          style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-lg"
            style={{ color: '#f5f5f5' }}
          >
            ☰
          </button>
          <span className="text-base font-semibold" style={{ color: '#39FF14' }}>
            Admin
          </span>
          <div className="w-6" />
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
