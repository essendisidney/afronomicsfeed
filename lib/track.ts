/** Reader signals (lib/signals-core.ts); each carries a bucket after a comma in the stored path, checked by signalSuffix. */
export const SIGNAL_EVENTS = ["read_depth", "engaged", "first_visit", "return_reader", "search_miss"] as const;
export type SignalEvent = (typeof SIGNAL_EVENTS)[number];

/**
 * Anonymous counts of what readers do (sign up, check a rate, report a price, share), one daily total per action
 * and page. Nothing personal is sent. Devices marked as the owner's (by opening the desk) are never counted.
 * The database keeps its own list of accepted names (af_event, supabase/migrations/0034, live since 13 Oct 2026, and
 * 0043 for the reader signals); a name it does not know is dropped silently, so add new names there as well.
 */
export const TRACK_EVENTS = [
  "newsletter_signup",
  "alert_signup",
  "push_alert_on",
  "reader_report",
  "reader_story",
  "rate_check",
  "share",
  "enquiry",
  "checkout_start",
  // Added with migration 0034 (counted once it is applied):
  "download_click", // a CSV / JSON data link (counted automatically by components/layout/PageCounter.tsx)
  "pricing_cta_click", // a buy / pilot call to action (automatic on /pricing; elsewhere tag the element)
  "pilot_form_start", // see trackPilotForm below
  "pilot_form_submit",
  "source_click", // a reader opened the issuer's own notice from our tables
  "survey_answer", // a one-question survey answered (components/ui/MicroSurvey.tsx)
  // Added with migration 0043 (reader signals, lib/signals-core.ts; each carries a bucket after a comma in the path):
  ...SIGNAL_EVENTS,
] as const;

export type TrackEvent = (typeof TRACK_EVENTS)[number];

export const isTrackEvent = (name: string | null | undefined): name is TrackEvent => TRACK_EVENTS.includes(name as TrackEvent);

export function isOwnerDevice() {
  try {
    return localStorage.getItem("af_owner") === "1";
  } catch {
    return false;
  }
}

/**
 * Count one action on this page. `network` (shares only: the element's data-network, e.g. "whatsapp") is stored
 * with the page path, see eventPath below.
 */
export function track(event: TrackEvent, network?: string | null, at?: string) {
  if (typeof window === "undefined" || isOwnerDevice()) return;
  const path = at ?? window.location.pathname;
  const body = JSON.stringify(network ? { event, path, network } : { event, path });
  try {
    if (!navigator.sendBeacon?.("/api/hit", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/hit", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
    }
  } catch {}
}

let pilotStarted = false;

/**
 * For the pilot request form: call trackPilotForm("start") on the first edit of any field (onFocus or onChange is
 * fine; only the first call per page load counts) and trackPilotForm("submit") once the server has accepted the
 * request. Sends only the step name and the page path; never pass or send anything the person typed.
 *
 *   import { trackPilotForm } from "@/lib/track";
 *   <form onFocus={() => trackPilotForm("start")} onSubmit={...}>   // after a successful response: trackPilotForm("submit")
 *
 * Any other element can be counted without code by tagging it, e.g. <a data-track="pricing_cta_click">; the click
 * listener in components/layout/PageCounter.tsx picks up any data-track value from TRACK_EVENTS.
 */
export function trackPilotForm(step: "start" | "submit") {
  if (step === "start") {
    if (pilotStarted) return;
    pilotStarted = true;
  }
  track(step === "start" ? "pilot_form_start" : "pilot_form_submit");
}

/**
 * A share keeps its network (data-network: whatsapp, linkedin, x, copy, ...) in the stored path, after a comma:
 * "/morning,whatsapp". events_daily has no other column for it, af_event's path check already allows commas, and the
 * name stays "share", so the desk's share totals are unchanged and no migration is needed. Other events ignore it.
 */
export function eventPath(event: string, path: string, network: string | undefined) {
  // Reader signals (read depth, engaged time, return windows, empty searches) keep their bucket the same way.
  const bucket = signalSuffix(event, network);
  if (bucket) return `${path.slice(0, 200 - bucket.length - 1)},${bucket}`;
  const net = (network ?? "").toLowerCase();
  if (event !== "share" || !/^[a-z0-9_]{1,24}$/.test(net)) return path;
  return `${path.slice(0, 200 - net.length - 1)},${net}`;
}

/** The bucket a signal may carry (the part after the comma), or null if it is not a valid one. */
export function signalSuffix(event: string, suffix: string | null | undefined): string | null {
  const s = (suffix ?? "").toLowerCase();
  switch (event) {
    case "read_depth":
      return /^(25|50|75|100)$/.test(s) ? s : null;
    case "engaged":
      return /^(30|120)$/.test(s) ? s : null;
    case "first_visit":
      return /^\d{4}-w\d{2}$/.test(s) ? s : null;
    case "return_reader":
      return /^\d{4}-w\d{2}\.(w1|w2-4|w5-12)$/.test(s) ? s : null;
    case "search_miss":
      return /^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$/.test(s) ? s : null;
    default:
      return null;
  }
}
