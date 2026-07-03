/**
 * Vercel puts the real client IP in x-forwarded-for (first entry in the
 * comma-separated list — everything after that is intermediate proxies).
 * Falls back to x-real-ip for other environments. Never trust this for
 * anything security-critical (it's spoofable by anyone who controls their
 * own request headers if not behind a proxy that overwrites it) — it's
 * meant as a throttling signal, not an identity guarantee.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
