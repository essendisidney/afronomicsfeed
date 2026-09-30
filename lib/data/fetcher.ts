/**
 * Shared fetch helper for every upstream publisher.
 *
 * - Uses Next's persistent data cache (`next.revalidate`) so a page render never
 *   waits on a publisher that has already been read inside the window.
 * - Memoises in-process so dozens of statically generated pages share one read.
 * - Times out without an AbortSignal (a signal would opt the call out of Next's
 *   request memoisation) and never throws: a failed read returns null.
 */

const inflight = new Map<string, { at: number; promise: Promise<unknown> }>();
const MEMO_MS = 10 * 60 * 1000;

export const USER_AGENT = "AfronomicsBot/1.0 (+https://www.afronomicsfeed.com/method)";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
    );
  });
}

type FetchOptions = {
  revalidate: number;
  timeoutMs?: number;
  accept?: string;
  retries?: number;
  tags?: string[];
};

async function readOnce(url: string, kind: "json" | "text", options: FetchOptions) {
  const response = await fetch(url, {
    headers: { Accept: options.accept ?? (kind === "json" ? "application/json" : "*/*"), "User-Agent": USER_AGENT },
    next: { revalidate: options.revalidate, tags: options.tags },
  });
  if (!response.ok) throw new Error(`${response.status}`);
  return kind === "json" ? response.json() : response.text();
}

async function read(url: string, kind: "json" | "text", options: FetchOptions): Promise<unknown | null> {
  const key = `${kind}:${url}`;
  const hit = inflight.get(key);
  if (hit && Date.now() - hit.at < MEMO_MS) return hit.promise;

  const promise = (async () => {
    const attempts = (options.retries ?? 1) + 1;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const value = await withTimeout(readOnce(url, kind, options), options.timeoutMs ?? 15000);
      if (value !== null) return value;
    }
    return null;
  })();

  inflight.set(key, { at: Date.now(), promise });
  const value = await promise;
  // Do not pin a failure for the whole memo window.
  if (value === null) inflight.delete(key);
  return value;
}

export function fetchJson<T = unknown>(url: string, options: FetchOptions): Promise<T | null> {
  return read(url, "json", options) as Promise<T | null>;
}

export function fetchText(url: string, options: FetchOptions): Promise<string | null> {
  return read(url, "text", options) as Promise<string | null>;
}

/** Time of this server render. Pages are regenerated on a schedule, so "3h ago" is relative to the last regeneration. */
export function renderTime() {
  return Date.now();
}
