'use client';

import { useEffect } from 'react';
import {
  applyScheme,
  getStoredScheme,
  getSystemScheme,
  resolveScheme,
} from '@/lib/color-scheme';

/**
 * Keeps <html class="dark"> in sync with stored preference or OS setting.
 */
export function ColorSchemeSync() {
  useEffect(() => {
    applyScheme(resolveScheme());

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = () => {
      // Only follow OS when user has not chosen explicitly
      if (getStoredScheme() == null) {
        applyScheme(getSystemScheme());
      }
    };
    media.addEventListener('change', onSystemChange);
    return () => media.removeEventListener('change', onSystemChange);
  }, []);

  return null;
}
