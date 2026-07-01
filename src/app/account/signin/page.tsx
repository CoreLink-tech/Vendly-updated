'use client';

import { useSearchParams } from 'next/navigation';
import { type FormEvent, Suspense, useState } from 'react';
import { authClient } from '@/lib/auth-client';

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await authClient.signIn.email({ email, password });

    if (signInError) {
      setError(signInError.message || signInError.statusText || JSON.stringify(signInError));
      setLoading(false);
      return;
    }

    // Fetch user role and redirect accordingly
    try {
      const res = await fetch('/api/user/me');
      const data = await res.json() as { user: { role: string } };
      const role = data.user?.role;

      if (callbackUrl) {
        window.location.href = callbackUrl;
      } else if (role === 'admin') {
        window.location.href = '/admin';
      } else if (role === 'logistics') {
        window.location.href = '/logistics';
      } else {
        window.location.href = '/dashboard';
      }
    } catch {
      window.location.href = '/dashboard';
    }
  };

  return (
    <main
      className="flex min-h-screen w-full items-center justify-center p-4"
      style={{ backgroundColor: '#0d0d0d' }}
    >
      <div className="w-full max-w-[420px]">
        <div className="flex justify-center mb-3">
          <a href="/">
            <img src="/logo-full.png" alt="Vendly" className="h-20 w-auto" />
          </a>
        </div>

        <form
          onSubmit={(e) => { void onSubmit(e); }}
          className="rounded-xl border p-8 flex flex-col gap-5"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <div>
            <h1 className="text-xl font-semibold" style={{ color: '#f5f5f5' }}>Welcome back</h1>
            <p className="text-sm mt-1" style={{ color: '#888888' }}>Sign in to your account</p>
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
            Email Address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-lg border p-3 text-sm outline-none transition-colors"
              style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
              onFocus={(e) => { e.target.style.borderColor = '#22c55e'; }}
              onBlur={(e) => { e.target.style.borderColor = '#2a2a2a'; }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="rounded-lg border p-3 text-sm outline-none transition-colors"
              style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a', color: '#f5f5f5' }}
              onFocus={(e) => { e.target.style.borderColor = '#22c55e'; }}
              onBlur={(e) => { e.target.style.borderColor = '#2a2a2a'; }}
            />
          </label>

          {error && (
            <div
              className="text-xs px-3 py-2 rounded-lg border"
              style={{ borderColor: '#ef444430', backgroundColor: '#ef444410', color: '#ef4444' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#22c55e', color: '#0d0d0d' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-center text-xs" style={{ color: '#555555' }}>
            No account?{' '}
            <a href="/account/signup" className="font-medium" style={{ color: '#22c55e' }}>
              Sign up free
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
