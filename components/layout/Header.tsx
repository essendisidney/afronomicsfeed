"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { SearchDialog } from "@/components/search/SearchDialog";
import { institutionalPilot } from "@/lib/billing/ratecard";
import { institutionsNav, nav, sectionFor, utilityNav } from "@/lib/site";
import { readThemeMode, setThemeMode, themeModes, type ThemeMode } from "@/lib/theme";
import type { SearchHit } from "@/lib/search-core";

/**
 * The header (docs/rebuild/phase-7-plan.md, 7a; RECEIPTS.md "One site, one journey"): one slim bar with the five
 * sections, search and a quiet For institutions link; everything else (theme, Kiswahili, the Morning, alerts) is in
 * the menu. On phones a bottom bar keeps Today, Receipts, Numbers, Search and the menu under the thumb.
 */

function subscribeTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme-mode"] });
  return () => observer.disconnect();
}

function themeSnapshot(): ThemeMode {
  return readThemeMode();
}

const institutionLinks = [
  { href: "/for-institutions", label: "Overview" },
  { href: "/pricing", label: "Pricing" },
  { href: "/data-api", label: "Data API" },
  { href: "/watch/sample", label: "Watch pack sample" },
] as const;

const readerLinks = [...utilityNav, { href: "/stories", label: "Stories" }, { href: "/subscribe", label: "Newsletter" }, { href: "/pricing#readers", label: "Reader plans" }];

function SearchIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="8.5" cy="8.5" r="5.75" />
      <path d="m13 13 4.25 4.25" strokeLinecap="round" />
    </svg>
  );
}

const tabIcons: Record<string, React.ReactNode> = {
  "/": <path d="M3 9.5 10 4l7 5.5V16a1 1 0 0 1-1 1h-3.5v-4.5h-5V17H4a1 1 0 0 1-1-1z" />,
  "/receipts": <path d="M5 3h10v14l-2-1.3-1.5 1.3-1.5-1.3L8.5 17 7 15.7 5 17zM8 7h4M8 10h4" />,
  "/numbers": <path d="M4 16V9M8 16V5M12 16v-5M16 16V7" />,
};

