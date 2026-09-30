import type { NextConfig } from "next";

/** Old URLs from the first build, sent to their nearest live equivalent. */
const legacy: Array<[string, string]> = [
  ["/pro", "/pricing"],
  ["/today", "/news"],
  ["/terminal", "/data"],
  ["/observations", "/data"],
  ["/ask", "/data"],
  ["/ask/:path+", "/data"],
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
  async redirects() {
    return legacy.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;
