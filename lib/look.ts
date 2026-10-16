/**
 * Signature-look preview (branch rebuild/signature-look-preview, not for merge as is). Three identity skins over the same tokens, picked by
 * `data-look` on <html>: "a" Kente Gold, "b" Laterite, "c" Malachite. With no look set the site renders exactly as on
 * main. Preview only: `?look=a|b|c` picks one and remembers it in this browser, `?look=off` clears it, and
 * NEXT_PUBLIC_SIGNATURE_LOOK sets a default for a whole preview deployment.
 *
 * The script runs in <head> before the page paints (components/layout/ThemeScript.tsx), so a look never flashes in
 * after the first paint and nothing moves (no layout shift).
 */

const looks = ["a", "b", "c"] as const;
export type Look = (typeof looks)[number];

const LOOK_KEY = "af-look";

export function isLook(v: unknown): v is Look {
  return typeof v === "string" && (looks as readonly string[]).includes(v);
}

const defaultLook: Look | null = isLook(process.env.NEXT_PUBLIC_SIGNATURE_LOOK) ? process.env.NEXT_PUBLIC_SIGNATURE_LOOK : null;

export const lookScript = `(function () {
  var KEY = ${JSON.stringify(LOOK_KEY)}, ok = { a: 1, b: 1, c: 1 }, look = ${JSON.stringify(defaultLook)};
  try {
    var q = new URLSearchParams(location.search).get("look");
    if (q === "off") localStorage.removeItem(KEY);
    else if (q && ok[q]) localStorage.setItem(KEY, q);
    var saved = localStorage.getItem(KEY);
    if (q === "off") look = null;
    else if (saved && ok[saved]) look = saved;
  } catch (e) {}
  if (look) document.documentElement.setAttribute("data-look", look);
})();`;

/** The palette of each look, for the share card (lib/og-look.tsx) and the preview notes. Contrast ratios are WCAG 2.x. */
export const lookPalettes: Record<Look, { name: string; sig: string; sigInk: string; sigDark: string; mast: string; ink: string; paper: string; on: string }> = {
  a: { name: "Kente Gold", sig: "#E3A72F", sigInk: "#8A5700", sigDark: "#F0BD55", mast: "#15120D", ink: "#15120D", paper: "#F6F4EF", on: "#15120D" },
  b: { name: "Laterite", sig: "#B3401F", sigInk: "#A33A1C", sigDark: "#F2916D", mast: "#B3401F", ink: "#1D1512", paper: "#F7F3EF", on: "#FFFFFF" },
  c: { name: "Malachite", sig: "#0B7A57", sigInk: "#0A6E4F", sigDark: "#5FD6A8", mast: "#063A2C", ink: "#0F1A16", paper: "#F3F6F4", on: "#FFFFFF" },
};
