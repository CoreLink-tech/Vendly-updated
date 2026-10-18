import { trackPageview } from '@/lib/analytics-archive';

export const runtime = 'nodejs';

/**
 * POST /api/track
 * Body (optional): { path?: string }
 * Records one pageview for today via Analytics History Archive (server-side only).
 */
export async function POST(request: Request) {
  let path: string | undefined;

  try {
    const body = (await request.json().catch(() => null)) as { path?: string } | null;
    if (body?.path && typeof body.path === 'string') {
      // Keep paths short and safe
      path = body.path.slice(0, 500);
    }
  } catch {
    // empty / invalid body is fine
  }

  const tracked = await trackPageview(path);
  return Response.json({ tracked });
}
