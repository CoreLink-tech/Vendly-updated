import Link from 'next/link';
import { NavIcon, type IconName } from '@/components/NavIcon';
import HowItWorks from '@/components/HowItWorks';
import { AwningStripe } from '@/components/AwningStripe';
import { MarketTag } from '@/components/MarketTag';
import { landing, displayFont } from '@/lib/landing-theme';

const FEATURES: { icon: IconName; title: string; desc: string; fill: string; accent: string }[] = [
  {
    icon: 'store',
    title: 'Your own storefront',
    desc: 'A store at vendly.com/store/your-name, with your logo, your colors, your description.',
    fill: landing.paper,
    accent: landing.orange,
  },
  {
    icon: 'package',
    title: 'List anything, no limit',
    desc: 'Photos, pricing, stock, categories. One product or a hundred, all in the same place.',
    fill: landing.greenDeep,
    accent: landing.paper,
  },
  {
    icon: 'truck',
    title: 'Orders and delivery, tracked',
    desc: 'Every order moves through received, accepted, prepared, delivered — with route-based logistics pricing built in.',
    fill: landing.paperDim,
    accent: landing.greenDeep,
  },
  {
    icon: 'card',
    title: 'Pay upfront or on delivery',
    desc: 'Customers choose. You keep everything you make — Vendly takes no commission.',
    fill: landing.paper,
    accent: landing.green,
  },
  {
    icon: 'dashboard',
    title: 'One dashboard, real numbers',
    desc: 'Sales, orders, and customers, updated live. No spreadsheet required.',
    fill: landing.paperDim,
    accent: landing.orangeDeep,
  },
  {
    icon: 'ambassador',
    title: 'Earn from referrals',
    desc: 'Bring in other vendors and earn a recurring cut, every month they stay.',
    fill: landing.orange,
    accent: landing.ink,
  },
];

