'use client';

import { useSearchParams } from 'next/navigation';
import { type FormEvent, Suspense, useState } from 'react';
import { authClient } from '@/lib/auth-client';

function SignUpForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const ref = searchParams.get('ref') || '';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name,
    });

    if (signUpError) {
      setError(signUpError.message || signUpError.statusText || JSON.stringify(signUpError));
      setLoading(false);
      return;
    }

    // Store referral code to handle after signup
    if (ref && typeof window !== 'undefined') {
      localStorage.setItem('vendly_ref', ref);
    }

    if (typeof window !== 'undefined') {
      window.location.href = callbackUrl;
    }
  };

  return (
    <main
      className="flex min-h-screen w-full items-center justify-center p-4 font-inter"
      style={{ backgroundColor: '#0d0d0d' }}
    >
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <img src="/logo-icon.webp" alt="Vendly" style={{ height: 80, width: 'auto', objectFit: 'contain', margin: '0 auto' }} />
          </a>
          <p className="text-sm mt-3" style={{ color: '#888888' }}>
            Create your vendor account
          </p>
        </div>

        <form
          onSubmit={(e) => {
            void onSubmit(e);
          }}
          className="rounded-xl border p-8 flex flex-col gap-5"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <div>
            <h1 className="text-xl font-semibold" style={{ color: '#f5f5f5' }}>
              Get started
            </h1>
            <p className="text-sm mt-1" style={{ color: '#888888' }}>
              Open your store in minutes
            </p>
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
            Full Name
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your business name"
              className="rounded-lg border p-3 text-sm outline-none transition-colors"
              style={{
                backgroundColor: '#0d0d0d',
                borderColor: '#2a2a2a',
                color: '#f5f5f5',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#22c55e';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2a2a2a';
              }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
            Email Address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-lg border p-3 text-sm outline-none transition-colors"
              style={{
                backgroundColor: '#0d0d0d',
                borderColor: '#2a2a2a',
                color: '#f5f5f5',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#22c55e';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2a2a2a';
              }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: '#aaaaaa' }}>
            Password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="rounded-lg border p-3 text-sm outline-none transition-colors"
              style={{
                backgroundColor: '#0d0d0d',
                borderColor: '#2a2a2a',
                color: '#f5f5f5',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#22c55e';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2a2a2a';
              }}
            />
          </label>

          {ref && (
            <div
              className="text-xs px-3 py-2 rounded-lg border"
              style={{ borderColor: '#22c55e30', backgroundColor: '#22c55e08', color: '#22c55e' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 inline mr-1"><polyline points="20 6 9 17 4 12"/></svg> Referral code applied
            </div>
          )}

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
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-center text-xs" style={{ color: '#555555' }}>
            Already have an account?{' '}
            <a
              href={`/account/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="font-medium"
              style={{ color: '#22c55e' }}
            >
              Sign in
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
