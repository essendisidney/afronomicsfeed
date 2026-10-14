#!/usr/bin/env node
/**
 * Site QA: the automated quality gate for the public site.
 *
 * Visits the pages in tests/site/pages.json against a running `next start`, at 390px and 1280px, in light and
 * dark, and fails on: horizontal overflow, console errors, internal links answering >= 400, axe-core WCAG A/AA
 * violations, images without alt, missing or over-long <title> / meta description, more than one <h1>, tap targets
 * under 44px (header, footer and calls to action at 390px), broken shared layout (header, footer, footer column
 * sizes, long nav labels) and known overclaims in the copy. Intentional exceptions live in tests/site/allowlist.json.
 *
 * Writes <out>/report.md, <out>/report.json and <out>/screenshots/*.jpg; exits 1 when anything fails.
 *
 *   node scripts/site-qa.mjs                        # against http://localhost:3000
 *   node scripts/site-qa.mjs --serve                # runs `next start` itself (after `next build`)
 *   node scripts/site-qa.mjs --base https://... --only /pricing,/about --concurrency 6 --out qa-report
 *
 * See docs/qa.md.
 */
import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "package.json"));

// Every request the QA makes says it is ours (lib/bots.ts INTERNAL_HEADER, and an Afronomics user agent on the link
// checks), so a run against production or a CI `next start` is never counted as readers, clicks or API usage.
const INTERNAL_HEADERS = { "x-afronomics-internal": "site-qa" };
const FETCH_HEADERS = { ...INTERNAL_HEADERS, "user-agent": "AfronomicsSiteQA/1.0 (+link check)" };

// ---------------------------------------------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { base: "http://localhost:3000", out: "qa-report", concurrency: 4, serve: false, only: null, port: 3000, skipLinks: null, pages: "tests/site/pages.json" };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => argv[++i];
    if (arg === "--base") opts.base = value();
    else if (arg === "--out") opts.out = value();
    else if (arg === "--concurrency") opts.concurrency = Number(value());
    else if (arg === "--only") opts.only = value().split(",").map((s) => s.trim()).filter(Boolean);
    else if (arg === "--serve") opts.serve = true;
    else if (arg === "--port") opts.port = Number(value());
    // Only for a sandbox without internet, where routes that proxy an upstream source (the World Bank) cannot answer.
    else if (arg === "--skip-links") opts.skipLinks = new RegExp(value());
    else if (arg === "--pages") opts.pages = value();
    else if (arg === "--help" || arg === "-h") {
      console.log("node scripts/site-qa.mjs [--base URL] [--serve] [--port 3000] [--out qa-report] [--concurrency 4] [--only /a,/b] [--pages FILE] [--skip-links REGEX]");
      process.exit(0);
    } else throw new Error(`Unknown argument ${arg}`);
  }
  if (opts.serve && !argv.includes("--base")) opts.base = `http://localhost:${opts.port}`;
  opts.base = opts.base.replace(/\/$/, "");
  opts.out = path.resolve(root, opts.out);
  return opts;
}

/** Viewports and themes every page is checked in. The first is the "primary" variant for page-level checks. */
const VARIANTS = [
  { id: "1280-light", width: 1280, height: 900, colorScheme: "light" },
  { id: "1280-dark", width: 1280, height: 900, colorScheme: "dark" },
  { id: "390-light", width: 390, height: 844, colorScheme: "light", mobile: true },
  { id: "390-dark", width: 390, height: 844, colorScheme: "dark", mobile: true },
];

export const LIMITS = {
  titleMax: 65,
  descriptionMax: 160,
  tapTarget: 44,
  navLabelMax: 32,
  footerColumnMin: 4,
  footerColumnMax: 14,
  footerColumnRatio: 2,
  // Speed budget (docs/rebuild/phase-7-plan.md, 7a), on a phone over slow 4G with a 4x slower CPU. Set from what the
  // site measured on 14 Oct 2026 (largest content 1.0-2.1 s, 147-162 KB of script): the framework alone sends about
  // 140 KB, so the plan's first guess of 120 KB was below the floor.
  lcpMs: 2500,
  clsMax: 0.05,
  scriptKb: 175,
};

