"use client";

import { useState } from "react";

export function CopyCitation({ text }: { text: string }) {
  const [copied, setCopied] = useState<"idle" | "citation" | "link">("idle");

  async function copy(value: string, kind: "citation" | "link") {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
  }

  const url = text.split(" ").at(-1) ?? "";

  return (
    <div className="no-print flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => copy(text, "citation")}
        className="border border-rule px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft hover:border-gold"
      >
        {copied === "citation" ? "Citation copied" : "Copy citation"}
      </button>
      <button
        type="button"
        onClick={() => copy(url, "link")}
        className="border border-rule px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft hover:border-gold"
      >
        {copied === "link" ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
