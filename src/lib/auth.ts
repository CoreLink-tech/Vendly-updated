import { betterAuth } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { bearer } from 'better-auth/plugins';

const trustedOrigins = [
  process.env.BETTER_AUTH_URL,
  'https://vendlyapp.vercel.app',
].filter((v): v is string => Boolean(v));

// Build Supabase postgres connection string from env vars
// Format: postgresql://postgres.{ref}:{password}@{region}.pooler.supabase.com:6543/postgres
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const ref = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
const dbPassword = process.env.SUPABASE_DB_PASSWORD || '';
const databaseUrl = `postgresql://postgres.${ref}:${encodeURIComponent(dbPassword)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;

export const auth = betterAuth({
  database: {
    provider: 'pg',
    url: databaseUrl,
  },
  baseURL: process.env.BETTER_AUTH_URL || 'https://vendlyapp.vercel.app',
  secret: process.env.BETTER_AUTH_SECRET || 'vendly-secret-key-2026',
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-up/email') return;
      const body = ctx.body as { email?: unknown; name?: unknown } | undefined;
      if (!body || typeof body.email !== 'string') return;
      if (typeof body.name === 'string' && body.name.trim().length > 0) return;
      const derived = body.email.split('@')[0];
      body.name = derived && derived.length > 0 ? derived : 'User';
    }),
  },
  advanced: {
    cookiePrefix: 'better-auth',
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: true,
      httpOnly: true,
      path: '/',
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'vendor',
      },
    },
  },
  plugins: [bearer()],
});

export type Session = typeof auth.$Infer.Session;