/** The page templates the speed budget is measured on, one at a time so the timing is not skewed by parallel work. */
const SPEED_PAGES = ["/", "/receipts", "/numbers", "/markets/tbills", "/rates/kenya", "/registry", "/compare", "/casebook", "/record", "/for-institutions"];

async function checkSpeed(browser, base, target) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, extraHTTPHeaders: INTERNAL_HEADERS });
  const page = await context.newPage();
  const found = [];
  try {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      window.__lcp = 0;
      window.__cls = 0;
      new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__lcp = e.startTime))).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (window.__cls += e.value))).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(base + target.path, { waitUntil: "load", timeout: 60_000 });
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => ({
      lcp: Math.round(window.__lcp),
      cls: window.__cls,
      kb: Math.round(performance.getEntriesByType("resource").filter((r) => r.initiatorType === "script").reduce((n, r) => n + r.transferSize, 0) / 1024),
    }));
    const push = (message) => found.push({ check: "speed", page: target.path, variant: "390-slow-4g", message, detail: null });
    if (m.lcp > LIMITS.lcpMs) push(`Largest content took ${m.lcp} ms (budget ${LIMITS.lcpMs} ms)`);
    if (m.cls > LIMITS.clsMax) push(`Layout shift ${m.cls.toFixed(3)} (budget ${LIMITS.clsMax})`);
    if (m.kb > LIMITS.scriptKb) push(`${m.kb} KB of script (budget ${LIMITS.scriptKb} KB)`);
    console.log(`speed ${target.path}: ${m.lcp} ms, shift ${m.cls.toFixed(3)}, ${m.kb} KB script`);
  } catch (err) {
    found.push({ check: "speed", page: target.path, variant: "390-slow-4g", message: `Could not measure: ${String(err.message || err).slice(0, 200)}`, detail: null });
  } finally {
    await context.close();
  }
  return found;
}

/**
 * Known overclaims. Each rule matches within one sentence of visible copy (plus <title> and meta description).
 * `unless` lets the same sentence clear the rule (a ranking stated "by yield" is a fact, not a boast).
 */
export const COPY_RULES = [
  { id: "every-african", pattern: /\bevery African\b/i, why: "Coverage is a list of markets, not the whole continent." },
  { id: "cited-by-institutions", pattern: /\bcited by institutions\b/i, why: "Name the institution and the citation, or drop it." },
  { id: "the-minute-they-publish", pattern: /\bthe minute they publish\b/i, why: "Publication lags the source; say 'the day they publish' or give the measured latency." },
  { id: "guaranteed", pattern: /\bguaranteed?\b/i, unless: /\b(?:not|never|no|nor)\b[^.]{0,24}\bguarantee/i, why: "Nothing on the site is guaranteed; allowlist only factual uses (e.g. a government guarantee)." },
  { id: "best-fund", pattern: /\bbest (?:money[- ]market )?funds?\b/i, unless: /\bby yield\b/i, why: "A fund ranking must say what it ranks by ('by yield')." },
];

// ---------------------------------------------------------------------------------------------------------------
// Pure helpers (exported for tests)
// ---------------------------------------------------------------------------------------------------------------

