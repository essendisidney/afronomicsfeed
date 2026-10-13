"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { SearchDialog } from "@/components/search/SearchDialog";
import { institutionalPilot } from "@/lib/billing/ratecard";
import { nav, utilityNav } from "@/lib/site";
import type { SearchHit } from "@/lib/search-core";

function subscribeTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function themeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

/** The institutional path, one tap from any page: the pilot form, then pricing, the API and licences. */
const institutionLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/data-api", label: "Data API" },
  { href: "/licensing", label: "Licensing" },
  { href: "/for-institutions", label: "For institutions" },
] as const;

const readerLinks = [...utilityNav, { href: "/subscribe", label: "Newsletter" }, { href: "/pricing#readers", label: "Reader plans" }];

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="8.5" cy="8.5" r="5.75" />
      <path d="m13 13 4.25 4.25" strokeLinecap="round" />
    </svg>
  );
}

export function Header({ searchIndex }: { searchIndex: SearchHit[] }) {
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const dark = useSyncExternalStore(subscribeTheme, themeSnapshot, () => false);
  const open = menuPath === pathname;
  // The most specific section wins, so /markets/tbills lights T-bills, not Currencies (/markets) as well.
  const activeHref = nav
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((x, y) => y.href.length - x.href.length)[0]?.href;

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

  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("af-theme", next ? "dark" : "light");
  }

  const chip = "min-h-11 items-center whitespace-nowrap rounded-full px-3 text-[13px] font-medium text-night-soft hover:bg-night-2 hover:text-night-ink sm:min-h-9";

  return (
    <header className="no-print on-night sticky top-0 z-40 bg-night text-night-ink" aria-label="Site">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-1.5 sm:gap-4 sm:px-6 sm:py-3">
        <Wordmark compact night logoClassName="h-7 w-auto sm:h-10" />
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="hidden h-9 min-w-0 flex-1 items-center justify-between gap-3 rounded-full border border-night-line bg-night-2 px-4 text-left text-[13px] text-night-muted hover:border-night-soft/40 hover:text-night-soft md:flex md:max-w-sm lg:max-w-md"
        >
          <span className="truncate">Search markets, countries and data</span>
          <kbd className="shrink-0 whitespace-nowrap rounded-md border border-night-line px-1.5 py-0.5 font-sans text-[11px] text-night-muted">Ctrl K</kbd>
        </button>
        <div className="flex items-center gap-0.5 sm:gap-1.5">
          {utilityNav.map((item) => (
            <Link key={item.href} href={item.href} className={`${chip} hidden xl:inline-flex`}>
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-night-soft hover:bg-night-2 hover:text-night-ink md:hidden"
            aria-label="Search"
          >
            <SearchIcon />
          </button>
          <button type="button" onClick={toggleTheme} className={`${chip} hidden sm:inline-flex`}>
            <span suppressHydrationWarning>{dark ? "Light" : "Dark"}</span>
            <span className="sr-only"> theme</span>
          </button>
          <Link
            href={institutionalPilot.href}
            data-track="pricing_cta_click"
            className="relative inline-flex min-h-9 items-center whitespace-nowrap rounded-full bg-accent px-3 before:absolute before:inset-x-0 before:-inset-y-1 text-[13px] font-semibold text-night hover:bg-gold-soft sm:ml-1 sm:px-4"
          >
            <span className="sm:hidden">Free pilot</span>
            <span className="hidden sm:inline xl:hidden">Start a pilot</span>
            <span className="hidden xl:inline">Start a 30-day pilot</span>
          </Link>
          <button
            type="button"
            className={`${chip} inline-flex xl:hidden`}
            onClick={() => setMenuPath((current) => (current === pathname ? null : pathname))}
            aria-expanded={open}
            aria-controls="site-menu"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      <nav className="hidden border-t border-night-line lg:block" aria-label="Sections">
        <div className="mx-auto flex max-w-7xl items-center gap-x-1 overflow-x-auto px-4 sm:px-6">
          {nav.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative px-3 py-3 text-[14px] font-medium ${
                  active
                    ? "text-night-ink after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent"
                    : "text-night-muted hover:text-night-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <span aria-hidden className="ml-auto h-4 w-px shrink-0 bg-night-line" />
          <Link
            href="/pricing"
            aria-current={pathname === "/pricing" ? "page" : undefined}
            className={`px-3 py-3 text-[14px] font-medium ${pathname === "/pricing" ? "text-night-ink" : "text-night-soft hover:text-night-ink"}`}
          >
            Pricing
          </Link>
          <Link href="/subscribe" className="px-3 py-3 text-[14px] font-medium text-night-muted hover:text-night-ink">
            Newsletter
          </Link>
        </div>
      </nav>

      {open ? (
        <div id="site-menu" className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-night-line bg-night px-4 pb-6 pt-4 xl:hidden">
          <nav aria-label="For institutions" className="rounded-2xl border border-night-line bg-night-2 p-4">
            <p className="text-[12px] font-semibold text-accent">For funds, banks and DFIs</p>
            <p className="mt-1 text-[14px] leading-5 text-night-soft">African government bond and bill auctions by API, with the full history.</p>
            <Link
              href={institutionalPilot.href}
              data-track="pricing_cta_click"
              className="mt-3 flex min-h-11 items-center justify-center rounded-full bg-accent px-4 text-[14px] font-semibold text-night hover:bg-gold-soft"
            >
              Start a free 30-day pilot
            </Link>
            <ul className="mt-2 grid grid-cols-2 gap-1">
              {institutionLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex min-h-11 items-center rounded-xl px-3 text-[15px] font-medium text-night-ink hover:bg-night">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Sections" className="mt-5">
            <p className="px-3 text-[12px] font-semibold text-night-muted">Markets and data</p>
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

          <nav aria-label="Reader tools" className="mt-5">
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
          </nav>
          <button
            type="button"
            onClick={toggleTheme}
            className="mt-4 flex min-h-11 w-full items-center rounded-xl border border-night-line px-3 text-left text-[15px] font-medium text-night-soft sm:hidden"
          >
            <span suppressHydrationWarning>{dark ? "Switch to light theme" : "Switch to dark theme"}</span>
          </button>
        </div>
      ) : null}

      <SearchDialog index={searchIndex} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
