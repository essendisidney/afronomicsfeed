/**
 * Light and dark by time of day (founder decision, 15 Oct 2026). The reader picks Auto, Light or Dark in the menu;
 * Auto is the default and follows the reader's own clock: light from 06:00, dark from 19:00. The choice is kept in
 * localStorage ("af-theme"); readers who chose Light or Dark before Auto existed keep their choice.
 *
 * The script below runs in <head> before the page paints (components/layout/ThemeScript.tsx), so there is no flash
 * of the wrong theme. In Auto it also switches at 06:00 and 19:00 while the page stays open, and checks again when
 * the tab comes back into view. It sets `dark` on <html> and `data-theme-mode` to the reader's choice.
 */

export type ThemeMode = "auto" | "light" | "dark";

export const THEME_KEY = "af-theme";
export const LIGHT_FROM = 6;
export const DARK_FROM = 19;

export const themeModes: { mode: ThemeMode; label: string }[] = [
  { mode: "auto", label: "Auto" },
  { mode: "light", label: "Light" },
  { mode: "dark", label: "Dark" },
];

export const themeScript = `(function () {
  var KEY = ${JSON.stringify(THEME_KEY)}, LIGHT = ${LIGHT_FROM}, DARK = ${DARK_FROM}, timer;
  function mode() {
    try { var m = localStorage.getItem(KEY); return m === "light" || m === "dark" ? m : "auto"; } catch (e) { return "auto"; }
  }
  function apply() {
    clearTimeout(timer);
    var m = mode(), now = new Date(), h = now.getHours();
    var dark = m === "dark" || (m === "auto" && (h >= DARK || h < LIGHT));
    var root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.setAttribute("data-theme-mode", m);
    if (m === "auto") {
      var next = new Date(now);
      next.setHours(h >= LIGHT && h < DARK ? DARK : LIGHT, 0, 5, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      timer = setTimeout(apply, next - now);
    }
  }
  window.__afTheme = function (m) {
    try { if (m === "auto") localStorage.removeItem(KEY); else localStorage.setItem(KEY, m); } catch (e) {}
    apply();
  };
  apply();
  document.addEventListener("visibilitychange", function () { if (!document.hidden) apply(); });
})();`;

/** Set the reader's choice from the menu (the head script defines window.__afTheme). */
export function setThemeMode(mode: ThemeMode) {
  (window as unknown as { __afTheme?: (m: ThemeMode) => void }).__afTheme?.(mode);
}

export function readThemeMode(): ThemeMode {
  const m = document.documentElement.getAttribute("data-theme-mode");
  return m === "light" || m === "dark" ? m : "auto";
}
