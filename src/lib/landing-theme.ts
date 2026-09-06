// Landing page color tokens. Deep green carries the brand (logo, primary
// buttons, the one dark section); orange is spent sparingly, as a mark of
// emphasis rather than a second primary. Scoped to the landing page only —
// the dashboard and storefront have their own theming.

export const landing = {
  ink: '#161F1A',        // near-black — body copy, headings
  paper: '#FFFEFB',      // warm off-white base
  paperDim: '#F7F3E9',   // deeper cream for alternating panels
  green: '#0B5E38',      // primary
  greenDeep: '#093F27',  // pressed/dark states, the one dark section fill
  greenSoft: '#E7F0EA',  // tint for chips, icon wells on paper
  orange: '#F5820A',     // accent — used sparingly, never as a second primary
  orangeSoft: '#FCE9D2', // tint for accent chips
  cocoa: '#5C6259',      // muted secondary text
  line: '#E7E5DE',       // light gray hairline border, warmed slightly to sit on cream
  lineOnDark: 'rgba(255,254,251,0.14)',
} as const;

export const displayFont = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
export const bodyFont = { fontFamily: 'var(--font-exo2), sans-serif' };
