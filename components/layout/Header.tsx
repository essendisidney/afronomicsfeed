"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { SearchDialog } from "@/components/search/SearchDialog";
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

export function Header({ searchIndex }: { searchIndex: SearchHit[] }) {
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const dark = useSyncExternalStore(subscribeTheme, themeSnapshot, () => false);
  const open = menuPath === pathname;

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

  return (
    <header className="no-print on-night sticky top-0 z-40 bg-night text-night-ink">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Wordmark compact night />
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="hidden h-9 min-w-0 flex-1 items-center justify-between gap-3 rounded-full border border-night-line bg-night-2 px-4 text-left text-[13px] text-night-muted hover:border-night-soft/40 hover:text-night-soft md:flex md:max-w-sm lg:max-w-md"
        >
          <span className="truncate">Search markets, countries and data</span>
          <kbd className="rounded-md border border-night-line px-1.5 py-0.5 font-sans text-[11px] text-night-muted">Ctrl K</kbd>
        </button>
        <div className="flex items-center gap-1 sm:gap-2">
          {utilityNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden rounded-full px-3 py-1.5 text-[13px] font-medium text-night-soft hover:bg-night-2 hover:text-night-ink lg:inline"
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="rounded-full px-3 py-1.5 text-[13px] font-medium text-night-soft hover:bg-night-2 hover:text-night-ink md:hidden"
          >
            Search
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden rounded-full px-3 py-1.5 text-[13px] font-medium text-night-soft hover:bg-night-2 hover:text-night-ink sm:inline"
            aria-label="Switch colour theme"
          >
            <span suppressHydrationWarning>{dark ? "Light" : "Dark"}</span>
          </button>
          <Link
            href="/pricing"
            className="ml-1 hidden rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-night hover:bg-gold-soft sm:inline"
          >
            Get Pro
          </Link>
          <button
            type="button"
            className="rounded-full px-3 py-1.5 text-[13px] font-medium text-night-soft hover:bg-night-2 lg:hidden"
            onClick={() => setMenuPath((current) => (current === pathname ? null : pathname))}
            aria-expanded={open}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      <nav className="hidden border-t border-night-line lg:block" aria-label="Sections">
        <div className="mx-auto flex max-w-7xl items-center gap-x-1 overflow-x-auto px-4 sm:px-6">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
          <Link href="/subscribe" className="ml-auto px-3 py-3 text-[14px] font-medium text-night-muted hover:text-night-ink">
            Newsletter
          </Link>
        </div>
      </nav>

      {open ? (
        <nav className="border-t border-night-line bg-night px-4 pb-6 pt-4 lg:hidden" aria-label="Sections">
          <ul className="grid grid-cols-2 gap-1">
            {[...nav, ...utilityNav, { href: "/subscribe", label: "Newsletter" }, { href: "/pricing", label: "Get Pro" }].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block rounded-xl px-3 py-2.5 text-[15px] font-medium text-night-ink hover:bg-night-2">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={toggleTheme}
            className="mt-3 w-full rounded-xl border border-night-line px-3 py-2.5 text-left text-[15px] font-medium text-night-soft sm:hidden"
          >
            <span suppressHydrationWarning>{dark ? "Switch to light theme" : "Switch to dark theme"}</span>
          </button>
        </nav>
      ) : null}

      <SearchDialog index={searchIndex} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
