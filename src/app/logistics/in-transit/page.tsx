'use client';
import { OrdersList } from '../OrdersList';
import { theme } from '@/lib/theme';

export default function LogisticsInTransitPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: theme.ink }}>In Transit</h1>
        <p className="text-sm mt-1" style={{ color: theme.muted }}>Orders currently on the way to customers.</p>
      </div>
      <OrdersList statusFilter="shipped" />
    </div>
  );
}
