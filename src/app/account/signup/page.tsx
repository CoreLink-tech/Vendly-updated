'use client';

import { useSearchParams } from 'next/navigation';
import { type FormEvent, Suspense, useState } from 'react';
import Image from 'next/image';
import { authClient } from '@/lib/auth-client';
import { theme } from '@/lib/theme';

function SignUpForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || searchParams.get('amb') || '');
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

    // Store referral/ambassador code to handle after signup — the backend
    // figures out which type it is, so one generic key covers both.
    if (referralCode.trim() && typeof window !== 'undefined') {
      localStorage.setItem('vendly_referral_code', referralCode.trim());
    }

    if (typeof window !== 'undefined') {
      window.location.href = callbackUrl;
    }
  };

  return (
    <main
      className="flex min-h-screen w-full items-center justify-center p-4"
      style={{ backgroundColor: theme.bg }}
    >
      <div className="w-full max-w-[420px]">
        <div className="flex justify-center mb-3">
          <a href="/">
            <Image src="/logo-full.png" alt="Vendly" width={160} height={48} className="h-12 w-auto" priority />
          </a>
        </div>

        <form
          onSubmit={(e) => {
            void onSubmit(e);
          }}
          className="rounded-[24px] border p-8 flex flex-col gap-5"
          style={{ backgroundColor: theme.surface, borderColor: theme.line, boxShadow: theme.shadowCard }}
        >
          <div>
            <h1 className="text-xl font-semibold" style={{ color: theme.ink }}>
              Get started
            </h1>
            <p className="text-sm mt-1" style={{ color: theme.muted }}>
              Open your store in minutes
            </p>
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: theme.muted }}>
            Full Name
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your business name"
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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
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
            Referral Code (optional)
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Have a code? Enter it here"
              className="rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ backgroundColor: theme.bg, borderColor: theme.line, color: theme.ink }}
              onFocus={(e) => { e.target.style.borderColor = theme.green; }}
              onBlur={(e) => { e.target.style.borderColor = theme.line; }}
            />
          </label>

          {referralCode.trim() && (
            <div
              className="text-xs px-3 py-2 rounded-lg border"
              style={{ borderColor: '#22c55e30', backgroundColor: '#22c55e08', color: theme.green }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 inline mr-1"><polyline points="20 6 9 17 4 12"/></svg> Referral code will be applied
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
            className="py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: theme.green, color: theme.bg }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-center text-xs" style={{ color: theme.faint }}>
            Already have an account?{' '}
            <a
              href={`/account/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="font-medium"
              style={{ color: theme.green }}
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
