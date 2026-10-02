// Platform-wide design tokens — aligned with the premium landing system.
// Use these instead of hardcoded hex values in shells and app pages.

export const theme = {
  // Surfaces
  bg: '#FFFEFB',           // page background (warm off-white)
  bgDim: '#F7F3E9',        // alternating / sidebar subtle
  surface: '#FFFFFF',      // cards, panels
  surfaceRaised: '#FFFEFB',

  // Brand — richer, more natural greens
  green: '#0A6B3C',        // primary actions (stronger natural green)
  greenDeep: '#085530',    // pressed / strong emphasis
  greenSoft: '#C8E6D5',    // icon wells — more saturated mint
  orange: '#F5820A',       // accent (sparingly)
  orangeSoft: '#FCE9D2',

  // Text
  ink: '#161F1A',          // primary text
  muted: '#5C6259',        // secondary text
  faint: '#8A9088',        // tertiary / placeholders
  cocoa: '#5B4B3B',        // warm brown, alt secondary text on paper (landing)

  // Borders & lines
  line: '#E7E5DE',
  lineStrong: '#D4D1C7',
  lineOnDark: 'rgba(255, 254, 251, 0.24)', // hairline border on dark sections

  // Status
  success: '#0A6B3C',
  warning: '#F5820A',
  danger: '#C0392B',

  // Shadows (tuned for glassmorphism)
  shadowCard: '0 1px 0 0 rgba(255,255,255,0.75) inset, 0 10px 28px -8px rgba(22, 31, 26, 0.10), 0 3px 10px -3px rgba(22, 31, 26, 0.05)',
  shadowSoft: '0 8px 24px -8px rgba(22, 31, 26, 0.08)',
} as const;

export const displayFont = {
  fontFamily: 'var(--font-fraunces), Georgia, serif',
} as const;

export const bodyFont = {
  fontFamily: 'var(--font-exo2), system-ui, sans-serif',
} as const;
