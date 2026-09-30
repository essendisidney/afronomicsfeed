import Link from "next/link";
import type { WireItem } from "@/lib/data/wire";
import { EmptyNote, timeAgo } from "./parts";

export function WireList({
  items,
  compact = false,
  showSummary = false,
  now,
}: {
  items: WireItem[];
  compact?: boolean;
  showSummary?: boolean;
  now: number;
}) {
  if (items.length === 0) {
    return <EmptyNote>No publisher headlines in this window. The wire refreshes every 15 minutes.</EmptyNote>;
  }
  return (
    <ul className="divide-y divide-rule">
      {items.map((item) => (
        <li key={item.id} className={compact ? "py-2.5" : "py-3.5"}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block leading-snug text-ink hover:text-forest ${compact ? "text-[15px]" : "font-serif text-lg"}`}
          >
            {item.title}
          </a>
          {showSummary && item.summary ? (
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-ink-soft">{item.summary}</p>
          ) : null}
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            <span className="text-ink-soft">{item.publisher}</span>
            <span>·</span>
            <time dateTime={item.publishedAt}>{timeAgo(item.publishedAt, now)}</time>
            {item.countries.slice(0, 3).map((country) => (
              <Link key={country.iso} href={`/countries/${country.slug}`} className="text-forest hover:text-gold">
                {country.name}
              </Link>
            ))}
          </p>
        </li>
      ))}
    </ul>
  );
}