/** Split text into sentences (and lines), so a rule and its `unless` are judged together. */
export function sentences(text) {
  return text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function copyFindings(text) {
  const found = [];
  const seen = new Set();
  for (const sentence of sentences(text)) {
    for (const rule of COPY_RULES) {
      const m = sentence.match(rule.pattern);
      if (!m || (rule.unless && rule.unless.test(sentence))) continue;
      const key = `${rule.id}|${sentence}`;
      if (seen.has(key)) continue;
      seen.add(key);
      found.push({ rule: rule.id, phrase: m[0], sentence: sentence.length > 220 ? `${sentence.slice(0, 217)}...` : sentence, why: rule.why });
    }
  }
  return found;
}

/** A page pattern in the allowlist: "*" for every page, a trailing "*" for a prefix, else an exact path. */
export function pageMatches(pattern, pagePath) {
  if (!pattern || pattern === "*") return true;
  if (pattern.endsWith("*")) return pagePath.startsWith(pattern.slice(0, -1));
  return pattern === pagePath;
}

export function allowed(allowlist, violation) {
  const haystack = `${violation.message}\n${violation.detail ?? ""}`.toLowerCase();
  return allowlist.find(
    (entry) => entry.check === violation.check && pageMatches(entry.page, violation.page) && haystack.includes(String(entry.match).toLowerCase()),
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Playwright and axe
// ---------------------------------------------------------------------------------------------------------------

async function loadChromium() {
  const candidates = ["@playwright/test", "playwright", "playwright-core"];
  for (const name of candidates) {
    try {
      const mod = await import(pathToFileURL(require.resolve(name)).href);
      return (mod.chromium ?? mod.default?.chromium);
    } catch {
      /* try the next one */
    }
  }
  // A global install (this repo's sandbox has one): PLAYWRIGHT_MODULE=$(npm root -g)/playwright
  if (process.env.PLAYWRIGHT_MODULE) {
    const mod = await import(pathToFileURL(path.join(process.env.PLAYWRIGHT_MODULE, "index.mjs")).href);
    return mod.chromium ?? mod.default?.chromium;
  }
  throw new Error("Playwright not found: run `npm ci` (it is a devDependency) or set PLAYWRIGHT_MODULE.");
}

async function axeSource() {
  return readFile(require.resolve("axe-core/axe.min.js"), "utf8");
}

// ---------------------------------------------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------------------------------------------

async function waitForServer(base, ms = 60_000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try {
      const res = await fetch(base, { redirect: "manual", headers: FETCH_HEADERS });
      if (res.status < 500) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${base} did not answer within ${ms / 1000}s`);
}

function startServer(port) {
  const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "-p", String(port)], {
    cwd: root,
    stdio: ["ignore", "inherit", "inherit"],
    env: { ...process.env, NODE_ENV: "production" },
  });
  return child;
}

// ---------------------------------------------------------------------------------------------------------------
// In-page checks (run in the browser)
// ---------------------------------------------------------------------------------------------------------------

/* Serialised and run in the page (browser globals). */
function inPageChecks({ limits, variant, primary }) {
  const vw = document.documentElement.clientWidth;
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    const s = getComputedStyle(el);
    return s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) !== 0;
  };
  const describe = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += `#${el.id}`;
    const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).slice(0, 4).join(".") : "";
    if (cls) s += `.${cls}`;
    const text = (el.innerText || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return text ? `${s} "${text}"` : s;
  };
  const out = { variant: variant.id };

  // Horizontal overflow, with the elements that stick out (ignoring those inside a scrolling or clipping box).
  const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  out.overflow = null;
  if (scrollWidth > vw + 1) {
    const clipped = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox !== "visible") return true;
      }
      return false;
    };
    const offenders = [];
    for (const el of document.body.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 && r.width > 0 && !clipped(el)) {
        // Report only the outermost offender of each branch.
        if (!offenders.some((o) => o.contains(el))) offenders.push(el);
      }
      if (offenders.length >= 8) break;
    }
    for (const el of offenders) el.style.outline = "3px solid #e00";
    out.overflow = { scrollWidth, viewport: vw, offenders: offenders.map((el) => `${describe(el)} (right edge ${Math.round(el.getBoundingClientRect().right)}px)`) };
  }

  // Every link on the page (internal ones are checked once per run, after all pages).
  out.links = [...document.querySelectorAll("a[href]")].map((a) => a.href);

  // Shared layout: header and footer, footer columns, nav label length.
  // The site chrome is the <header> and <footer> directly under <body>; articles have their own inside <main>.
  const header = document.querySelector("body > header");
  const footer = document.querySelector("body > footer");
  out.layout = { header: Boolean(header), footer: Boolean(footer), columns: [], longLabels: [] };
  if (footer) {
    out.layout.columns = [...footer.querySelectorAll("nav")].map((nav) => ({
      title: nav.getAttribute("aria-label") || describe(nav),
      links: nav.querySelectorAll("li a").length || nav.querySelectorAll("a").length,
    }));
  }
  for (const a of document.querySelectorAll("body > header a, body > footer a")) {
    if (!visible(a)) continue;
    const label = (a.innerText || "").trim().replace(/\s+/g, " ");
    if (label.length > limits.navLabelMax && !label.includes("@")) out.layout.longLabels.push(label);
  }

  // Tap targets on a phone: header, footer and the calls to action in <main>.
  out.tapTargets = [];
  if (variant.mobile) {
    const selector = [
      "body > header a",
      "body > header button",
      "body > footer a",
      "body > footer button",
      // Calls to action: the UI kit's pill buttons and links, form submits, and anything marked data-cta.
      "main a.rounded-full",
      "main button.rounded-full",
      'main button[type="submit"]',
      "main [data-cta]",
    ].join(",");
    const fixedLayer = (node) => {
      for (let p = node; p && p !== document.body; p = p.parentElement) if (getComputedStyle(p).position === "fixed") return true;
      return false;
    };
    // The box can be smaller than what a thumb can hit: a ::before that extends the hit area counts. So a box
    // under 44px is probed 22px out from its centre; it passes if each probe still lands on the element.
    const hitArea = (el) => {
      const half = limits.tapTarget / 2 - 0.5;
      el.scrollIntoView({ block: "center", inline: "nearest" });
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const probes = [];
      if (r.height < limits.tapTarget - 0.5) probes.push([cx, cy - half], [cx, cy + half]);
      if (r.width < limits.tapTarget - 0.5) probes.push([cx - half, cy], [cx + half, cy]);
      return probes.every(([x, y]) => {
        const hit = document.elementFromPoint(x, y);
        if (!hit) return false;
        if (el === hit || el.contains(hit)) return true;
        // Covered by a floating layer (install prompt, survey): that is not this element's size problem.
        return fixedLayer(hit) && !fixedLayer(el);
      });
    };
    for (const el of document.querySelectorAll(selector)) {
      if (!visible(el) || el.closest("[aria-hidden='true'], .sr-only")) continue;
      const r = el.getBoundingClientRect();
      if (r.height < limits.tapTarget - 0.5 || r.width < limits.tapTarget - 0.5) {
        if (hitArea(el)) continue;
        const where = el.closest("body > header") ? "header" : el.closest("body > footer") ? "footer" : "main";
        out.tapTargets.push({ where, target: describe(el), size: `${Math.round(r.width)}x${Math.round(r.height)}` });
      }
    }
    window.scrollTo(0, 0);
  }

  if (primary) {
    out.title = document.title;
    out.description = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? null;
    out.h1 = [...document.querySelectorAll("h1")].map((h) => (h.innerText || h.textContent || "").trim().slice(0, 80));
    out.imagesWithoutAlt = [...document.querySelectorAll("img:not([alt])")].map((img) => img.currentSrc || img.src || describe(img));
    // Visible copy only (not scripts or JSON-LD), as readers see it.
    out.text = document.body.innerText;
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------------------------------------------

async function pool(items, size, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
  return results;
}

function slug(s) {
  return s.replace(/^\/+/, "").replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home";
}

/** Resolve tests/site/pages.json into a flat list of { path, status, label }. */
async function resolvePages(browser, base, config) {
  const pages = [];
  const add = (entry) => {
    if (!pages.some((p) => p.path === entry.path)) pages.push(entry);
  };
  const linksOn = async (pagePath) => {
    const context = await browser.newContext({ extraHTTPHeaders: INTERNAL_HEADERS });
    const page = await context.newPage();
    try {
      await page.goto(base + pagePath, { waitUntil: "domcontentloaded", timeout: 60_000 });
      const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.href));
      const origin = new URL(base).origin;
      const seen = [];
      for (const href of hrefs) {
        const url = new URL(href);
        if (url.origin !== origin) continue;
        if (!seen.includes(url.pathname)) seen.push(url.pathname);
      }
      return seen;
    } finally {
      await context.close();
    }
  };
  const discover = async (entry, from, parent = null) => {
    const re = new RegExp(entry.match.replace("{parent}", parent ?? ""));
    const found = (await linksOn(from)).filter((p) => re.test(p)).slice(0, entry.take ?? 1);
    if (found.length === 0) throw new Error(`pages.json: nothing on ${from} matches ${re} (${entry.label ?? "discover"})`);
    for (const p of found) {
      if (entry.visit !== false) add({ path: p, status: 200, label: entry.label ?? `from ${from}` });
      if (entry.each) await discover(entry.each, p, p);
    }
  };
  for (const entry of config.pages) {
    if (typeof entry === "string") add({ path: entry, status: 200, label: null });
    else if (entry.path) add({ path: entry.path, status: entry.status ?? 200, label: entry.label ?? null });
    else if (entry.discover) await discover(entry, entry.discover);
  }
  return pages;
}