export function Header({ searchIndex }: { searchIndex: SearchHit[] }) {
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const themeMode = useSyncExternalStore(subscribeTheme, themeSnapshot, (): ThemeMode => "auto");
  const open = menuPath === pathname;
  const activeHref = sectionFor(pathname);
  const toggleMenu = () => setMenuPath((current) => (current === pathname ? null : pathname));

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="no-print on-night sticky top-0 z-40 bg-night text-night-ink" aria-label="Site">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Wordmark compact night logoClassName="h-7 w-auto" />
          <nav aria-label="Sections" className="ml-4 hidden h-full items-stretch lg:flex">
            {nav.map((item) => {
              const active = item.href === activeHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center px-3 text-[14px] font-medium ${
                    active
                      ? "text-night-ink after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent"
                      : "text-night-muted hover:text-night-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden h-9 items-center gap-2 rounded-full border border-night-line bg-night-2 pl-3 pr-2 text-[13px] text-night-muted hover:text-night-soft md:flex"
            >
              <SearchIcon className="h-4 w-4" />
              <span>Search</span>
              <kbd className="rounded border border-night-line px-1 font-sans text-[10.5px]">Ctrl K</kbd>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-night-soft hover:bg-night-2 hover:text-night-ink md:hidden"
              aria-label="Search"
            >
              <SearchIcon />
            </button>
            <Link
              href={institutionsNav.href}
              aria-current={activeHref === institutionsNav.href ? "page" : undefined}
              className="hidden min-h-9 items-center whitespace-nowrap rounded-full px-3 text-[13px] font-medium text-night-soft hover:bg-night-2 hover:text-night-ink aria-[current=page]:text-night-ink lg:inline-flex"
            >
              {institutionsNav.label}
            </Link>
            <button
              type="button"
              className="inline-flex min-h-11 items-center rounded-full px-3 text-[13px] font-medium text-night-soft hover:bg-night-2 hover:text-night-ink sm:min-h-9"
              onClick={toggleMenu}
              aria-expanded={open}
              aria-controls="site-menu"
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {open ? (
          <div id="site-menu" className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-night-line bg-night">
            <div className="mx-auto grid max-w-7xl gap-5 px-4 pb-24 pt-4 sm:px-6 lg:grid-cols-3 lg:pb-6">
              <nav aria-label="Sections">
                <p className="px-3 text-[12px] font-semibold text-night-muted">Sections</p>
                <ul className="mt-1 grid grid-cols-2 gap-1">
                  {nav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={item.href === activeHref ? "page" : undefined}
                        className="flex min-h-11 items-center rounded-xl px-3 text-[15px] font-medium text-night-ink hover:bg-night-2 aria-[current=page]:bg-night-2"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav aria-label="Reader tools">
                <p className="px-3 text-[12px] font-semibold text-night-muted">For readers</p>
                <ul className="mt-1 grid grid-cols-2 gap-1">
                  {readerLinks.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="flex min-h-11 items-center rounded-xl px-3 text-[15px] font-medium text-night-soft hover:bg-night-2 hover:text-night-ink">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                {/* Auto follows the reader's clock: light from 06:00, dark from 19:00 (lib/theme.ts). */}
                <div className="mt-3 px-3">
                  <p id="theme-label" className="text-[12px] font-semibold text-night-muted">
                    Theme
                  </p>
                  <div role="group" aria-labelledby="theme-label" className="mt-1 grid grid-cols-3 gap-1 rounded-xl bg-night-2 p-1">
                    {themeModes.map(({ mode, label }) => (
                      <button
                        key={mode}
                        type="button"
                        aria-pressed={themeMode === mode}
                        onClick={() => setThemeMode(mode)}
                        className="min-h-11 rounded-lg text-[14px] font-medium text-night-soft hover:text-night-ink aria-pressed:bg-night aria-pressed:text-night-ink"
                        suppressHydrationWarning
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-[12px] text-night-muted">Auto: light from 06:00, dark from 19:00, by your clock.</p>
                </div>
              </nav>
              <nav aria-label="For institutions" className="rounded-2xl border border-night-line bg-night-2 p-4">
                <p className="text-[12px] font-semibold text-accent">For boards, banks, SACCOs and funds</p>
                <ul className="mt-2 grid grid-cols-2 gap-1">
                  {institutionLinks.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="flex min-h-11 items-center rounded-xl px-3 text-[15px] font-medium text-night-ink hover:bg-night">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={institutionalPilot.href}
                  data-track="pricing_cta_click"
                  className="mt-3 flex min-h-11 items-center justify-center rounded-full bg-accent px-4 text-[14px] font-semibold text-night hover:bg-gold-soft"
                >
                  Start a free {institutionalPilot.days}-day pilot
                </Link>
              </nav>
            </div>
          </div>
        ) : null}
      </header>

      <nav aria-label="Quick" className="no-print on-night fixed inset-x-0 bottom-0 z-40 border-t border-night-line bg-night pb-[env(safe-area-inset-bottom)] text-night-ink lg:hidden">
        <ul className="grid grid-cols-5">
          {nav.slice(0, 3).map((item) => {
            const active = item.href === activeHref;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${active ? "text-night-ink" : "text-night-muted"}`}
                >
                  <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-5 w-5 ${active ? "text-accent" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
                    {tabIcons[item.href]}
                  </svg>
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button type="button" onClick={() => setSearchOpen(true)} className="flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-night-muted">
              <SearchIcon className="h-5 w-5" />
              Search
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                toggleMenu();
                window.scrollTo({ top: 0 });
              }}
              aria-expanded={open}
              aria-controls="site-menu"
              className="flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-night-muted aria-expanded:text-night-ink"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M4 6h12M4 10h12M4 14h12" />
              </svg>
              More
            </button>
          </li>
        </ul>
      </nav>

      <SearchDialog index={searchIndex} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
