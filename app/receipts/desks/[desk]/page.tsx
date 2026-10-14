import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/data/PageShell";
import { ReceiptList } from "@/components/receipts/ReceiptList";
import { desks, visibleReceipts, type DeskSlug } from "@/lib/receipts";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(desks).map((desk) => ({ desk }));
}

export async function generateMetadata({ params }: { params: Promise<{ desk: string }> }): Promise<Metadata> {
  const d = desks[(await params).desk as DeskSlug];
  if (!d) return {};
  return { title: `${d.name}: its Receipts and calls`, alternates: { canonical: `${site.url}/receipts/desks/${(await params).desk}` } };
}

export default async function DeskPage({ params }: { params: Promise<{ desk: string }> }) {
  const slug = (await params).desk as DeskSlug;
  const d = desks[slug];
  if (!d) notFound();
  const list = visibleReceipts().filter((r) => r.desk === d.name);
  const calls = list.reduce((n, r) => n + r.calls.length, 0);
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Today" }, { href: "/receipts", label: "Receipts" }, { label: d.name }]}
      kicker="A desk"
      title={d.name}
      lede={
        <>
          Covers {d.covers}. This desk is a research and writing agent working under the{" "}
          <Link href="/method" className="underline underline-offset-2">
            house rules
          </Link>
          , not a person. Afronomics Feed, as publisher, is accountable for everything it publishes.
        </>
      }
    >
      <p className="tabular mb-6 text-[14px] text-ink-soft">
        {list.length} Receipt{list.length === 1 ? "" : "s"} · {calls} call{calls === 1 ? "" : "s"} on{" "}
        <Link href="/record" className="underline underline-offset-2">
          the record
        </Link>
      </p>
      <ReceiptList receipts={list} empty="No Receipts from this desk yet." />
    </PageShell>
  );
}