const TAG_ITEMS = [
  { label: 'Wall art', price: '₦45,000', accent: landing.orange, rotate: -6, top: '4%', left: '2%' },
  { label: 'Ankara dress', price: '₦12,000', accent: landing.green, rotate: 5, top: '20%', left: '58%' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: landing.paper, color: landing.ink }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4">
        <Link href="/" className="flex items-center">
          <img src="/logo-full.png" alt="Vendly" className="h-14 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/account/signin"
            className="text-sm font-medium px-4 py-2 rounded-lg"
            style={{ color: landing.cocoa }}
          >
            Sign in
          </Link>
          <Link
            href="/account/signup"
            className="text-sm font-semibold px-5 py-2.5 rounded-lg transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: landing.orange, color: landing.paper }}
          >
            Open your store
          </Link>
        </div>
      </nav>
      <AwningStripe />

      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 pb-20 md:pt-24 md:pb-28 max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
        <div>
          <h1
            className="text-[2.75rem] leading-[1.05] md:text-6xl md:leading-[1.05] font-semibold mb-6"
            style={displayFont}
          >
            Everything you sell,
            <br />
            one link to show it.
          </h1>
          <p className="text-base md:text-lg max-w-md mb-9 leading-relaxed" style={{ color: landing.cocoa }}>
            Build a storefront, list your products, take orders, and coordinate delivery — all from a
            link you can drop straight into WhatsApp or Instagram.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <Link
              href="/account/signup"
              className="w-full sm:w-auto text-center text-sm font-semibold px-8 py-3.5 rounded-lg transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: landing.green, color: landing.paper }}
            >
              Start your free trial
            </Link>
            <Link
              href="/account/signin"
              className="w-full sm:w-auto text-center text-sm font-medium px-8 py-3.5 rounded-lg border"
              style={{ borderColor: landing.line, color: landing.ink }}
            >
              Sign in
            </Link>
          </div>
          <p className="text-xs" style={{ color: landing.cocoa }}>
            3 days free, then ₦4,000/month. No commission on anything you sell.
          </p>
        </div>

        {/* Vendor illustration — a two-tone blob (the logo's own green + orange)
            gives the white shirt something to sit against instead of
            disappearing into the paper background. Two tags float near the
            laptop, standing in for products going live on his store. */}
        <div className="relative h-[380px] sm:h-[460px] md:h-[560px] flex items-end justify-center sm:justify-end" aria-hidden="true">
          <div
            className="absolute rounded-[45%_55%_60%_40%/50%_45%_55%_50%]"
            style={{
              backgroundColor: landing.green,
              width: '78%',
              height: '78%',
              right: '2%',
              bottom: '4%',
            }}
          />
          <div
            className="absolute rounded-[55%_45%_40%_60%/45%_55%_45%_55%]"
            style={{
              backgroundColor: landing.orange,
              width: '38%',
              height: '38%',
              left: '4%',
              bottom: '0%',
              opacity: 0.9,
            }}
          />
          <img
            src="/hero-vendor.webp"
            alt=""
            className="relative z-10 h-full w-auto object-contain object-bottom"
          />
          <div className="absolute z-20 top-[2%] left-[0%] sm:left-[4%]">
            <MarketTag rotate={TAG_ITEMS[0].rotate} accent={TAG_ITEMS[0].accent}>
              <p className="text-sm font-semibold whitespace-nowrap">{TAG_ITEMS[0].label}</p>
              <p className="text-xs mt-0.5" style={{ color: landing.cocoa }}>{TAG_ITEMS[0].price}</p>
            </MarketTag>
          </div>
          <div className="absolute z-20 bottom-[30%] right-[-2%] sm:right-[2%]">
            <MarketTag rotate={TAG_ITEMS[1].rotate} accent={TAG_ITEMS[1].accent}>
              <p className="text-sm font-semibold whitespace-nowrap">{TAG_ITEMS[1].label}</p>
              <p className="text-xs mt-0.5" style={{ color: landing.cocoa }}>{TAG_ITEMS[1].price}</p>
            </MarketTag>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-20" style={{ backgroundColor: landing.paperDim }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-[2.5rem] font-semibold mb-3 max-w-xl" style={displayFont}>
            Everything a storefront needs, nothing it doesn't.
          </h2>
          <p className="text-base mb-12 max-w-lg" style={{ color: landing.cocoa }}>
            Six things vendors ask for most, built in from day one.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-7 rounded-2xl"
                style={{ backgroundColor: f.fill, border: f.fill === landing.paper ? `1.5px solid ${landing.line}` : 'none' }}
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-xl mb-5" style={{ color: f.accent, backgroundColor: 'rgba(0,0,0,0.06)' }}>
                  <NavIcon name={f.icon} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: f.fill === landing.greenDeep || f.fill === landing.orange ? landing.paper : landing.ink }}>
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: f.fill === landing.greenDeep || f.fill === landing.orange ? 'rgba(255,252,244,0.85)' : landing.cocoa }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <HowItWorks />

      {/* Pricing */}
      <section className="px-6 md:px-12 py-24" style={{ backgroundColor: landing.paper }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-[2.5rem] font-semibold mb-3" style={displayFont}>
            One price. Everything included.
          </h2>
          <p className="mb-16 text-sm" style={{ color: landing.cocoa }}>
            No commission, no hidden fees — pick monthly or save two months on yearly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div
              className="p-8 rounded-2xl text-left"
              style={{ backgroundColor: landing.paperDim, transform: 'rotate(-1.5deg)' }}
            >
              <p className="text-xs font-medium mb-4" style={{ color: landing.cocoa }}>Monthly</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-semibold" style={displayFont}>₦4,000</span>
                <span className="text-sm mb-1.5" style={{ color: landing.cocoa }}>/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Your own store URL', 'Unlimited products', 'Order management', 'Logistics coordination', 'Referral system'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: landing.ink }}>
                    <span style={{ color: landing.green }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/account/signup"
                className="block text-center text-sm font-semibold py-3 rounded-lg border"
                style={{ borderColor: landing.green, color: landing.green }}
              >
                Get started
              </Link>
            </div>

            <div
              className="p-8 rounded-2xl text-left relative"
              style={{ backgroundColor: landing.greenDeep, transform: 'rotate(1.5deg)' }}
            >
              <div
                className="absolute -top-3 -right-3 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: landing.orange, color: landing.paper, transform: 'rotate(8deg)' }}
              >
                Best value
              </div>
              <p className="text-xs font-medium mb-4" style={{ color: 'rgba(255,252,244,0.7)' }}>Yearly</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-semibold" style={{ ...displayFont, color: landing.paper }}>₦40,000</span>
                <span className="text-sm mb-1.5" style={{ color: 'rgba(255,252,244,0.7)' }}>/year</span>
              </div>
              <p className="text-xs mb-6" style={{ color: landing.orange }}>Save ₦8,000 — two months free</p>
              <ul className="space-y-3 mb-8">
                {['Your own store URL', 'Unlimited products', 'Order management', 'Logistics coordination', 'Referral system'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: landing.paper }}>
                    <span style={{ color: landing.orange }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/account/signup"
                className="block text-center text-sm font-semibold py-3 rounded-lg"
                style={{ backgroundColor: landing.orange, color: landing.paper }}
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-24 text-center relative overflow-hidden" style={{ backgroundColor: landing.orange }}>
        <h2 className="text-3xl md:text-5xl font-semibold mb-4 max-w-2xl mx-auto" style={{ ...displayFont, color: landing.ink }}>
          Ready to open your store?
        </h2>
        <p className="mb-9 text-sm" style={{ color: landing.ink }}>
          Three days free. No card required to start.
        </p>
        <Link
          href="/account/signup"
          className="inline-flex items-center text-sm font-semibold px-8 py-3.5 rounded-lg transition-transform hover:-translate-y-0.5"
          style={{ backgroundColor: landing.ink, color: landing.paper }}
        >
          Start your free trial
        </Link>
      </section>

      {/* Footer */}
      <AwningStripe height={6} />
      <footer className="px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ backgroundColor: landing.paper }}>
        <a href="/">
          <img src="/logo-full.png" alt="Vendly" className="h-10 w-auto" />
        </a>
        <p className="text-xs" style={{ color: landing.cocoa }}>
          © 2026 Vendly. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link href="/account/signin" className="text-xs" style={{ color: landing.cocoa }}>
            Sign in
          </Link>
          <Link href="/account/signup" className="text-xs" style={{ color: landing.cocoa }}>
            Sign up
          </Link>
        </div>
      </footer>
    </main>
  );
}
