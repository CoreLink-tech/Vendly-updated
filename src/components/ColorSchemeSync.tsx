'use client';

import { useEffect } from 'react';

/**
 * Applies `.dark` on <html> when the OS prefers dark mode,
 * and keeps color-scheme in sync for native form controls.
 */
export function ColorSchemeSync() {
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = (dark: boolean) => {
      root.classList.toggle('dark', dark);
      root.style.colorScheme = dark ? 'dark' : 'light';
    };

    apply(media.matches);

    const onChange = (e: MediaQueryListEvent) => apply(e.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return null;
}
