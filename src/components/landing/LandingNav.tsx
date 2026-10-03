'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { theme } from '@/lib/theme';

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#how-it-works', label: 'How it works' },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);
  /** Sticky bottom CTA only after the hero "Create your store" scrolls out of view */
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    const heroCta = document.getElementById('hero-create-store');
    if (!heroCta) {
      setShowStickyCta(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyCta(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '0px' }
    );

    observer.observe(heroCta);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <nav
        className="glass sticky top-0 z-50"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.5)' }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <Image
              src="/logo-full.png"
              alt="Vendly"
              width={140}
              height={36}
              priority
              className="h-9 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-9">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: theme.ink }}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/account/signin"
              className="text-sm font-medium px-4 py-2 rounded-full transition-opacity hover:opacity-70"
              style={{ color: theme.ink }}
            >
              Sign in
            </Link>
            <Link
              href="/account/signup"
              className="text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_-6px_rgba(11,94,56,0.35)]"
              style={{ backgroundColor: theme.green, color: theme.bg }}
            >
              Create your store
            </Link>
          </div>

          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="glass md:hidden w-10 h-10 flex items-center justify-center rounded-full"
          >
            <span className="relative w-4 h-3 block">
              <span
                className="absolute left-0 right-0 h-[1.5px] rounded-full transition-transform"
                style={{
                  backgroundColor: theme.ink,
                  top: open ? '5px' : '0px',
                  transform: open ? 'rotate(45deg)' : 'none',
                }}
              />
              <span
                className="absolute left-0 right-0 h-[1.5px] rounded-full transition-opacity"
                style={{ backgroundColor: theme.ink, top: '5px', opacity: open ? 0 : 1 }}
              />
              <span
                className="absolute left-0 right-0 h-[1.5px] rounded-full transition-transform"
                style={{
                  backgroundColor: theme.ink,
                  top: open ? '5px' : '10px',
                  transform: open ? 'rotate(-45deg)' : 'none',
                }}
              />
            </span>
          </button>
        </div>

        {open && (
          <div
            className="md:hidden px-6 pb-6 flex flex-col gap-1"
            style={{ borderTop: `1px solid ${theme.line}` }}
          >
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium py-3"
                style={{ color: theme.ink, borderBottom: `1px solid ${theme.line}` }}
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/account/signin"
              onClick={() => setOpen(false)}
              className="text-sm font-medium py-3"
              style={{ color: theme.ink }}
            >
              Sign in
            </Link>
            <Link
              href="/account/signup"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-center px-5 py-3 rounded-full mt-2"
              style={{ backgroundColor: theme.green, color: theme.bg }}
            >
              Create your store
            </Link>
          </div>
        )}
      </nav>

      {/* Full-bleed sticky mobile CTA — only when hero CTA is off-screen and menu closed */}
      {!open && showStickyCta && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 w-full"
          style={{
            paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
            background:
              'linear-gradient(to top, rgba(255,254,251,0.97) 50%, rgba(255,254,251,0))',
          }}
        >
          <Link
            href="/account/signup"
            className="block w-full text-center text-sm font-semibold py-4"
            style={{ backgroundColor: theme.green, color: theme.bg }}
          >
            Create your store
          </Link>
        </div>
      )}
    </>
  );
}
