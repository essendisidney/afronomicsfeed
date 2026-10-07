"use client";

import { useState, useSyncExternalStore } from "react";
import { track } from "@/lib/track";
import { shareUi, type ShareLang } from "@/lib/learn-ui";
import { shareUrl, type ShareSpec } from "@/lib/share";

/**
 * Share a result: WhatsApp, LinkedIn, X, copy link, and the phone's own share sheet where there is one.
 * Each link goes to /share, which shows the result card in the preview and sends the reader to the tool,
 * tagged utm_source=<channel>&utm_campaign=share for the page counter.
 */

const noop = () => () => {};
const canNativeShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

export function ShareResult({ spec, text, lang = "en" }: { spec: ShareSpec; text: string; lang?: ShareLang }) {
  const t = shareUi[lang];
  const native = useSyncExternalStore(noop, canNativeShare, () => false);
  const [copied, setCopied] = useState(false);
  const pill = "inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-1.5 text-[13px] font-medium text-ink hover:border-accent";

  const wa = `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl(spec, "whatsapp")}`)}`;
  const li = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl(spec, "linkedin"))}`;
  const x = `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl(spec, "x"))}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl(spec, "copy"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {}
  }

  async function nativeShare() {
    try {
      await navigator.share({ text, url: shareUrl(spec, "native") });
    } catch {}
  }

  return (
    <div
      className="no-print mt-4 flex flex-wrap items-center gap-2"
      role="group"
      aria-label={t.heading}
      onClickCapture={(e) => {
        if ((e.target as Element).closest("a,button")) track("share");
      }}
    >
      <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">{t.heading}</span>
      {native ? (
        <button type="button" onClick={nativeShare} className={`${pill} border-accent/50 text-accent`}>
          {t.share}
        </button>
      ) : null}
      <a href={wa} target="_blank" rel="noopener noreferrer" className={pill}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c1.7.7 2.3.8 3.1.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3Z" />
        </svg>
        WhatsApp
      </a>
      <a href={li} target="_blank" rel="noopener noreferrer" className={pill}>
        LinkedIn
      </a>
      <a href={x} target="_blank" rel="noopener noreferrer" className={pill}>
        X
      </a>
      <button type="button" onClick={copy} className={pill} aria-live="polite">
        {copied ? t.copied : t.copy}
      </button>
    </div>
  );
}
