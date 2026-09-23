import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";

export const metadata: Metadata = {
  title: "Editorial",
  description: "Afronomics editorial environment. CMS is not connected; filesystem Markdown remains the Kenya desk.",
};

const roles = ["Admin", "Editor", "Analyst", "Contributor"] as const;

export default function AdminPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Editorial" }]}
      kicker="Editorial"
      title="The CMS is not live"
      lede="Kenya desk pieces still ship as Markdown in /content. When the admin exists, editors will schedule, tag entities, attach sources and feature stories — with audit logs."
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Roles on the schema</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {roles.map((role) => (
          <li key={role} className="border border-rule px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em]">
            {role}
          </li>
        ))}
      </ul>
      <ul className="mt-8 list-disc space-y-2 pl-5 text-sm text-ink-soft">
        <li>Create / edit / schedule articles</li>
        <li>Attach sources and tag countries, sectors, entities</li>
        <li>Draft signals and charts</li>
        <li>Feature homepage stories and assemble briefs</li>
      </ul>
      <p className="mt-6 text-sm">
        Ops board:{" "}
        <Link href="/ingestion" className="text-forest underline underline-offset-2">
          /ingestion
        </Link>
        . Source registry:{" "}
        <Link href="/sources" className="text-forest underline underline-offset-2">
          /sources
        </Link>
        .
      </p>
      <p className="mt-4 text-sm text-muted">Audit log: empty. No client write path is exposed.</p>
    </LayerPage>
  );
}
