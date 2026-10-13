"use client";

import { useState } from "react";

/** The paid API key with a copy button. The key comes from the server render; it is never stored in the browser. */
export function CopyKey({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
      <code className="block min-w-0 flex-1 break-all bg-surface px-3 py-2 font-mono text-[13px] text-ink">{value}</code>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard?.writeText(value).then(() => setCopied(true), () => undefined);
        }}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/20 px-4 py-2 text-[13px] font-semibold hover:border-accent"
      >
        {copied ? "Copied" : "Copy key"}
      </button>
    </div>
  );
}
