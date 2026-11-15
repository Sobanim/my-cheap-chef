import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Origins PostHog talks to: the ingestion host from the env, plus its assets
 * host, which serves the lazily loaded parts of the SDK
 * (`eu.i.posthog.com` → `eu-assets.i.posthog.com`).
 */
const getPostHogOrigins = (): string[] => {
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!host) return [];

  try {
    const { origin } = new URL(host);
    const assetsOrigin = origin.replace(/^(https:\/\/[a-z]+)\.i\.posthog\.com$/, "$1-assets.i.posthog.com");
    return [...new Set([origin, assetsOrigin])];
  } catch {
    return [];
  }
};

const posthogOrigins = getPostHogOrigins();

/**
 * Content Security Policy.
 *
 * `'unsafe-inline'` in script-src is a known compromise: Next.js injects inline
 * bootstrap scripts, and the stricter alternative (a per-request nonce) needs
 * middleware. The policy still blocks scripts from any foreign origin, framing,
 * and form posts to other sites. `'unsafe-eval'` is dev-only (React Refresh).
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${posthogOrigins.join(" ")}`.trim(),
  "style-src 'self' 'unsafe-inline'",
  // Product photos on /discounts come from Lidl's image proxy.
  "img-src 'self' data: blob: https://*.assets.schwarz",
  "font-src 'self' data:",
  `connect-src 'self' ${posthogOrigins.join(" ")}${isDev ? " ws: wss:" : ""}`.trim(),
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Legacy twin of `frame-ancestors` for browsers that ignore it.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
