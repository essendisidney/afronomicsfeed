import ExcelJS from "exceljs";
import { site } from "@/lib/site";

/**
 * Premium data files (docs/rebuild/phase-7e-r3-plan.md, PR 1, item 3). Every dataset downloads as CSV and as an Excel
 * workbook built from the same rows: a Cover sheet (title, source, as-of date, licence, citation), the Data sheet
 * (frozen header, number formats, widths) and a Notes sheet (one line per column). File names follow one rule:
 * afronomics_<dataset>_<as-of>.csv or .xlsx.
 *
 * The workbook is made from the dataset's own CSV text, so the two can never disagree: its "#" lines become the cover's
 * notes and its rows the Data sheet. Every column needs a note in COLUMN_NOTES (tests/site/test_documents.py checks).
 */

export type DataFile = { dataset: string; title: string; asOf: string; href: string };

export const fileName = (f: DataFile, ext: "csv" | "xlsx") => `afronomics_${f.dataset}_${f.asOf}.${ext}`;

function citation(f: DataFile) {
  return `Afronomics (${f.asOf.slice(0, 4)}). ${f.title}. Data as of ${f.asOf}. ${site.url.replace(/^https?:\/\//, "")}${f.href}`;
}

/** Lines added on top of a CSV: as-of date and how to cite (the dataset's own title and source lines follow). */
export function csvTopLines(f: DataFile) {
  return [`# ${f.title}. Data as of ${f.asOf}.`, `# Cite as: ${citation(f)}`];
}

/* What each column means. Exact names first, then patterns for columns named after a market's currency or measure. */
const COLUMN_NOTES: Record<string, string> = {
  value_date: "Date the auction settled (value date), YYYY-MM-DD",
  settlement_date: "Date the auction settled, YYYY-MM-DD",
  auction_date: "Date of the auction, YYYY-MM-DD",
  tenor_days: "Term of the bill in days",
  tenor_years: "Term of the bond in years, as issued",
  issue: "Issue number as the central bank names it",
  isin: "International Securities Identification Number",
  maturity: "Date the security matures, YYYY-MM-DD",
  type: "Kind of bond as the central bank describes it",
  kind: "New issue, reopening, tap sale or switch",
  offered_kes_m: "Amount offered, KES millions",
  offered_total_kes_m: "Amount offered, KES millions",
  received_kes_m: "Bids received, KES millions",
  subscription_pct: "Bids received as % of the amount offered",
  accepted_kes_m: "Amount accepted, KES millions",
  competitive_kes_m: "Accepted from competitive bids, KES millions",
  noncompetitive_kes_m: "Accepted from non-competitive bids, KES millions",
  bid_to_cover: "Bids received divided by the amount accepted",
  bid_cover: "Bids received divided by the amount accepted",
  weighted_avg_rate_pct: "Weighted average rate of accepted bids, % a year",
  market_weighted_avg_rate_pct: "Weighted average rate of all bids, % a year",
  price_per_100: "Average price paid per 100 of face value",
  coupon_pct: "Coupon, % a year",
  min_rate_pct: "Lowest accepted rate, % a year",
  max_rate_pct: "Highest accepted rate, % a year",
  source_notice: "Link to the central bank's result notice for this row",
  source: "Link to the document this row was read from",
  as_of: "Date the figure refers to, YYYY-MM-DD",
  rank: "Rank by assets under management",
  scheme: "Collective investment scheme the fund belongs to",
  fund: "Fund name as the Capital Markets Authority lists it",
  currency: "Currency of the fund",
  aum_kes: "Assets under management, KES",
  share_pct: "Share of all money market fund assets, %",
  date: "Date of the published yield, YYYY-MM-DD",
  manager: "Fund manager",
  effective_annual_yield_pct: "Effective annual yield as the manager publishes it, before tax, %",
  daily_yield_pct: "Daily yield as the manager publishes it, %",
  country: "Country",
  iso2: "ISO 3166 two-letter country code",
  region: "World Bank region",
  institution: "Institution as the regulator names it",
  registry_slug: "Afronomics registry identifier (afronomicsfeed.com/registry/<slug>)",
  licence_status: "Licence status in the regulator's latest list",
  county: "County of the head office",
  metric: "What the figure measures",
  year: "Financial year the figure belongs to",
  value: "The figure as the regulator publishes it",
  unit: "Unit of the value",
  page: "Page of the source document",
  note: "Afronomics note on how the figure was read",
};

const PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^rate_pct \((.+)\)$/, (m) => `Rate, % a year: the ${m[1]}`],
  [/^offered_([a-z]{3})_m$/, (m) => `Amount offered, ${m[1].toUpperCase()} millions`],
  [/^received_([a-z]{3})_m$/, (m) => `Bids received, ${m[1].toUpperCase()} millions`],
  [/^bids_([a-z]{3})_m$/, (m) => `Bids received, ${m[1].toUpperCase()} millions`],
  [/^accepted_([a-z]{3})_m$/, (m) => `Amount accepted, ${m[1].toUpperCase()} millions`],
  [/^(19|20)\d\d$/, (m) => `Value for ${m[0]}, as published; blank where not published`],
];

function columnNote(name: string): string | null {
  if (COLUMN_NOTES[name]) return COLUMN_NOTES[name];
  for (const [re, fn] of PATTERNS) {
    const m = name.match(re);
    if (m) return fn(m);
  }
  return null;
}

