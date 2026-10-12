import { FairCheckForm } from "@/components/data/FairCheckForm";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Questions } from "@/components/seo/Questions";
import { ShareRow } from "@/components/ui/ShareRow";
import { COUNTRIES, MIN_FAIR, categoryLabel, townLabel, type FairCell, type FairKind } from "@/lib/fair-core";
import { rpc } from "@/lib/store";

const money = (code: string, n: number) => `${COUNTRIES.find((c) => c.code === code)?.symbol ?? ""}${Math.round(n).toLocaleString("en-US")}`;

async function cells(kind: FairKind): Promise<FairCell[]> {
  const r = await rpc("af_fair_report_summary", { p_secret: process.env.AF_CRON_SECRET ?? "", p_kind: kind });
  return r.ok && Array.isArray(r.value) ? (r.value as FairCell[]) : [];
}

/** "Is my salary fair?" / "Is my rent fair?": the form, then every published middle figure. */
export async function FairCheckPage({ kind }: { kind: FairKind }) {
  const all = await cells(kind);
  const published = all.filter((c) => c.median != null);
  const collecting = all.filter((c) => c.town !== "all").reduce((n, c) => n + c.n, 0);
  const what = kind === "pay" ? "salary" : "rent";
  const path = kind === "pay" ? "/pay-check" : "/rent-check";
  const title = kind === "pay" ? "Is my salary fair?" : "Is my rent fair?";
  const items =
    kind === "pay"
      ? [
          { q: "How do I know if my salary is fair in Kenya?", a: "Compare it with what people in the same job and town are paid. Report yours here, anonymously, and you will see the middle salary and the middle half of reports once at least five people in that job and town have reported." },
          { q: "Is this salary data from employers?", a: "No. Every figure comes from anonymous reports by readers: monthly salary before tax, by job and town. We publish only the median and middle range of at least five reports, never one person's figure, and drop figures far from the rest." },
        ]
      : [
          { q: "How do I know if my rent is fair?", a: "Compare it with what people pay for the same kind of home in the same town. Report yours here, anonymously, and you will see the middle rent and the middle half of reports once at least five people have reported for that home and town." },
          { q: "Where does this rent data come from?", a: "From anonymous reports by readers: monthly rent by kind of home and town. We publish only the median and middle range of at least five reports, never one person's figure, and drop figures far from the rest." },
        ];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/rates/kenya", label: "Money" }, { label: title }]}
      kicker={kind === "pay" ? "Pay check · from readers" : "Rent check · from readers"}
      title={title}
      lede={
        <p>
          Tell us your monthly {what}, anonymously, and see how it compares with people {kind === "pay" ? "doing the same job" : "renting the same kind of home"} in
          your town. Kenya, Nigeria, Ghana, Uganda, Tanzania and South Africa. We publish only the middle of at least {MIN_FAIR} reports, never one person’s figure.
        </p>
      }
    >
      <FairCheckForm kind={kind} />
      <div className="mt-4">
        <ShareRow text={`${title} Check yours anonymously against people in the same ${kind === "pay" ? "job" : "kind of home"} and town:`} path={path} />
      </div>

      <section className="mt-12">
        <SectionTitle
          kicker="What readers report"
          title={kind === "pay" ? "Middle monthly salaries, before tax" : "Middle monthly rents"}
          note={`Median and middle half of reports over the last 12 months; shown once ${MIN_FAIR} or more people have reported.`}
        />
        {published.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{kind === "pay" ? "Job" : "Home"}</th>
                  <th>Where</th>
                  <th className="text-right">Middle</th>
                  <th className="text-right">Middle half</th>
                  <th className="text-right">Reports</th>
                </tr>
              </thead>
              <tbody>
                {published.map((c) => (
                  <tr key={`${c.country}-${c.category}-${c.town}`}>
                    <td className="font-medium text-ink">{categoryLabel(kind, c.category)}</td>
                    <td>{townLabel(c.country, c.town)}</td>
                    <td className="text-right font-semibold">{money(c.country, c.median!)}</td>
                    <td className="text-right">
                      {money(c.country, c.low!)} – {money(c.country, c.high!)}
                    </td>
                    <td className="text-right">{c.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 max-w-2xl rounded-xl border border-rule bg-surface px-4 py-3 text-sm text-ink-soft">
            {collecting
              ? `${collecting} report${collecting === 1 ? "" : "s"} so far. No job and town has reached ${MIN_FAIR} yet, so nothing is published. Yours could be the one that does.`
              : `Collecting from today. The first figures appear once ${MIN_FAIR} people have reported the same ${kind === "pay" ? "job" : "kind of home"} in the same town.`}
          </p>
        )}
      </section>

      <p className="mt-10 text-sm text-ink-soft">
        Figures are what readers report, not official statistics, and are checked only for range. <em>Information, not advice.</em>
      </p>
      <Questions items={items} />
    </PageShell>
  );
}
