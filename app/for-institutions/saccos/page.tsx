import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { priceText, rateItem } from "@/lib/billing/ratecard";
import { SACCO_WIDGET_HEIGHT, SAMPLE_SLUG, saccoIframe, saccoScript, widgetSaccos } from "@/lib/embeds-sacco";
import { kindLabels } from "@/lib/registry";
import { fitDescription } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "For SACCOs: the Watch pack and member widget",
  description: fitDescription(
    "A private quarterly pack for a SACCO's board: its SASRA figures beside its tier and SASRA's standards, the sector and where surplus funds earn. And a free widget with its own SASRA figures for members.",
  ),
  alternates: { canonical: `${site.url}/for-institutions/saccos` },
};

/**
 * The SACCO sales page (docs/rebuild/upgrade-U5-plan.md §4). Names no SACCO and makes no claim about any: the demo pack
 * and demo widget describe a SACCO that does not exist (the large-tier median). The price line is read from the rate
 * card, so it never disagrees with /prices; nothing here sets a price.
 */
export default async function SaccosPage({ searchParams }: { searchParams: Promise<{ sacco?: string }> }) {
  const { sacco } = await searchParams;
  const saccos = widgetSaccos().filter((s) => s.status !== "revoked" && s.status !== "expired");
  const chosen = saccos.find((s) => s.slug === sacco) ?? null;
  const slug = chosen?.slug ?? SAMPLE_SLUG;
  const pack = rateItem("pack_plus");
  const link = "font-semibold text-forest underline underline-offset-2";
  const button = "inline-flex min-h-11 items-center rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-paper hover:bg-forest";

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/for-institutions", label: "For institutions" }, { label: "SACCOs" }]}
      kicker="For SACCOs"
      title="Your SACCO beside its SASRA tier, for your board only"
      lede={
        <p>
          The Watch pack is a private quarterly pack for a SACCO&rsquo;s board and management, built only from what SASRA and the Central Bank
          publish. The member widget puts the figures SASRA published for your SACCO on your own site, with the source and date.
        </p>
      }
      aside={
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
          <p className="text-[14px] font-semibold text-ink">See it first</p>
          <p className="mt-1 text-[13px] leading-5 text-ink-soft">The demo pack is the real layout with real SASRA figures, for a demo SACCO that does not exist.</p>
          <a href="/watch/sample" target="_blank" rel="noopener" className={`mt-4 ${button}`}>
            Open the demo pack
          </a>
        </div>
      }
    >
      <section>
        <SectionTitle kicker="For the board" title="What is in the Watch pack" />
        <div className="mt-4 grid gap-8 lg:grid-cols-12">
          <ol className="list-decimal space-y-3 pl-5 text-[15px] leading-7 text-ink-soft lg:col-span-7">
            <li>
              <strong className="text-ink">Your SACCO at a glance.</strong> Total assets, deposits, loans and income from SASRA&rsquo;s annual report,
              each with its change on the year, beside the median and the middle half of your SASRA tier.
            </li>
            <li>
              <strong className="text-ink">Soundness beside SASRA&rsquo;s standards.</strong> Each ratio as SASRA published it, beside the level
              SASRA prescribes and the tier median, with no verdict. This page goes only to your board.
            </li>
            <li>
              <strong className="text-ink">Deposit-taking SACCOs this quarter.</strong> SASRA&rsquo;s latest quarterly totals for the sector, against a
              year before.
            </li>
            <li>
              <strong className="text-ink">Where surplus funds earn.</strong> Treasury bills, bonds and money market funds after withholding tax, and
              our published ranges for the next auction with their record.
            </li>
            <li>
              <strong className="text-ink">From the casebook.</strong> Past failures, and the question each leaves a board, once signed off.
            </li>
          </ol>
          <div className="space-y-3 text-[14px] leading-6 text-ink-soft lg:col-span-5">
            <p>
              <strong className="text-ink">Delivery.</strong> A private link for your named contacts, valid for 120 days and withdrawable at any
              time, and a PDF for the board papers.
            </p>
            <p>
              <strong className="text-ink">Refresh.</strong> Your SACCO&rsquo;s figures change once a year, when SASRA publishes its annual report
              (about nine months after year-end); the sector and market pages change every quarter. The pack says which is which.
            </p>
            <p>
              <strong className="text-ink">Privacy.</strong> Nothing in your pack is published. In public we show only the regulator&rsquo;s figures,
              with no grade, score or rank. <Link href="/method/peer-comparison" className={link}>How the comparison is worked out</Link>.
            </p>
            <p>
              <a href="/documents/watch-pack-sample.pdf" target="_blank" rel="noopener" className={link}>
                Download the demo pack (PDF)
              </a>
            </p>
          </div>
        </div>
        {pack ? (
          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3 rounded-2xl border border-rule bg-surface px-5 py-4">
            <p className="max-w-2xl text-[14px] leading-6 text-ink-soft">
              <strong className="text-ink">Included in {pack.name}</strong> for SACCO subscribers, with the monthly committee pack, an email the day
              each Kenya auction lands and the Morning note for five named people.
            </p>
            <p className="text-[14px] text-ink-soft">
              <strong className="text-ink">{priceText(pack)}</strong> {pack.unit}.{" "}
              <Link href="/prices" className={link}>
                Price guide
              </Link>
            </p>
          </div>
        ) : null}
      </section>

      <section className="mt-14" id="widget">
        <SectionTitle kicker="For your members" title="Your SASRA figures on your own site" />
        <div className="mt-4 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-[15px] leading-7 text-ink-soft">
              Your licence status and the figures SASRA published for your SACCO, with the change on the year, the source page and the date. Nothing
              else: no ratio against a minimum, no comparison with other SACCOs, no grade. It updates itself when SASRA publishes a new report.
              Free, with &ldquo;Data: Afronomics&rdquo; kept.
            </p>
            <form action="/for-institutions/saccos#widget" className="mt-5 flex flex-wrap items-end gap-3">
              <label className="flex min-w-0 flex-1 flex-col gap-1 text-[14px]">
                <span className="text-[12px] font-semibold text-muted">Your SACCO</span>
                <select name="sacco" defaultValue={chosen?.slug ?? ""} className="min-h-11 w-full min-w-0 rounded-lg border border-rule bg-surface px-3 text-ink">
                  <option value="">The demo SACCO</option>
                  {saccos.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name} ({kindLabels[s.kind]})
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="min-h-11 rounded-lg border border-forest px-4 font-semibold text-forest hover:bg-forest hover:text-paper">
                Show the code
              </button>
            </form>
            <p className="mt-5 text-[12px] font-semibold text-muted">One line of HTML</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all border border-rule bg-paper-2 p-3 font-mono text-[11px] leading-5 text-ink">{saccoIframe(slug)}</pre>
            <p className="mt-4 text-[12px] font-semibold text-muted">Or a script that sizes the box to fit</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all border border-rule bg-paper-2 p-3 font-mono text-[11px] leading-5 text-ink">{saccoScript(slug)}</pre>
            <p className="mt-3 text-[13px] text-muted">
              Add <code className="font-mono">?theme=dark</code> or <code className="font-mono">?theme=light</code> to the frame address to fix the
              colours. Can&rsquo;t find your SACCO? It is listed as SASRA lists it in the <Link href="/registry" className={link}>registry</Link>.
            </p>
          </div>
          <div className="lg:col-span-6">
            <iframe
              key={slug}
              src={`/embed/sacco/${slug}`}
              width="100%"
              height={SACCO_WIDGET_HEIGHT}
              style={{ border: 0, maxWidth: 420 }}
              loading="lazy"
              title={chosen ? `${chosen.name}: published figures` : "Demo SACCO widget"}
            />
          </div>
        </div>
      </section>

      <section className="mt-14">
        <SectionTitle kicker="Getting started" title="From first look to your board pack" />
        <ol className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-3">
          <li className="bg-surface px-5 py-5">
            <p className="text-[13px] font-semibold text-gold">1. Ask for a pilot pack</p>
            <p className="mt-2 text-sm leading-6 text-ink-soft">Tell us your SACCO below. The desk replies within one business day; your pilot pack comes on a private link.</p>
          </li>
          <li className="bg-surface px-5 py-5">
            <p className="text-[13px] font-semibold text-gold">2. Table it</p>
            <p className="mt-2 text-sm leading-6 text-ink-soft">Use it at the next board or committee meeting. Every figure carries its source and date.</p>
          </li>
          <li className="bg-surface px-5 py-5">
            <p className="text-[13px] font-semibold text-gold">3. Subscribe</p>
            <p className="mt-2 text-sm leading-6 text-ink-soft">The pack comes each quarter with {pack ? pack.name : "the committee pack"}; the member widget is free.</p>
          </li>
        </ol>
        <p className="mt-4 text-[14px] leading-6 text-ink-soft">
          Want the rates data itself first? Start the{" "}
          <Link href="/pricing?from=sacco-watch#pilot" className={link}>
            free 30-day data pilot
          </Link>
          .
        </p>
      </section>

      <section className="mt-14 max-w-2xl" id="enquiry">
        <SectionTitle kicker="Talk to the desk" title="Ask for your SACCO's pilot pack" />
        <div className="mt-4">
          <EnquiryForm interest="pack" cta="Ask for a pilot pack" />
        </div>
        <p className="mt-6 text-[13px] text-muted">Information, not advice. Figures are SASRA&rsquo;s and the Central Bank of Kenya&rsquo;s, as published.</p>
      </section>
    </PageShell>
  );
}