async function checkPage(browser, { base, axe, target, variant, primary, screenshotDir }) {
  const context = await browser.newContext({
    viewport: { width: variant.width, height: variant.height },
    colorScheme: variant.colorScheme,
    reducedMotion: "reduce",
    isMobile: Boolean(variant.mobile),
    hasTouch: Boolean(variant.mobile),
    deviceScaleFactor: 1,
    extraHTTPHeaders: INTERNAL_HEADERS,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    // A page that is meant to answer 404 logs its own 404; that is the expected answer, not an error.
    const from = msg.location()?.url ?? "";
    if (target.status !== 200 && from === base + target.path && /status of \d+/.test(msg.text())) return;
    consoleErrors.push(`${msg.text().slice(0, 300)}${from && from !== base + target.path ? ` (${from.replace(base, "")})` : ""}`);
  });
  page.on("pageerror", (err) => consoleErrors.push(`Uncaught: ${String(err.message || err).slice(0, 300)}`));

  const found = [];
  const push = (check, message, detail) => found.push({ check, page: target.path, variant: variant.id, message, detail });
  try {
    const res = await page.goto(base + target.path, { waitUntil: "load", timeout: 60_000 });
    const status = res?.status() ?? 0;
    if (status !== target.status) push("status", `HTTP ${status}, expected ${target.status}`);
    await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
    // Let client components settle (theme, hydration-time layout).
    await page.waitForTimeout(300);

    const result = await page.evaluate(inPageChecks, { limits: LIMITS, variant, primary });

    if (result.overflow) {
      push("overflow", `Page is ${result.overflow.scrollWidth}px wide in a ${result.overflow.viewport}px viewport`, result.overflow.offenders.join("\n"));
    }
    for (const t of result.tapTargets) push("tap-target", `${t.where}: ${t.target} is ${t.size}`, null);

    const { layout } = result;
    if (!layout.header) push("layout", "No <header>");
    if (!layout.footer) push("layout", "No <footer>");
    if (layout.columns.length) {
      for (const c of layout.columns) {
        if (c.links < LIMITS.footerColumnMin || c.links > LIMITS.footerColumnMax) {
          push("layout", `Footer column "${c.title}" has ${c.links} links (allowed ${LIMITS.footerColumnMin}-${LIMITS.footerColumnMax})`);
        }
      }
      const counts = layout.columns.map((c) => c.links).filter((n) => n > 0);
      const min = Math.min(...counts);
      const max = Math.max(...counts);
      if (max > LIMITS.footerColumnRatio * min) {
        const summary = layout.columns.map((c) => `${c.title}: ${c.links}`).join(", ");
        push("layout", `Footer columns unbalanced: longest ${max} is more than ${LIMITS.footerColumnRatio}x the shortest ${min}`, summary);
      }
    }
    for (const label of new Set(layout.longLabels)) push("layout", `Header/footer link label longer than ${LIMITS.navLabelMax} characters: "${label}"`);

    if (consoleErrors.length) for (const e of new Set(consoleErrors)) push("console", e);

    // axe-core, WCAG 2.x A and AA.
    await page.addScriptTag({ content: axe });
    const violations = await page.evaluate(async () => {
      const r = await window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"] },
        resultTypes: ["violations"],
      });
      return r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.slice(0, 6).map((n) => `${n.target.join(" ")}${n.failureSummary ? ` -- ${n.failureSummary.split("\n").slice(1, 2).join(" ").trim()}` : ""}`),
        count: v.nodes.length,
      }));
    });
    for (const v of violations) push("axe", `${v.id} (${v.impact}): ${v.help} [${v.count} node${v.count === 1 ? "" : "s"}]`, v.nodes.join("\n"));

    let pageData = null;
    if (primary) {
      const { title, description, h1, imagesWithoutAlt, text } = result;
      if (!title) push("meta", "Missing <title>");
      else if (title.length > LIMITS.titleMax) push("meta", `Title is ${title.length} characters (max ${LIMITS.titleMax}): "${title}"`);
      if (!description) push("meta", "Missing meta description");
      else if (description.length > LIMITS.descriptionMax) push("meta", `Description is ${description.length} characters (max ${LIMITS.descriptionMax}): "${description}"`);
      if (h1.length > 1) push("h1", `${h1.length} <h1> elements`, h1.join("\n"));
      if (h1.length === 0 && target.status === 200) push("h1", "No <h1>");
      for (const src of imagesWithoutAlt) push("img-alt", `Image without alt: ${src}`);
      for (const f of copyFindings([title, description, text].filter(Boolean).join("\n"))) {
        push("copy", `"${f.phrase}" (${f.rule}): ${f.why}`, f.sentence);
      }
      pageData = { title, description };
    }

    if (found.length && screenshotDir) {
      const file = `${slug(target.path)}__${variant.id}.jpg`;
      await page.screenshot({ path: path.join(screenshotDir, file), fullPage: true, type: "jpeg", quality: 55, timeout: 30_000 }).catch(() => {});
      for (const f of found) f.screenshot = `screenshots/${file}`;
    }
    return { found, links: result.links, pageData };
  } catch (err) {
    push("error", `Could not check page: ${String(err.message || err).split("\n")[0]}`);
    return { found, links: [], pageData: null };
  } finally {
    await context.close();
  }
}

