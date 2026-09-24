import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { deskNav, disclaimer, footerGroups, nav, site } from "@/lib/site";

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
            {site.linkedinUrl ? (
              <a
                href={site.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted no-underline hover:text-forest"
              >
                LinkedIn
              </a>
            ) : null}
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink-soft">{site.promise}</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{site.line}</p>
          </div>
          <div className="md:col-span-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Layers</p>
            <ul className="mt-3 columns-2 gap-x-6 space-y-1.5 text-sm">
              {nav.map((item) => (
                <li key={item.href} className="break-inside-avoid">
                  <Link href={item.href} className="text-ink-soft hover:text-forest">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              Kenya desk file
            </p>
            <ul className="mt-3 columns-2 gap-x-6 space-y-1.5 text-sm">
              {deskNav.map((item) => (
                <li key={item.href} className="break-inside-avoid">
                  <Link href={item.href} className="text-ink-soft hover:text-forest">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 grid gap-8 border-t border-rule pt-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                {group.title}
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {group.links.map((item) => (
                  <li key={`${group.title}-${item.href}`}>
                    <Link href={item.href} className="text-ink-soft hover:text-forest">
                      {item.label}
                    </Link>
                  </li>
                ))}
                {group.title === "Company" ? (
                  <li>
                    <a href="/rss.xml" className="text-ink-soft hover:text-forest">
                      RSS
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ))}
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
