"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isOwnerDevice } from "@/lib/track";

/** Sends one anonymous page-view beacon per navigation. See app/api/hit/route.ts. */
export function PageCounter() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    // The owner's own devices (marked when the desk is opened) are not counted, so the desk shows outside readers.
    if (isOwnerDevice() || pathname.startsWith("/desk")) return;
    // One first-visit marker and one last-seen date in this browser (no cookie, nothing personal): lets us count
    // returning readers, and people per day (the first view of the day) rather than only page views.
    let returning = false;
    let visitor = false;
    try {
      const today = new Date().toISOString().slice(0, 10);
      returning = localStorage.getItem("af_seen") !== null;
      if (!returning) localStorage.setItem("af_seen", today);
      visitor = localStorage.getItem("af_day") !== today;
      if (visitor) localStorage.setItem("af_day", today);
    } catch {}
    // Campaign tags (utm_source/utm_campaign) on the landing link, so clicks from our own posts are counted by post.
    const params = new URLSearchParams(window.location.search);
    const campaign = params.get("utm_source") ? `${params.get("utm_source")}/${params.get("utm_campaign") ?? ""}` : "";
    const body = JSON.stringify({ path: pathname, referrer: document.referrer, returning, visitor, campaign });
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
      if (!link || isOwnerDevice()) return;
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
