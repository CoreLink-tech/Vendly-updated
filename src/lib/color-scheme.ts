export type ColorScheme = 'light' | 'dark';

export const COLOR_SCHEME_KEY = 'vendly-color-scheme';

export function getSystemScheme(): ColorScheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getStoredScheme(): ColorScheme | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(COLOR_SCHEME_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    /* private mode */
  }
  return null;
}

export function resolveScheme(): ColorScheme {
  return getStoredScheme() ?? getSystemScheme();
}

export function applyScheme(scheme: ColorScheme) {
  const root = document.documentElement;
  root.classList.toggle('dark', scheme === 'dark');
  root.style.colorScheme = scheme;
}

export function setScheme(scheme: ColorScheme) {
  applyScheme(scheme);
  try {
    localStorage.setItem(COLOR_SCHEME_KEY, scheme);
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new CustomEvent('vendly-scheme', { detail: scheme }));
}

export function toggleScheme(): ColorScheme {
  const next: ColorScheme = resolveScheme() === 'dark' ? 'light' : 'dark';
  setScheme(next);
  return next;
}
