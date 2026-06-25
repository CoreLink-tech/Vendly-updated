'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

function fmtDate(str: string) {
  return str ? str.slice(0, 10) : '—';
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [changing, setChanging] = useState<string | null>(null);

  const load = () => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    fetch(`/api/admin/users${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers((d as { users: User[] }).users);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const setRole = async (userId: string, role: string) => {
    setChanging(userId);
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });
    load();
    setChanging(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Users
        </h1>
        <p className="text-sm mt-1" style={{ color: '#888888' }}>
          {users.length} registered users
        </p>
      </div>

      <input
        type="text"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none mb-6"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#f5f5f5' }}
      />

      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div
              className="w-5 h-5 border-2 rounded-full"
              style={{
                borderColor: '#39FF14',
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
        ) : users.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: '#555555' }}>
              No users found.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#2a2a2a' }}>
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-4 md:px-6 py-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: '#39FF1420', color: '#39FF14' }}
                >
                  {(u.name || u.email)[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#f5f5f5' }}>
                    {u.name || '—'}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#888888' }}>
                    {u.email}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs hidden md:block" style={{ color: '#555555' }}>
                    {fmtDate(u.createdAt)}
                  </span>
                  <select
                    value={u.role}
                    onChange={(e) => {
                      void setRole(u.id, e.target.value);
                    }}
                    disabled={changing === u.id}
                    className="text-xs rounded-lg border px-2 py-1 outline-none"
                    style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#aaaaaa' }}
                  >
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                    <option value="logistics">Logistics</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
