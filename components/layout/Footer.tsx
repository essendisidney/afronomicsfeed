import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { institutionalPilot } from "@/lib/billing/ratecard";
import { disclaimer, footerColumns, footerLine, site } from "@/lib/site";

const legal = [
  { href: "/legal/disclaimer", label: "Disclaimer" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/imprint", label: "Imprint" },
] as const;

/** `wide`: on a phone the odd fifth column spans both columns with its links in two, instead of sitting alone on the left. */
function Column({ title, links, wide = false }: { title: string; links: readonly { href: string; label: string }[]; wide?: boolean }) {
  return (
    <nav aria-label={title} className={wide ? "col-span-2 sm:col-span-1" : undefined}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-night-muted">{title}</p>
      {/* A 44px row on a phone (easy to hit), the usual tight list from sm. */}
      <ul className={`mt-3 sm:block sm:space-y-2.5 ${wide ? "grid grid-cols-2 gap-x-6" : ""}`}>
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="flex min-h-11 items-center text-[14px] text-night-soft hover:text-night-ink sm:inline sm:min-h-0">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="no-print on-night mt-16 bg-night text-night-ink">
      {/* Bottom padding keeps the last line clear of the floating "Install the app" button. */}
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-24 sm:px-6">
        <div className="flex flex-col gap-6 border-b border-night-line pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <Wordmark compact night />
            <p className="mt-5 text-sm leading-6 text-night-soft">{site.promise}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={institutionalPilot.href}
              data-track="pricing_cta_click"
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-[14px] font-semibold text-on-accent hover:bg-gold-soft"
            >
              Start a free 30-day pilot
            </Link>
            <Link
              href="/subscribe"
              className="inline-flex min-h-11 items-center rounded-full px-5 text-[14px] font-semibold text-night-ink ring-1 ring-night-line hover:bg-night-2"
            >
              Get the Morning by email
            </Link>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {footerColumns.map((group, index) => (
            <Column key={group.title} title={group.title} links={group.links} wide={footerColumns.length % 2 === 1 && index === footerColumns.length - 1} />
          ))}
        </div>

        {/* Three to a row on a phone, so the sixth link does not wrap onto a line of its own. */}
        <nav aria-label="Afronomics" className="mt-10 grid grid-cols-3 gap-x-5 text-[14px] text-night-soft sm:flex sm:flex-wrap sm:items-center sm:gap-y-1">
          {footerLine.map((item) => (
            <Link key={item.href} href={item.href} className="inline-flex min-h-11 min-w-11 items-center hover:text-night-ink sm:min-h-0 sm:min-w-0">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 flex flex-col gap-4 border-t border-night-line pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 [&>a]:inline-flex [&>a]:min-h-11 [&>a]:min-w-11 [&>a]:items-center sm:[&>a]:min-h-0 sm:[&>a]:min-w-0">
            {legal.map((item) => (
              <Link key={item.href} href={item.href} className="text-xs text-night-muted hover:text-night-ink">
                {item.label}
              </Link>
            ))}
            <a href="/rss.xml" className="text-xs text-night-muted hover:text-night-ink">
              RSS
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 [&>a]:inline-flex [&>a]:min-h-11 [&>a]:min-w-11 [&>a]:items-center sm:[&>a]:min-h-0 sm:[&>a]:min-w-0">
            <a href={`mailto:${site.contactEmail}`} className="text-xs text-night-muted hover:text-night-ink">
              {site.contactEmail}
            </a>
            {site.linkedinUrl ? (
              <a href={site.linkedinUrl} className="text-xs text-night-muted hover:text-night-ink" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            ) : null}
            <a href={site.telegramUrl} className="text-xs text-night-muted hover:text-night-ink" target="_blank" rel="noopener noreferrer">
              Telegram
            </a>
          </div>
        </div>

        <p className="mt-6 max-w-3xl text-xs leading-5 text-night-muted">{disclaimer}</p>
        <p className="mt-4 text-[12px] font-medium text-night-muted">
          © {new Date().getFullYear()} {site.legalName} ·{" "}
          <a href={site.houseUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:text-night-ink sm:min-h-0">
            {site.houseCredit}
          </a>
        </p>
      </div>
    </footer>
  );
}
