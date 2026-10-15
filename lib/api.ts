import { after } from "next/server";
import { countsAsApiCall } from "@/lib/bots";
import { csvTopLines, fileName, parseCsv, workbook, type DataFile } from "@/lib/documents/data-files";
import { checkSession, sessionToken, verifySession } from "@/lib/downloads";
import { rpc } from "@/lib/store";
import { site } from "@/lib/site";

/**
 * Free and keyed access (decision D-016, F1).
 *
 * Free for everyone, no key: the latest 12 months of any market (by each row's auction or settlement date), at up to
 * 100 rows a call. A key (pilot or paid, issued on the desk or by the pilot form; migrations 0028 and 0035) is needed
 * for older history, for more than 100 rows a call and for bulk CSV beyond the free window. A request without a valid
 * key is never refused and never cut silently: it gets the free slice, `truncated: true`, an `upgrade` link and the
 * `X-Afronomics-Free-Tier: true` header (CSV: `#` comment lines at the top).
 *
 * The site's own pages and embeds read the data through lib/data loaders, not through this API, so none of this
 * changes what readers see on afronomicsfeed.com. In a browser, where a link cannot send a header, a key holder signs
 * in once on /downloads and the CSV routes accept that session as the key (lib/downloads.ts).
 */
export const FREE_MONTHS = 12;
export const FREE_ROWS = 100;
export const UPGRADE_URL = `${site.url}/pricing#pilot`;
export const TERMS_URL = `${site.url}/developers#terms`;
const KEYED_DEFAULT_ROWS = 500;
const KEYED_MAX_ROWS = 5000;

export const LICENCE_LINE =
  "Free for research, journalism, teaching and non-commercial use with credit and a link. Commercial use, including internal use at a fund, bank or firm, needs a pilot or paid licence; redistribution is Enterprise only.";

/** A licensed customer's key, from "Authorization: Bearer afk_…" or "X-API-Key: afk_…". */
function keyOf(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const key = (auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : request.headers.get("x-api-key") ?? "").trim();
  return /^afk_[0-9a-f]{48}$/.test(key) ? key : key ? "invalid" : "";
}

export const DOWNLOADS_URL = `${site.url}/downloads`;

/**
 * none: no key sent. valid: a live key (plan set). not_recognised: a key was sent but is unknown, revoked, expired or
 * could not be checked. downloads_only: an Analyst key on the JSON API (Analyst covers full-history CSV downloads,
 * not the API). session_expired: a browser download session (lib/downloads.ts) that is expired or not valid.
 * `personal`: the request is tied to one visitor (a download session cookie or ?full=1), so it is never cached.
 */
export type ApiAccess = {
  plan: string | null;
  key: "none" | "valid" | "not_recognised" | "downloads_only" | "session_expired";
  via?: "header" | "session";
  personal?: boolean;
};

const checked = new WeakMap<Request, Promise<ApiAccess>>();

/** Plans whose keys unlock CSV downloads only, not the JSON API. */
const DOWNLOAD_ONLY_PLANS = new Set(["analyst"]);

/**
 * Check the request's key once (memoised per request, so a route and apiJson can both ask without counting twice).
 * A valid key is counted in data_key_usage by af_api_key_use, as before. With `csv` (the /api/data CSV routes), a
 * browser download session from /downloads counts as a valid key when no header key is sent; it is checked against
 * the key's live state and counted per key too (lib/downloads.ts).
 */
export function apiAccess(request: Request, path: string, opts: { csv?: boolean } = {}): Promise<ApiAccess> {
  let access = checked.get(request);
  if (!access) {
    access = (async (): Promise<ApiAccess> => {
      const key = keyOf(request);
      const token = opts.csv ? sessionToken(request) : null;
      const personal = Boolean(opts.csv && (token || new URL(request.url).searchParams.has("full")));
      if (key) {
        const result = key === "invalid" ? null : await rpc("af_api_key_use", { p_secret: process.env.AF_CRON_SECRET ?? "", p_key: key, p_path: path });
        const plan = result?.ok ? ((result.value as string | null) ?? null) : null;
        if (plan && DOWNLOAD_ONLY_PLANS.has(plan) && !opts.csv) return { plan: null, key: "downloads_only", via: "header", personal };
        return plan ? { plan, key: "valid", via: "header", personal } : { plan: null, key: "not_recognised", via: "header", personal };
      }
      if (token) {
        const session = verifySession(token);
        if (!session) return { plan: null, key: "session_expired", via: "session", personal };
        const plan = await checkSession(session, path);
        return plan ? { plan, key: "valid", via: "session", personal } : { plan: null, key: "not_recognised", via: "session", personal };
      }
      return { plan: null, key: "none", personal };
    })();
    checked.set(request, access);
  }
  return access;
}

