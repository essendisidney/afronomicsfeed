"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { quoteText, shareHref, taggedUrl } from "@/lib/share-links";
import { ShareIcon } from "./ShareIcon";
import { copyText } from "./clipboard";

/**
 * Select a passage of the story (up to 280 characters) and a small "Share quote" bar floats above it: X, LinkedIn,
 * WhatsApp or copy, each carrying the quote in quotation marks and the story's address. The bar is position:fixed,
 * so it never moves the text. It closes on Escape, on scroll, or on a click elsewhere; Tab moves focus into it.
 * Mouse and trackpad only: on touch screens the phone's own selection menu already offers share and copy.
 */
const MAX = 280;
const BAR_W = 248;
const noop = () => () => {};
const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

type Spot = { quote: string; x: number; y: number; below: boolean };

export function QuoteShare({ url, title, children }: { url: string; title: string; children: React.ReactNode }) {
  const enabled = useSyncExternalStore(noop, finePointer, () => false);
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const open = useRef(false);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const close = () => {
      if (!open.current) return;
      open.current = false;
      setSpot(null);
      setCopied(false);
    };
    const check = () => {
      const sel = window.getSelection();
      const area = root.current;
      if (!sel || sel.isCollapsed || sel.rangeCount === 0 || !area) return close();
      const range = sel.getRangeAt(0);
      if (!area.contains(range.commonAncestorContainer)) return close();
      const text = sel.toString().replace(/\s+/g, " ").trim();
      if (text.length < 3 || text.length > MAX) return close();
      const rect = range.getBoundingClientRect();
      if (!rect.width && !rect.height) return close();
      const half = BAR_W / 2;
      const x = Math.min(Math.max(rect.left + rect.width / 2, half + 8), window.innerWidth - half - 8);
      // Under the sticky header (about 7rem on desktop) there is no room above the selection; drop below it instead.
      const below = rect.top < 140;
      open.current = true;
      setCopied(false);
      setSpot({ quote: text, x, y: below ? rect.bottom + 10 : rect.top - 10, below });
    };
    const onPointerUp = (event: MouseEvent) => {
      if (bar.current?.contains(event.target as Node)) return;
      window.setTimeout(check, 0);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!bar.current?.contains(event.target as Node)) close();
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.shiftKey || event.key.startsWith("Arrow") || event.key === "Shift") check();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!open.current) return;
      if (event.key === "Escape") {
        const inside = bar.current?.contains(document.activeElement);
        close();
        if (inside) root.current?.focus();
        return;
      }
      // Tab from the selected text goes into the bar first, so a keyboard user can reach it.
      if (event.key === "Tab" && !event.shiftKey && !bar.current?.contains(document.activeElement)) {
        const first = bar.current?.querySelector<HTMLElement>("a, button");
        if (first) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const onSelection = () => {
      const sel = window.getSelection();
      if (open.current && (!sel || sel.isCollapsed) && !bar.current?.contains(document.activeElement)) close();
    };
    document.addEventListener("mouseup", onPointerUp);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("selectionchange", onSelection);
    window.addEventListener("scroll", close, { passive: true, capture: true });
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mouseup", onPointerUp);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("selectionchange", onSelection);
      window.removeEventListener("scroll", close, { capture: true });
      window.removeEventListener("resize", close);
    };
  }, [enabled]);

  const quoted = spot ? quoteText(spot.quote) : "";
  const xText = spot ? quoteText(spot.quote, 240) : "";
  const linkedin = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`${quoted}\n\n${taggedUrl(url, "linkedin")}`)}`;
  const button =
    "inline-flex h-10 w-10 items-center justify-center rounded-full text-night-ink transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10";

  return (
    <div ref={root} tabIndex={-1} className="outline-none" data-quote-share={enabled ? "on" : "off"}>
      {children}
      {spot ? (
        <div
          ref={bar}
          role="group"
          aria-label="Share quote"
          data-quote-popover=""
          onMouseDown={(event) => event.preventDefault()}
          style={{ left: spot.x, top: spot.y, width: BAR_W, transform: `translate(-50%, ${spot.below ? "0" : "-100%"})` }}
          className="on-night no-print fixed z-50 flex items-center gap-0.5 rounded-full bg-night py-1 pl-4 pr-1 text-night-ink shadow-[0_18px_50px_-14px_rgba(0,0,0,0.65)] ring-1 ring-night-line"
        >
          <span className="mr-auto flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-semibold">
            <ShareIcon name="quote" size={14} className="text-accent" />
            Share quote
          </span>
          <a
            href={shareHref("x", { url, text: xText })}
            target="_blank"
            rel="noopener noreferrer"
            data-track="share"
            data-network="x"
            data-share="quote"
            aria-label="Share quote on X (opens in a new tab)"
            className={button}
          >
            <ShareIcon name="x" size={16} />
          </a>
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            data-track="share"
            data-network="linkedin"
            data-share="quote"
            aria-label="Share quote on LinkedIn (opens in a new tab)"
            className={button}
          >
            <ShareIcon name="linkedin" size={16} />
          </a>
          <a
            href={shareHref("whatsapp", { url, text: `${quoted}\n— ${title}` })}
            target="_blank"
            rel="noopener noreferrer"
            data-track="share"
            data-network="whatsapp"
            data-share="quote"
            aria-label="Share quote on WhatsApp (opens in a new tab)"
            className={button}
          >
            <ShareIcon name="whatsapp" size={16} />
          </a>
          <button
            type="button"
            data-track="share"
            data-network="copy"
            data-share="quote"
            aria-label={copied ? "Quote copied" : "Copy quote with link"}
            className={button}
            onClick={async () => setCopied(await copyText(`${quoted}\n— ${title}, Afronomics\n${taggedUrl(url, "copy")}`))}
          >
            <ShareIcon name={copied ? "check" : "link"} size={16} />
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {copied ? "Quote copied to clipboard" : "Share options for the selected quote. Press Tab to reach them, Escape to close."}
          </span>
        </div>
      ) : null}
    </div>
  );
}
