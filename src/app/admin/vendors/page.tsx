'use client';

import { useEffect, useState } from 'react';

interface Vendor {
  id: string;
  businessName: string;
  email: string;
  userName: string;
  status: string;
  slug: string;
  createdAt: string;
  productCount: number;
  orderCount: number;
  subscription: { plan: string; status: string; endDate?: string; trialEnd?: string } | null;
  accountType: 'paid' | 'trial' | 'trial_expired' | 'pending' | 'suspended';
}

const ACCOUNT_TYPE_LABELS: Record<Vendor['accountType'], string> = {
  paid: 'Paid',
  trial: 'Trial',
  trial_expired: 'Trial expired',
  pending: 'Pending',
  suspended: 'Suspended',
};

const ACCOUNT_TYPE_COLORS: Record<Vendor['accountType'], string> = {
  paid: '#22c55e',
  trial: '#3b82f6',
  trial_expired: '#f59e0b',
  pending: '#888888',
  suspended: '#ef4444',
};

function fmtDate(str: string) {
  return str ? str.slice(0, 10) : '';
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [foundingOpen, setFoundingOpen] = useState(false);

  useEffect(() => {
    fetch('/api/public/founding-status')
      .then((r) => r.json())
      .then((d) => setFoundingOpen((d as { isOpen: boolean }).isOpen))
      .catch(() => setFoundingOpen(false));
  }, []);

  const monthlyPrice = foundingOpen ? 3000 : 4000;
  const yearlyPrice = foundingOpen ? 30000 : 40000;

  const load = () => {
    const qs = new URLSearchParams();
    if (search) qs.set('search', search);
    if (statusFilter) qs.set('status', statusFilter);
    if (typeFilter) qs.set('type', typeFilter);
    fetch(`/api/admin/vendors?${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setVendors((d as { vendors: Vendor[] }).vendors);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [search, statusFilter, typeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const doAction = async (vendorId: string, action: 'activate' | 'suspend' | 'deactivate') => {
    setActionLoading(true);
    await fetch('/api/admin/vendors', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId, action, plan }),
    });
    load();
    setSelected(null);
    setActionLoading(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Vendors
        </h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>
          {vendors.length} total vendors
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border px-4 py-2.5 text-sm outline-none"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#f5f5f5' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border px-4 py-2.5 text-sm outline-none"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#f5f5f5' }}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border px-4 py-2.5 text-sm outline-none"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#f5f5f5' }}
        >
          <option value="">All account types</option>
          <option value="paid">Paid</option>
          <option value="trial">Trial (active)</option>
          <option value="trial_expired">Trial expired</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div
              className="w-5 h-5 border-2 rounded-full"
              style={{
                borderColor: '#22c55e',
                borderTopColor: 'transparent',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <style jsx global>{`
              @keyframes spin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: '#555555' }}>
              No vendors found.
            </p>
          </div>
        ) : (
          <div className="divide-y overflow-x-auto" style={{ borderColor: '#2a2a2a' }}>
            {vendors.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-4 px-4 md:px-6 py-4 cursor-pointer hover:bg-[#1e1e1e] transition-colors"
                onClick={() => setSelected(v)}
              >
                <div
                  className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}
                >
                  {(v.businessName || v.userName || 'V')[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#f5f5f5' }}>
                    {v.businessName || '—'}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#888888' }}>
                    {v.email}
                  </p>
                </div>
                <div
                  className="hidden md:flex items-center gap-4 text-xs"
                  style={{ color: '#888888' }}
                >
                  <span>{v.productCount} products</span>
                  <span>{v.orderCount} orders</span>
                  <span>{fmtDate(v.createdAt)}</span>
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs shrink-0"
                  style={{ borderColor: '#2a2a2a' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: ACCOUNT_TYPE_COLORS[v.accountType] }}
                  />
                  <span style={{ color: ACCOUNT_TYPE_COLORS[v.accountType] }}>
                    {ACCOUNT_TYPE_LABELS[v.accountType]}
                  </span>
                </div>
                {v.slug && (
                  <a
                    href={`/store/${v.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="hidden md:flex shrink-0 text-xs px-2.5 py-1 rounded-lg border font-semibold"
                    style={{ borderColor: '#22c55e30', backgroundColor: '#22c55e10', color: '#22c55e' }}
                  >
                    View Store ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vendor detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        >
          <div
            className="w-full max-w-md rounded-xl border"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: '#2a2a2a' }}
            >
              <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
                {selected.businessName || 'Vendor'}
              </p>
              <button onClick={() => setSelected(null)} style={{ color: '#888888' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Email', selected.email],
                  ['Slug', selected.slug || '—'],
                  ['Account type', ACCOUNT_TYPE_LABELS[selected.accountType]],
                  ['Vendor status', selected.status],
                  ['Products', String(selected.productCount)],
                  ['Orders', String(selected.orderCount)],
                  ['Joined', fmtDate(selected.createdAt)],
                  ['Plan', selected.subscription?.plan || 'None'],
                  ['Sub status', selected.subscription?.status || '—'],
                  [
                    selected.accountType === 'trial' || selected.accountType === 'trial_expired' ? 'Trial ends' : 'Renews',
                    fmtDate(selected.subscription?.trialEnd || selected.subscription?.endDate || '') || '—',
                  ],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs" style={{ color: '#888888' }}>
                      {k}
                    </p>
                    <p
                      className="text-sm font-medium capitalize mt-0.5"
                      style={{ color: '#f5f5f5' }}
                    >
                      {v}
                    </p>
                  </div>
                ))}
              </div>

              {selected.status !== 'active' && (
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: '#aaaaaa' }}>
                    Activate with plan:
                  </p>
                  <div className="flex gap-2 mb-3">
                    {(['monthly', 'yearly'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPlan(p)}
                        className="flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors"
                        style={{
                          borderColor: plan === p ? '#22c55e' : '#2a2a2a',
                          color: plan === p ? '#22c55e' : '#888888',
                          backgroundColor: plan === p ? '#22c55e10' : 'transparent',
                        }}
                      >
                        {p === 'monthly' ? `Monthly ₦${monthlyPrice.toLocaleString()}` : `Yearly ₦${yearlyPrice.toLocaleString()}`}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      void doAction(selected.id, 'activate');
                    }}
                    disabled={actionLoading}
                    className="w-full py-3 rounded-lg text-sm font-semibold disabled:opacity-50"
                    style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
                  >
                    {actionLoading ? 'Activating…' : 'Activate Vendor'}
                  </button>
                </div>
              )}

              {selected.status === 'active' && (
                <button
                  onClick={() => {
                    void doAction(selected.id, 'suspend');
                  }}
                  disabled={actionLoading}
                  className="w-full py-3 rounded-lg text-sm font-semibold border disabled:opacity-50"
                  style={{ borderColor: '#ef444430', color: '#ef4444' }}
                >
                  {actionLoading ? '…' : 'Suspend Vendor'}
                </button>
              )}

              {selected.slug && (
                <a
                  href={`/store/${selected.slug}`}
                  target="_blank"
                  className="block text-center text-xs py-2 rounded-lg border"
                  style={{ borderColor: '#2a2a2a', color: '#22c55e' }}
                >
                  View Store →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
