import { betterAuth } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { bearer } from 'better-auth/plugins';
import { Pool } from 'pg';

const dbPassword = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD || '');
const connectionString = `postgresql://postgres:${dbPassword}@db.wzdnnccyvdbrbkqsxsiw.supabase.co:5432/postgres`;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const trustedOrigins = [
  process.env.BETTER_AUTH_URL,
  'https://vendlyapp.vercel.app',
].filter((v): v is string => Boolean(v));

export const auth = betterAuth({
  database: pool,
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
