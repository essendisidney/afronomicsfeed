import { ADVICE_DISCLAIMER } from "@/lib/legal";

/** The information-not-advice notice for the pack, benchmarking and institutional pages (lib/legal.ts). */
export function AdviceDisclaimer({ className = "" }: { className?: string }) {
  return (
    <aside aria-label="Not investment advice" className={`mt-14 max-w-3xl rounded-2xl border border-rule bg-surface px-5 py-4 ${className}`}>
      <p className="text-[13px] font-semibold text-ink">Information, not advice</p>
      <p className="mt-1 text-[13px] leading-5 text-ink-soft">{ADVICE_DISCLAIMER}</p>
    </aside>
  );
}
