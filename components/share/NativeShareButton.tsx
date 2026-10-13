"use client";

import { useSyncExternalStore } from "react";
import { taggedUrl } from "@/lib/share-links";
import { ShareIcon } from "./ShareIcon";

const noop = () => () => {};
/** The phone's own share sheet, offered only on touch devices that have one. The server and first paint say no. */
const canShare = () =>
  typeof navigator !== "undefined" && typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches;

export function NativeShareButton({
  url,
  title,
  text,
  className,
  showLabel = true,
}: {
  url: string;
  title: string;
  text?: string;
  className?: string;
  showLabel?: boolean;
}) {
  const supported = useSyncExternalStore(noop, canShare, () => false);
  if (!supported) return null;
  return (
    <button
      type="button"
      data-track="share"
      data-network="native"
      aria-label={showLabel ? undefined : "Share…"}
      className={className}
      onClick={() => {
        navigator.share({ title, text, url: taggedUrl(url, "native") }).catch(() => undefined);
      }}
    >
      <ShareIcon name="share" />
      {showLabel ? <span>Share…</span> : null}
    </button>
  );
}
