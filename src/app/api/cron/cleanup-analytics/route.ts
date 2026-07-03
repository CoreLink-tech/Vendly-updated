import { supabase } from '@/lib/supabase';

// Runs daily via Vercel Cron (see vercel.json). product_analytics only ever
// needs 7/30-day windows, so raw view/visit rows older than 90 days are
// pure dead weight. On a database capped at 500MB (free tier), unbounded
// analytics tables are the most likely thing to quietly eat the whole
// budget over months of otherwise-normal traffic — nobody notices until
// the project stops accepting writes.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const { error: viewsError, count: viewsDeleted } = await supabase
    .from('product_views')
    .delete({ count: 'exact' })
    .lt('viewedAt', cutoff);

  const { error: visitsError, count: visitsDeleted } = await supabase
    .from('store_visits')
    .delete({ count: 'exact' })
    .lt('visitedAt', cutoff);

  if (viewsError || visitsError) {
    console.error('[cron/cleanup-analytics] failed:', viewsError?.message, visitsError?.message);
    return Response.json({ error: 'Cleanup failed' }, { status: 500 });
  }

  return Response.json({ viewsDeleted: viewsDeleted || 0, visitsDeleted: visitsDeleted || 0 });
}
