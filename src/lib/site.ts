// Every publicly shareable link (store links, referral links, ambassador
// links) should always point here, regardless of which domain someone is
// currently browsing the dashboard from (vercel.app, the custom domain,
// or a preview deployment). Using window.location.origin for this was the
// actual bug — it silently baked in whatever domain happened to be in the
// address bar at that moment instead of the real canonical one.
export const SITE_URL = 'https://vendlyapp.com.ng';
