// Platform-wide design tokens — aligned with the premium landing system.
// Values are CSS variables so light/dark mode update automatically.

export const theme = {
  // Surfaces
  bg: 'var(--vendly-bg)',
  bgDim: 'var(--vendly-bg-dim)',
  surface: 'var(--vendly-surface)',
  surfaceRaised: 'var(--vendly-surface-raised)',

  // Brand
  green: 'var(--vendly-green)',
  greenDeep: 'var(--vendly-green-deep)',
  greenSoft: 'var(--vendly-green-soft)',
  orange: 'var(--vendly-orange)',
  orangeSoft: 'var(--vendly-orange-soft)',

  // Text
  ink: 'var(--vendly-ink)',
  muted: 'var(--vendly-muted)',
  faint: 'var(--vendly-faint)',
  cocoa: 'var(--vendly-cocoa)',

  // Borders & lines
  line: 'var(--vendly-line)',
  lineStrong: 'var(--vendly-line-strong)',
  lineOnDark: 'var(--vendly-line-on-dark)',

  // Status
  success: 'var(--vendly-success)',
  warning: 'var(--vendly-warning)',
  danger: 'var(--vendly-danger)',

  // Shadows (tuned for glassmorphism)
  shadowCard:
    '0 1px 0 0 rgba(255,255,255,0.12) inset, 0 10px 28px -8px rgba(0, 0, 0, 0.18), 0 3px 10px -3px rgba(0, 0, 0, 0.08)',
  shadowSoft: '0 8px 24px -8px rgba(0, 0, 0, 0.16)',
} as const;

export const displayFont = {
  fontFamily: 'var(--font-fraunces), Georgia, serif',
} as const;

export const bodyFont = {
  fontFamily: 'var(--font-exo2), system-ui, sans-serif',
} as const;
