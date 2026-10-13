import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { Source } from "@/lib/types";

/** The story's sources as a clean numbered panel, each opening the publisher's own document, plus how we work. */
export function SourcesBlock({ sources, id = "sources", children }: { sources: Source[]; id?: string; children?: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="rounded-3xl border border-rule bg-paper-2 px-5 py-6 sm:px-8 sm:py-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={`${id}-heading`} className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-muted">
          Sources
        </h2>
        <Link href="/method" className="-my-3 inline-flex min-h-11 items-center text-[13px] font-semibold text-forest underline decoration-rule underline-offset-4 hover:text-accent">
          Sources &amp; method
        </Link>
      </div>
      <ol className="mt-4 divide-y divide-rule">
        {sources.map((source, index) => (
          <li key={`${source.url}-${source.date}`} className="flex gap-4 py-3 text-[14.5px] leading-6 text-ink-soft first:pt-0 last:pb-0">
            <span className="w-5 shrink-0 font-mono text-[12.5px] leading-6 text-muted">{String(index + 1).padStart(2, "0")}</span>
            <span className="min-w-0 [overflow-wrap:anywhere]">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                data-track="source_click"
                className="font-medium text-ink underline decoration-rule underline-offset-4 hover:text-accent hover:decoration-accent"
              >
                {source.name}
              </a>
              <span className="text-muted"> · {formatDate(source.date)}</span>
            </span>
          </li>
        ))}
      </ol>
      {children ? <div className="mt-5 border-t border-rule pt-5">{children}</div> : null}
    </section>
  );
}
