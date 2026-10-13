export const runtime = "nodejs";

/** Crude per-instance limit: at most this many log lines a minute, so a noisy page or a flood cannot fill the logs. */
const LINES_PER_MINUTE = 60;
const MAX_BODY = 64_000;
let windowStart = 0;
let linesInWindow = 0;
let droppedInWindow = 0;

type Violation = { directive: string; blocked: string; page: string };

/** The blocked resource as a host (or a keyword such as inline, eval, data): never a full URL or query string. */
function blockedHost(value: unknown) {
  if (typeof value !== "string" || !value) return "-";
  try {
    const url = new URL(value);
    return url.host || url.protocol.replace(/:$/, "");
  } catch {
    return value.replace(/[^a-z0-9:.-]/gi, "").slice(0, 40) || "-"; // "inline", "eval", "data", "blob"
  }
}

/** The page as a path only: query strings and fragments can carry personal data, so they are never logged. */
function pagePath(value: unknown) {
  if (typeof value !== "string" || !value) return "-";
  try {
    return new URL(value).pathname.slice(0, 160) || "/";
  } catch {
    return "-";
  }
}

function read(body: Record<string, unknown>): Violation {
  // report-uri (application/csp-report) sends kebab-case keys; report-to (application/reports+json) sends camelCase.
  const directive = body["effective-directive"] ?? body.effectiveDirective ?? body["violated-directive"] ?? "";
  return {
    directive: String(directive).replace(/[^a-z-]/gi, "").slice(0, 40) || "-",
    blocked: blockedHost(body["blocked-uri"] ?? body.blockedURL),
    page: pagePath(body["document-uri"] ?? body.documentURL),
  };
}

function reportsFrom(parsed: unknown) {
  const reports: Record<string, unknown>[] = [];
  if (Array.isArray(parsed)) {
    for (const item of parsed.slice(0, 20)) {
      const report = item as { type?: unknown; body?: unknown } | null;
      if (report?.type === "csp-violation" && report.body && typeof report.body === "object") reports.push(report.body as Record<string, unknown>);
    }
  } else if (parsed && typeof parsed === "object") {
    const body = (parsed as { "csp-report"?: unknown })["csp-report"];
    if (body && typeof body === "object") reports.push(body as Record<string, unknown>);
  }
  return reports;
}

/**
 * Receives Content-Security-Policy-Report-Only violations, in both the report-uri format (application/csp-report)
 * and the Reporting API format (application/reports+json), and logs one compact line per violation:
 * directive, blocked host and page path. No IP addresses, user agents, full URLs or query strings are recorded.
 */
export async function POST(request: Request) {
  const type = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!["application/csp-report", "application/reports+json", "application/json"].includes(type)) {
    return new Response(null, { status: 415 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return new Response(null, { status: 413 });

  const now = Date.now();
  if (now - windowStart >= 60_000) {
    if (droppedInWindow) console.log(`[csp] rate limit: ${droppedInWindow} reports dropped in the last minute`);
    windowStart = now;
    linesInWindow = 0;
    droppedInWindow = 0;
  }
  if (linesInWindow >= LINES_PER_MINUTE) {
    droppedInWindow++;
    return new Response(null, { status: 429 });
  }

  const text = (await request.text().catch(() => "")).slice(0, MAX_BODY);
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  for (const report of reportsFrom(parsed)) {
    if (linesInWindow >= LINES_PER_MINUTE) {
      droppedInWindow++;
      continue;
    }
    linesInWindow++;
    const v = read(report);
    console.log(`[csp] ${v.directive} blocked=${v.blocked} page=${v.page}`);
  }
  return new Response(null, { status: 204 });
}
