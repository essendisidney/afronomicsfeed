"use client";

import { useEffect, useRef, useState } from "react";
import { taggedUrl } from "@/lib/share-links";
import { ShareIcon } from "./ShareIcon";
import { copyText } from "./clipboard";

/**
 * Copies the story's address (tagged utm_source=copy) and says so: the label flips to "Copied" and a polite live
 * region announces it to screen readers. `showLabel` false keeps the button icon-only, with the name in aria-label.
 */
export function CopyLinkButton({ url, className, showLabel = true, campaign }: { url: string; className?: string; showLabel?: boolean; campaign?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function onClick() {
    const ok = await copyText(taggedUrl(url, "copy", campaign));
    setState(ok ? "copied" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2400);
  }

  const label = state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy link";
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        data-track="share"
        data-network="copy"
        data-state={state}
        aria-label={showLabel ? undefined : label}
        title={showLabel ? undefined : label}
        className={className}
      >
        <ShareIcon name={state === "copied" ? "check" : "link"} />
        {showLabel ? <span>{label}</span> : null}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied" ? "Link copied to clipboard" : state === "failed" ? "Could not copy the link" : ""}
      </span>
    </>
  );
}
