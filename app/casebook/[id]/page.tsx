import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseView } from "@/components/casebook/CaseView";
import { PageShell } from "@/components/data/PageShell";
import { getCase, isPublic, visibleCases } from "@/lib/cases";
import { fitDescription } from "@/lib/seo";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return visibleCases().map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = getCase((await params).id);
  if (!c) return {};
  return {
    title: `${c.title} (${c.id})`,
    description: fitDescription(c.summary),
    alternates: { canonical: `${site.url}/casebook/${c.id}` },
    robots: isPublic(c) ? undefined : { index: false, follow: false },
  };
}

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const c = getCase((await params).id);
  if (!c) notFound();
  return (
    <PageShell crumbs={[{ href: "/", label: "Today" }, { href: "/casebook", label: "Casebook" }, { label: c.id }]} kicker={`Case ${c.id}`} title={c.title} lede={c.summary}>
      <CaseView c={c} />
    </PageShell>
  );
}
