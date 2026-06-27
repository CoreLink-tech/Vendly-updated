'use client';

import { useEffect, useState } from 'react';

interface LogisticsUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminLogisticsUsersPage() {
  const [users, setUsers] = useState<LogisticsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => {
    fetch('/api/admin/logistics-users')
      .then((r) => r.json())
      .then((d) => { setUsers((d as { users: LogisticsUser[] }).users || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const assign = async () => {
    if (!email.trim()) return;
    setAssigning(true);
    setMessage('');
    const r = await fetch('/api/admin/logistics-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });
    const d = await r.json() as { message?: string; error?: string };
    setMessage(d.message || d.error || '');
    setEmail('');
    setAssigning(false);
    load();
  };

  const remove = async (userId: string) => {
    await fetch('/api/admin/logistics-users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    load();
  };

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>Logistics Users</h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>Assign riders and logistics staff dashboard access.</p>
      </div>

      {/* Assign form */}
      <div className="rounded-xl border p-5 mb-6" style={{ backgroundColor: '#111111', borderColor: '#2a2a2a' }}>
        <p className="text-sm font-semibold mb-3" style={{ color: '#f5f5f5' }}>Assign Logistics Role</p>
        <p className="text-xs mb-3" style={{ color: '#888888' }}>The user must already have a Vendly account.</p>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@email.com"
            className="flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#f5f5f5' }}
            onKeyDown={(e) => e.key === 'Enter' && void assign()}
          />
          <button
            onClick={() => void assign()}
            disabled={assigning || !email.trim()}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
          >
            {assigning ? '…' : 'Assign'}
          </button>
        </div>
        {message && (
          <p className="text-xs mt-2" style={{ color: message.includes('now') ? '#22c55e' : '#ef4444' }}>{message}</p>
        )}
      </div>

      {/* Current logistics users */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#111111', borderColor: '#2a2a2a' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: '#2a2a2a' }}>
          <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Current Logistics Users ({users.length})</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: '#555555' }}>No logistics users yet.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#2a2a2a' }}>
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#f5f5f5' }}>{u.name}</p>
                  <p className="text-xs" style={{ color: '#888888' }}>{u.email}</p>
                </div>
                <button
                  onClick={() => void remove(u.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border"
                  style={{ borderColor: '#ef444430', color: '#ef4444' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
