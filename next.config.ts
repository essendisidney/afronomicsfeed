import type { NextConfig } from "next";

/** Old URLs from the first build, sent to their nearest live equivalent. */
/**
 * Parked routes (rebuild brief, section 4; docs/rebuild/phase-1-plan.md): out of the navigation and the sitemap,
 * permanently redirected to the nearest page of the new structure. The code stays in git; /chama stays live until
 * the end of October 2026 (founder decision, 14 Oct). tests/site/test_redirects.py checks this map.
 */
export const parked: Array<[string, string]> = [
  ["/tenders", "/for-institutions"],
  ["/tenders/:path*", "/for-institutions"],
  ["/jobs", "/for-institutions"],
  ["/jobs/:path*", "/for-institutions"],
  ["/radio", "/morning"],
  ["/rent-check", "/numbers"],
  ["/pay-check", "/numbers"],
  ["/diaspora", "/rates/remittances"],
  ["/send-money", "/rates/remittances"],
  ["/send-money/:path*", "/rates/remittances"],
  ["/trade", "/numbers"],
  ["/technology", "/numbers"],
  ["/climate", "/numbers"],
  ["/capital", "/numbers"],
  ["/economy", "/numbers"],
  ["/ask", "/search"],
  ["/signals", "/"],
];

const legacy: Array<[string, string]> = [
  ["/pro", "/pricing"],
  ["/today", "/news"],
  ["/terminal", "/data"],
  ["/observations", "/data"],
  ["/manifesto", "/about"],
  ["/login", "/pricing"],
  ["/signup", "/subscribe"],
  ["/account", "/pricing"],
  ["/account/:path+", "/pricing"],
  ["/opinion", "/brief"],
  ["/trackers", "/data"],
  ["/trackers/:path+", "/data"],
  ["/companies", "/countries"],
  ["/companies/:path+", "/countries"],
  ["/indicators/:indicator/:country", "/countries/:country"],
  ["/indicators/:indicator", "/data/:indicator"],
  ["/indicators", "/data"],
  ["/countries/:slug/:topic", "/countries/:slug"],
  ["/economy/:slug", "/countries/:slug"],
  ["/climate/:slug", "/countries/:slug"],
  ["/projects/:slug", "/countries/:slug"],
  ["/projects", "/numbers"],
  ["/capital/:path+", "/numbers"],
  ["/technology/:path+", "/numbers"],
  ["/trade/:path+", "/numbers"],
  ["/signals/:path+", "/"],
  ["/markets/exchanges/:path+", "/markets"],
  ["/markets/commodities/:path+", "/markets"],
  ["/method/registry", "/method"],
  ["/sources", "/method"],
  ["/graph/:path+", "/countries"],
  ["/graph", "/countries"],
];

/**
 * Paystack origins. Checkout today is a top-level redirect to checkout.paystack.com (CSP does not govern
 * navigations), and the browser never calls Paystack directly; these are listed so a switch to Paystack's inline
 * popup (script from js.paystack.co, iframe from checkout.paystack.com, XHR to api.paystack.co) does not report.
 */
const paystack = "https://js.paystack.co https://checkout.paystack.com https://api.paystack.co https://standard.paystack.co";

/**
 * Content-Security-Policy, sent as Report-Only: violations are posted to /api/csp-report and nothing is blocked.
 * Built from what the site loads today: scripts, styles, fonts (next/font/local), images, OG cards and fetches are
 * all same-origin; Supabase is called only from the server; there is no third-party analytics. JSON-LD blocks are
 * data, not script, so CSP ignores them. Next's App Router streams per-page inline bootstrap scripts
 * (self.__next_f.push) and the theme script is inline, so script-src carries 'unsafe-inline': hashes cannot cover
 * per-page payloads, and nonces would force every page to render per request (no static/ISR, no CDN cache).
 * next dev also needs 'unsafe-eval' and the HMR websocket.
 */
function contentSecurityPolicy(frameAncestors: string) {
  const dev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""} ${paystack}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self' ${paystack}${dev ? " ws: wss:" : ""}`,
    `frame-src 'self' ${paystack}`,
    "worker-src 'self'",
    "manifest-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    `form-action 'self' ${paystack}`,
    `frame-ancestors ${frameAncestors}`,
    "report-uri /api/csp-report",
    "report-to csp",
  ].join("; ");
}

const nextConfig: NextConfig = {
  async headers() {
    // Baseline security headers that institutional security reviews look for. Widgets under /embed/ are meant to
    // be framed on other sites, so only they may be framed; everything else refuses framing by other sites.
    // The Content-Security-Policy is report-only for now, so violations surface in logs before anything is enforced.
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      { key: "Reporting-Endpoints", value: 'csp="/api/csp-report"' },
      { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy("'self'") },
    ];
    return [
      { source: "/:path*", headers: security },
      { source: "/((?!embed/).*)", headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }] },
      // Widgets are framed by other sites (the route itself enforces frame-ancestors *), so the report-only policy
      // agrees there. Listed after the catch-all so this value replaces it for /embed/*.
      { source: "/embed/:path*", headers: [{ key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy("*") }] },
      // Embedded charts (app/embed/chart) copy a Receipt's chart: never indexed, even where the route answers 404.
      { source: "/embed/chart/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Short addresses for sharing by word of mouth and on WhatsApp.
      { source: "/pay", destination: "/rates/what-readers-paid", permanent: false },
      ...legacy.map(([source, destination]) => ({ source, destination, permanent: true })),
      ...parked.map(([source, destination]) => ({ source, destination, permanent: true })),
    ];
  },
};

export default nextConfig;
