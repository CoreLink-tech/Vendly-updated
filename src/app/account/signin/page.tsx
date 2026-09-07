'use client';

import { useSearchParams } from 'next/navigation';
import { type FormEvent, Suspense, useState } from 'react';
import Image from 'next/image';
import { authClient } from '@/lib/auth-client';
import { theme } from '@/lib/theme';

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

    try {
      const res = await fetch('/api/user/me');
      const data = (await res.json()) as { user: { role: string } };
      const role = data.user?.role;

      if (callbackUrl) {
        window.location.href = callbackUrl;
      } else if (role === 'admin') {
        window.location.href = '/admin';
      } else if (role === 'ceo') {
        window.location.href = '/ceo';
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
      style={{ backgroundColor: theme.bg }}
    >
      <div className="w-full max-w-[420px]">
        <div className="flex justify-center mb-6">
          <a href="/">
            <Image src="/logo-full.png" alt="Vendly" width={160} height={48} className="h-12 w-auto" priority />
          </a>
        </div>

        <form
          onSubmit={(e) => {
            void onSubmit(e);
          }}
          className="rounded-[24px] border p-8 flex flex-col gap-5"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.line,
            boxShadow: theme.shadowCard,
          }}
        >
          <div>
            <h1 className="text-xl font-semibold" style={{ color: theme.ink }}>
              Welcome back
            </h1>
            <p className="text-sm mt-1" style={{ color: theme.muted }}>
              Sign in to your account
            </p>
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: theme.muted }}>
            Email Address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-xl border p-3 text-sm outline-none transition-colors"
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.line,
                color: theme.ink,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.green;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.line;
              }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: theme.muted }}>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="rounded-xl border p-3 text-sm outline-none transition-colors"
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.line,
                color: theme.ink,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.green;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.line;
              }}
            />
          </label>

          {error && (
            <div
              className="text-xs px-3 py-2 rounded-xl border"
              style={{
                borderColor: '#ef444440',
                backgroundColor: '#ef444410',
                color: theme.danger,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="py-3.5 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ backgroundColor: theme.green, color: theme.bg }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-center text-xs" style={{ color: theme.faint }}>
            No account?{' '}
            <a href="/account/signup" className="font-medium" style={{ color: theme.green }}>
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
