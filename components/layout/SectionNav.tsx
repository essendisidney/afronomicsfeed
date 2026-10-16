"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The section bar on Today (redesign preview): a row of chips under the header that jumps to each part of the page and
 * marks the part in view, so a reader scrolling always knows where they are. Rendered on the server with the first
 * chip marked and a fixed height, so it never moves the page; on the client an IntersectionObserver only swaps which
 * chip is marked. Jumps are plain in-page links (they work without JavaScript); smooth scrolling is off for readers
 * who ask for less motion (app/globals.css).
 */
export type SectionLink = { id: string; label: string };

/** Header (56px) plus this bar (44px) plus a little air: where a section's top counts as "in view". */
const TOP = 112;

export function SectionNav({ sections, label = "On this page" }: { sections: SectionLink[]; label?: string }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const bar = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => el != null);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const visible = new Set<string>();
    const pick = () => {
      // The first section (in page order) that crosses the band under the bars; near the bottom, the last one.
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const id = atEnd ? els[els.length - 1].id : els.find((el) => visible.has(el.id))?.id;
      if (id) setActive(id);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        pick();
      },
      { rootMargin: `-${TOP}px 0px -50% 0px` },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  // Keep the marked chip in view inside the bar (sideways only; the page itself never scrolls from here).
  useEffect(() => {
    const ul = bar.current;
    const chip = ul?.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (!ul || !chip) return;
    const left = chip.offsetLeft - ul.offsetLeft;
    if (left < ul.scrollLeft || left + chip.offsetWidth > ul.scrollLeft + ul.clientWidth) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      ul.scrollTo({ left: Math.max(0, left - 16), behavior: reduce ? "auto" : "smooth" });
    }
  }, [active]);

  return (
    <nav aria-label={label} className="no-print sticky top-14 z-30 h-11 border-b border-rule bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <ul ref={bar} className="swipe-row mx-auto flex h-full max-w-7xl items-stretch gap-1 overflow-x-auto px-2 sm:px-4">
        {sections.map((s) => {
          const on = s.id === active;
          return (
            <li key={s.id} className="flex shrink-0">
              <a
                href={`#${s.id}`}
                data-section={s.id}
                aria-current={on ? "location" : undefined}
                onClick={() => setActive(s.id)}
                className="group flex min-h-11 items-center px-1 text-[13px] font-medium whitespace-nowrap"
              >
                <span
                  className={`inline-flex h-8 items-center rounded-full border px-3 transition-colors ${
                    on ? "border-ink bg-ink text-paper" : "border-rule bg-surface text-ink-soft group-hover:border-ink group-hover:text-ink"
                  }`}
                >
                  {s.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
