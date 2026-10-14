import Link from "next/link";
import { ReceiptMeta, VerdictLine } from "@/components/receipts/ReceiptView";
import type { Receipt } from "@/lib/receipts";

/** Receipts newest first, each with its verdict line visible: the list is readable without opening anything. */
export function ReceiptList({ receipts, empty }: { receipts: Receipt[]; empty: string }) {
  if (!receipts.length) return <p className="rounded-2xl border border-rule bg-surface px-5 py-5 text-[15px] text-ink-soft">{empty}</p>;
  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {receipts.map((r) => (
        <li key={r.slug} className="py-5">
          <ReceiptMeta r={r} />
          <h2 className="t-h2 mt-2 text-ink text-balance">
            <Link href={`/receipts/${r.slug}`} className="hover:text-forest">
              {r.title}
            </Link>
          </h2>
          <VerdictLine r={r} size="md" />
          <p className="mt-2 max-w-3xl text-[15px] leading-6 text-ink-soft">{r.summary}</p>
        </li>
      ))}
    </ul>
  );
}
