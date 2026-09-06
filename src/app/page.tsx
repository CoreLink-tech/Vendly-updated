import Link from 'next/link';
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

const FEATURES: { title: string; desc: string; Mock: () => React.JSX.Element }[] = [
  {
    title: 'Your storefront',
    desc: 'One link — vendly.app/store/your-name — styled with your logo and your colors. Customers browse and order right there.',
    Mock: StorefrontMock,
  },
  {
    title: 'Unlimited products',
    desc: 'List one item or four hundred. Photos, pricing, categories, and stock counts, all in one place.',
    Mock: ProductsMock,
  },
  {
    title: 'Orders & delivery',
    desc: 'Every order moves through received, accepted, prepared, delivered — with delivery pricing worked out by route.',
    Mock: OrdersMock,
  },
  {
    title: 'Flexible payments',
    desc: 'Customers pay upfront or on delivery, their choice. You keep everything you make — Vendly takes no commission.',
    Mock: PaymentsMock,
  },
  {
    title: 'Analytics dashboard',
    desc: 'Revenue, orders, and growth, updated live. No spreadsheet, no guessing what sold.',
    Mock: AnalyticsMock,
  },
  {
    title: 'Customer management',
    desc: 'See who\u2019s buying, how often, and how much they\u2019ve spent, so you know who to follow up with.',
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
    <main className="min-h-screen pb-24 md:pb-0" style={{ backgroundColor: landing.paper, color: landing.ink }}>
      <LandingNav />

      {/* Hero */}
      <section className="px-6 md:px-8 pt-16 pb-20 md:pt-24 md:pb-28 max-w-6xl mx-auto grid lg:grid-cols-[1fr_0.9fr] gap-16 items-center">
        <div>
          <h1 className="text-[2.5rem] leading-[1.08] md:text-[3.4rem] md:leading-[1.06] font-semibold mb-6" style={displayFont}>
            Everything you sell,
            <br />
            one link to show it.
          </h1>
          <p className="text-base md:text-lg max-w-md mb-9 leading-relaxed" style={{ color: landing.cocoa }}>
            Create your storefront, list products, accept orders, manage payments, and coordinate delivery — all from
            one simple link.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
            <Link
              href="/account/signup"
              className="text-center text-sm font-semibold px-7 py-3.5 rounded-full transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: landing.green, color: landing.paper }}
            >
              Create your store
            </Link>
            <a
              href="#how-it-works"
              className="text-center text-sm font-medium px-7 py-3.5 rounded-full"
              style={{ border: `1px solid ${landing.line}`, color: landing.ink }}
            >
              See how it works
            </a>
          </div>
          <p className="text-xs" style={{ color: landing.cocoa }}>
            3 days free &middot; ₦4,000/month &middot; No commission
          </p>
        </div>

        <HeroMockup />
      </section>

      {/* Features */}
      <section id="features" className="px-6 md:px-8 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-[2.5rem] font-semibold mb-4 max-w-lg" style={displayFont}>
            Everything a storefront needs
          </h2>
          <p className="text-base mb-16 md:mb-20 max-w-md" style={{ color: landing.cocoa }}>
            Six things vendors ask for most, built in from day one.
          </p>

          <div className="flex flex-col gap-20 md:gap-28">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <h3 className="text-2xl font-semibold mb-3" style={displayFont}>{f.title}</h3>
                  <p className="text-base leading-relaxed max-w-sm" style={{ color: landing.cocoa }}>{f.desc}</p>
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
      <section id="how-it-works" className="px-6 md:px-8 py-20 md:py-28" style={{ backgroundColor: landing.paperDim }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-[2.5rem] font-semibold mb-4 max-w-lg" style={displayFont}>
            From sign-up to your first order
          </h2>
          <p className="text-base mb-16 max-w-md" style={{ color: landing.cocoa }}>
            Four steps, most vendors are live the same day.
          </p>
          <HowItWorksSteps />
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 md:px-8 py-20 md:py-24">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 max-w-lg mx-auto" style={displayFont}>
            Built for businesses selling every day
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {CATEGORIES.map((c) => (
              <span
                key={c}
                className="text-sm font-medium px-5 py-2.5 rounded-full"
                style={{ border: `1px solid ${landing.line}`, color: landing.ink }}
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
          <h2 className="text-3xl md:text-[2.5rem] font-semibold mb-4" style={displayFont}>
            One price. Everything included.
          </h2>
          <p className="mb-14 text-base" style={{ color: landing.cocoa }}>
            No commission, no hidden fees, no separate plan to unlock features.
          </p>

          <div
            className="rounded-[24px] p-9 md:p-12 text-left max-w-lg mx-auto relative"
            style={{ backgroundColor: landing.greenDeep }}
          >
            <span
              className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
              style={{ backgroundColor: landing.orange, color: landing.paper }}
            >
              3 days free
            </span>
            <div className="flex items-end gap-1.5 mb-8">
              <span className="text-5xl font-semibold" style={{ ...displayFont, color: landing.paper }}>₦4,000</span>
              <span className="text-base mb-1.5" style={{ color: 'rgba(255,254,251,0.65)' }}>/month</span>
            </div>
            <ul className="space-y-3.5 mb-10">
              {PLAN_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm" style={{ color: landing.paper }}>
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold"
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
              className="block text-center text-sm font-semibold py-3.5 rounded-full transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: landing.paper, color: landing.greenDeep }}
            >
              Create your store
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-8 py-20 md:py-28 text-center">
        <h2 className="text-3xl md:text-[2.75rem] font-semibold mb-8 max-w-xl mx-auto leading-tight" style={displayFont}>
          Your business deserves a professional storefront.
        </h2>
        <Link
          href="/account/signup"
          className="inline-flex items-center text-sm font-semibold px-8 py-3.5 rounded-full transition-transform hover:-translate-y-0.5"
          style={{ backgroundColor: landing.green, color: landing.paper }}
        >
          Create your store
        </Link>
      </section>

      {/* Footer */}
      <AwningStripe height={4} />
      <footer className="px-6 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: `1px solid ${landing.line}` }}>
        <a href="/">
          <img src="/logo-full.png" alt="Vendly" className="h-9 w-auto" />
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
