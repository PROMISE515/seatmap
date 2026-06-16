// Keep the canonical host on the currently reachable production domain until
// westerntoiletmap.com is added to the Vercel project and serving 200s.
export const SITE_URL = "https://seatmapchina.com";
export const SITE_HOST = "seatmapchina.com";
export const NEXT_SITE_URL = "https://westerntoiletmap.com";
export const SEO_LAST_REVIEWED_ISO = "2026-06-16";
export const SEO_LAST_REVIEWED_LABEL = "June 16, 2026";
export const LEGACY_SITE_HOSTS = new Set([
  "www.seatmapchina.com",
  "www.westerntoiletmap.com",
]);
