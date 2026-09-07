'use client';
import { OrdersList } from '../OrdersList';
import { theme } from '@/lib/theme';

export default function LogisticsPendingPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: theme.ink }}>Pending Pickup</h1>
        <p className="text-sm mt-1" style={{ color: theme.muted }}>Orders waiting to be picked up from vendors.</p>
      </div>
      <OrdersList statusFilter="new" />
    </div>
  );
}
