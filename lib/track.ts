/**
 * Anonymous counts of what readers do (sign up, check a rate, report a price, share), one daily total per action
 * and page. Nothing personal is sent. Devices marked as the owner's (by opening the desk) are never counted.
 */
export type TrackEvent =
  | "newsletter_signup"
  | "alert_signup"
  | "push_alert_on"
  | "reader_report"
  | "reader_story"
  | "rate_check"
  | "share"
  | "enquiry"
  | "checkout_start";

export function isOwnerDevice() {
  try {
    return localStorage.getItem("af_owner") === "1";
  } catch {
    return false;
  }
}

export function track(event: TrackEvent) {
  if (typeof window === "undefined" || isOwnerDevice()) return;
  const body = JSON.stringify({ event, path: window.location.pathname });
  try {
    if (!navigator.sendBeacon?.("/api/hit", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/hit", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
    }
  } catch {}
}
