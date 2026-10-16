import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { BarChart } from "@/components/charts/BarChart";
import { ChartFrame } from "@/components/charts/ChartFrame";
import { PageShell } from "@/components/data/PageShell";
import { StatTile } from "@/components/data/StatTile";
import { EvidenceTag } from "@/components/evidence/EvidenceTag";
import { rpc } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

/**
 * The living reference for design system v2 (docs/rebuild/phase-7-plan.md, 7a): the type scale, the colour tokens and
 * the parts every page is built from, rendered by the same components the site uses. Behind the desk key. The figures
 * below are specimens to show the parts, labelled as such, and are never shown to readers.
 */

const TOKENS = ["paper", "surface", "ink", "ink-soft", "muted", "rule", "forest", "brand-accent", "up", "down", "warn", "chart-quiet", "facts", "analysis", "opinion"];
const SPECIMEN = { source: "Specimen source", href: "https://www.afronomicsfeed.com/method", asOf: "2026-10-14" };

export default async function DesignPage() {
  const key = (await cookies()).get("af_desk")?.value ?? "";
  const check = key ? await rpc("af_desk", { p_secret: key }) : null;
  if (!check?.ok || check.value == null) notFound();

  return (
    <PageShell share={false} crumbs={[{ href: "/desk", label: "Desk" }, { label: "Design system" }]} kicker="Private" title="Design system v2">
      <p className="max-w-2xl text-[15px] leading-7 text-ink-soft">
        Every page is built from these parts. Sizes come from the scale, never set by hand; colour carries meaning only (rise, fall, warning, the one
        highlight). The figures here are specimens.
      </p>

      <section className="mt-8">
        <h2 className="t-h2 text-ink">Type scale</h2>
        <div className="mt-4 space-y-3 rounded-2xl border border-rule bg-surface px-5 py-5">
          <p className="t-display text-ink">t-display: Receipt headlines</p>
          <p className="t-h1 text-ink">t-h1: page titles</p>
          <p className="t-h2 text-ink">t-h2: section headings</p>
          <p className="t-h3 text-ink">t-h3: chart titles and card headings</p>
          <p className="t-label text-muted">t-label: kickers and meta lines</p>
          <p className="text-[1.0625rem] leading-7 text-ink">Body: 17px on 28px, Archivo with tabular figures where numbers line up.</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="t-h2 text-ink">Colour tokens</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {TOKENS.map((t) => (
            <li key={t} className="rounded-xl border border-rule bg-surface p-3">
              <span className="block h-10 rounded-md border border-rule" style={{ background: `var(--${t})` }} />
              <code className="mt-2 block text-[12px] text-ink-soft">--{t}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="t-h2 text-ink">Stat tile</h2>
          <div className="mt-4 grid gap-3">
            <StatTile label="Specimen rate" value="8.76%" change="−1 bps on the last auction" direction="down" trend={[9.1, 9.0, 8.95, 8.9, 8.86, 8.8, 8.78, 8.77, 8.76]} evidence={SPECIMEN} />
            <StatTile label="Specimen level" value="8.75%" change="set 7 Oct" evidence={SPECIMEN} />
          </div>
        </div>
        <div>
          <h2 className="t-h2 text-ink">Chart</h2>
          <div className="mt-4">
            <ChartFrame title="The title states the finding, not the topic" unit="Unit in the subtitle, %" evidence={SPECIMEN}>
              <BarChart
                data={[
                  { label: "A", value: 40 },
                  { label: "B", value: 120 },
                  { label: "C", value: 90 },
                ]}
                unit="%"
                highlight={["B"]}
                reference={{ value: 100, label: "A reference line" }}
                label="Specimen chart"
                format={(v) => `${v}%`}
              />
            </ChartFrame>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="t-h2 text-ink">Evidence tag and labels</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-rule bg-surface px-5 py-5">
          <EvidenceTag {...SPECIMEN} />
          <EvidenceTag {...SPECIMEN} dateKind="value" />
          <span className="label-chip text-facts">Facts</span>
          <span className="label-chip text-analysis">Analysis</span>
          <span className="label-chip text-opinion">Opinion</span>
        </div>
      </section>
    </PageShell>
  );
}
