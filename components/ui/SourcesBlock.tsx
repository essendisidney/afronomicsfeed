import { formatDate } from "@/lib/format";
import type { Source } from "@/lib/types";

export function SourcesBlock({ sources }: { sources: Source[] }) {
  return (
    <section className="border-t border-rule pt-8">
      <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        Citations
      </h2>
      <ol className="mt-4 space-y-3">
        {sources.map((source) => (
          <li key={`${source.url}-${source.date}`} className="text-sm leading-6 text-ink-soft">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-forest underline decoration-rule underline-offset-4 hover:text-gold"
            >
              {source.name}
            </a>
            <span className="text-muted"> · {formatDate(source.date)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
