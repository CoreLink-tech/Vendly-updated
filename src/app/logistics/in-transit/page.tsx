'use client';
import { OrdersList } from '../OrdersList';

export default function LogisticsInTransitPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>In Transit</h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>Orders currently on the way to customers.</p>
      </div>
      <OrdersList statusFilter="shipped" />
    </div>
  );
}
