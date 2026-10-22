"use client";

import { useEffect, useRef } from "react";
import type { FoundInput, FoundTool } from "@/lib/found";
import { isOwnerDevice } from "@/lib/track";

/** What a tool sends to /api/found (lib/found.ts FoundInput): the tool and the reader's inputs, nothing else. */
export type FoundPayload = FoundInput;

function pageViewId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  }
}

/**
 * Count one result per tool per page view, like rate_check: once the line has shown a positive difference and the
 * reader has stopped typing for 1.5 seconds. Owner devices (marked by opening the desk) are never counted. Any failure
 * is silent: the reader never sees an error from the count.
 */
export function useFoundCount(payload: FoundPayload | null) {
  const sent = useRef<Set<FoundTool>>(new Set());
  const view = useRef("");
  const key = payload ? JSON.stringify(payload) : "";
  useEffect(() => {
    if (!key) return;
    const body = JSON.parse(key) as FoundPayload;
    if (sent.current.has(body.tool)) return;
    const t = window.setTimeout(() => {
      if (sent.current.has(body.tool) || isOwnerDevice()) return;
      sent.current.add(body.tool);
      if (!view.current) view.current = pageViewId();
      try {
        void fetch("/api/found", {
          method: "POST",
          body: JSON.stringify({ ...body, view: view.current }),
          headers: { "Content-Type": "application/json" },
          keepalive: true,
        }).catch(() => {});
      } catch {}
    }, 1500);
    return () => window.clearTimeout(t);
  }, [key]);
}
