'use client';
import { NavIcon, IconName } from '@/components/NavIcon';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' as IconName },
  { href: '/dashboard/products', label: 'Products', icon: 'package' as IconName },
  { href: '/dashboard/orders', label: 'Orders', icon: 'orders' as IconName },
  { href: '/dashboard/store-settings', label: 'Store Settings', icon: 'store' as IconName },
  { href: '/dashboard/subscription', label: 'Subscription', icon: 'card' as IconName },
  { href: '/dashboard/referrals', label: 'Referral Dashboard', icon: 'link' as IconName },
  { href: '/dashboard/ambassador', label: 'Ambassador', icon: 'ambassador' as IconName },
  { href: '/dashboard/support', label: 'Support', icon: 'chat' as IconName },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [vendor, setVendor] = useState<{
    businessName: string;
    status: string;
    slug: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/user/me');
      if (!res.ok) {
        router.push('/account/signin?callbackUrl=/dashboard');
        return;
      }
      const data = (await res.json()) as {
        user: { name: string; email: string };
        vendor: { businessName: string; status: string; slug: string } | null;
      };
      setUser(data.user);
      setVendor(data.vendor);

      // If vendor doesn't have a profile yet, create one
      if (!data.vendor) {
        // Check for referral code stored during signup
        const ref = typeof localStorage !== 'undefined' ? localStorage.getItem('vendly_ref') : null;
        const profileBody = ref ? { referredBy: ref } : {};
        await fetch('/api/vendor/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileBody),
        });
        if (ref && typeof localStorage !== 'undefined') localStorage.removeItem('vendly_ref');
        const res2 = await fetch('/api/user/me');
        const data2 = (await res2.json()) as {
          vendor: { businessName: string; status: string; slug: string } | null;
        };
        setVendor(data2.vendor);
      }
    }
    void load();
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
        {/* Logo */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: '#2a2a2a' }}
        >
          <div className="flex items-center">
            <img src="/logo-icon.png" alt="Vendly" className="h-8 w-auto" />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400"
            style={{ color: '#888888' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Vendor info */}
        {vendor && (
          <div className="px-4 py-4 border-b" style={{ borderColor: '#2a2a2a' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}
              >
                {(vendor.businessName || 'V')[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: '#f5f5f5' }}>
                  {vendor.businessName || 'My Store'}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full`}
                    style={{ backgroundColor: vendor.status === 'active' ? '#22c55e' : '#f59e0b' }}
                  />
                  <span className="text-[10px] capitalize" style={{ color: '#888888' }}>
                    {vendor.status}
                  </span>
                </div>
              </div>
            </div>
            {vendor.slug && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/store/${vendor.slug}`;
                  void navigator.clipboard.writeText(url);
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 1500);
                }}
                className="mt-3 w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border text-left transition-colors"
                style={{ borderColor: '#2a2a2a', backgroundColor: '#1a1a1a' }}
              >
                <span className="text-[11px] truncate" style={{ color: '#888888' }}>
                  /store/{vendor.slug}
                </span>
                <span className="text-[10px] font-semibold shrink-0" style={{ color: '#22c55e' }}>
                  {linkCopied ? 'Copied!' : 'Copy link'}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Nav items */}
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

        {/* Bottom */}
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
            className="w-full text-left text-xs px-3 py-2 rounded-lg transition-colors"
            style={{ color: '#888888' }}
          >
            Sign out →
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header
          className="flex items-center justify-between px-4 py-4 border-b md:hidden"
          style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-lg"
            style={{ color: '#f5f5f5' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <img src="/logo-icon.png" alt="Vendly" className="h-7 w-auto" />
          <div className="w-6" />
        </header>

        {/* Pending activation banner */}
        {vendor && vendor.status === 'pending' && (
          <div
            className="mx-4 mt-4 px-4 py-3 rounded-lg border flex items-center justify-between gap-3 text-sm"
            style={{ backgroundColor: '#22c55e08', borderColor: '#22c55e30' }}
          >
            <p style={{ color: '#aaaaaa' }}>Your store is pending activation.</p>
            <Link
              href="/dashboard/subscription"
              className="text-xs font-semibold shrink-0"
              style={{ color: '#22c55e' }}
            >
              Activate Now →
            </Link>
          </div>
        )}

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
