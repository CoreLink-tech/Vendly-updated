import type { ReactNode } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  trend,
  href,
  icon,
}: {
  label: string;
  value: string | number;
  /** Short trend line, e.g. "+12 this week". Only shown when the data is real. */
  trend?: string;
  href?: string;
  icon?: ReactNode;
}) {
  const content = (
    <Card
      className={cn(
        'gap-2 p-5',
        href && 'transition-colors hover:border-primary/40'
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
