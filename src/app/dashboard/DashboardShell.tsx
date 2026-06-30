'use client';
import { NavIcon, IconName } from '@/components/NavIcon';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

const BASE_NAV = [
  { href: '/dashboard',                label: 'Dashboard',    icon: '⬛' },
  { href: '/dashboard/products',       label: 'Products',     icon: 'package' as IconName },
  { href: '/dashboard/orders',         label: 'Orders',       icon: 'orders' as IconName },
  { href: '/dashboard/analytics',      label: 'Analytics',    icon: 'chart' as IconName },
  { href: '/dashboard/store-settings', label: 'Store Settings', icon: 'store' as IconName },
  { href: '/dashboard/subscription',   label: 'Subscription', icon: 'card' as IconName },
];

const SUPPORT_NAV = [
  { href: '/dashboard/support', label: 'Support', icon: 'chat' as IconName },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [vendor, setVendor] = useState<{
    businessName: string;
    status: string;
    slug: string;
  } | null>(null);
  const [ambassadorStatus, setAmbassadorStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        ambassadorStatus: string | null;
      };
      setUser(data.user);
      setVendor(data.vendor);
      setAmbassadorStatus(data.ambassadorStatus);

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
          ambassadorStatus: string | null;
        };
        setVendor(data2.vendor);
        setAmbassadorStatus(data2.ambassadorStatus);
      }
      setLoading(false);
    }
    void load();
  }, [router]);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };


  if (loading) {
    return (
      <div className="min-h-screen flex" style={{ backgroundColor: '#0d0d0d' }}>
        {/* Skeleton sidebar */}
        <div className="hidden md:flex flex-col border-r shrink-0" style={{ width: 240, backgroundColor: '#111111', borderColor: '#2a2a2a' }}>
          {/* Logo */}
          <div className="px-6 py-5 border-b" style={{ borderColor: '#2a2a2a' }}>
            <div className="h-8 w-36 rounded-lg animate-pulse" style={{ backgroundColor: '#2a2a2a' }} />
          </div>
          {/* User */}
          <div className="px-4 py-4 border-b flex items-center gap-3" style={{ borderColor: '#2a2a2a' }}>
            <div className="w-9 h-9 rounded-full animate-pulse shrink-0" style={{ backgroundColor: '#2a2a2a' }} />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 rounded animate-pulse" style={{ backgroundColor: '#2a2a2a' }} />
              <div className="h-2.5 w-16 rounded animate-pulse" style={{ backgroundColor: '#222' }} />
            </div>
          </div>
          {/* Nav items */}
          <div className="flex-1 py-4 px-3 space-y-1">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                <div className="w-5 h-5 rounded animate-pulse shrink-0" style={{ backgroundColor: '#2a2a2a' }} />
                <div className="h-3 rounded animate-pulse" style={{ backgroundColor: '#2a2a2a', width: `${60 + (i % 3) * 20}px` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile header skeleton */}
          <div className="flex items-center justify-between px-4 py-4 border-b md:hidden" style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}>
            <div className="w-6 h-5 rounded animate-pulse" style={{ backgroundColor: '#2a2a2a' }} />
            <div className="h-7 w-28 rounded-lg animate-pulse" style={{ backgroundColor: '#2a2a2a' }} />
          </div>

          {/* Content skeleton */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 max-w-6xl w-full mx-auto">
            {/* Page title */}
            <div className="mb-8">
              <div className="h-7 w-48 rounded-lg animate-pulse mb-2" style={{ backgroundColor: '#2a2a2a' }} />
              <div className="h-4 w-64 rounded animate-pulse" style={{ backgroundColor: '#1e1e1e' }} />
            </div>
            {/* Store link bar */}
            <div className="h-12 w-full rounded-lg animate-pulse mb-6" style={{ backgroundColor: '#1a1a1a' }} />
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl p-5 animate-pulse" style={{ backgroundColor: '#1a1a1a', height: 96 }}>
                  <div className="h-3 w-20 rounded mb-3" style={{ backgroundColor: '#2a2a2a' }} />
                  <div className="h-7 w-14 rounded" style={{ backgroundColor: '#2a2a2a' }} />
                </div>
              ))}
            </div>
            {/* Quick action cards */}
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: '#1a1a1a' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: '#2a2a2a' }}
        >
          <img src="/logo.webp" alt="Vendly" style={{ width: 160, height: 'auto', objectFit: 'contain' }} />
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
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {[
            ...BASE_NAV,
            // If approved ambassador: show Ambassador only (no Referrals)
            // If not approved: show Referrals + Ambassador application link
            ...(ambassadorStatus === 'approved'
              ? [{ href: '/dashboard/ambassador', label: 'Ambassador', icon: 'ambassador' as IconName }]
              : [
                  { href: '/dashboard/referrals', label: 'Referral Dashboard', icon: 'link' as IconName },
                  { href: '/dashboard/ambassador', label: 'Ambassador', icon: 'ambassador' as IconName },
                ]),
            ...SUPPORT_NAV,
          ].map((item) => {
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
                <span className="text-base"><NavIcon name={item.icon} /></span>
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
          <img src="/logo.webp" alt="Vendly" style={{ width: 110, height: 'auto', objectFit: 'contain' }} />
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
