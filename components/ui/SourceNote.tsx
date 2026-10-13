import Link from "next/link";
import { loadHealth } from "@/lib/data/health";

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/**
 * The provenance line under a multi-publisher table: each publisher linked to its own results page, and the date of
 * the last freshness check (data/health.json), with a link to the data status page. Nothing here is typed by hand:
 * the publishers come from the market definitions and the date from the last data run.
 */
export function SourceNote({
  sources,
  className = "",
}: {
  sources: readonly { name: string; href: string }[];
  className?: string;
}) {
  const health = loadHealth();
  const unique = sources.filter((s, i) => sources.findIndex((x) => x.href === s.href) === i);
  return (
    <p className={`mt-4 max-w-4xl text-xs leading-5 text-muted ${className}`}>
      <span className="font-medium text-ink-soft">Sources:</span>{" "}
      {unique.map((s, i) => (
        <span key={s.href}>
          {i ? " · " : ""}
          <a href={s.href} target="_blank" rel="noopener noreferrer" data-track="source_click" className="underline underline-offset-2 hover:text-forest">
            {s.name}
          </a>
        </span>
      ))}
      . Each row links to the publisher&rsquo;s own notice on its market page. Afronomics compiles and checks; the publisher is the source.
      {health ? (
        <>
          {" "}
          Freshness last checked {dateFmt.format(new Date(health.checked_on))}:{" "}
          <Link href="/status" className="underline underline-offset-2 hover:text-forest">
            data status
          </Link>
          .
        </>
      ) : null}{" "}
      <em>Information, not advice.</em>
    </p>
  );
}
