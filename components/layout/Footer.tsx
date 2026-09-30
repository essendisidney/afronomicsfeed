import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { disclaimer, footerGroups, site } from "@/lib/site";

const legal = [
  { href: "/legal/disclaimer", label: "Disclaimer" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/imprint", label: "Imprint" },
] as const;

function Column({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-night-ink">{title}</p>
      <ul className="mt-4 space-y-2">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-sm text-night-soft hover:text-night-ink">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="no-print on-night mt-16 bg-night text-night-ink">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Wordmark compact night />
            <p className="mt-5 max-w-xs text-sm leading-6 text-night-soft">{site.promise}</p>
            <a
              href={site.houseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block font-medium text-[12px] text-night-muted hover:text-night-ink"
            >
              {site.houseCredit}
            </a>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
            {footerGroups.map((group) => (
              <Column key={group.title} title={group.title} links={group.links} />
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-night-line pt-6">
          {legal.map((item) => (
            <Link key={item.href} href={item.href} className="text-xs text-night-muted hover:text-night-ink">
              {item.label}
            </Link>
          ))}
          <a href="/rss.xml" className="text-xs text-night-muted hover:text-night-ink">
            RSS
          </a>
          <a href={`mailto:${site.contactEmail}`} className="text-xs text-night-muted hover:text-night-ink">
            {site.contactEmail}
          </a>
          {site.linkedinUrl ? (
            <a href={site.linkedinUrl} className="text-xs text-night-muted hover:text-night-ink" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          ) : null}
        </div>

        <p className="mt-6 max-w-3xl text-xs leading-5 text-night-muted">{disclaimer}</p>
        <p className="mt-4 font-medium text-[12px] text-night-muted">
          © {new Date().getFullYear()} {site.legalName}
        </p>
      </div>
    </footer>
  );
}
