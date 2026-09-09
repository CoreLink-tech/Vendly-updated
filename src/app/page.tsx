import type { JSX } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroMockup } from '@/components/landing/HeroMockup';
import { HowItWorksSteps } from '@/components/landing/HowItWorksSteps';
import { AwningStripe } from '@/components/AwningStripe';
import {
  StorefrontMock,
  ProductsMock,
  OrdersMock,
  PaymentsMock,
  AnalyticsMock,
  CustomersMock,
} from '@/components/landing/FeatureMock';
import { landing, displayFont } from '@/lib/landing-theme';

// Simple inline icons (no extra deps needed beyond what's already in the project)
function IconStore() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function IconBox() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
function IconTruck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 5v3h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}
function IconCredit() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

const FEATURES: {
  title: string;
  desc: string;
  Icon: () => JSX.Element;
  Mock: () => JSX.Element;
}[] = [
  {
    title: 'Your storefront',
    desc: 'One link — vendly.app/store/your-name — styled with your logo and your colors. Customers browse and order right there.',
    Icon: IconStore,
    Mock: StorefrontMock,
  },
  {
    title: 'Unlimited products',
    desc: 'List one item or four hundred. Photos, pricing, categories, and stock counts, all in one place.',
    Icon: IconBox,
    Mock: ProductsMock,
  },
  {
    title: 'Orders & delivery',
    desc: 'Every order moves through received, accepted, prepared, delivered — with delivery pricing worked out by route.',
    Icon: IconTruck,
    Mock: OrdersMock,
  },
  {
    title: 'Flexible payments',
    desc: 'Customers pay upfront or on delivery, their choice. You keep everything you make — Vendly takes no commission.',
    Icon: IconCredit,
    Mock: PaymentsMock,
  },
  {
    title: 'Analytics dashboard',
    desc: 'Revenue, orders, and growth, updated live. No spreadsheet, no guessing what sold.',
    Icon: IconChart,
    Mock: AnalyticsMock,
  },
  {
    title: 'Customer management',
    desc: 'See who’s buying, how often, and how much they’ve spent, so you know who to follow up with.',
    Icon: IconUsers,
    Mock: CustomersMock,
  },
];

const CATEGORIES = ['Fashion', 'Food', 'Beauty', 'Electronics', 'Home', 'Services'];

const PLAN_FEATURES = [
  'Unlimited products',
  'Your own storefront',
  'Order management',
  'Upfront & delivery payments',
  'Delivery pricing by route',
  'Analytics dashboard',
  '0% commission, ever',
];

