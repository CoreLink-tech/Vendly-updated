// Landing page color tokens — pulled from the Vendly mark itself (the
// striped awning on the logo's shopping bag, and its green→orange
// gradient) rather than a generic SaaS palette. Scoped to the landing
// page only; the dashboard and storefront have their own theming.

export const landing = {
  ink: '#17231C',       // near-black, warm toward green — body copy on paper, dark section fill
  paper: '#FFFCF4',     // warm ivory base
  paperDim: '#FBF1DD',  // slightly deeper cream for alternating panels
  orange: '#F5820A',    // awning orange — primary accent
  orangeDeep: '#C9600A',
  green: '#128A4B',     // storefront green — secondary accent
  greenDeep: '#0B5E38',
  sky: '#2AA6E0',       // logo's swoosh blue — used sparingly
  cocoa: '#5B4B3B',     // muted warm brown for secondary text on paper
  line: '#E9DEC7',      // hairline border tone on paper
} as const;

export const displayFont = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
