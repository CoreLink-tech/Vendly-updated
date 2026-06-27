'use client';
import { OrdersList } from '../OrdersList';

export default function LogisticsPendingPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>Pending Pickup</h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>Orders waiting to be picked up from vendors.</p>
      </div>
      <OrdersList statusFilter="new" />
    </div>
  );
}
