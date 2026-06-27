'use client';
import { OrdersList } from '../OrdersList';

export default function LogisticsAllOrdersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>All Orders</h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>Every order across all vendors and statuses.</p>
      </div>
      <OrdersList />
    </div>
  );
}
