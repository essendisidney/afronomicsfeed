import type { EaChange } from "@/lib/data/east-africa";
import { srcHref } from "./CountryRates";

/** "What changed this month": factual sentences computed from the data, grouped by country, each with its source. */
export function MonthChanges({ items }: { items: EaChange[] }) {
  const groups = [...new Set(items.map((i) => i.country))];
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {groups.map((country) => (
        <div key={country} className="min-w-0">
          <h3 className="font-serif text-xl text-ink">{country}</h3>
          <ul className="mt-2 space-y-3 border-l-2 border-gold/50 pl-4">
            {items
              .filter((i) => i.country === country)
              .map((i) => (
                <li key={i.text} className="text-[14px] leading-6 text-ink-soft">
                  {i.text}
                  {i.source ? (
                    <>
                      {" "}
                      <a href={srcHref(i.source)} target="_blank" rel="noopener noreferrer" className="text-[12px] text-forest underline underline-offset-2">
                        Source
                      </a>
                    </>
                  ) : null}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
