"use client";

import { useState } from "react";
import { copyText } from "@/components/share/clipboard";
import { buttonClass } from "@/components/ui/Button";

/** One button that copies a whole channel post, ready to paste into WhatsApp. */
export function CopyPost({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  return (
    <button
      type="button"
      onClick={async () => setState((await copyText(text)) ? "done" : "failed")}
      className={buttonClass({ variant: "primary", size: "sm" })}
    >
      {state === "done" ? "Copied" : state === "failed" ? "Copy failed: select the text" : label}
    </button>
  );
}
