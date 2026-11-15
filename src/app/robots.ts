import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/site";

// Served as /robots.txt. Everything is open to every crawler — search engines
// and AI assistants alike; being quoted by them is the point. Only pages with
// nothing worth indexing are kept out: the legacy product grid and the
// service worker's offline fallback.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/discounts", "/offline"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
