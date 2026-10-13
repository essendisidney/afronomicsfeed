import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { corrections, type Correction } from "@/lib/corrections";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";
import { fitDescription } from "@/lib/seo";
import { rpcRead } from "@/lib/store";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Corrections",
  description: fitDescription(
    "The Afronomics corrections policy and public log: how to report an error, how fast we fix it, and every correction to an article or a published figure.",
  ),
  alternates: { canonical: `${site.url}/corrections` },
};

export default async function CorrectionsPage() {
  // Corrections to published figures are kept in the database and listed in full on /reference#corrections.
  const data = await rpcRead("af_corrections", {}, 900);
  const dataCount = data.ok && Array.isArray(data.value) ? data.value.length : null;
  const mail = `mailto:${site.contactEmail}?subject=${encodeURIComponent("Correction")}`;
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Corrections"
        title="The public log"
        lede="If a citation, date, or attribution is wrong, it is recorded here. Silence is not a correction policy."
      />

      <section className="mt-10 border-y border-rule py-6 text-sm leading-6 text-ink-soft" aria-labelledby="policy">
        <h2 id="policy" className="font-serif text-xl text-ink">
          The policy
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            Report an error to{" "}
            <a href={mail} className="underline underline-offset-2">
              {site.contactEmail}
            </a>{" "}
            with the subject &ldquo;Correction&rdquo;, the page and what is wrong. The desk inbox is read every working day.
          </li>
          <li>We check the figure against the publisher&rsquo;s own document. If we were wrong, we fix the page and log the correction; we never change a published figure silently.</li>
          <li>Each entry says when, what was wrong and what changed. Corrections to articles are listed below; corrections to data are in the data corrections log.</li>
          <li>
            When a publisher restates a result, we carry the restated figure and log the change. Figures that are late or could not be read are listed on{" "}
            <Link href="/status" className="underline underline-offset-2">
              data status
            </Link>
            .
          </li>
        </ul>
        <p className="mt-4">
          <strong className="text-ink">Data corrections:</strong>{" "}
          {dataCount == null ? "the log is on" : dataCount === 0 ? "none to published figures so far; the log is on" : `${dataCount} logged to published figures, listed on`}{" "}
          <Link href="/reference#corrections" className="font-medium text-forest underline underline-offset-2">
            the reference
          </Link>
          . Our full standards: <Link href="/editorial-standards" className="font-medium text-forest underline underline-offset-2">editorial standards</Link>.
        </p>
      </section>

      <h2 className="mt-10 font-serif text-2xl text-ink">Article corrections</h2>

      {corrections.length === 0 ? (
        <p className="mt-4 border border-rule bg-paper-2 px-5 py-6 text-sm leading-6 text-ink-soft">
          No article corrections logged yet. When we fix a date, a label or a claim in an
          article, the change is recorded here with what was wrong and what we changed.
        </p>
      ) : (
        <ul className="mt-4 space-y-8">
          {corrections.map((item) => (
            <li key={`${item.date}-${item.pieceTitle}`} className="border-t border-rule pt-6">
              <CorrectionCard {...item} />
            </li>
          ))}
        </ul>
      )}

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
}: Correction) {
  return (
    <article>
      <p className="font-medium text-[12.5px] text-muted">
        {formatDate(date)} · {editor}
      </p>
      <h2 className="mt-2 font-serif text-xl">
        <a href={pieceHref} className="hover:text-forest">
          {pieceTitle}
        </a>
      </h2>
      <dl className="mt-4 space-y-3 text-sm leading-6">
        <div>
          <dt className="font-medium text-[12px] text-muted">What was wrong</dt>
          <dd className="mt-1 text-ink-soft">{whatWasWrong}</dd>
        </div>
        <div>
          <dt className="font-medium text-[12px] text-muted">What was corrected</dt>
          <dd className="mt-1 text-ink-soft">{whatWasCorrected}</dd>
        </div>
      </dl>
    </article>
  );
}
