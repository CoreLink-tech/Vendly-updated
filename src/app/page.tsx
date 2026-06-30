import Link from 'next/link';
import { NavIcon } from '@/components/NavIcon';

export default function HomePage() {
  return (
    <main
      className="min-h-screen font-inter"
      style={{ backgroundColor: '#0d0d0d', color: '#f5f5f5' }}
    >
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 md:px-12 py-5 border-b"
        style={{ borderColor: '#2a2a2a' }}
      >
        <img src="/logo.webp" alt="Vendly" style={{ height: 60, width: 'auto', objectFit: 'contain' }} />
        <div className="flex items-center gap-3">
          <Link
            href="/account/signin"
            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ color: '#aaaaaa' }}
          >
            Sign In
          </Link>
          <Link
            href="/account/signup"
            className="text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 py-24 md:py-36 text-center max-w-5xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 border"
          style={{
            backgroundColor: 'rgba(34,197,94,0.08)',
            borderColor: 'rgba(34,197,94,0.25)',
            color: '#22c55e',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
          Now accepting vendors — apply today
        </div>
        <h1
          className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight mb-6"
          style={{ color: '#f5f5f5' }}
        >
          Your complete
          <br />
          <span style={{ color: '#22c55e' }}>ecommerce operating system</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Create your own storefront, manage products, receive orders, and coordinate logistics —
          all in one place. No marketplace fees. Your store, your rules.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/account/signup"
            className="w-full sm:w-auto text-sm font-semibold px-8 py-3.5 rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
          >
            Open Your Store Free
          </Link>
          <Link
            href="/account/signin"
            className="w-full sm:w-auto text-sm font-medium px-8 py-3.5 rounded-lg border transition-colors hover:border-gray-400"
            style={{ borderColor: '#2a2a2a', color: '#aaaaaa' }}
          >
            Sign In →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section
        className="px-6 md:px-12 py-20 border-t"
        style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="text-xs font-medium uppercase tracking-widest mb-12 text-center"
            style={{ color: '#22c55e' }}
          >
            Everything you need
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: 'store',
                title: 'Your Own Storefront',
                desc: 'Get a unique URL at vendly.com/store/your-name. Customise your logo, description, and product catalogue.',
              },
              {
                icon: 'package',
                title: 'Product Management',
                desc: 'Add unlimited products with images, pricing, stock tracking, and categories. Optimised delivery automatically.',
              },
              {
                icon: 'truck',
                title: 'Order & Logistics',
                desc: 'Full order pipeline from new order to delivered. Built-in logistics coordination with route-based pricing.',
              },
              {
                icon: 'card',
                title: 'Flexible Payments',
                desc: 'Customers pay upfront or on delivery. You keep 100% — Vendly only provides the infrastructure.',
              },
              {
                icon: 'dashboard',
                title: 'Business Dashboard',
                desc: 'Real-time insights into your sales, orders, and customer data. All in one clean, fast dashboard.',
              },
              {
                icon: 'ambassador',
                title: 'Referral & Ambassador',
                desc: 'Earn commissions by referring other vendors. Become an ambassador for recurring monthly income.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-xl border transition-colors"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
              >
                <div className="flex items-center justify-center w-10 h-10 mb-4" style={{ color: '#22c55e' }}><NavIcon name={f.icon as any} /></div>
                <h3 className="text-base font-semibold mb-2" style={{ color: '#f5f5f5' }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#888888' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 md:px-12 py-20 border-t" style={{ borderColor: '#2a2a2a' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p
            className="text-xs font-medium uppercase tracking-widest mb-4"
            style={{ color: '#22c55e' }}
          >
            Pricing
          </p>
          <h2
            className="text-3xl md:text-4xl font-semibold tracking-tight mb-4"
            style={{ color: '#f5f5f5' }}
          >
            Simple, transparent pricing
          </h2>
          <p className="text-gray-400 mb-14 text-sm">
            No hidden fees. No commissions. Just a flat subscription.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div
              className="p-8 rounded-xl border text-left"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            >
              <p
                className="text-xs font-medium uppercase tracking-wider mb-4"
                style={{ color: '#888888' }}
              >
                Monthly
              </p>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-semibold" style={{ color: '#f5f5f5' }}>
                  ₦4,000
                </span>
                <span className="text-sm mb-1.5" style={{ color: '#888888' }}>
                  /month
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Your own store URL',
                  'Unlimited products',
                  'Order management',
                  'Logistics coordination',
                  'Referral system',
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: '#aaaaaa' }}
                  >
                    <span style={{ color: '#22c55e' }}>-</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/account/signup"
                className="block text-center text-sm font-semibold py-3 rounded-lg border transition-colors"
                style={{ borderColor: '#22c55e', color: '#22c55e' }}
              >
                Get Started
              </Link>
            </div>

            <div
              className="p-8 rounded-xl border text-left relative"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#22c55e' }}
            >
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full"
                style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
              >
                Best Value
              </div>
              <p
                className="text-xs font-medium uppercase tracking-wider mb-4"
                style={{ color: '#888888' }}
              >
                Yearly
              </p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-semibold" style={{ color: '#f5f5f5' }}>
                  ₦40,000
                </span>
                <span className="text-sm mb-1.5" style={{ color: '#888888' }}>
                  /year
                </span>
              </div>
              <p className="text-xs mb-6" style={{ color: '#22c55e' }}>
                Save ₦8,000 — 2 months free
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Your own store URL',
                  'Unlimited products',
                  'Order management',
                  'Logistics coordination',
                  'Referral system',
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: '#aaaaaa' }}
                  >
                    <span style={{ color: '#22c55e' }}>-</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/account/signup"
                className="block text-center text-sm font-semibold py-3 rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-6 md:px-12 py-20 border-t text-center"
        style={{ borderColor: '#2a2a2a', backgroundColor: '#111111' }}
      >
        <h2
          className="text-3xl md:text-4xl font-semibold tracking-tight mb-4"
          style={{ color: '#f5f5f5' }}
        >
          Ready to open your store?
        </h2>
        <p className="text-gray-400 mb-8 text-sm">
          Join thousands of vendors already selling on Vendly.
        </p>
        <Link
          href="/account/signup"
          className="inline-flex items-center text-sm font-semibold px-8 py-3.5 rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
        >
          Start for free →
        </Link>
      </section>

      {/* Footer */}
      <footer
        className="px-6 md:px-12 py-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ borderColor: '#2a2a2a' }}
      >
        <img src="/logo.webp" alt="Vendly" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
        <p className="text-xs" style={{ color: '#555555' }}>
          © 2026 Vendly. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="/account/signin"
            className="text-xs hover:text-gray-300 transition-colors"
            style={{ color: '#555555' }}
          >
            Sign In
          </Link>
          <Link
            href="/account/signup"
            className="text-xs hover:text-gray-300 transition-colors"
            style={{ color: '#555555' }}
          >
            Sign Up
          </Link>
        </div>
      </footer>
    </main>
  );
}
