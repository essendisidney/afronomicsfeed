import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { deskNav, disclaimer, nav, site } from "@/lib/site";

const product = [
  { href: "/about", label: "About" },
  { href: "/pro", label: "Pro" },
  { href: "/pricing", label: "Pricing" },
  { href: "/subscribe", label: "Subscribe" },
  { href: "/manifesto", label: "Manifesto" },
  { href: "/terminal", label: "Directory" },
] as const;

const company = [
  { href: "/advisory", label: "Advisory" },
  { href: "/press", label: "Press" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
] as const;

const legal = [
  { href: "/legal/disclaimer", label: "Disclaimer" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/imprint", label: "Imprint" },
] as const;

function Column({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-night-muted">{title}</p>
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
    <footer className="no-print mt-16 bg-night text-night-ink">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Wordmark compact night />
            <p className="mt-5 max-w-xs text-sm leading-6 text-night-soft">{site.promise}</p>
            <a
              href={site.houseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.16em] text-night-muted hover:text-night-ink"
            >
              {site.houseCredit}
            </a>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
            <Column title="Product" links={product} />
            <Column title="Read" links={deskNav} />
            <Column title="Desks" links={nav} />
            <Column title="House" links={company} />
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
          {site.linkedinUrl ? (
            <a href={site.linkedinUrl} className="text-xs text-night-muted hover:text-night-ink" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          ) : null}
        </div>

        <p className="mt-6 max-w-3xl text-xs leading-5 text-night-muted">{disclaimer}</p>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-night-muted">
          © {new Date().getFullYear()} {site.legalName}
        </p>
      </div>
    </footer>
  );
}
