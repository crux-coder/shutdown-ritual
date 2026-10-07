// The public address of the site, for links that leave the page: email
// confirmations, the sitemap, and absolute URLs in link previews.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
