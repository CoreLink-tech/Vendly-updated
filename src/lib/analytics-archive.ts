/**
 * Server-only client for Analytics History Archive ingest.
 *
 * Env (set on Vercel — never NEXT_PUBLIC_):
 *   ANALYTICS_ARCHIVE_URL     e.g. https://analytics-one-chi.vercel.app/api/v1/ingest
 *   ANALYTICS_ARCHIVE_API_KEY e.g. aha_...
 */

export type AnalyticsRecord = {
  date: string; // YYYY-MM-DD
  metric_name: string;
  metric_value: number;
  path?: string;
};

function todayISODate(): string {
  // UTC date keeps daily buckets stable across regions
  return new Date().toISOString().slice(0, 10);
}

/**
 * POST metric records to the archive. Fail-soft: logs and returns false on any error.
 */
export async function sendAnalyticsRecords(
  records: AnalyticsRecord[]
): Promise<{ ok: boolean; accepted?: number }> {
  const url = process.env.ANALYTICS_ARCHIVE_URL;
  const key = process.env.ANALYTICS_ARCHIVE_API_KEY;

  if (!url || !key) {
    console.warn(
      '[analytics-archive] Missing ANALYTICS_ARCHIVE_URL or ANALYTICS_ARCHIVE_API_KEY — skip ingest'
    );
    return { ok: false };
  }

  if (!records.length) {
    return { ok: false };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records }),
      // Avoid hanging user requests if archive is slow
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(
        `[analytics-archive] Ingest failed ${res.status}: ${text.slice(0, 200)}`
      );
      return { ok: false };
    }

    const data = (await res.json().catch(() => null)) as {
      ok?: boolean;
      accepted?: number;
    } | null;

    if (data?.ok) {
      return { ok: true, accepted: data.accepted };
    }

    console.error('[analytics-archive] Unexpected response', data);
    return { ok: false };
  } catch (err) {
    console.error('[analytics-archive] Request error', err);
    return { ok: false };
  }
}

/** One pageview for today (optional path). */
export async function trackPageview(path?: string): Promise<boolean> {
  const record: AnalyticsRecord = {
    date: todayISODate(),
    metric_name: 'pageviews',
    metric_value: 1,
  };
  if (path) record.path = path;

  const result = await sendAnalyticsRecords([record]);
  return result.ok;
}
