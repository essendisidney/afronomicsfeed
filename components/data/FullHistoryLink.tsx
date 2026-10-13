"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { FLAG_COOKIE, fullHistoryHref } from "@/lib/downloads-core";

/** Whether this browser has a download session (the script-readable flag set next to the HttpOnly session cookie). */
function signedIn() {
  try {
    return document.cookie.split(";").some((c) => c.trim() === `${FLAG_COOKIE}=1`);
  } catch {
    return false;
  }
}

// The flag only changes on a full page load (sign-in and sign-out are form posts), so there is nothing to subscribe to.
const subscribe = () => () => {};

/**
 * The link next to a CSV download: "Full history CSV" for a key holder signed in on /downloads, otherwise
 * "Full history: sign in with your key". Server-rendered as the sign-in link (pages stay static), switched on the
 * client. The flag grants nothing: the CSV route checks the signed HttpOnly session itself.
 */
export function FullHistoryLink({ csv, className = "text-forest underline underline-offset-2" }: { csv: string; className?: string }) {
  const on = useSyncExternalStore(subscribe, signedIn, () => false);
  const pathname = usePathname() ?? "/";
  return on ? (
    <a href={fullHistoryHref(csv)} download className={className}>
      Full history CSV
    </a>
  ) : (
    <a href={`/downloads?next=${encodeURIComponent(pathname)}`} className={className} rel="nofollow">
      Full history: sign in with your key
    </a>
  );
}
