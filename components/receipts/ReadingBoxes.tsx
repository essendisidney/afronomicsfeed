import { asOfLabel } from "@/components/evidence/EvidenceTag";
import { ShareNumberButton } from "@/components/receipts/ShareNumberButton";
import { receiptEvidence, type Receipt } from "@/lib/receipts";
import { site } from "@/lib/site";

/**
 * The top of a long Receipt, read in twenty seconds: "The 3 numbers" (each figure as printed in the Receipt, with
 * its source and a share button that links to the tile itself, #n1 to #n3) and "What it means for you", drawn only
 * from the Receipt's own Analysis and marked as such. Both come from the front matter (keyNumbers, forYou), which
 * scripts/receipt_check.py and lib/receipts.ts check against the text.
 */

export function KeyNumbers({ r }: { r: Receipt }) {
  if (!r.keyNumbers.length) return null;
  const url = `${site.url}/receipts/${r.slug}`;
  const n = r.keyNumbers.length;
  return (
    <section aria-labelledby="key-numbers" className="mt-6">
      <h2 id="key-numbers" className="t-label text-accent">
        {n === 1 ? "The number" : `The ${n} numbers`}
      </h2>
      <ol className={`mt-2 grid grid-cols-1 gap-3 ${n === 3 ? "sm:grid-cols-3" : n === 2 ? "sm:grid-cols-2" : ""}`}>
        {r.keyNumbers.map((k, i) => {
          const id = `n${i + 1}`;
          const ev = receiptEvidence(r, k.source);
          return (
            <li
              key={id}
              id={id}
              className="flex scroll-mt-20 flex-col rounded-xl border border-rule bg-surface px-4 py-3 target:border-accent target:ring-2 target:ring-accent/40"
            >
              {/* One line on a phone whichever font is showing, so a late font cannot re-wrap the figure. */}
              <p className="tabular whitespace-nowrap text-[1.6rem] font-semibold leading-tight text-ink sm:whitespace-normal sm:text-[1.45rem]">{k.value}</p>
              <p className="mt-1 text-[14px] leading-5 text-ink-soft">{k.label}</p>
              <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                {ev ? (
                  <p className="text-[11.5px] leading-4 text-muted">
                    <a href={ev.href} target="_blank" rel="noopener noreferrer" className="underline decoration-rule underline-offset-2 hover:text-forest">
                      {ev.source}
                    </a>
                    {namesDate(ev.source, ev.asOf) ? null : <>, {asOfLabel(ev.asOf)}</>}
                  </p>
                ) : (
                  <span />
                )}
                <ShareNumberButton
                  url={`${url}#${id}`}
                  title={r.title}
                  text={`${k.value}: ${k.label}. ${ev ? `Source: ${ev.source}.` : ""}`.trim()}
                  label={`${k.value}, ${k.label}`}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function ForYou({ r }: { r: Receipt }) {
  if (!r.forYou.length) return null;
  return (
    <section aria-labelledby="for-you" className="mt-4 rounded-xl border border-rule border-l-4 border-l-analysis bg-surface px-4 py-4 sm:px-5">
      <h2 id="for-you" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-semibold text-ink">
        What it means for you
        <span className="label-chip text-analysis">Analysis</span>
      </h2>
      <ul className="mt-2 space-y-2">
        {r.forYou.map((line) => (
          <li key={line} className="flex gap-2.5 text-[15px] leading-6 text-ink">
            <span aria-hidden="true" className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-analysis" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[13px] font-semibold text-ink-soft">Information, not advice.</p>
    </section>
  );
}

/** True when a source's name already gives its date ("…results of 1 April 2024"), so the date is not printed twice. */
function namesDate(source: string, asOf: string | undefined): boolean {
  if (!asOf || !/^\d{4}-\d{2}-\d{2}/.test(asOf)) return false;
  const long = new Date(`${asOf.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return source.includes(long);
}
