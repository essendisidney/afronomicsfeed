import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CaseView } from "@/components/casebook/CaseView";
import { PageShell } from "@/components/data/PageShell";
import { getCase } from "@/lib/cases";
import { rpc } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Case draft", robots: { index: false, follow: false } };

/**
 * A case as it will look when published, drafts included, for the founder to check and sign off. Behind the desk
 * key (the af_desk cookie is scoped to /desk, so this page sits under it); anyone else gets a 404.
 */
export default async function DeskCasePage({ params }: { params: Promise<{ id: string }> }) {
  const key = (await cookies()).get("af_desk")?.value ?? "";
  const check = key ? await rpc("af_desk", { p_secret: key }) : null;
  if (!check?.ok || check.value == null) notFound();
  const c = getCase((await params).id, true);
  if (!c) notFound();
  return (
    <PageShell share={false} crumbs={[{ href: "/desk", label: "Desk" }, { label: c.id }]} kicker={`Case ${c.id}`} title={c.title} lede={c.summary}>
      <CaseView c={c} />
    </PageShell>
  );
}
