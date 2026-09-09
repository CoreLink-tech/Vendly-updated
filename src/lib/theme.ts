// Platform-wide design tokens — aligned with the premium landing system.
// Use these instead of hardcoded hex values in shells and app pages.

export const theme = {
  // Surfaces
  bg: '#FFFEFB',           // page background (warm off-white)
  bgDim: '#F7F3E9',        // alternating / sidebar subtle
  surface: '#FFFFFF',      // cards, panels
  surfaceRaised: '#FFFEFB',

  // Brand
  green: '#0B5E38',        // primary actions, active states
  greenDeep: '#093F27',    // pressed / strong emphasis
  greenSoft: '#E7F0EA',    // icon wells, active bg tint
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
  success: '#0B5E38',
  warning: '#F5820A',
  danger: '#C0392B',

  // Shadows
  shadowCard: '0 16px 40px -16px rgba(22, 31, 26, 0.12), 0 4px 12px -4px rgba(22, 31, 26, 0.05)',
  shadowSoft: '0 8px 24px -8px rgba(22, 31, 26, 0.10)',
} as const;

export const displayFont = {
  fontFamily: 'var(--font-fraunces), Georgia, serif',
} as const;

export const bodyFont = {
  fontFamily: 'var(--font-exo2), system-ui, sans-serif',
} as const;
