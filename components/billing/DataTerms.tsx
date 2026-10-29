import Link from "next/link";
import { dataTerms } from "@/lib/billing/ratecard";

/**
 * The free / keyed / Enterprise data terms (D-016), rendered from the one text in lib/billing/ratecard.ts so that
 * /developers, /licensing and /data-api say exactly the same thing.
 */
export function DataTerms() {
  const columns = [
    { ...dataTerms.free, link: { href: "/developers", label: "Call the API" } },
    { ...dataTerms.keyed, link: { href: "/pricing#pilot", label: "Free 30-day pilot key" } },
    { ...dataTerms.enterprise, link: { href: "/licensing#enquiry", label: "Ask about Enterprise" } },
  ];
  return (
    <div>
      <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-3">
        {columns.map((c) => (
          <div key={c.title} className="flex flex-col bg-surface px-5 py-6">
            <p className="text-[13px] font-semibold text-gold">{c.title}</p>
            <ul className="mt-3 flex-1 list-disc space-y-1.5 pl-4 text-sm leading-6 text-ink-soft">
              {c.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <Link href={c.link.href} className="mt-3 inline-flex min-h-11 items-center self-start text-[13px] font-semibold text-forest underline underline-offset-2">
              {c.link.label}
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-soft">
        <strong className="text-ink">{dataTerms.fundQuestion.q}</strong> {dataTerms.fundQuestion.a}
      </p>
    </div>
  );
}
