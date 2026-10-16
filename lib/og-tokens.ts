import fs from "node:fs";
import path from "node:path";

/**
 * The share cards' colours: the signature look's design tokens (Laterite, chosen 16 Oct 2026; reference on branch
 * rebuild/signature-look-preview, look "b"). Only this module knows colours; lib/og-signature.tsx draws with what it
 * returns.
 *
 * When app/globals.css carries the look's tokens (--sig, --sig-ink, --stamp-paper, --ink, --paper …, as the final look
 * on rebuild/signature-look will), they are read from the block that defines --sig, so a change of look reaches every
 * card without touching card code. Until then (main today has no --sig), the whole Laterite set below is used, never
 * a mix of old and new tokens.
 */

const LATERITE = {
  sig: "#b3401f", // the terracotta field
  "sig-ink": "#a33a1c", // terracotta text on light
  "stamp-paper": "#fbefe6", // the badge disc
  mast: "#8f3016", // masthead dark, for the slip's shadow edge
  ink: "#1d1512",
  "ink-soft": "#45372f",
  muted: "#6c5e55",
  paper: "#f7f3ef",
  rule: "#e0d6cd",
};
type Token = keyof typeof LATERITE;

/** The receipt slip: a little lighter than the page paper, as in the reference card. */
const SLIP = "#fbf6f2";
/** Text on the terracotta field. */
const ON_FIELD = "#ffffff";
const ON_FIELD_SOFT = "#fbe3d6";

let cached: (Record<Token, string> & { slip: string; onField: string; onFieldSoft: string }) | null = null;

export function ogTokens() {
  if (cached) return cached;
  let css = "";
  try {
    css = fs.readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");
  } catch {
    css = "";
  }
  const out: Record<Token, string> = { ...LATERITE };
  // The first block that defines the look's signature colour, in light mode.
  const block = /([^{}]*)\{[^{}]*--sig:\s*#[0-9a-fA-F]{3,8}[^{}]*\}/.exec(css);
  if (block && !/\.dark/.test(block[1])) {
    for (const name of Object.keys(LATERITE) as Token[]) {
      const m = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})\\s*;`).exec(block[0]);
      if (m) out[name] = m[1];
    }
  }
  cached = { ...out, slip: SLIP, onField: ON_FIELD, onFieldSoft: ON_FIELD_SOFT };
  return cached;
}

/** Desk colours (app/globals.css, light): a small mark before the desk's name on its cards; the signature otherwise. */
const DESK = {
  markets: "#1f5fae",
  banking: "#0a6d73",
  companies: "#8a3a80",
  "public-money": "#8c5400",
  "cost-of-living": "#b0365a",
  africa: "#3f6a1e",
};

export function accentFor(desk: string | null | undefined): string {
  let css = "";
  try {
    css = fs.readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");
  } catch {
    css = "";
  }
  if (desk && desk in DESK) {
    const m = new RegExp(`--desk-${desk}:\\s*(#[0-9a-fA-F]{3,8})\\s*;`).exec(css);
    return m ? m[1] : DESK[desk as keyof typeof DESK];
  }
  return ogTokens()["sig-ink"];
}
