import { betterAuth } from 'better-auth';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { bearer } from 'better-auth/plugins';
import {
  clientIpFromRequest,
  isIpBlocked,
  newEventId,
  reportWatcherEvent,
} from '@/lib/watcher';
import { Pool } from 'pg';

// Use SESSION pooler (port 5432) - supports prepared statements unlike transaction pooler
const pool = new Pool({
  connectionString: `postgresql://postgres.csejvtbylrncgsvmhpns:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD || '')}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 15000,
});

const trustedOrigins = [
  process.env.BETTER_AUTH_URL,
  'https://vendlyapp.com.ng',
  'https://www.vendlyapp.com.ng',
  'https://vendlyapp.vercel.app', // kept during the domain transition — remove once nobody's using it
].filter((v): v is string => Boolean(v));

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL || 'https://vendlyapp.com.ng',
  secret: process.env.BETTER_AUTH_SECRET || 'vendly-secret-key-2026',
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Block known-bad IPs on auth endpoints (fail-open if Watcher is down)
      if (
        ctx.path === '/sign-in/email' ||
        ctx.path === '/sign-up/email' ||
        ctx.path.startsWith('/sign-in')
      ) {
        const ip = clientIpFromRequest(ctx.request ?? null, ctx.headers ?? null);
        if (await isIpBlocked(ip)) {
          throw new APIError('FORBIDDEN', { message: 'Access denied' });
        }
      }

      // Existing: derive name on email sign-up when missing
      if (ctx.path !== '/sign-up/email') return;
      const body = ctx.body as { email?: unknown; name?: unknown } | undefined;
      if (!body || typeof body.email !== 'string') return;
      if (typeof body.name === 'string' && body.name.trim().length > 0) return;
      const derived = body.email.split('@')[0];
      body.name = derived && derived.length > 0 ? derived : 'User';
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-in/email') return;

      const body = ctx.body as { email?: string } | undefined;
      const user =
        (typeof body?.email === 'string' && body.email) ||
        ctx.context.newSession?.user?.email ||
        'unknown';
      const ip = clientIpFromRequest(ctx.request ?? null, ctx.headers ?? null);
      const event_id = newEventId();

      if (ctx.context.newSession) {
        reportWatcherEvent({
          event_type: 'login_success',
          ip_address: ip,
          event_id,
          metadata: { user },
        });
      } else {
        // No session after sign-in attempt → treat as failed login
        reportWatcherEvent({
          event_type: 'login_failed',
          ip_address: ip,
          event_id,
          metadata: { user },
        });
      }
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