/** The first day of the free window: the same calendar day twelve months ago (UTC). Rows dated on or after it are free. */
export function freeWindowFrom(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - FREE_MONTHS, now.getUTCDate())).toISOString().slice(0, 10);
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** from, to (YYYY-MM-DD) and limit from the query string; null when a date is malformed. */
export function readRange(request: Request): { from: string; to: string; limit: number | null } | null {
  const q = new URL(request.url).searchParams;
  const from = q.get("from") ?? "";
  const to = q.get("to") ?? "";
  if ((from && !ISO.test(from)) || (to && !ISO.test(to))) return null;
  const raw = Number(q.get("limit"));
  const limit = q.get("limit") && Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : null;
  return { from, to, limit };
}

export type FreeTier = {
  window_from: string;
  max_rows: number;
  truncated: boolean;
  reasons: Array<"history" | "rows">;
  /** Same request for the next (older) page inside the free window, when there is one. */
  next: string | null;
};

const dayBefore = (date: string) => new Date(Date.parse(`${date}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);

/**
 * Apply the access rule to rows already filtered by everything except date and limit.
 * Keyed: unchanged behaviour (from/to, JSON limit default 500, max 5,000; CSV passes `keyed` = no cap, the full file).
 * Free: rows on or after the free window start, newest first, at most 100 (or the requested limit if lower), cut at a
 * whole date where possible so `next` pages cleanly.
 */
export function sliceRows<T>(
  request: Request,
  rows: T[],
  dateOf: (row: T) => string,
  range: { from: string; to: string; limit: number | null },
  access: ApiAccess,
  keyed: { defaultRows: number; maxRows: number } = { defaultRows: KEYED_DEFAULT_ROWS, maxRows: KEYED_MAX_ROWS },
): { rows: T[]; free: FreeTier | null } {
  const within = (row: T, from: string) => (!from || dateOf(row) >= from) && (!range.to || dateOf(row) <= range.to);
  const keyedLimit = Math.min(keyed.maxRows, range.limit ?? keyed.defaultRows);
  const full = rows.filter((row) => within(row, range.from)).slice(0, keyedLimit);
  if (access.plan) return { rows: full, free: null };

  const windowFrom = freeWindowFrom();
  const from = range.from && range.from > windowFrom ? range.from : windowFrom;
  const limit = Math.min(FREE_ROWS, range.limit ?? FREE_ROWS);
  const inWindow = rows.filter((row) => within(row, from)).sort((a, b) => dateOf(b).localeCompare(dateOf(a)));
  let picked = inWindow.slice(0, limit);
  let next: string | null = null;
  if (inWindow.length > picked.length && picked.length) {
    const last = dateOf(picked[picked.length - 1]);
    const firstLeft = dateOf(inWindow[picked.length]);
    const capped = range.limit == null || range.limit > FREE_ROWS; // cut by the free cap, not by the caller's own limit
    if (firstLeft === last && capped) {
      // The cut splits a date: end this page before that date, so the next page starts with all of its rows.
      const whole = picked.filter((row) => dateOf(row) !== last);
      if (whole.length) picked = whole;
    }
    const tail = dateOf(picked[picked.length - 1]);
    const left = dateOf(inWindow[picked.length]);
    // Normally the next page starts at the first row left out. If a single date still splits (the caller's own limit, or
    // more than 100 rows on one date), restart at that date: a few rows repeat, none are skipped. A page that is all one
    // date moves on to the day before, so paging always ends.
    const nextTo = left !== tail ? left : dateOf(picked[0]) === tail ? dayBefore(tail) : tail;
    const url = new URL(request.url);
    url.searchParams.set("to", nextTo);
    const nextUrl = new URL(url.pathname + url.search, site.url);
    next = nextUrl.toString();
  }
  const reasons: FreeTier["reasons"] = [];
  if (full.some((row) => dateOf(row) < windowFrom)) reasons.push("history");
  if (inWindow.length > picked.length && (range.limit == null || range.limit > picked.length)) reasons.push("rows");
  return {
    rows: picked,
    free: { window_from: windowFrom, max_rows: FREE_ROWS, truncated: picked.length < full.length, reasons, next },
  };
}

function freeNote(free: FreeTier) {
  const why = [
    free.reasons.includes("history") ? `rows dated before ${free.window_from} need a key` : "",
    free.reasons.includes("rows") ? `more than ${FREE_ROWS} rows in one call needs a key` : "",
  ].filter(Boolean);
  return `Free tier: the latest ${FREE_MONTHS} months (rows dated ${free.window_from} or later), up to ${FREE_ROWS} rows a call.${
    why.length ? ` This response was shortened: ${why.join("; ")}.` : ""
  } Full history and larger calls: a pilot or paid key (${UPGRADE_URL}).`;
}

const KEY_NOT_RECOGNISED =
  "API key not recognised (unknown, revoked or expired), so this is the free tier. Check the key, or ask the desk for a new one: " + UPGRADE_URL;
const SESSION_KEY_NOT_RECOGNISED =
  "The key behind your download session is no longer valid (revoked or expired), so this is the free tier. Ask the desk for a new key: " + UPGRADE_URL;
const SESSION_EXPIRED = `Your full-history download session has ended, so this is the free tier. Sign in again with your key: ${DOWNLOADS_URL}`;
const DOWNLOADS_ONLY = `This is an Analyst key: it unlocks full-history CSV downloads (/api/data/..., or in a browser at ${DOWNLOADS_URL}), not the JSON API, so this is the free tier. The API is in Team and API: ${UPGRADE_URL}`;

/** The one-line notice for a key or session that did not unlock full access, or null. */
function keyNote(access: ApiAccess) {
  if (access.key === "not_recognised") return access.via === "session" ? SESSION_KEY_NOT_RECOGNISED : KEY_NOT_RECOGNISED;
  if (access.key === "session_expired") return SESSION_EXPIRED;
  if (access.key === "downloads_only") return DOWNLOADS_ONLY;
  return null;
}

/** The JSON fields that describe a free (or unrecognised-key) response. Empty for a valid key (free is null then). */
export function freeFields(free: FreeTier | null) {
  return {
    ...(free
      ? {
          truncated: free.truncated,
          ...(free.truncated ? { upgrade: UPGRADE_URL } : {}),
          free_tier: { window_from: free.window_from, max_rows: free.max_rows, ...(free.next ? { next: free.next } : {}), note: freeNote(free) },
        }
      : {}),
  };
}

/** Headers shared by JSON and CSV responses for this access level. */
const KEY_HEADER: Partial<Record<ApiAccess["key"], string>> = {
  not_recognised: "not-recognised",
  session_expired: "session-expired",
  downloads_only: "downloads-only",
};

function accessHeaders(access: ApiAccess, free: FreeTier | null): Record<string, string> {
  const keyHeader = KEY_HEADER[access.key];
  return {
    Vary: access.via === "session" || access.personal ? "Authorization, X-API-Key, Cookie" : "Authorization, X-API-Key",
    ...(access.plan
      ? { "X-Afronomics-Plan": access.plan, "Cache-Control": "private, no-store" }
      : {
          "X-Afronomics-Free-Tier": "true",
          ...(free?.truncated ? { "X-Afronomics-Truncated": "true" } : {}),
          ...(keyHeader ? { "X-Afronomics-Key": keyHeader, "Cache-Control": "no-store" } : {}),
          // A visitor's own download (session cookie or ?full=1) is never stored by the CDN, so a key holder is never
          // served a cached free file under the full-history URL, and nobody is served a holder's file.
          ...(access.personal ? { "Cache-Control": "private, no-store" } : {}),
        }),
  };
}

/**
 * Public JSON API helpers. Responses without a key are cached at the edge for five minutes; each served request is
 * counted (path, calling site, country; no IPs or keys) so we can see which datasets people build on. Automated callers
 * are served but not counted (lib/bots.ts). Keyed calls are checked and counted per key (apiAccess) and served fresh.
 * Pass `free` from sliceRows on endpoints that return history rows.
 */
export async function apiJson(request: Request, path: string, data: unknown, status = 200, free: FreeTier | null = null): Promise<Response> {
  const access = await apiAccess(request, path);
  const origin = request.headers.get("origin") ?? request.headers.get("referer") ?? "";
  let caller = "";
  try {
    caller = origin ? new URL(origin).hostname.replace(/^www\./, "") : "";
  } catch {}
  const country = request.headers.get("x-vercel-ip-country") ?? "";
  // Count people and the sites building on the data. Not counted (lib/bots.ts countsAsApiCall): crawlers and our own
  // jobs (alert checker, readers), HEAD and prefetches (link checkers), and internal calls: anything without
  // x-vercel-ip-country, i.e. not received from the internet by Vercel (the site QA's `next start` in CI, local runs).
  if (countsAsApiCall(request.method, request.headers))
    after(() => rpc("af_hit", { p_path: `/api${path}`.slice(0, 200), p_referrer: caller || "api", p_country: country }).catch(() => undefined));
  return new Response(
    JSON.stringify(
      {
        ...(data as object),
        ...(status < 400 ? freeFields(free) : {}),
        ...(keyNote(access) ? { key_status: access.key, key_note: keyNote(access) } : {}),
        attribution: `Source: Afronomics (${site.url.replace("https://", "")}), compiled from central-bank publications. Credit Afronomics with a link.`,
        licence: access.plan ? `Licensed under your ${access.plan} plan. Terms: ${TERMS_URL}` : `${LICENCE_LINE} Terms: ${TERMS_URL}`,
      },
      null,
      0,
    ),
    {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Expose-Headers": "X-Afronomics-Free-Tier, X-Afronomics-Truncated, X-Afronomics-Key, X-Afronomics-Plan",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        ...accessHeaders(access, free),
      },
    },
  );
}

/**
 * A CSV download under the same rule. `body` is the dataset's own CSV (with its own `#` source lines); notice lines go
 * on top. With `file` (lib/documents/data-files.ts) the download is named afronomics_<dataset>_<as-of>.csv, opens with
 * its as-of date and citation, and `?format=xlsx` returns the same rows as an Excel workbook.
 */
export async function apiCsv(body: string, filename: string, access: ApiAccess, free: FreeTier | null, file?: { meta: Omit<DataFile, "asOf"> & { asOf?: string }; request: Request }): Promise<Response> {
  const lines = access.plan
    ? [`# Licensed under your ${access.plan} plan. Terms: ${TERMS_URL}`]
    : [
        ...(keyNote(access) ? [`# ${keyNote(access)}`] : []),
        ...(free ? [`# ${freeNote(free)}`, `# truncated: ${free.truncated}${free.truncated ? `; upgrade: ${UPGRADE_URL}` : ""}`] : []),
        ...(free?.next ? [`# Next page (older rows inside the free window): ${free.next}`] : []),
        `# Licence: ${LICENCE_LINE} Terms: ${TERMS_URL}`,
      ];
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers": "X-Afronomics-Free-Tier, X-Afronomics-Truncated, X-Afronomics-Key, X-Afronomics-Plan",
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    ...accessHeaders(access, free),
  };
  if (!file) {
    return new Response(`${lines.join("\n")}\n${body}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"`, ...headers } });
  }
  return dataFileResponse(file.request, `${lines.join("\n")}\n${body}`, { ...file.meta, asOf: file.meta.asOf ?? asOfFrom(body) }, access.plan ? `Licensed under your ${access.plan} plan. Terms: ${TERMS_URL}` : `${LICENCE_LINE} Terms: ${TERMS_URL}`, headers);
}

