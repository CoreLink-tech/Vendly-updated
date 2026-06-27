'use client';
import { OrdersList } from '../OrdersList';

export default function LogisticsDeliveredPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>Delivered</h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>Successfully completed deliveries.</p>
      </div>
      <OrdersList statusFilter="delivered" />
    </div>
  );
}
