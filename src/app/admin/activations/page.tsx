'use client';

import { useEffect, useState } from 'react';

interface ActivationCode {
  id: string;
  code: string;
  plan: string;
  status: string;
  usedByName: string | null;
  usedAt: string | null;
  createdAt: string;
  isFounding: boolean;
}

function fmtDate(str: string | null) {
  return str ? str.slice(0, 10) : '—';
}

export default function ActivationsPage() {
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [count, setCount] = useState('1');
  const [isFounding, setIsFounding] = useState(true);
  const [genError, setGenError] = useState('');
  const [newCodes, setNewCodes] = useState<string[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    fetch(`/api/admin/activation-codes${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setCodes((d as { codes: ActivationCode[] }).codes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const generate = async () => {
    setGenerating(true);
    setNewCodes([]);
    setGenError('');
    const res = await fetch('/api/admin/activation-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, count: parseInt(count) || 1, isFounding }),
    });
    const data = (await res.json()) as { codes: string[]; error?: string; warning?: string };
    if (!res.ok) {
      setGenError(data.error || 'Failed to generate codes');
      setGenerating(false);
      return;
    }
    if (data.warning) setGenError(data.warning);
    setNewCodes(data.codes || []);
    load();
    setGenerating(false);
  };

  const copyAll = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(newCodes.join('\n'));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Activation Codes
        </h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>
          Generate and manage vendor activation codes.
        </p>
      </div>

      {/* Generator */}
      <div
        className="p-6 rounded-xl border mb-6"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#f5f5f5' }}>
          Generate Codes
        </h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: '#aaaaaa' }}>
              Plan
            </p>
            <div className="flex gap-2">
              {(['monthly', 'yearly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlan(p)}
                  className="px-4 py-2 rounded-lg border text-xs font-semibold"
                  style={{
                    borderColor: plan === p ? '#22c55e' : '#2a2a2a',
                    color: plan === p ? '#22c55e' : '#888888',
                    backgroundColor: plan === p ? '#22c55e10' : 'transparent',
                  }}
                >
                  {p === 'monthly' ? 'Monthly' : 'Yearly'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: '#aaaaaa' }}>
              Quantity
            </p>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              min={1}
              max={50}
              className="rounded-lg border px-3 py-2 text-sm w-20 outline-none"
              style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
            />
          </div>
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: '#aaaaaa' }}>
              Batch
            </p>
            <button
              onClick={() => setIsFounding(!isFounding)}
              className="px-4 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2"
              style={{
                borderColor: isFounding ? '#22c55e' : '#2a2a2a',
                color: isFounding ? '#22c55e' : '#888888',
                backgroundColor: isFounding ? '#22c55e10' : 'transparent',
              }}
            >
              <span
                className="w-3 h-3 rounded-sm border flex items-center justify-center"
                style={{ borderColor: isFounding ? '#22c55e' : '#555555' }}
              >
                {isFounding && (
                  <span className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: '#22c55e' }} />
                )}
              </span>
              Founding 100
            </button>
          </div>
          <button
            onClick={() => {
              void generate();
            }}
            disabled={generating}
            className="px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
          >
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>

        {genError && (
          <p className="text-xs mt-3" style={{ color: '#ef4444' }}>
            {genError}
          </p>
        )}

        {newCodes.length > 0 && (
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#0d0d0d' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold" style={{ color: '#22c55e' }}>
                {newCodes.length} code{newCodes.length > 1 ? 's' : ''} generated
              </p>
              <button
                onClick={copyAll}
                className="text-xs px-3 py-1 rounded border"
                style={{ borderColor: '#22c55e40', color: '#22c55e' }}
              >
                {copiedAll ? 'Copied!' : 'Copy All'}
              </button>
            </div>
            <div className="space-y-1">
              {newCodes.map((c) => (
                <code key={c} className="block text-sm font-mono" style={{ color: '#f5f5f5' }}>
                  {c}
                </code>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {[
          { v: '', l: 'All' },
          { v: 'unused', l: 'Unused' },
          { v: 'used', l: 'Used' },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setStatusFilter(f.v)}
            className="text-xs px-3 py-1.5 rounded-full border"
            style={{
              borderColor: statusFilter === f.v ? '#22c55e' : '#2a2a2a',
              color: statusFilter === f.v ? '#22c55e' : '#888888',
              backgroundColor: statusFilter === f.v ? '#22c55e10' : 'transparent',
            }}
          >
            {f.l}
          </button>
        ))}
      </div>

      {/* Codes table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-24">
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
        ) : codes.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: '#555555' }}>
              No codes found.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#2a2a2a' }}>
            <div
              className="hidden md:grid grid-cols-5 px-6 py-2 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: '#555555' }}
            >
              <span>Code</span>
              <span>Plan</span>
              <span>Status</span>
              <span>Used By</span>
              <span>Date</span>
            </div>
            {codes.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-2 md:grid-cols-5 px-4 md:px-6 py-3 items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono" style={{ color: '#f5f5f5' }}>
                    {c.code}
                  </code>
                  {c.isFounding && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: '#22c55e15', color: '#22c55e' }}
                    >
                      F100
                    </span>
                  )}
                </div>
                <span className="text-xs capitalize" style={{ color: '#aaaaaa' }}>
                  {c.plan}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: c.status === 'unused' ? '#22c55e' : '#888888' }}
                  />
                  <span className="text-xs capitalize" style={{ color: '#aaaaaa' }}>
                    {c.status}
                  </span>
                </div>
                <span className="text-xs truncate" style={{ color: '#888888' }}>
                  {c.usedByName || '—'}
                </span>
                <span className="text-xs" style={{ color: '#555555' }}>
                  {fmtDate(c.status === 'used' ? c.usedAt : c.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
