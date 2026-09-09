// Single source of truth for order status labels and colors.
// Previously duplicated (with slightly different values) across
// the dashboard overview, orders list, and order status dropdown.

export const ORDER_STATUSES = [
  { value: 'new', label: 'New Order' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'preparing_package', label: 'Preparing' },
  { value: 'ready_for_pickup', label: 'Ready for Pickup' },
  { value: 'logistics_assigned', label: 'Logistics Assigned' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number]['value'];

export const ORDER_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  ORDER_STATUSES.map((s) => [s.value, s.label])
);

// Dot/accent color per status, using brand tokens where the status
// maps to a brand-meaningful state (delivered/completed = green,
// preparing/ready = orange) and a small set of neutral hues for the
// in-between logistics states so the sequence reads left to right.
export const ORDER_STATUS_COLOR: Record<string, string> = {
  new: '#3B82F6',
  accepted: '#8B5CF6',
  preparing_package: '#F5820A',
  ready_for_pickup: '#F97316',
  logistics_assigned: '#06B6D4',
  picked_up: '#6366F1',
  in_transit: '#F5820A',
  delivered: '#0B5E38',
  completed: '#0B5E38',
  cancelled: '#C0392B',
};

// Which Badge variant (see components/ui/badge.tsx) best fits each
// status, for places that want a filled badge instead of a dot.
export const ORDER_STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  new: 'secondary',
  accepted: 'secondary',
  preparing_package: 'outline',
  ready_for_pickup: 'outline',
  logistics_assigned: 'secondary',
  picked_up: 'secondary',
  in_transit: 'outline',
  delivered: 'default',
  completed: 'default',
  cancelled: 'destructive',
};