/**
 * Ask the server for one internal URL. Redirects are followed while they stay on this site; a redirect off-site
 * (an outbound fund or partner link) counts as working, because the site's job ends at sending the reader there.
 */
async function internalStatus(url, origin) {
  let current = url;
  for (let hop = 0; hop < 6; hop++) {
    let res = await fetch(current, { method: "HEAD", redirect: "manual", headers: FETCH_HEADERS });
    if (res.status === 405 || res.status >= 400) res = await fetch(current, { method: "GET", redirect: "manual", headers: FETCH_HEADERS });
    await res.body?.cancel?.();
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return res.status;
      const nextUrl = new URL(location, current);
      if (nextUrl.origin !== origin) return res.status;
      current = nextUrl.href;
      continue;
    }
    return res.status;
  }
  return "redirect loop";
}

async function checkLinks(base, linkPages, skip, skipPattern, concurrency = 8) {
  const origin = new URL(base).origin;
  const broken = [];
  const urls = [...linkPages.keys()].filter((u) => !skip.has(u) && !(skipPattern && skipPattern.test(new URL(u).pathname)));
  await pool(urls, concurrency, async (url) => {
    let status;
    try {
      status = await internalStatus(url, origin);
    } catch (err) {
      status = `error: ${err.message}`;
    }
    if (typeof status !== "number" || status >= 400) broken.push({ url, status, pages: [...linkPages.get(url)] });
  });
  return broken.map((b) => ({
    check: "link",
    page: b.pages[0],
    variant: "all",
    message: `${new URL(b.url).pathname}${new URL(b.url).search} answers ${b.status}`,
    detail: `Linked from: ${b.pages.slice(0, 10).join(", ")}${b.pages.length > 10 ? ` and ${b.pages.length - 10} more` : ""}`,
  }));
}

