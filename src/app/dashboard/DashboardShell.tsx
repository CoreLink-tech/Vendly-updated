'use client';
import { NavIcon, IconName } from '@/components/NavIcon';
import { SITE_URL } from '@/lib/site';
import { theme } from '@/lib/theme';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authClient } from '@/lib/auth-client';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' as IconName },
  { href: '/dashboard/products', label: 'Products', icon: 'package' as IconName },
  { href: '/dashboard/orders', label: 'Orders', icon: 'orders' as IconName },
  { href: '/dashboard/reports', label: 'Reports', icon: 'flag' as IconName },
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

  useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  const [linkCopied, setLinkCopied] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [vendor, setVendor] = useState<{
    businessName: string;
    status: string;
    slug: string;
    phone?: string;
    location?: string;
    address?: string;
  } | null>(null);
  const [subscription, setSubscription] = useState<{
    plan: string;
    status: string;
    endDate?: string;
    trialEnd?: string;
  } | null>(null);
  const [isApprovedAmbassador, setIsApprovedAmbassador] = useState(false);

  function daysRemaining(dateStr?: string) {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/user/me');
      if (!res.ok) {
        router.push('/account/signin?callbackUrl=/dashboard');
        return;
      }
      const data = (await res.json()) as {
        user: { name: string; email: string; role?: string };
        vendor: { businessName: string; status: string; slug: string; phone?: string; location?: string; address?: string } | null;
        subscription: { plan: string; status: string; endDate?: string; trialEnd?: string } | null;
        ambassadorStatus: string | null;
      };

      // Staff accounts must never enter the vendor dashboard / auto-create a store
      const role = data.user?.role;
      if (role === 'admin') {
        router.replace('/admin');
        return;
      }
      if (role === 'ceo') {
        router.replace('/ceo');
        return;
      }
      if (role === 'logistics') {
        router.replace('/logistics');
        return;
      }

      setUser(data.user);
      setVendor(data.vendor);
      setSubscription(data.subscription);
      setIsApprovedAmbassador(data.ambassadorStatus === 'approved');

      let currentVendor = data.vendor;
      if (!data.vendor) {
        const code = typeof localStorage !== 'undefined' ? localStorage.getItem('vendly_referral_code') : null;
        const profileBody = code ? { referredBy: code, ambassadorCode: code } : {};
        await fetch('/api/vendor/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileBody),
        });
        if (code && typeof localStorage !== 'undefined') localStorage.removeItem('vendly_referral_code');
        const res2 = await fetch('/api/user/me');
        const data2 = (await res2.json()) as {
          vendor: { businessName: string; status: string; slug: string; phone?: string; location?: string; address?: string } | null;
          subscription: { plan: string; status: string; endDate?: string; trialEnd?: string } | null;
        };
        setVendor(data2.vendor);
        setSubscription(data2.subscription);
        currentVendor = data2.vendor;
      }

      const incomplete =
        !currentVendor?.businessName || !currentVendor?.phone || !currentVendor?.location || !currentVendor?.address;
      if (incomplete && pathname !== '/dashboard/setup') {
        router.replace('/dashboard/setup');
      }
    }
    void load();
  }, [router, pathname]);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  if (pathname === '/dashboard/setup') {
    return <>{children}</>;
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: theme.bg, color: theme.ink }}
    >
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r transition-transform duration-200 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width: 260,
          backgroundColor: theme.surface,
          borderColor: theme.line,
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: theme.line }}
        >
          <Link href="/dashboard" className="flex items-center">
            <Image src="/logo-full.png" alt="Vendly" width={120} height={36} className="h-9 w-auto" priority />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg"
            style={{ color: theme.muted }}
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Vendor info */}
        {vendor && (
          <div className="px-4 py-4 border-b" style={{ borderColor: theme.line }}>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{ backgroundColor: theme.greenSoft, color: theme.green }}
              >
                {(vendor.businessName || 'V')[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: theme.ink }}>
                  {vendor.businessName || 'My Store'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: vendor.status === 'active' ? theme.green : theme.orange }}
                  />
                  <span className="text-[11px]" style={{ color: theme.muted }}>
                    {vendor.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {vendor.status === 'active' && subscription?.status === 'active' && (() => {
                  const remaining = daysRemaining(subscription.trialEnd || subscription.endDate);
                  if (remaining === null) return null;
                  const expiringSoon = remaining <= 3;
                  return (
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: expiringSoon ? theme.orange : theme.muted }}
                    >
                      {remaining > 0
                        ? `${remaining} day${remaining === 1 ? '' : 's'} left on your ${subscription.plan === 'trial' ? 'free trial' : 'plan'}`
                        : 'Plan expires today'}
                    </p>
                  );
                })()}
              </div>
            </div>
            {vendor.slug && (
              <button
                onClick={() => {
                  const url = `${SITE_URL}/store/${vendor.slug}`;
                  void navigator.clipboard.writeText(url);
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 1500);
                }}
                className="mt-3 w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-left transition-colors hover:bg-black/[0.02]"
                style={{ borderColor: theme.line, backgroundColor: theme.bgDim }}
              >
                <span className="text-[11px] truncate" style={{ color: theme.muted }}>
                  /store/{vendor.slug}
                </span>
                <span className="text-[11px] font-semibold shrink-0" style={{ color: theme.green }}>
                  {linkCopied ? 'Copied!' : 'Copy link'}
                </span>
              </button>
            )}
            {vendor.slug && (
              <a
                href={`${SITE_URL}/store/${vendor.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: theme.green, color: theme.bg }}
              >
                View My Storefront
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            )}
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV_ITEMS.filter(
            (item) => !(isApprovedAmbassador && item.href === '/dashboard/referrals')
          ).map((item) => {
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

        {/* Bottom */}
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

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
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
          <Image src="/logo-full.png" alt="Vendly" width={100} height={32} className="h-8 w-auto" />
          <div className="flex justify-end min-w-8">
            {vendor?.status === 'active' && subscription?.status === 'active' && (() => {
              const remaining = daysRemaining(subscription.trialEnd || subscription.endDate);
              if (remaining === null) return null;
              const expiringSoon = remaining <= 3;
              return (
                <span
                  className="text-[11px] font-semibold whitespace-nowrap"
                  style={{ color: expiringSoon ? theme.orange : theme.green }}
                >
                  {remaining > 0 ? `${remaining} day${remaining === 1 ? '' : 's'} left` : 'Expires today'}
                </span>
              );
            })()}
          </div>
        </header>

        {/* Pending activation banner */}
        {vendor && vendor.status === 'pending' && (
          <div
            className="mx-4 mt-4 px-4 py-3 rounded-2xl border flex items-center justify-between gap-3 text-sm"
            style={{ backgroundColor: theme.greenSoft, borderColor: theme.line }}
          >
            <p style={{ color: theme.muted }}>Your store is inactive — activate a plan to go live.</p>
            <Link
              href="/dashboard/subscription"
              className="text-xs font-semibold shrink-0"
              style={{ color: theme.green }}
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
