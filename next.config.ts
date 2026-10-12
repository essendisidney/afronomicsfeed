import type { NextConfig } from "next";

/** Old URLs from the first build, sent to their nearest live equivalent. */
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
  ["/projects", "/capital"],
  ["/capital/:path+", "/capital"],
  ["/technology/:path+", "/technology"],
  ["/trade/:path+", "/trade"],
  ["/signals/:path+", "/signals"],
  ["/markets/exchanges/:path+", "/markets"],
  ["/markets/commodities/:path+", "/markets"],
  ["/method/registry", "/method"],
  ["/sources", "/method"],
  ["/graph/:path+", "/countries"],
  ["/graph", "/countries"],
];

const nextConfig: NextConfig = {
  async headers() {
    // Baseline security headers that institutional security reviews look for. Widgets under /embed/ are meant to
    // be framed on other sites, so only they may be framed; everything else refuses framing by other sites.
    // A full Content-Security-Policy comes later, in report-only mode first, so nothing breaks unseen.
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
    ];
    return [
      { source: "/:path*", headers: security },
      { source: "/((?!embed/).*)", headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }] },
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
    ];
  },
};

export default nextConfig;
