'use client';

import { useEffect, useState } from 'react';
import { theme } from '@/lib/theme';

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
      body: JSON.stringify({ plan, count: parseInt(count) || 1 }),
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
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: theme.ink }}>
          Activation Codes
        </h1>
        <p className="text-sm mt-1" style={{ color: theme.muted }}>
          Generate and manage vendor activation codes.
        </p>
      </div>

      {/* Generator */}
      <div
        className="p-6 rounded-xl border mb-6"
        style={{ backgroundColor: theme.surface, borderColor: theme.line }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: theme.ink }}>
          Generate Codes
        </h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: theme.muted }}>
              Plan
            </p>
            <div className="flex gap-2">
              {(['monthly', 'yearly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlan(p)}
                  className="px-4 py-2 rounded-lg border text-xs font-semibold"
                  style={{
                    borderColor: plan === p ? theme.green : theme.line,
                    color: plan === p ? theme.green : theme.muted,
                    backgroundColor: plan === p ? theme.greenSoft : 'transparent',
                  }}
                >
                  {p === 'monthly' ? 'Monthly' : 'Yearly'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: theme.muted }}>
              Quantity
            </p>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              min={1}
              max={50}
              className="rounded-lg border px-3 py-2 text-sm w-20 outline-none"
              style={{ backgroundColor: theme.bg, borderColor: theme.line, color: theme.ink }}
            />
          </div>
          <button
            onClick={() => {
              void generate();
            }}
            disabled={generating}
            className="px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.green, color: theme.bg }}
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
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: theme.bg }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold" style={{ color: theme.green }}>
                {newCodes.length} code{newCodes.length > 1 ? 's' : ''} generated
              </p>
              <button
                onClick={copyAll}
                className="text-xs px-3 py-1 rounded border"
                style={{ borderColor: '#22c55e40', color: theme.green }}
              >
                {copiedAll ? 'Copied!' : 'Copy All'}
              </button>
            </div>
            <div className="space-y-1">
              {newCodes.map((c) => (
                <code key={c} className="block text-sm font-mono" style={{ color: theme.ink }}>
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
              borderColor: statusFilter === f.v ? theme.green : theme.line,
              color: statusFilter === f.v ? theme.green : theme.muted,
              backgroundColor: statusFilter === f.v ? theme.greenSoft : 'transparent',
            }}
          >
            {f.l}
          </button>
        ))}
      </div>

      {/* Codes table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: theme.surface, borderColor: theme.line }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div
              className="w-5 h-5 border-2 rounded-full"
              style={{
                borderColor: theme.green,
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
            <p className="text-sm" style={{ color: theme.faint }}>
              No codes found.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: theme.line }}>
            <div
              className="hidden md:grid grid-cols-5 px-6 py-2 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: theme.faint }}
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
                  <code className="text-sm font-mono" style={{ color: theme.ink }}>
                    {c.code}
                  </code>
                  {c.isFounding && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: theme.greenSoft, color: theme.green }}
                    >
                      F100
                    </span>
                  )}
                </div>
                <span className="text-xs capitalize" style={{ color: theme.muted }}>
                  {c.plan}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: c.status === 'unused' ? theme.green : theme.muted }}
                  />
                  <span className="text-xs capitalize" style={{ color: theme.muted }}>
                    {c.status}
                  </span>
                </div>
                <span className="text-xs truncate" style={{ color: theme.muted }}>
                  {c.usedByName || '—'}
                </span>
                <span className="text-xs" style={{ color: theme.faint }}>
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
