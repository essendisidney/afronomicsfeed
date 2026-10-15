import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { ReceiptList } from "@/components/receipts/ReceiptList";
import { sectorNames, visibleReceipts } from "@/lib/receipts";
import { fitDescription } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Receipts: our daily verdict on African money",
  description: fitDescription(
    "Every day, one money event in Africa (an IPO, a rate decision, a budget line) with the figures from the source, our verdict labelled as opinion, and dated calls on the record.",
  ),
  alternates: { canonical: `${site.url}/receipts` },
};

const chip = (on: boolean) =>
  `inline-flex min-h-11 items-center rounded-full border px-3 text-[13px] font-medium sm:min-h-9 ${on ? "border-ink bg-ink text-paper" : "border-rule bg-surface text-ink-soft hover:border-ink"}`;

export default async function ReceiptsPage({ searchParams }: { searchParams: Promise<{ sector?: string; type?: string }> }) {
  const { sector, type } = await searchParams;
  const all = visibleReceipts();
  const sectors = [...new Set(all.map((r) => r.sector))];
  const shown = all.filter((r) => (!sector || r.sector === sector) && (!type || r.type === type));
  const href = (q: { sector?: string; type?: string }) => {
    const p = new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][]);
    return p.size ? `/receipts?${p}` : "/receipts";
  };

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Today" }, { label: "Receipts" }]}
      kicker="Receipts"
      title="One money event a day, with the receipt"
      lede={
        <>
          The figures from the source, our verdict labelled as opinion, and dated calls that go on{" "}
          <Link href="/record" className="underline underline-offset-2">
            our record
          </Link>
          . Information, not advice.
        </>
      }
    >
      {sectors.length > 1 || all.some((r) => r.type === "data") ? (
        <nav aria-label="Filter Receipts" className="mb-6 flex flex-wrap gap-2">
          <Link href={href({ type })} className={chip(!sector)}>
            All sectors
          </Link>
          {sectors.map((s) => (
            <Link key={s} href={href({ sector: s, type })} className={chip(sector === s)}>
              {sectorNames[s] ?? s}
            </Link>
          ))}
          <span aria-hidden="true" className="mx-1 w-px self-stretch bg-rule" />
          <Link href={href({ sector, type: type === "verdict" ? undefined : "verdict" })} className={chip(type === "verdict")}>
            Verdicts
          </Link>
          <Link href={href({ sector, type: type === "data" ? undefined : "data" })} className={chip(type === "data")}>
            Data Receipts
          </Link>
        </nav>
      ) : null}
      <ReceiptList receipts={shown} empty="The first Receipts are being checked against their source documents. They appear here once every figure has passed." />
      <p className="mt-8 text-[14px] text-ink-soft">
        Briefs, weekly notes and explainers are in{" "}
        <Link href="/stories" className="font-semibold text-forest underline underline-offset-2">
          Stories
        </Link>
        .
      </p>
    </PageShell>
  );
}
