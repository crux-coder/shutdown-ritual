import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Only the public pages are worth indexing; everything else needs an account.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/terms", "/sign-up", "/sign-in"],
      disallow: ["/today", "/rituals", "/settings", "/onboarding", "/auth/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
