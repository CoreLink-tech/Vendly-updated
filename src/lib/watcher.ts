/**
 * Watcher security monitoring (server-only).
 *
 * Env (set on Vercel — never NEXT_PUBLIC_ / never commit secrets):
 *   WATCHER_BASE_URL  e.g. https://watcher-rho-green.vercel.app
 *   WATCHER_API_KEY   Bearer token for the Watcher API
 *
 * All network calls are fail-soft with short timeouts so Watcher downtime
 * never breaks auth or other user-facing flows.
 */

import { getClientIp } from '@/lib/request';

const TIMEOUT_MS = 2500;

function config(): { baseUrl: string; apiKey: string } | null {
  const baseUrl = (process.env.WATCHER_BASE_URL || '').replace(/\/$/, '');
  const apiKey = process.env.WATCHER_API_KEY || '';
  if (!baseUrl || !apiKey) {
    return null;
  }
  return { baseUrl, apiKey };
}

function authHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

export type WatcherEventType = 'login_failed' | 'login_success';

export type WatcherEventPayload = {
  event_type: WatcherEventType;
  ip_address: string;
  event_id: string;
  metadata?: { user?: string; [key: string]: unknown };
};

/**
 * Fire-and-forget event POST. Never throws to callers.
 */
export function reportWatcherEvent(payload: WatcherEventPayload): void {
  const cfg = config();
  if (!cfg) {
    return;
  }

  const body = JSON.stringify(payload);

  void (async () => {
    try {
      const res = await fetch(`${cfg.baseUrl}/api/v1/events`, {
        method: 'POST',
        headers: authHeaders(cfg.apiKey),
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.warn(
          `[watcher] event ${payload.event_type} failed ${res.status}: ${text.slice(0, 160)}`
        );
      }
    } catch (err) {
      console.warn('[watcher] event send error', err);
    }
  })();
}

/**
 * Returns true if the IP is on Watcher's blocked list.
 * On missing config / timeout / error → false (allow traffic).
 */
export async function isIpBlocked(ip: string): Promise<boolean> {
  if (!ip || ip === 'unknown') return false;

  const cfg = config();
  if (!cfg) return false;

  try {
    const res = await fetch(`${cfg.baseUrl}/api/v1/security/blocked-ips`, {
      method: 'GET',
      headers: authHeaders(cfg.apiKey),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      // Avoid accidental caching of security list
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`[watcher] blocked-ips ${res.status}`);
      return false;
    }

    const data = (await res.json().catch(() => null)) as unknown;
    const list = normalizeIpList(data);
    return list.has(ip.trim());
  } catch (err) {
    console.warn('[watcher] blocked-ips error', err);
    return false;
  }
}

function normalizeIpList(data: unknown): Set<string> {
  const set = new Set<string>();
  if (!data) return set;

  // Accept common shapes: string[], { ips: string[] }, { blocked: string[] }, { data: string[] }
  let arr: unknown[] = [];
  if (Array.isArray(data)) {
    arr = data;
  } else if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['ips', 'blocked', 'blocked_ips', 'data', 'items']) {
      if (Array.isArray(obj[key])) {
        arr = obj[key] as unknown[];
        break;
      }
    }
  }

  for (const item of arr) {
    if (typeof item === 'string') {
      set.add(item.trim());
    } else if (item && typeof item === 'object' && typeof (item as { ip?: string }).ip === 'string') {
      set.add((item as { ip: string }).ip.trim());
    }
  }
  return set;
}

/** Resolve client IP from a Fetch Request or header bag. */
export function clientIpFromRequest(request?: Request | null, headers?: Headers | null): string {
  if (request) return getClientIp(request);
  if (headers) {
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    return headers.get('x-real-ip') || 'unknown';
  }
  return 'unknown';
}

/**
 * For sensitive API routes: if IP is blocked, return a 403 Response; else null.
 * Fail-open when Watcher is unavailable.
 */
export async function rejectIfBlocked(request: Request): Promise<Response | null> {
  const ip = getClientIp(request);
  const blocked = await isIpBlocked(ip);
  if (!blocked) return null;
  return Response.json(
    { error: 'Forbidden', message: 'Access denied' },
    { status: 403 }
  );
}

export function newEventId(): string {
  return crypto.randomUUID();
}
