"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { SearchDialog } from "@/components/search/SearchDialog";
import { nav, site, utilityNav } from "@/lib/site";
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
    <header className="no-print sticky top-0 z-40 border-b border-night-line bg-night text-night-ink">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Wordmark compact night />
        <p className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-night-muted xl:block">
          {site.line}
        </p>
        <div className="flex items-center gap-4">
          {utilityNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden text-[12px] font-medium tracking-wide text-night-soft hover:text-night-ink lg:inline"
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="text-[12px] font-medium tracking-wide text-night-soft hover:text-night-ink"
          >
            Search
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="text-[12px] font-medium tracking-wide text-night-soft hover:text-night-ink"
          >
            <span suppressHydrationWarning>{dark ? "Light" : "Dark"}</span>
          </button>
          <Link
            href="/subscribe"
            className="hidden text-[12px] font-medium tracking-wide text-night-soft hover:text-night-ink sm:inline"
          >
            Newsletter
          </Link>
          <Link
            href="/pricing"
            className="bg-gold px-3 py-1.5 text-[12px] font-semibold tracking-wide text-night-ink hover:bg-gold-soft"
          >
            Pro
          </Link>
          <button
            type="button"
            className="text-[12px] font-medium tracking-wide text-night-soft lg:hidden"
            onClick={() => setMenuPath((current) => (current === pathname ? null : pathname))}
            aria-expanded={open}
          >
            Menu
          </button>
        </div>
      </div>
      <nav className="hidden border-t border-night-line lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-x-6 overflow-x-auto px-4 py-2.5 sm:px-6">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[13px] font-medium tracking-wide ${
                  active ? "text-night-ink" : "text-night-muted hover:text-night-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {open ? (
        <nav className="border-t border-night-line bg-night px-4 py-5 lg:hidden">
          <ul className="grid grid-cols-2 gap-3">
            {[...nav, ...utilityNav, { href: "/pricing", label: "Pro" }, { href: "/subscribe", label: "Newsletter" }].map(
              (item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[14px] font-medium text-night-ink">
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
      ) : null}

      <SearchDialog index={searchIndex} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
