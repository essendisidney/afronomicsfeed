"use client";

import { useEffect, useRef, useState } from "react";
import { networkLabel, shareHref, taggedUrl, type ShareNetwork } from "@/lib/share-links";
import { ShareIcon } from "./ShareIcon";
import { copyText } from "./clipboard";

const networks: ShareNetwork[] = ["whatsapp", "linkedin", "x"];

/**
 * "Share this number" (docs/rebuild/phase-7b-plan.md, 7b-2): a small button on a figure tile. The link it shares is
 * /share?kind=number&…, which names the figure by reference only; the card that link previews with reads the value,
 * label, source and date from the data. On a phone it opens the phone's own share sheet; elsewhere a small menu
 * (WhatsApp, LinkedIn, X, copy link) opens over the tile. The button sits in the tile's corner, absolutely placed,
 * so nothing moves when it hydrates or opens.
 */
export function ShareNumberButton({
  url,
  text,
  label,
  className = "",
  campaign = "number",
  what = "this number",
  placement = "corner",
}: {
  url: string;
  text: string;
  label: string;
  className?: string;
  /** The campaign tag (share-<campaign>): number, chart, call. */
  campaign?: string;
  /** What is shared, in the button's name: "this number", "this chart", "this call". */
  what?: string;
  /** corner: absolutely placed in a tile's corner; inline: in the flow, e.g. beside a chart title. */
  placement?: "corner" | "inline";
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  async function onClick() {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse && typeof navigator.share === "function") {
      navigator.share({ title: text, text, url: taggedUrl(url, "native", campaign) }).catch(() => undefined);
      return;
    }
    if (coarse) {
      void copy();
      return;
    }
    setOpen((o) => !o);
  }

  async function copy() {
    if (await copyText(taggedUrl(url, "copy", campaign))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  }

  return (
    <div ref={box} className={`no-print z-20 ${placement === "corner" ? "absolute" : "relative shrink-0"} ${className}`}>
      <button
        type="button"
        onClick={onClick}
        aria-label={`Share ${what}: ${label}`}
        aria-expanded={open}
        title={`Share ${what}`}
        data-track="share"
        data-network={campaign}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-paper-2 hover:text-accent focus-visible:text-accent [&_svg]:h-4 [&_svg]:w-4"
      >
        <ShareIcon name={copied ? "check" : "share"} />
      </button>
      {open ? (
        <div role="group" aria-label={`Share ${what}`} className="absolute right-0 top-11 w-44 rounded-xl border border-rule bg-surface p-1.5 shadow-lg">
          {networks.map((n) => (
            <a
              key={n}
              href={shareHref(n, { url, text, campaign })}
              target="_blank"
              rel="noopener noreferrer"
              data-track="share"
              data-network={n}
              className="flex min-h-9 items-center gap-2 rounded-lg px-2 text-[13px] font-semibold text-ink hover:bg-paper-2 [&_svg]:h-4 [&_svg]:w-4"
            >
              <ShareIcon name={n} />
              {networkLabel[n]}
            </a>
          ))}
          <button
            type="button"
            onClick={copy}
            data-track="share"
            data-network="copy"
            className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px] font-semibold text-ink hover:bg-paper-2 [&_svg]:h-4 [&_svg]:w-4"
          >
            <ShareIcon name={copied ? "check" : "link"} />
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      ) : null}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}