export default function HomePage() {
  return (
    <main
      className="min-h-screen pb-24 md:pb-0"
      style={{ backgroundColor: landing.paper, color: landing.ink }}
    >
      <LandingNav />

      {/* Hero */}
      <section className="px-6 md:px-8 pt-16 pb-20 md:pt-24 md:pb-32 max-w-6xl mx-auto grid lg:grid-cols-[1fr_0.95fr] gap-12 lg:gap-16 items-center">
        <div className="landing-fade-up">
          <h1
            className="text-[2.5rem] leading-[1.08] md:text-[3.5rem] md:leading-[1.05] font-semibold mb-6 tracking-tight"
            style={displayFont}
          >
            Everything you sell,
            <br />
            one link to show it.
          </h1>
          <p
            className="text-base md:text-lg max-w-md mb-9 leading-relaxed"
            style={{ color: landing.cocoa }}
          >
            Create your storefront, list products, accept orders, manage payments, and coordinate
            delivery — all from one simple link.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
            <Link
              href="/account/signup"
              className="text-center text-sm font-semibold px-8 py-3.5 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_rgba(11,94,56,0.4)]"
              style={{ backgroundColor: landing.green, color: landing.paper }}
            >
              Create your store
            </Link>
            <a
              href="#how-it-works"
              className="text-center text-sm font-medium px-8 py-3.5 rounded-full transition-colors duration-200 hover:bg-black/[0.03]"
              style={{ border: `1px solid ${landing.line}`, color: landing.ink }}
            >
              See how it works
            </a>
          </div>
          <p className="text-xs tracking-wide" style={{ color: landing.cocoa }}>
            3 days free · ₦4,000/month · No commission
          </p>
        </div>

        <div className="landing-fade-up landing-delay-2">
          <HeroMockup />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 md:px-8 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 md:mb-20 max-w-xl">
            <h2
              className="text-3xl md:text-[2.6rem] font-semibold mb-4 tracking-tight"
              style={displayFont}
            >
              Everything a storefront needs
            </h2>
            <p className="text-base leading-relaxed" style={{ color: landing.cocoa }}>
              Six things vendors ask for most, built in from day one.
            </p>
          </div>

          <div className="flex flex-col gap-24 md:gap-32">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
              >
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <div
                    className="w-11 h-11 rounded-[14px] flex items-center justify-center mb-5"
                    style={{ backgroundColor: landing.greenSoft, color: landing.green }}
                  >
                    <f.Icon />
                  </div>
                  <h3
                    className="text-2xl md:text-[1.75rem] font-semibold mb-3 tracking-tight"
                    style={displayFont}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-base leading-relaxed max-w-sm"
                    style={{ color: landing.cocoa }}
                  >
                    {f.desc}
                  </p>
                </div>
                <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  <f.Mock />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="px-6 md:px-8 py-20 md:py-28"
        style={{ backgroundColor: landing.paperDim }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 md:mb-16 max-w-xl">
            <h2
              className="text-3xl md:text-[2.6rem] font-semibold mb-4 tracking-tight"
              style={displayFont}
            >
              From sign-up to your first order
            </h2>
            <p className="text-base leading-relaxed" style={{ color: landing.cocoa }}>
              Four steps. Most vendors are live the same day.
            </p>
          </div>
          <HowItWorksSteps />
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 md:px-8 py-20 md:py-24">
        <div className="max-w-6xl mx-auto text-center">
          <h2
            className="text-2xl md:text-[2rem] font-semibold mb-8 max-w-lg mx-auto tracking-tight"
            style={displayFont}
          >
            Built for businesses selling every day
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {CATEGORIES.map((c) => (
              <span
                key={c}
                className="text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-200 hover:bg-black/[0.03]"
                style={{
                  border: `1px solid ${landing.line}`,
                  color: landing.ink,
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 md:px-8 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl md:text-[2.6rem] font-semibold mb-4 tracking-tight"
            style={displayFont}
          >
            One price. Everything included.
          </h2>
          <p className="mb-14 text-base max-w-md mx-auto" style={{ color: landing.cocoa }}>
            No commission, no hidden fees, no separate plan to unlock features.
          </p>

          <div
            className="rounded-[24px] p-8 md:p-12 text-left max-w-md mx-auto relative landing-soft-shadow"
            style={{ backgroundColor: landing.greenDeep }}
          >
            <span
              className="inline-block text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6"
              style={{ backgroundColor: landing.orange, color: landing.paper }}
            >
              3 days free
            </span>
            <div className="flex items-end gap-1.5 mb-8">
              <span
                className="text-5xl md:text-[3.25rem] font-semibold tracking-tight"
                style={{ ...displayFont, color: landing.paper }}
              >
                ₦4,000
              </span>
              <span
                className="text-base mb-1.5"
                style={{ color: 'rgba(255,254,251,0.65)' }}
              >
                /month
              </span>
            </div>
            <ul className="space-y-3.5 mb-10">
              {PLAN_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: landing.paper }}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                    style={{ backgroundColor: landing.orange, color: landing.paper }}
                  >
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/account/signup"
              className="block text-center text-sm font-semibold py-3.5 rounded-full transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: landing.paper, color: landing.greenDeep }}
            >
              Create your store
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-8 py-20 md:py-28 text-center">
        <h2
          className="text-3xl md:text-[2.75rem] font-semibold mb-8 max-w-xl mx-auto leading-tight tracking-tight"
          style={displayFont}
        >
          Your business deserves a professional storefront.
        </h2>
        <Link
          href="/account/signup"
          className="inline-flex items-center text-sm font-semibold px-9 py-3.5 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_rgba(11,94,56,0.4)]"
          style={{ backgroundColor: landing.green, color: landing.paper }}
        >
          Create your store
        </Link>
      </section>

      {/* Footer */}
      <AwningStripe height={4} />
      <footer
        className="px-6 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ borderTop: `1px solid ${landing.line}` }}
      >
        <a href="/">
          <Image
            src="/logo-full.png"
            alt="Vendly"
            width={140}
            height={36}
            className="h-9 w-auto"
          />
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
