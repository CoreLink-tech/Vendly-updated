import { ORDER_STATUS_COLOR, ORDER_STATUS_LABELS } from '@/lib/order-status';

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: ORDER_STATUS_COLOR[status] || '#8A9088' }}
      />
      {ORDER_STATUS_LABELS[status] || status}
    </span>
  );
}
