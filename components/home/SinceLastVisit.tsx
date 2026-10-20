"use client";

import { useEffect, useState } from "react";
import { sinceLine, snapshot, type Mark, type Snapshot, type Story } from "@/lib/since-core";

const KEY = "af_since";
const VIEW = "af_since_view";
const HOUR = 3_600_000;

/**
 * One line under Today's numbers: what changed since this browser last came (lib/since-core.ts). The snapshot stays in
 * the browser; nothing is sent. A first visit sees an invitation in the same one line, so nothing below it moves.
 * The baseline is renewed at most once an hour, so a reload keeps showing the same changes.
 */
export function SinceLastVisit({ marks, stories, now }: { marks: Mark[]; stories: Story[]; now: string }) {
  const [line, setLine] = useState<string | null>(null);
  useEffect(() => {
    try {
      const held = sessionStorage.getItem(VIEW);
      const prev = JSON.parse(localStorage.getItem(KEY) ?? "null") as Snapshot | null;
      if (held) setLine(held);
      else if (prev?.at && prev.marks) {
        const text = sinceLine(prev, marks, stories, now);
        sessionStorage.setItem(VIEW, text);
        setLine(text);
      }
      if (!prev?.at || Date.parse(now) - Date.parse(prev.at) > HOUR) localStorage.setItem(KEY, JSON.stringify(snapshot(marks, stories, now)));
    } catch {
      // Storage blocked (private window): the invitation stays.
    }
  }, [marks, stories, now]);
  return (
    <p className="mt-2 flex min-h-11 items-center overflow-hidden rounded-xl border border-rule bg-surface px-3 text-[13px] leading-5" aria-live="polite">
      <span className="truncate">
        {line ? (
          <span className="font-medium text-ink">{line}</span>
        ) : (
          <span className="text-muted">Come back tomorrow: this line will show what changed since now.</span>
        )}
      </span>
    </p>
  );
}
