"use client";

import { useEffect, useRef, useState } from "react";
import { taggedUrl } from "@/lib/share-links";
import { ShareIcon } from "@/components/share/ShareIcon";
import { copyText } from "@/components/share/clipboard";

/**
 * Shares one key number of a Receipt: the link goes to the tile itself (#n1, #n2, #n3). On a phone with a share sheet
 * it opens the sheet, so WhatsApp is one tap; elsewhere it copies the link and says so. The button is the same on
 * the server and the client, so nothing moves when the page wakes up. Link only: no image card is drawn here.
 */
export function ShareNumberButton({ url, title, text, label }: { url: string; title: string; text: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function onClick() {
    if (typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches) {
      navigator.share({ title, text, url: taggedUrl(url, "native") }).catch(() => undefined);
      return;
    }
    const ok = await copyText(taggedUrl(url, "copy"));
    setState(ok ? "copied" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2400);
  }

  const shown = state === "copied" ? "Link copied" : state === "failed" ? "Copy failed" : "Share";
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        data-track="share"
        data-network="number"
        aria-label={state === "idle" ? `Share this number: ${label}` : shown}
        className="-mb-2 -mr-2 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-2 text-[12.5px] font-semibold text-forest hover:text-ink"
      >
        <ShareIcon name={state === "copied" ? "check" : "share"} />
        <span>{shown}</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied" ? "Link to this number copied" : state === "failed" ? "Could not copy the link" : ""}
      </span>
    </>
  );
}
