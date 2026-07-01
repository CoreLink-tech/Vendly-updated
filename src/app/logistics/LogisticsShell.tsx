'use client';
import { NavIcon } from '@/components/NavIcon';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

const NAV_ITEMS = [
  { href: '/logistics', label: 'Overview', icon: 'dashboard' as const },
  { href: '/logistics/orders', label: 'All Orders', icon: 'orders' as const },
  { href: '/logistics/pending', label: 'Pending Pickup', icon: 'truck' as const },
  { href: '/logistics/in-transit', label: 'In Transit', icon: 'link' as const },
  { href: '/logistics/delivered', label: 'Delivered', icon: 'check' as const },
  { href: '/logistics/rates', label: 'Delivery Rates', icon: 'money' as const },
];

export default function LogisticsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => r.json())
      .then((data) => {
        const d = data as { user: { name: string; email: string; role: string } };
        if (!d.user || !['admin', 'logistics'].includes(d.user.role)) {
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

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0d0d0d' }}>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r transition-transform duration-200 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 240, backgroundColor: '#111111', borderColor: '#2a2a2a' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#2a2a2a' }}>
          <div className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Vendly" className="h-10 w-auto" />
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>
              LOGISTICS
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden" style={{ color: '#888888' }}>
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-colors"
                style={{
                  backgroundColor: isActive ? '#22c55e15' : 'transparent',
                  color: isActive ? '#22c55e' : '#888888',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t" style={{ borderColor: '#2a2a2a' }}>
          {user && (
            <div className="mb-3">
              <p className="text-xs font-medium truncate" style={{ color: '#f5f5f5' }}>{user.name}</p>
              <p className="text-[10px] truncate" style={{ color: '#555555' }}>{user.email}</p>
            </div>
          )}
          <button
            onClick={() => { void handleSignOut(); }}
            className="w-full text-left text-xs px-3 py-2 rounded-lg"
            style={{ color: '#888888' }}
          >
            Sign out →
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center justify-between px-4 py-4 border-b md:hidden"
          style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}
        >
          <button onClick={() => setSidebarOpen(true)} style={{ color: '#f5f5f5' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span className="text-base font-semibold" style={{ color: '#22c55e' }}>Logistics</span>
          <div className="w-6" />
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
