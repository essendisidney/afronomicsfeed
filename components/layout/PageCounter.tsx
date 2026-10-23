"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cohortWeek, depthsReached, ENGAGED_SECONDS, READING_PAGE, returnWindow } from "@/lib/signals-core";
import { isOwnerDevice, isTrackEvent, track } from "@/lib/track";

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
      const seen = localStorage.getItem("af_seen");
      returning = seen !== null;
      if (!returning) localStorage.setItem("af_seen", today);
      visitor = localStorage.getItem("af_day") !== today;
      if (visitor) localStorage.setItem("af_day", today);
      // Return windows by the week this browser first came (lib/signals-core.ts): one count per browser per window.
      if (!seen) track("first_visit", cohortWeek(today), "/");
      else if (visitor) {
        const slot = returnWindow(seen, today);
        if (slot && !localStorage.getItem(`af_ret_${slot}`)) {
          localStorage.setItem(`af_ret_${slot}`, today);
          track("return_reader", `${cohortWeek(seen)}.${slot}`, "/");
        }
      }
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
  // How far a story is read and how long it holds attention (lib/signals-core.ts): each depth and each engaged mark
  // once per page view. Engaged time only runs while the tab is in front and the reader moved in the last 15 seconds
  // (time to read a paragraph).
  useEffect(() => {
    if (!pathname || !READING_PAGE.test(pathname) || isOwnerDevice()) return;
    const sent = new Set<number>();
    const onScroll = () => {
      const doc = document.documentElement;
      const fraction = doc.scrollHeight > 0 ? (window.scrollY + window.innerHeight) / doc.scrollHeight : 0;
      for (const depth of depthsReached(fraction)) {
        if (sent.has(depth)) continue;
        sent.add(depth);
        track("read_depth", String(depth), pathname);
      }
    };
    let active = Date.now();
    let seconds = 0;
    const marks: number[] = [...ENGAGED_SECONDS];
    const onActivity = () => {
      active = Date.now();
    };
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible" || Date.now() - active > 15000) return;
      seconds += 1;
      while (marks.length && seconds >= marks[0]) track("engaged", String(marks.shift()), pathname);
      if (!marks.length) window.clearInterval(timer);
    }, 1000);
    const activity = ["scroll", "keydown", "pointerdown", "pointermove", "touchstart"] as const;
    window.addEventListener("scroll", onScroll, { passive: true });
    // Depths count only once the reader scrolls, so a short page that fits the screen is not "read to the end".
    for (const name of activity) window.addEventListener(name, onActivity, { passive: true });
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("scroll", onScroll);
      for (const name of activity) window.removeEventListener(name, onActivity);
    };
  }, [pathname]);
  // Clicks that matter, counted anonymously (lib/track.ts): data downloads (the strongest demand signal), anything
  // tagged data-track="<event>", and calls to action on /pricing. The one-question survey listens for downloads.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // auxclick: a middle-click opens a share or download link in a new tab without firing "click".
      if (event.type === "auxclick" && event.button !== 1) return;
      const target = event.target as Element | null;
      const tagged = target?.closest?.("[data-track]");
      const name = tagged?.getAttribute("data-track");
      // Shares carry the network (data-network="whatsapp", "linkedin", "copy", ...), stored with the page path.
      if (isTrackEvent(name)) track(name, tagged?.getAttribute("data-network"));
      const link = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!tagged && window.location.pathname === "/pricing" && target?.closest?.("#main a[href], #main button") && !target.closest("[data-no-track]")) {
        track("pricing_cta_click");
      }
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      const data = url.origin === window.location.origin && (url.pathname.startsWith("/api/data/") || url.pathname.startsWith("/api/v1/"));
      if (!data) return;
      window.dispatchEvent(new CustomEvent("af:download"));
      if (isOwnerDevice()) return;
      track("download_click");
      if (!url.pathname.startsWith("/api/data/")) return;
      const body = JSON.stringify({ path: `/download${url.pathname.slice(4)}`, referrer: document.referrer });
      try {
        navigator.sendBeacon?.("/api/hit", new Blob([body], { type: "application/json" }));
      } catch {}
    };
    document.addEventListener("click", onClick);
    document.addEventListener("auxclick", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("auxclick", onClick);
    };
  }, []);
  return null;
}
