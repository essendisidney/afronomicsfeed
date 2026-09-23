import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { deskNav, disclaimer, footerNav, nav, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="no-print mt-auto border-t border-rule bg-paper-2">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Wordmark />
            <a
              href={site.houseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-mono text-[10px] uppercase tracking-[0.16em] text-muted no-underline hover:text-forest"
            >
              {site.houseCredit}
            </a>
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink-soft">{site.promise}</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{site.line}</p>
          </div>
          <div className="md:col-span-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Layers</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-ink-soft hover:text-forest">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              Kenya desk file
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {deskNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-ink-soft hover:text-forest">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">House</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-ink-soft hover:text-forest">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="/rss.xml" className="text-ink-soft hover:text-forest">
                  RSS
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-rule pt-6">
          <p className="max-w-5xl text-xs leading-6 text-muted">{disclaimer}</p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            © {new Date().getFullYear()} {site.legalName}
            <span className="mx-2" aria-hidden>
              ·
            </span>
            <a
              href={site.houseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-forest"
            >
              {site.houseCredit}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
