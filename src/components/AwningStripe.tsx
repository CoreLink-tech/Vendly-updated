import { theme } from '@/lib/theme';

// A thin striped bar echoing the awning on the Vendly logo's shopping-bag
// icon. Used as a structural device throughout the landing page in place
// of plain hairline dividers — a section break, an underline, a card edge.
export function AwningStripe({ className = '', height = 10 }: { className?: string; height?: number }) {
  return (
    <div
      className={className}
      style={{
        height,
        backgroundImage: `repeating-linear-gradient(-35deg, ${theme.orange} 0px, ${theme.orange} 16px, ${theme.bg} 16px, ${theme.bg} 20px, ${theme.green} 20px, ${theme.green} 36px, ${theme.bg} 36px, ${theme.bg} 40px)`,
      }}
    />
  );
}