/**
 * The newest date in the CSV's own date column (value, settlement, auction or as-of date), never later than today:
 * a bond auction's value date can be days after its result is published.
 */
function asOfFrom(csv: string) {
  const { header, rows } = parseCsv(csv);
  const col = header.findIndex((h) => ["value_date", "settlement_date", "auction_date", "date", "as_of"].includes(h));
  const dates = col < 0 ? [] : rows.map((r) => r[col]).filter((v) => /^\d{4}-\d{2}-\d{2}$/.test(v ?? ""));
  const today = new Date().toISOString().slice(0, 10);
  return dates.filter((d) => d <= today).sort().at(-1) ?? today;
}

/** A dataset as CSV (default) or, with ?format=xlsx, as the Excel workbook; named afronomics_<dataset>_<as-of>. */
export async function dataFileResponse(request: Request, csv: string, meta: DataFile, licence: string, extra: Record<string, string> = {}): Promise<Response> {
  if (new URL(request.url).searchParams.get("format") === "xlsx") {
    const bytes = await workbook(csv, meta, licence);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName(meta, "xlsx")}"`,
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        ...extra,
      },
    });
  }
  return new Response(`${csvTopLines(meta).join("\n")}\n${csv}`, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${fileName(meta, "csv")}"`, "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400", ...extra },
  });
}

/** CSV downloads give a key holder the whole file unless they pass a limit. */
export const CSV_KEYED = { defaultRows: Number.POSITIVE_INFINITY, maxRows: Number.POSITIVE_INFINITY };

/** A plain-text error for the CSV routes. */
export function csvError(message: string, status: number) {
  return new Response(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
