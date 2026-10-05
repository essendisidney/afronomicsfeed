import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { LoanCalculator } from "@/components/learn/LoanCalculator";
import { SavingsCalculator } from "@/components/learn/SavingsCalculator";
import { getArticle } from "@/lib/content";
import { fairBench } from "@/lib/data/kenya-rates";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Learn money: saving, borrowing, rates and currencies, explained",
  description:
    "Short, plain-language lessons on Treasury bills, money market funds, the real cost of a loan, compound interest, inflation, exchange rates and the Central Bank Rate — each linked to today’s real figures, with savings and loan calculators and a glossary in English and Kiswahili.",
  alternates: { canonical: `${site.url}/learn` },
};

const tracks: { title: string; note: string; lessons: string[] }[] = [
  { title: "Saving", note: "Making what you put aside work harder", lessons: ["learn-compound-interest", "learn-money-market-funds", "learn-treasury-bills"] },
  { title: "Borrowing", note: "Knowing what a loan really costs", lessons: ["learn-loan-real-cost"] },
  { title: "How the economy reaches your pocket", note: "Rates, prices and your currency", lessons: ["learn-central-bank-rate", "learn-inflation-real-return", "learn-exchange-rates", "learn-africa-rates"] },
  { title: "For professionals", note: "Field guides for desks and treasuries", lessons: ["who-sets-what-kenya-money-markets", "sasra-ira-and-the-nonbank-perimeter"] },
];

const glossary: { en: string; sw: string; means: string; href?: string }[] = [
  { en: "Interest", sw: "Riba", means: "What a lender charges, or a saver earns, for the use of money, usually as a percentage a year." },
  { en: "Savings", sw: "Akiba", means: "Money set aside rather than spent." },
  { en: "Loan", sw: "Mkopo", means: "Money borrowed that must be repaid, usually with interest and fees." },
  { en: "Compound interest", sw: "Riba mchanganyiko", means: "Earning interest on earlier interest as well as on what you put in.", href: "/explainers/learn-compound-interest" },
  { en: "Flat rate", sw: "Riba ya kiwango bapa", means: "Interest charged on the full amount borrowed for the whole term, even as you repay.", href: "/explainers/learn-loan-real-cost" },
  { en: "Reducing balance", sw: "Salio linalopungua", means: "Interest charged only on what you still owe; cheaper than the same flat rate.", href: "/explainers/learn-loan-real-cost" },
  { en: "Treasury bill", sw: "Hati ya hazina", means: "A loan to the government for 91, 182 or 364 days, bought below face value.", href: "/explainers/learn-treasury-bills" },
  { en: "Treasury bond", sw: "Hati fungani ya serikali", means: "A longer loan to the government, from one to thirty years, usually paying interest twice a year.", href: "/markets/kenya-bonds" },
  { en: "Money market fund", sw: "Mfuko wa soko la fedha", means: "A fund that pools savers’ money into short-term, lower-risk paper.", href: "/explainers/learn-money-market-funds" },
  { en: "Yield", sw: "Mapato", means: "What an investment earns, expressed as a percentage a year." },
  { en: "Withholding tax", sw: "Kodi ya zuio", means: "Tax taken from interest before you receive it; 15% on most interest for Kenyan residents." },
  { en: "Central Bank Rate", sw: "Riba ya Benki Kuu", means: "The policy rate set by the Central Bank of Kenya; other rates follow it.", href: "/explainers/learn-central-bank-rate" },
  { en: "Inflation", sw: "Mfumuko wa bei", means: "How fast prices rise, usually measured over a year.", href: "/explainers/learn-inflation-real-return" },
  { en: "Real return", sw: "Faida halisi", means: "What you earn after taking inflation away: whether your money buys more or less." },
  { en: "Exchange rate", sw: "Kiwango cha ubadilishaji fedha", means: "The price of one currency in another, such as shillings per dollar.", href: "/explainers/learn-exchange-rates" },
  { en: "Fee", sw: "Ada", means: "A charge on top of, or instead of, interest. Count it in the total you repay." },
  { en: "Security, collateral", sw: "Dhamana", means: "Something a lender can take if a loan is not repaid." },
  { en: "Budget", sw: "Bajeti", means: "A plan for what comes in and what goes out." },
];

export default function LearnPage() {
  const bench = fairBench();
  const presets = bench
    ? [
        { label: "Bank savings, after tax", rate: bench.savingsAvg * 0.85 },
        { label: "One-year bill, after tax", rate: bench.bill364Net },
        { label: "Best fund, after tax", rate: bench.bestFundNet },
      ]
    : [];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Learn" }]}
      kicker="Afronomics · Learn"
      title="Learn money, from the basics"
      lede={
        <p>
          Short lessons in plain words on saving, borrowing and how the economy reaches your pocket, wherever you are in Africa. The ideas are the
          same from Cairo to Cape Town; the worked examples use real figures from central banks across the continent, with Kenya’s in most detail
          for now. Each lesson takes three or four minutes. Then try it with your own money in the calculators, in any currency.
        </p>
      }
    >
      <section className="grid gap-6 lg:grid-cols-2">
        {tracks.map((track) => (
          <div key={track.title} className="rounded-2xl border border-rule bg-surface px-5 py-5">
            <p className="text-[13px] font-semibold text-forest">{track.note}</p>
            <h2 className="mt-1 font-serif text-2xl text-ink">{track.title}</h2>
            <ol className="mt-3 space-y-3">
              {track.lessons.flatMap((slug, i) => {
                const a = getArticle("explainer", slug);
                if (!a) return [];
                return [
                  <li key={slug} className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-paper-2 text-[12px] font-semibold text-ink-soft">{i + 1}</span>
                    <div>
                      <Link href={`/explainers/${slug}`} className="font-medium leading-snug text-ink hover:text-forest">
                        {a.title}
                      </Link>
                      <p className="text-[13px] leading-5 text-muted">
                        {a.minutes ? `${a.minutes} min · ` : ""}
                        {a.teaser[0]}
                      </p>
                    </div>
                  </li>,
                ];
              })}
            </ol>
          </div>
        ))}
      </section>

      <section id="savings-calculator" className="mt-14 scroll-mt-24">
        <SectionTitle kicker="Try it" title="How much will my savings grow?" note="Works in any currency. The quick rates are Kenya’s today, after tax; type your own country’s rate." />
        <div className="mt-4">
          <SavingsCalculator presets={presets} />
        </div>
      </section>

      <section id="loan-calculator" className="mt-14 scroll-mt-24">
        <SectionTitle kicker="Try it" title="What will this loan cost me?" note="Works in any currency: flat rate and reducing balance, side by side, for the same headline rate." />
        <div className="mt-4">
          <LoanCalculator bankAverage={bench?.lendingAvg ?? null} />
        </div>
      </section>

      <section id="glossary" className="mt-14 scroll-mt-24">
        <SectionTitle kicker="Words" title="Glossary, in English and Kiswahili" />
        <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {glossary.map((g) => (
            <div key={g.en} className="border-b border-rule pb-3">
              <dt className="text-[15px] font-semibold text-ink">
                {g.href ? (
                  <Link href={g.href} className="hover:text-forest">
                    {g.en}
                  </Link>
                ) : (
                  g.en
                )}{" "}
                <span className="font-normal text-muted">· {g.sw}</span>
              </dt>
              <dd className="mt-1 text-[14px] leading-6 text-ink-soft">{g.means}</dd>
            </div>
          ))}
        </dl>
      </section>

      <NewsletterBand />
    </PageShell>
  );
}
