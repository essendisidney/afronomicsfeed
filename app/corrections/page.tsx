import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { corrections, sampleCorrectionFormat } from "@/lib/corrections";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Corrections",
  description: "Public corrections log for Afronomics Feed.",
};

export default function CorrectionsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Corrections"
        title="The public log"
        lede="If a citation, date, or attribution is wrong, it is recorded here. Silence is not a correction policy."
      />

      {corrections.length === 0 ? (
        <p className="mt-10 border border-rule bg-paper-2 px-5 py-6 text-sm leading-6 text-ink-soft">
          No corrections have been logged yet. The desk is current against the
          seed file. When a live correction ships, it will appear above the
          sample format.
        </p>
      ) : (
        <ul className="mt-10 space-y-8">
          {corrections.map((item) => (
            <li key={`${item.date}-${item.pieceTitle}`} className="border-t border-rule pt-6">
              <CorrectionCard {...item} />
            </li>
          ))}
        </ul>
      )}

      <section className="mt-14 border border-dashed border-rule p-6">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          Sample format — not a live correction
        </p>
        <div className="mt-4">
          <CorrectionCard {...sampleCorrectionFormat} />
        </div>
      </section>
    </div>
  );
}

function CorrectionCard({
  date,
  pieceTitle,
  pieceHref,
  whatWasWrong,
  whatWasCorrected,
  editor,
}: (typeof sampleCorrectionFormat)) {
  return (
    <article>
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
        {formatDate(date)} · {editor}
      </p>
      <h2 className="mt-2 font-serif text-xl">
        <a href={pieceHref} className="hover:text-forest">
          {pieceTitle}
        </a>
      </h2>
      <dl className="mt-4 space-y-3 text-sm leading-6">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">What was wrong</dt>
          <dd className="mt-1 text-ink-soft">{whatWasWrong}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">What was corrected</dt>
          <dd className="mt-1 text-ink-soft">{whatWasCorrected}</dd>
        </div>
      </dl>
    </article>
  );
}
