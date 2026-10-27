import Link from "next/link";
import { CopyCitation } from "@/components/ui/CopyCitation";
import { referenceRateTerms } from "@/lib/reference-rates";

/**
 * "How to cite" and the licence terms for an Afronomics reference rate (ASBI, KCCI). Terms text only; prices are on
 * /licensing and are not set here.
 */
export function ReferenceTerms({ shortName, cite }: { shortName: string; cite: { short: string; full: string } }) {
  const terms = referenceRateTerms(shortName);
  return (
    <section id="cite" className="mt-14 scroll-mt-24 rounded-2xl border border-rule bg-surface px-5 py-5 sm:px-6">
      <h2 className="font-serif text-2xl text-ink">How to cite {shortName}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">In a chart or article credit:</p>
      <p className="mt-2 max-w-3xl break-words rounded-xl bg-paper-2 px-4 py-3 text-[13px] leading-6 text-ink">{cite.short}</p>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-soft">In a paper or report:</p>
      <p className="mt-2 max-w-3xl break-words rounded-xl bg-paper-2 px-4 py-3 text-[13px] leading-6 text-ink">{cite.full}</p>
      <div className="mt-3">
        <CopyCitation text={cite.full} />
      </div>

      <h3 id="licence" className="mt-8 font-serif text-xl text-ink">Licence terms</h3>
      <div className="mt-3 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-3">
        {terms.map((t) => (
          <div key={t.title} className="bg-surface px-5 py-5">
            <p className="text-[13px] font-semibold text-gold">{t.title}</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm leading-6 text-ink-soft">
              {t.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-soft">
        Keys, licences and their prices:{" "}
        <Link href="/licensing" className="font-medium text-forest underline underline-offset-2">
          licensing
        </Link>
        . To ask about benchmark use:{" "}
        <Link href="/licensing#enquiry" className="font-medium text-forest underline underline-offset-2">
          send an enquiry
        </Link>
        .
      </p>
    </section>
  );
}
