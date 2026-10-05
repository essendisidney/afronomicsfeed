"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Sends one anonymous page-view beacon per navigation. See app/api/hit/route.ts. */
export function PageCounter() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    // One first-visit marker in this browser (no cookie, nothing personal): lets us count returning readers.
    let returning = false;
    try {
      returning = localStorage.getItem("af_seen") !== null;
      if (!returning) localStorage.setItem("af_seen", new Date().toISOString().slice(0, 10));
    } catch {}
    const body = JSON.stringify({ path: pathname, referrer: document.referrer, returning });
    try {
      if (!navigator.sendBeacon?.("/api/hit", new Blob([body], { type: "application/json" }))) {
        void fetch("/api/hit", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
      }
    } catch {}
  }, [pathname]);
  // Downloads are the strongest demand signal: count clicks on any data file link.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || !url.pathname.startsWith("/api/data/")) return;
      const body = JSON.stringify({ path: `/download${url.pathname.slice(4)}`, referrer: document.referrer });
      try {
        navigator.sendBeacon?.("/api/hit", new Blob([body], { type: "application/json" }));
      } catch {}
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
