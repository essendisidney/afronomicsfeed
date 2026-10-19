"use client";

import { useEffect, useRef } from "react";
import { cleanSearch } from "@/lib/signals-core";
import { track } from "@/lib/track";

/**
 * Counts a search that found nothing, once the reader has stopped typing for 1.5 seconds; each cleaned query once per
 * page load. Only the cleaned words are sent (lib/signals-core.ts cleanSearch drops anything that could be contact
 * details), never who searched.
 */
export function useSearchMiss(query: string, results: number) {
  const sent = useRef(new Set<string>());
  useEffect(() => {
    if (results > 0) return;
    const q = cleanSearch(query);
    if (!q || sent.current.has(q)) return;
    const timer = window.setTimeout(() => {
      sent.current.add(q);
      track("search_miss", q, "/search");
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [query, results]);
}
