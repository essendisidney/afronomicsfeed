import type { Metadata } from "next";
import Link from "next/link";
import { BidChecker } from "@/components/data/BidChecker";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Questions } from "@/components/seo/Questions";
import { FollowUp } from "@/components/ui/FollowUp";
import { latestAuctions, nextAuction, outlook } from "@/lib/data/auction-intel";
import { loadTbills, tenorLabel } from "@/lib/data/kenya-tbills";
import { publishedFor } from "@/lib/ledger";
import { site } from "@/lib/site";
import { fitDescription, fitTitle, withSocial } from "@/lib/seo";

const dateFmt = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const short = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const d = (iso: string, f = dateFmt) => f.format(new Date(`${iso}T00:00:00Z`));
const pct = (n: number) => `${n.toFixed(2)}%`;

export function generateMetadata(): Metadata {
  const next = nextAuction();
  const title = "Kenya T-bill auction: likely rates and “did my bid win?”";
  const description = `Before Kenya's next Treasury bill auction${next ? ` (bids close ${d(next.bidsClose, short)})` : ""}: the likely range for each bill's rate, tested on every auction since 2011. After it: did your bid win, and what does the bill pay after tax?`;
  return withSocial({ title: fitTitle(title), description: fitDescription(description), alternates: { canonical: `${site.url}/markets/kenya-tbills/auction` } }, "/markets/kenya-tbills/auction");
}

export default function AuctionPage() {
  const file = loadTbills();
  const next = nextAuction(file.rows);
  // Once a range is in the forecast ledger, show exactly what was published there, not a fresh calculation.
  const published = next ? publishedFor(next.valueDate) : new Map();
  const views = outlook(file.rows).map((v) => {
    const p = published.get(v.tenor);
    return p ? { ...v, low: p.low, high: p.high, writtenAt: p.written_at as string } : { ...v, writtenAt: null as string | null };
  });
  const writtenAt = views.find((v) => v.writtenAt)?.writtenAt ?? null;
  const latest = latestAuctions(file.rows);
  const last = file.rows[0]?.value_date;
  const tested = views.reduce((n, v) => n + v.trackRecord.tested, 0);
  const missShare = tested ? Math.round((1 - views.reduce((n, v) => n + v.trackRecord.inside, 0) / tested) * 10) : null;
  const items = [
    ...(next
      ? [{ q: "When is the next Kenya Treasury bill auction?", a: `Bids for the next auction close at 2 p.m. on ${d(next.bidsClose)}, through DhowCSD or Treasury Mobile Direct, for bills dated ${d(next.valueDate)}. The CBK auctions 91-, 182- and 364-day bills every week.` }]
      : []),
    ...views.map((v) => ({
      q: `What rate will the ${tenorLabel[v.tenor]} T-bill pay at the next auction?`,
      a: `No one knows until the CBK sets it. The last auction (${d(v.last.value_date, short)}) accepted an average of ${pct(v.last.weighted_avg_rate)}. From the last 26 weekly moves, the next average is likely between ${pct(v.low)} and ${pct(v.high)}; ranges built this way held the actual rate ${Math.round((v.trackRecord.inside / v.trackRecord.tested) * 100)}% of the time since 2011.`,
    })),
    {
      q: "How do I know if my T-bill bid was accepted?",
      a: "The CBK publishes the average rate of accepted bids, not the cut-off. A competitive bid at or below the average was accepted; above it, it depends on the cut-off, which only your DhowCSD account shows. Non-competitive bids are issued at the average.",
    },
  ];

  return (
    <PageShell
      share={{ path: "/markets/kenya-tbills/auction", campaign: "tool" }}
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets", label: "Markets" }, { href: "/markets/kenya-tbills", label: "Kenya T-bills" }, { label: "Auction" }]}
      kicker="Auction intelligence · Kenya"
      title="Before and after Kenya’s T-bill auction"
      lede={
        <p>
          The likely rate for each bill before you bid, and whether your bid won after the result, from every auction the Central Bank of Kenya has
          published since 2011. Information, not advice: the CBK sets the rates on the day.
        </p>
      }
    >
      {next ? (
        <section className="rounded-2xl border border-accent/40 bg-surface px-5 py-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">Next auction</p>
          <p className="mt-2 font-serif text-2xl text-ink">Bids close 2 p.m., {d(next.bidsClose)}</p>
          <p className="mt-1 text-[14px] text-ink-soft">
            For bills dated {d(next.valueDate)}. Bid through DhowCSD or Treasury Mobile Direct. Minimum KES 50,000 non-competitive, KES 2 million competitive.
            The CBK confirms the date and amounts in each week’s notice.
          </p>
        </section>
      ) : null}

      <section className="mt-10">
        <SectionTitle kicker="Before you bid" title="Likely range for the next average rate" note="From the last 26 weekly moves: the 10th to 90th percentile added to the latest rate. A range, not a prediction." />
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill</th>
                <th className="text-right">Last auction</th>
                <th className="text-right">Likely next</th>
                <th className="hidden text-right sm:table-cell">Typical weekly move</th>
                <th className="text-right">Tested since 2011</th>
              </tr>
            </thead>
            <tbody>
              {views.map((v) => (
                <tr key={v.tenor}>
                  <td className="font-medium text-ink">{tenorLabel[v.tenor]}</td>
                  <td className="text-right">
                    <span className="font-semibold">{pct(v.last.weighted_avg_rate)}</span>
                    <span className="block text-[11px] text-muted">{d(v.last.value_date, short)}</span>
                  </td>
                  <td className="text-right font-semibold">
                    {pct(v.low)} – {pct(v.high)}
                  </td>
                  <td className="hidden text-right sm:table-cell">{v.typicalMove.toFixed(2)} pts</td>
                  <td className="text-right">
                    {Math.round((v.trackRecord.inside / v.trackRecord.tested) * 100)}%
                    <span className="block text-[11px] text-muted">of {v.trackRecord.tested.toLocaleString("en-US")} auctions</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {writtenAt ? (
          <p className="mt-3 text-[13px] text-ink-soft">
            These ranges were written to the public forecast ledger on {writtenAt.replace("T", " ").slice(0, 16)} UTC, before bids close, and will be graded
            against the CBK result.{" "}
            <Link href="/record" className="font-semibold text-forest underline underline-offset-2">
              Our record →
            </Link>
          </p>
        ) : null}
        <p className="mt-2 text-[12px] text-muted">
          Tested since 2011: how often a range built this way would have held the rate the CBK then accepted, if it had been drawn before each
          auction. A range this wide aims for about 8 in 10.{" "}
          {missShare != null ? `About ${missShare} in ten auctions land outside it, so treat it as a guide, not a promise.` : null}
        </p>
      </section>

      <section className="mt-12">
        <SectionTitle kicker="After the result" title="Did my bid win?" note={last ? `Checked against the auction of ${d(last, short)}, the latest the CBK has published.` : undefined} />
        <div className="mt-4">
          <BidChecker auctions={latest} />
        </div>
      </section>

      <FollowUp heading="Get Thursday’s result the minute it’s out" />

      <p className="mt-10 text-sm text-ink-soft">
        Source: Central Bank of Kenya Treasury bill result notices; every auction is in{" "}
        <Link href="/markets/kenya-tbills" className="underline underline-offset-2">
          the full history
        </Link>
        . <em>Information, not advice.</em>
      </p>

      <Questions items={items} />
    </PageShell>
  );
}
