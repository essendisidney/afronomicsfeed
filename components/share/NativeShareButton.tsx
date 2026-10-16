"use client";

import { useState, useSyncExternalStore } from "react";
import { taggedUrl } from "@/lib/share-links";
import { ShareIcon } from "./ShareIcon";
import { copyText } from "./clipboard";

const noop = () => () => {};
/** The phone's own share sheet, offered only on touch devices that have one. The server and first paint say no. */
const canShare = () =>
  typeof navigator !== "undefined" && typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches;

/**
 * The phone's share sheet. By default it appears only once the browser says it has one (after hydration).
 * `stable` draws it on the server too, shown by CSS on touch screens only (pointer: coarse), so a bar near the top of a
 * page never moves when it appears (layout shift); where the browser has no share sheet, the button copies the link.
 */
export function NativeShareButton({
  url,
  title,
  text,
  className,
  showLabel = true,
  campaign,
  stable = false,
}: {
  url: string;
  title: string;
  text?: string;
  className?: string;
  showLabel?: boolean;
  campaign?: string;
  stable?: boolean;
}) {
  const supported = useSyncExternalStore(noop, canShare, () => false);
  const [copied, setCopied] = useState(false);
  if (!stable && !supported) return null;
  return (
    <button
      type="button"
      data-track="share"
      data-network="native"
      aria-label={showLabel ? undefined : copied ? "Link copied" : "Share…"}
      className={`${className ?? ""}${stable ? " pointer-fine:hidden" : ""}`}
      onClick={async () => {
        if (typeof navigator.share === "function") {
          navigator.share({ title, text, url: taggedUrl(url, "native", campaign) }).catch(() => undefined);
          return;
        }
        if (await copyText(taggedUrl(url, "copy", campaign))) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2400);
        }
      }}
    >
      <ShareIcon name={copied ? "check" : "share"} />
      {showLabel ? <span>{copied ? "Link copied" : "Share…"}</span> : null}
    </button>
  );
}