/** Group per-variant findings into one row per (check, page, message), listing the variants it failed in. */
function group(findings) {
  const map = new Map();
  for (const f of findings) {
    const key = `${f.check}|${f.page}|${f.message}`;
    const row = map.get(key) ?? { ...f, variants: [], screenshots: [] };
    if (!row.variants.includes(f.variant)) row.variants.push(f.variant);
    if (f.screenshot && !row.screenshots.includes(f.screenshot)) row.screenshots.push(f.screenshot);
    delete row.variant;
    delete row.screenshot;
    map.set(key, row);
  }
  return [...map.values()];
}

const CHECK_NAMES = {
  status: "HTTP status",
  error: "Page could not be checked",
  overflow: "Horizontal overflow",
  console: "Console errors",
  link: "Broken internal links",
  axe: "Accessibility (axe-core WCAG A/AA)",
  "img-alt": "Images without alt",
  meta: "Title and meta description",
  h1: "Headings (<h1>)",
  "tap-target": "Tap targets under 44px (390px)",
  layout: "Shared layout",
  copy: "Copy: overclaims",
  speed: "Speed budget (390px, slow 4G)",
};

function markdown({ base, pages, failures, allowedRows, staleAllowlist, seconds, linkCount }) {
  const lines = [];
  lines.push(`# Site QA report`, "");
  lines.push(`- Server: ${base}`);
  lines.push(`- Pages: ${pages.length}, each at ${VARIANTS.map((v) => v.id).join(", ")}`);
  lines.push(`- Internal links checked: ${linkCount}`);
  lines.push(`- Runtime: ${seconds.toFixed(0)}s`);
  lines.push(`- Result: ${failures.length ? `**FAIL**, ${failures.length} problem${failures.length === 1 ? "" : "s"}` : "**PASS**"}`);
  lines.push(`- Allowlisted: ${allowedRows.length}`, "");

  const byCheck = {};
  for (const f of failures) (byCheck[f.check] ??= []).push(f);
  if (failures.length) {
    lines.push("## Summary", "", "| Check | Problems |", "| --- | ---: |");
    for (const [check, rows] of Object.entries(byCheck)) lines.push(`| ${CHECK_NAMES[check] ?? check} | ${rows.length} |`);
    lines.push("");
    for (const [check, rows] of Object.entries(byCheck)) {
      lines.push(`## ${CHECK_NAMES[check] ?? check}`, "");
      for (const r of rows) {
        lines.push(`- **${r.page}** (${r.variants.join(", ")}): ${r.message}`);
        if (r.detail) for (const d of String(r.detail).split("\n")) lines.push(`  - ${d}`);
        if (r.screenshots.length) lines.push(`  - Screenshot: ${r.screenshots.join(", ")}`);
      }
      lines.push("");
    }
  }
  if (allowedRows.length) {
    lines.push("## Allowlisted (not failing)", "");
    for (const r of allowedRows) lines.push(`- ${r.check} on ${r.page}: ${r.message} -- ${r.reason}`);
    lines.push("");
  }
  if (staleAllowlist.length) {
    lines.push("## Allowlist entries that matched nothing (consider removing)", "");
    for (const e of staleAllowlist) lines.push(`- ${e.check} / ${e.page} / "${e.match}"`);
    lines.push("");
  }
  lines.push("## Pages", "");
  for (const p of pages) lines.push(`- ${p.path}${p.label ? ` (${p.label})` : ""}${p.status !== 200 ? ` [expects ${p.status}]` : ""}`);
  lines.push("");
  return lines.join("\n");
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const started = Date.now();
  const config = JSON.parse(await readFile(path.resolve(root, opts.pages), "utf8"));
  const allowlist = JSON.parse(await readFile(path.join(root, "tests/site/allowlist.json"), "utf8")).entries ?? [];

  let server = null;
  if (opts.serve) server = startServer(opts.port);
  const stop = () => server?.kill("SIGTERM");
  process.on("exit", stop);

  try {
    await waitForServer(opts.base);
    await rm(opts.out, { recursive: true, force: true });
    const screenshotDir = path.join(opts.out, "screenshots");
    await mkdir(screenshotDir, { recursive: true });

    const chromium = await loadChromium();
    const browser = await chromium.launch();
    const axe = await axeSource();

    let pages = await resolvePages(browser, opts.base, config);
    if (opts.only) pages = pages.filter((p) => opts.only.includes(p.path));
    console.log(`site-qa: ${pages.length} pages x ${VARIANTS.length} variants against ${opts.base}`);

    const jobs = pages.flatMap((target) => VARIANTS.map((variant, i) => ({ target, variant, primary: i === 0 })));
    let done = 0;
    const results = await pool(jobs, opts.concurrency, async (job) => {
      const r = await checkPage(browser, { base: opts.base, axe, screenshotDir, ...job });
      done++;
      const mark = r.found.length ? `${r.found.length} problem(s)` : "ok";
      console.log(`[${String(done).padStart(3)}/${jobs.length}] ${job.target.path} ${job.variant.id}: ${mark}`);
      return { ...job, ...r };
    });
    const speedFindings = [];
    for (const target of pages.filter((p) => p.status === 200 && SPEED_PAGES.includes(p.path))) speedFindings.push(...(await checkSpeed(browser, opts.base, target)));
    await browser.close();

    // Internal links, de-duplicated across every page and variant.
    const origin = new URL(opts.base).origin;
    const linkPages = new Map();
    for (const r of results) {
      for (const href of r.links) {
        let url;
        try {
          url = new URL(href);
        } catch {
          continue;
        }
        if (url.origin !== origin) continue;
        url.hash = "";
        const key = url.href;
        if (!linkPages.has(key)) linkPages.set(key, new Set());
        linkPages.get(key).add(r.target.path);
      }
    }
    // Pages that are meant to fail (the 404 page) are not broken links when they link to themselves.
    const expectedErrors = new Set(pages.filter((p) => p.status >= 400).map((p) => new URL(p.path, opts.base).href));
    const linkFindings = await checkLinks(opts.base, linkPages, expectedErrors, opts.skipLinks);

    const rows = group([...results.flatMap((r) => r.found), ...linkFindings, ...speedFindings]);
    const failures = [];
    const allowedRows = [];
    const used = new Set();
    for (const row of rows) {
      const entry = allowed(allowlist, row);
      if (entry) {
        used.add(entry);
        allowedRows.push({ ...row, reason: entry.reason });
      } else failures.push(row);
    }
    const staleAllowlist = opts.only ? [] : allowlist.filter((e) => !used.has(e));
    const seconds = (Date.now() - started) / 1000;

    const counts = {};
    for (const f of failures) counts[f.check] = (counts[f.check] ?? 0) + 1;
    const report = {
      base: opts.base,
      finishedAt: new Date().toISOString(),
      seconds: Math.round(seconds),
      variants: VARIANTS.map((v) => v.id),
      limits: LIMITS,
      pages,
      linksChecked: linkPages.size,
      pass: failures.length === 0,
      counts,
      failures,
      allowlisted: allowedRows,
      staleAllowlist,
      pageMeta: Object.fromEntries(results.filter((r) => r.pageData).map((r) => [r.target.path, r.pageData])),
    };
    await writeFile(path.join(opts.out, "report.json"), JSON.stringify(report, null, 2));
    const md = markdown({ base: opts.base, pages, failures, allowedRows, staleAllowlist, seconds, linkCount: linkPages.size });
    await writeFile(path.join(opts.out, "report.md"), md);
    if (process.env.GITHUB_STEP_SUMMARY) await writeFile(process.env.GITHUB_STEP_SUMMARY, md, { flag: "a" });

    console.log("");
    console.log(failures.length ? `site-qa: FAIL, ${failures.length} problem(s): ${JSON.stringify(counts)}` : "site-qa: PASS");
    console.log(`Report: ${path.relative(root, path.join(opts.out, "report.md"))} (${seconds.toFixed(0)}s)`);
    process.exitCode = failures.length ? 1 : 0;
  } finally {
    stop();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(2);
  });
}
