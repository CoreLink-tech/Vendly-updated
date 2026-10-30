import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Lightweight edge gate for sensitive API prefixes.
 * Full blocked-IP check runs in Node (auth hooks + route helpers);
 * here we only attach the client IP header for downstream consistency.
 *
 * Note: Watcher blocked-IP lookups need Node runtime + secrets, so the
 * authoritative check lives in src/lib/watcher.ts (auth hooks + rejectIfBlocked).
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '';
  if (ip) {
    response.headers.set('x-vendly-client-ip', ip);
  }
  return response;
}

export const config = {
  matcher: ['/api/admin/:path*', '/api/vendor/:path*', '/api/auth/:path*'],
};
