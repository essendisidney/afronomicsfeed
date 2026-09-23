import Link from "next/link";
import { countrySeries, type CountrySeriesSlug } from "@/lib/demo/country-series";

export function CountrySeriesNav({
  countrySlug,
  active,
}: {
  countrySlug: string;
  active?: CountrySeriesSlug;
}) {
  return (
    <nav aria-label="Country series" className="flex flex-wrap gap-x-4 gap-y-2 border-y border-rule py-3">
      <Link
        href={`/countries/${countrySlug}`}
        className={`font-mono text-[11px] font-semibold uppercase tracking-[0.12em] ${
          active ? "text-ink-soft hover:text-forest" : "text-forest"
        }`}
      >
        Terminal
      </Link>
      {countrySeries.map((item) => {
        const current = item.slug === active;
        return (
          <Link
            key={item.slug}
            href={`/countries/${countrySlug}/${item.slug}`}
            className={`font-mono text-[11px] font-semibold uppercase tracking-[0.12em] ${
              current ? "text-forest" : "text-ink-soft hover:text-forest"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
