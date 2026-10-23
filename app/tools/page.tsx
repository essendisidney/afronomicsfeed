import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { ToolIcon } from "@/components/ui/ToolIcon";
import { fitDescription, withSocial } from "@/lib/seo";
import { site } from "@/lib/site";
import { toolGroups, tools } from "@/lib/tools";

const description =
  "Afronomics' free calculators and checkers in one place: T-bills, M-PESA and Fuliza charges, net salary, loan cost, IPOs, savings goals, inflation, fair rates, chamas and licensed lenders.";

export const metadata: Metadata = withSocial(
  {
    title: "Tools: money calculators and checkers",
    description: fitDescription(description),
    alternates: { canonical: `${site.url}/tools` },
  },
  "/tools",
);

/** The tools hub (redesign preview): every calculator and checker, grouped by the question a reader brings (lib/tools.ts). */
export default function ToolsPage() {
  return (
    <PageShell
      share={{ path: "/tools", campaign: "tools" }}
      crumbs={[{ href: "/", label: "Today" }, { label: "Tools" }]}
      kicker="Tools"
      title="Calculators and checkers, one question each"
      lede="Pick the question you have; each tool opens on its own page and is free to use. Information, not advice."
    >
      <div className="grid gap-8">
        {toolGroups.map((group) => {
          const items = tools.filter((t) => t.group === group);
          const id = group.toLowerCase().replace(/[^a-z]+/g, "-");
          return (
            <section key={group} aria-labelledby={id}>
              <h2 id={id} className="t-h2 flex items-center gap-3 border-b border-ink pb-2 text-ink">
                <ToolIcon group={group} className="h-9 w-9" />
                {group}
              </h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href} className="af-tool group flex h-full min-h-11 flex-col rounded-2xl border border-rule bg-surface px-4 py-3.5">
                      <span className="text-[15px] font-semibold leading-6 text-ink group-hover:text-forest">
                        {t.title} <span aria-hidden="true" className="text-sig-ink opacity-0 transition-opacity group-hover:opacity-100">→</span>
                      </span>
                      <span className="mt-0.5 text-[13.5px] leading-5 text-ink-soft">{t.answers}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