/** RFC 4180 CSV, with "#" comment lines collected apart. */
export function parseCsv(text: string): { comments: string[]; header: string[]; rows: string[][] } {
  const comments: string[] = [];
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let quoted = false;
  let atLineStart = true;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (atLineStart && c === "#" && !quoted) {
      const end = text.indexOf("\n", i);
      comments.push(text.slice(i + 1, end === -1 ? undefined : end).trim());
      i = end === -1 ? text.length : end;
      continue;
    }
    atLineStart = false;
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      record.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      record.push(field);
      if (record.some((x) => x !== "")) records.push(record);
      record = [];
      field = "";
      atLineStart = true;
    } else field += c;
  }
  if (field !== "" || record.length) {
    record.push(field);
    if (record.some((x) => x !== "")) records.push(record);
  }
  const [header = [], ...rows] = records;
  return { comments, header, rows };
}

const NUMBER = /^-?\d+(\.\d+)?$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const INK = "FF121826";
const ACCENT = "FF5B3FD6";
const MUTED = "FF636B7D";
const RULE = "FFD9DCD7";

/** The workbook: Cover, Data and Notes sheets, made from the dataset's CSV text. */
export async function workbook(csv: string, f: DataFile, licence: string): Promise<Buffer> {
  const { comments, header, rows } = parseCsv(csv);
  const wb = new ExcelJS.Workbook();
  wb.creator = "Afronomics";
  wb.title = f.title;
  wb.subject = `${f.title}, data as of ${f.asOf}`;
  wb.company = "Afronomics";
  wb.created = new Date(`${f.asOf}T00:00:00Z`);

  const cover = wb.addWorksheet("Cover", { properties: { tabColor: { argb: ACCENT } }, views: [{ showGridLines: false }] });
  cover.getColumn(1).width = 4;
  cover.getColumn(2).width = 22;
  cover.getColumn(3).width = 100;
  cover.getCell("B2").value = "AFRONOMICS";
  cover.getCell("B2").font = { name: "Arial", bold: true, size: 11, color: { argb: INK } };
  cover.getCell("B4").value = f.title;
  cover.getCell("B4").font = { name: "Georgia", size: 18, bold: true, color: { argb: INK } };
  const lines: [string, string][] = [
    ["Data as of", f.asOf],
    ["Rows", String(rows.length)],
    ["Source", comments.find((c) => /^Sources?:/i.test(c))?.replace(/^Sources?:\s*/i, "") ?? comments[1] ?? ""],
    ["Licence", licence],
    ["How to cite", citation(f)],
    ["Online", `${site.url}${f.href}`],
    ["Notes", comments.filter((c) => !/^Sources?:/i.test(c)).join("\n")],
    ["", "Information, not advice. Figures are shown as each source published them."],
  ];
  lines.forEach(([k, v], i) => {
    const r = 6 + i;
    cover.getCell(`B${r}`).value = k;
    cover.getCell(`B${r}`).font = { name: "Arial", size: 9, bold: true, color: { argb: MUTED } };
    cover.getCell(`C${r}`).value = v;
    cover.getCell(`C${r}`).font = { name: "Arial", size: 10, color: { argb: INK } };
    cover.getCell(`C${r}`).alignment = { wrapText: true, vertical: "top" };
    cover.getCell(`B${r}`).alignment = { vertical: "top" };
    cover.getRow(r).border = { bottom: { style: "thin", color: { argb: RULE } } };
  });

  const data = wb.addWorksheet("Data", { views: [{ state: "frozen", ySplit: 1 }] });
  data.addRow(header);
  const head = data.getRow(1);
  head.font = { name: "Arial", bold: true, size: 9, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INK } };
  head.alignment = { vertical: "middle", wrapText: true };
  head.height = 30;
  const kinds = header.map((_, c) => {
    const vals = rows.map((r) => r[c] ?? "").filter((v) => v !== "");
    if (vals.length && vals.every((v) => DATE.test(v))) return "date";
    if (vals.length && vals.every((v) => NUMBER.test(v))) return "number";
    return "text";
  });
  for (const r of rows) {
    data.addRow(
      header.map((_, c) => {
        const v = r[c] ?? "";
        if (v === "") return null;
        if (kinds[c] === "number") return Number(v);
        if (kinds[c] === "date") return new Date(`${v}T00:00:00Z`);
        if (/^https?:\/\//.test(v)) return { text: v, hyperlink: v };
        return v;
      }),
    );
  }
  header.forEach((h, c) => {
    const col = data.getColumn(c + 1);
    const decimals = Math.max(0, ...rows.map((r) => ((r[c] ?? "").split(".")[1] ?? "").length).filter(Number.isFinite));
    if (kinds[c] === "date") col.numFmt = "yyyy-mm-dd";
    if (kinds[c] === "number") col.numFmt = decimals ? `#,##0.${"0".repeat(Math.min(decimals, 4))}` : /year|tenor|rank|issue|isin|page/.test(h) ? "0" : "#,##0";
    const longest = Math.max(h.length * 0.9, ...rows.slice(0, 500).map((r) => (r[c] ?? "").length));
    col.width = Math.min(Math.max(10, longest + 2), /source|notice/.test(h) ? 40 : 48);
    col.font = { name: "Arial", size: 9 };
  });
  data.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: Math.max(1, header.length) } };

  const notes = wb.addWorksheet("Notes", { views: [{ showGridLines: false }] });
  notes.columns = [
    { header: "Column", key: "c", width: 34 },
    { header: "What it is", key: "n", width: 90 },
  ];
  notes.getRow(1).font = { name: "Arial", bold: true, size: 9, color: { argb: "FFFFFFFF" } };
  notes.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: INK } };
  for (const h of header) notes.addRow({ c: h, n: columnNote(h) ?? "" });
  notes.eachRow((row, i) => {
    if (i > 1) row.font = { name: "Arial", size: 9 };
  });

  return Buffer.from(await wb.xlsx.writeBuffer());
}
