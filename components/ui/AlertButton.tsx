"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/track";

// Public half of the VAPID pair; the private half lives only in the database the alert function reads.
const VAPID_PUBLIC = "BLEooOPe7nfUZRQDPBciF603WZW_AV_JLt8BkCK1DZjKJ54Jhjny8yy1A_5PwZbZlfCAjVwzCf66WDbNnp-MOk8";
const STORE = "af-alerts"; // "all" or a JSON list of market slugs

type Pref = "all" | string[] | null;
type Status = "loading" | "unsupported" | "ios-install" | "ready" | "blocked" | "error";

function readPref(): Pref {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return null;
    return raw === "all" ? "all" : (JSON.parse(raw) as string[]);
  } catch {
    return null;
  }
}

function writePref(pref: Pref) {
  try {
    if (pref == null || (Array.isArray(pref) && pref.length === 0)) localStorage.removeItem(STORE);
    else localStorage.setItem(STORE, pref === "all" ? "all" : JSON.stringify(pref));
  } catch {}
}

function key(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/**
 * "Alert me" for auction results. On a market page (market set) it follows that market; on the monitor it
 * follows all of them. Uses the app's service worker; on iPhone it works once the app is on the home screen.
 */
export function AlertButton({ market, label }: { market?: string; label?: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [pref, setPref] = useState<Pref>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    // Reading browser capabilities and saved preferences has to happen after mount.
    /* eslint-disable react-hooks/set-state-in-effect */
    setPref(readPref());
    if (!supported) setStatus(ios && !standalone ? "ios-install" : "unsupported");
    else if (Notification.permission === "denied") setStatus("blocked");
    else setStatus("ready");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const following = pref === "all" || (market ? Array.isArray(pref) && pref.includes(market) : false);
  const coveredByAll = Boolean(market) && pref === "all";

  async function save(next: Pref) {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
      await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (next == null || (Array.isArray(next) && next.length === 0)) {
        if (sub) {
          await fetch("/api/alerts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
          await sub.unsubscribe();
        }
      } else {
        if (Notification.permission !== "granted") {
          const answer = await Notification.requestPermission();
          if (answer !== "granted") {
            setStatus(answer === "denied" ? "blocked" : "ready");
            return;
          }
        }
        sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key(VAPID_PUBLIC) });
        const json = sub.toJSON();
        const res = await fetch("/api/alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, markets: next === "all" ? null : next }),
        });
        if (!res.ok) throw new Error("save failed");
        track("push_alert_on");
      }
      writePref(next);
      setPref(next);
      setStatus("ready");
    } catch {
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  function toggle() {
    if (!market) return save(pref === "all" ? null : "all");
    const list = Array.isArray(pref) ? pref : [];
    return save(list.includes(market) ? list.filter((m) => m !== market) : [...list, market]);
  }

  const base = "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-semibold";
  if (status === "loading") return <span className={`${base} border border-rule text-muted`}>Alerts</span>;
  if (status === "ios-install")
    return <p className="text-[13px] text-ink-soft">For alerts on iPhone, add Afronomics to your home screen (Share, then Add to Home Screen) and open it from there.</p>;
  if (status === "unsupported") return <p className="text-[13px] text-ink-soft">This browser can’t show alerts. Try Chrome, Edge, Firefox or Safari.</p>;
  if (status === "blocked") return <p className="text-[13px] text-ink-soft">Notifications are blocked for this site. Allow them in your browser’s site settings to get alerts.</p>;
  if (coveredByAll) return <span className={`${base} border border-rule text-ink-soft`}>You get alerts for every market</span>;

  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={following}
        className={`${base} ${following ? "border border-rule text-ink hover:border-gold" : "bg-ink text-paper hover:bg-forest"} disabled:opacity-60`}
      >
        <span aria-hidden className={`h-2 w-2 rounded-full ${following ? "bg-accent" : "bg-paper/60"}`} />
        {busy ? "Saving" : following ? "Alerts on · turn off" : (label ?? "Alert me on new results")}
      </button>
      {status === "error" ? <span className="text-[13px] text-down">That didn’t save. Try again.</span> : null}
    </span>
  );
}
