"use client";

import { useEffect, useState } from "react";
import { SubscribeForm } from "@/components/ui/SubscribeForm";

/**
 * A polite end-of-story ask: slides in once a reader has scrolled most of the way through a story, once per
 * browser, and closes for good with one tap.
 */
const KEY = "af_story_prompt";

export function StorySignup() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) || localStorage.getItem("af_owner") === "1") return;
    } catch {
      return;
    }
    const onScroll = () => {
      const seen = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (seen > 0.6) {
        setOpen(true);
        try {
          localStorage.setItem(KEY, new Date().toISOString().slice(0, 10));
        } catch {}
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!open) return null;
  return (
    <aside
      role="dialog"
      aria-label="Get the next story"
      className="no-print fixed inset-x-3 bottom-3 z-50 mx-auto max-w-lg rounded-2xl border border-rule bg-surface px-5 py-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)] sm:bottom-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-ink">Liked this? Get the next one.</p>
          <p className="mt-0.5 text-[13px] leading-5 text-ink-soft">One new story a week and the day&rsquo;s rates every weekday morning, free. Plus our guide to where your shilling earns most.</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="-mr-1 rounded-full px-2 text-xl leading-none text-muted hover:text-ink">
          ×
        </button>
      </div>
      <div className="mt-3">
        <SubscribeForm />
      </div>
    </aside>
  );
}
