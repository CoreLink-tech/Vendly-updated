'use client';

import { useEffect, useState } from 'react';
import { resolveScheme, toggleScheme, type ColorScheme } from '@/lib/color-scheme';

type Props = {
  /** Visual size */
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * Light / dark mode toggle — glass pill with sun & moon.
 */
export function ThemeToggle({ size = 'md', className = '' }: Props) {
  const [scheme, setSchemeState] = useState<ColorScheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSchemeState(resolveScheme());

    const onScheme = (e: Event) => {
      const detail = (e as CustomEvent<ColorScheme>).detail;
      if (detail === 'light' || detail === 'dark') setSchemeState(detail);
    };
    window.addEventListener('vendly-scheme', onScheme);
    return () => window.removeEventListener('vendly-scheme', onScheme);
  }, []);

  const dim = size === 'sm' ? 36 : 40;
  const icon = size === 'sm' ? 16 : 18;

  return (
    <button
      type="button"
      onClick={() => setSchemeState(toggleScheme())}
      aria-label={scheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={scheme === 'dark' ? 'Light mode' : 'Dark mode'}
      className={`theme-toggle glass inline-flex items-center justify-center rounded-full shrink-0 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 ${className}`}
      style={{ width: dim, height: dim }}
    >
      {/* Avoid icon flash before mount */}
      {!mounted ? (
        <span className="block rounded-full" style={{ width: icon, height: icon, opacity: 0.3 }} />
      ) : scheme === 'dark' ? (
        /* Sun — switch to light */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={icon}
          height={icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        /* Moon — switch to dark */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={icon}
          height={icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
