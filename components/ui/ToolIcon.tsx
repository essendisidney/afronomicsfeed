import type { ReactNode } from "react";
import type { ToolGroup } from "@/lib/tools";

/**
 * One line icon per tool group, drawn in the signature on a laterite wash, so a row of calculators reads as a set of
 * instruments rather than a list of links. Decorative: the tool's title carries the meaning.
 */
const paths: Record<ToolGroup, ReactNode> = {
  // A wallet: everyday money.
  "Everyday money": (
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
      <path d="M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3" />
      <path d="M20 11h-4a2 2 0 0 0 0 4h4v-4Z" />
    </>
  ),
  // A rising line: saving and investing.
  "Saving and investing": (
    <>
      <path d="M4 19h16" />
      <path d="m5 15 4.5-4.5 3 3L19 7" />
      <path d="M14.5 7H19v4.5" />
    </>
  ),
  // A percent sign in a tag: what borrowing costs.
  Borrowing: (
    <>
      <path d="m8 16 8-8" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <circle cx="15.5" cy="15.5" r="1.5" />
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    </>
  ),
  // A shield with a tick: check before you sign.
  "Check before you sign": (
    <>
      <path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6l-7-2.5Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
};

export function ToolIcon({ group, className = "" }: { group: ToolGroup; className?: string }) {
  return (
    <span aria-hidden="true" className={`af-tool-icon inline-flex shrink-0 items-center justify-center rounded-xl ${className}`}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {paths[group]}
      </svg>
    </span>
  );
}
