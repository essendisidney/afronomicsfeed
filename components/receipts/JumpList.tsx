import type { SectionLink } from "@/components/layout/SectionNav";

/**
 * "On this page" for a long Receipt: plain in-page links, no script. On a phone it is a chip that opens into the
 * list (a <details>, so it costs no JavaScript and nothing below it moves until the reader taps it). On a laptop
 * the same list sits in the right-hand gutter and stays in view while the reader scrolls.
 */
function Links({ sections, tall }: { sections: SectionLink[]; tall?: boolean }) {
  return (
    <ol className="space-y-0.5">
      {sections.map((s) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            className={`flex ${tall ? "min-h-11" : "min-h-8"} items-center text-[14px] leading-5 text-ink-soft underline decoration-transparent underline-offset-4 hover:text-forest hover:decoration-forest`}
          >
            {s.label}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function JumpChip({ sections }: { sections: SectionLink[] }) {
  if (sections.length < 2) return null;
  return (
    <details data-jump className="no-print group mt-6 lg:hidden">
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-rule bg-surface px-4 text-[13.5px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
        On this page
        <span className="text-muted">· {sections.length} sections</span>
        <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none">
          <path d="M2 4.5 6 8l4-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <nav aria-label="On this page" className="mt-2 rounded-2xl border border-rule bg-surface px-4 py-2">
        <Links sections={sections} tall />
      </nav>
    </details>
  );
}

export function JumpRail({ sections, minutes }: { sections: SectionLink[]; minutes: number }) {
  if (sections.length < 2) return null;
  return (
    <nav data-jump-rail aria-labelledby="jump-rail-title" className="no-print sticky top-24 hidden max-w-60 border-l border-rule pl-4 lg:block">
      <p id="jump-rail-title" className="t-label text-muted">
        On this page
      </p>
      <p className="mt-0.5 text-[12.5px] text-muted">{minutes} min read</p>
      <div className="mt-2">
        <Links sections={sections} />
      </div>
    </nav>
  );
}
