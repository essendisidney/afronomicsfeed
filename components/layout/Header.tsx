"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { SearchDialog } from "@/components/search/SearchDialog";
import { nav, site, utilityNav } from "@/lib/site";
import type { ArticleIndexItem } from "@/lib/types";

function subscribeTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function themeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

export function Header({ articles }: { articles: ArticleIndexItem[] }) {
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
    <header className="no-print border-b border-rule bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <Wordmark />
        <p className="hidden max-w-xs text-right font-mono text-[11px] uppercase tracking-[0.12em] text-muted xl:block">
          {site.line}
        </p>
        <div className="flex items-center gap-2">
          {utilityNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft hover:text-forest md:inline"
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="border border-rule px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft hover:border-gold"
          >
            Search <span className="hidden sm:inline">⌘K</span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="border border-rule px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft hover:border-gold"
          >
            <span suppressHydrationWarning>{dark ? "Light" : "Dark"}</span>
          </button>
          <Link
            href="/login"
            className="hidden border border-rule px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft sm:inline"
          >
            Sign in
          </Link>
          <Link
            href="/account"
            className="hidden border border-rule px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft md:inline"
          >
            Account
          </Link>
          <Link
            href="/pro"
            className="bg-forest px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-paper hover:bg-forest-mid"
          >
            Pro
          </Link>
          <button
            type="button"
            className="border border-rule px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em] lg:hidden"
            onClick={() => setMenuPath((current) => (current === pathname ? null : pathname))}
            aria-expanded={open}
          >
            Menu
          </button>
        </div>
      </div>
      <nav className="hidden border-t border-rule lg:block">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2 sm:px-6">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-mono text-[11px] font-semibold uppercase tracking-[0.12em] ${
                  active ? "text-forest" : "text-ink-soft hover:text-forest"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="masthead-rule" />

      {open ? (
        <nav className="border-t border-rule px-4 py-4 lg:hidden">
          <ul className="grid grid-cols-2 gap-3">
            {[...nav, ...utilityNav, { href: "/pro", label: "Pro" }, { href: "/today", label: "Morning file" }].map(
              (item) => (
                <li key={item.href}>
                  <Link href={item.href} className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em]">
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
      ) : null}

      <SearchDialog articles={articles} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
