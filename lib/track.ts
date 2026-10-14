/**
 * Anonymous counts of what readers do (sign up, check a rate, report a price, share), one daily total per action
 * and page. Nothing personal is sent. Devices marked as the owner's (by opening the desk) are never counted.
 * The database keeps its own list of accepted names (af_event, supabase/migrations/0034, live since 13 Oct 2026 and
 * covering every name below); a name it does not know is dropped silently, so add new names there as well.
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
export function track(event: TrackEvent, network?: string | null) {
  if (typeof window === "undefined" || isOwnerDevice()) return;
  const path = window.location.pathname;
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
  const net = (network ?? "").toLowerCase();
  if (event !== "share" || !/^[a-z0-9_]{1,24}$/.test(net)) return path;
  return `${path.slice(0, 200 - net.length - 1)},${net}`;
}
