'use client';
import { OrdersList } from '../OrdersList';
import { theme } from '@/lib/theme';

export default function LogisticsDeliveredPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: theme.ink }}>Delivered</h1>
        <p className="text-sm mt-1" style={{ color: theme.muted }}>Successfully completed deliveries.</p>
      </div>
      <OrdersList statusFilter="delivered" />
    </div>
  );
}
