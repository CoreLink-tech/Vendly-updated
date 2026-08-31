import { landing } from '@/lib/landing-theme';

// A thin striped bar echoing the awning on the Vendly logo's shopping-bag
// icon. Used as a structural device throughout the landing page in place
// of plain hairline dividers — a section break, an underline, a card edge.
export function AwningStripe({ className = '', height = 10 }: { className?: string; height?: number }) {
  return (
    <div
      className={className}
      style={{
        height,
        backgroundImage: `repeating-linear-gradient(-35deg, ${landing.orange} 0px, ${landing.orange} 16px, ${landing.paper} 16px, ${landing.paper} 20px, ${landing.green} 20px, ${landing.green} 36px, ${landing.paper} 36px, ${landing.paper} 40px)`,
      }}
    />
  );
}
