import type { ReactNode } from 'react';
import { landing } from '@/lib/landing-theme';

// A rotated tag styled after a market price tag: a punched hole at the
// top, a bit of tilt, a warm paper face. Used in the hero collage to
// stand in for the range of things vendors actually sell, without
// relying on any one vendor's real product photos.
export function MarketTag({
  rotate,
  accent,
  children,
  className = '',
}: {
  rotate: number;
  accent: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex flex-col items-center gap-1.5 px-5 py-4 rounded-lg shadow-sm ${className}`}
      style={{
        backgroundColor: landing.paper,
        border: `1.5px solid ${landing.line}`,
        transform: `rotate(${rotate}deg)`,
        boxShadow: '0 6px 16px rgba(23,35,28,0.10)',
      }}
    >
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: landing.paperDim, border: `1.5px solid ${landing.line}` }} />
      <div className="text-center" style={{ color: landing.ink }}>
        {children}
      </div>
      <span className="w-8 h-0.5 rounded-full" style={{ backgroundColor: accent }} />
    </div>
  );
}
