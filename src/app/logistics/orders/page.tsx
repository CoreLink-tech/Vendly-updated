'use client';
import { OrdersList } from '../OrdersList';
import { theme } from '@/lib/theme';

export default function LogisticsAllOrdersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: theme.ink }}>All Orders</h1>
        <p className="text-sm mt-1" style={{ color: theme.muted }}>Every order across all vendors and statuses.</p>
      </div>
      <OrdersList />
    </div>
  );
}
