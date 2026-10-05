import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { LoanCalculator } from "@/components/learn/LoanCalculator";
import { SavingsCalculator } from "@/components/learn/SavingsCalculator";
import { isLearnLang, langMeta, learnLangs, loadLessons, ui } from "@/lib/learn-i18n";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return learnLangs.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLearnLang(lang)) return {};
  return {
    title: ui[lang].title,
    description: ui[lang].lede,
    alternates: {
      canonical: `${site.url}/learn/${lang}`,
      languages: { en: `${site.url}/learn`, ...Object.fromEntries(learnLangs.map((l) => [l, `${site.url}/learn/${l}`])) },
    },
  };
}

export default async function LearnLangPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLearnLang(lang)) notFound();
  const t = ui[lang];
  const lessons = loadLessons(lang);
  const dir = langMeta[lang].dir;

  return (
    <div lang={lang} dir={dir} className="overflow-x-clip">
      <PageShell crumbs={[{ href: "/", label: "Afronomics" }, { href: "/learn", label: "Learn" }, { label: langMeta[lang].native }]} kicker={t.kicker} title={t.title} lede={<p>{t.lede}</p>}>
        <nav aria-label={t.otherLangs} className="mb-8 flex flex-wrap gap-2 text-[14px]">
          <Link href="/learn" lang="en" dir="ltr" className="rounded-full border border-rule px-3 py-1 hover:border-gold">
            English
          </Link>
          {learnLangs.map((l) => (
            <Link key={l} href={`/learn/${l}`} lang={l} className={`rounded-full border px-3 py-1 ${l === lang ? "border-forest text-forest" : "border-rule hover:border-gold"}`}>
              {langMeta[l].native}
            </Link>
          ))}
        </nav>

        <section>
          <SectionTitle kicker={t.lessons} title={t.lessons} />
          <ol className="mt-4 grid gap-4 sm:grid-cols-2">
            {lessons.map((l, i) => (
              <li key={l.slug} className="rounded-2xl border border-rule bg-surface px-5 py-4">
                <p className="text-[12px] text-muted">
                  {i + 1} · {t.minutes(l.minutes)}
                </p>
                <Link href={`/learn/${lang}/${l.slug}`} className="mt-1 block text-[17px] font-semibold leading-snug text-ink hover:text-forest">
                  {l.title}
                </Link>
                <p className="mt-1 text-[14px] leading-6 text-ink-soft">{l.summary}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="savings-calculator" className="mt-14 scroll-mt-24">
          <SectionTitle kicker={t.tryIt} title={t.savingsTitle} note={t.savingsNote} />
          <div className="mt-4">
            <SavingsCalculator presets={[]} lang={lang} />
          </div>
        </section>

        <section id="loan-calculator" className="mt-14 scroll-mt-24">
          <SectionTitle kicker={t.tryIt} title={t.loanTitle} note={t.loanNote} />
          <div className="mt-4">
            <LoanCalculator bankAverage={null} lang={lang} />
          </div>
        </section>

        <section id="glossary" className="mt-14 scroll-mt-24">
          <SectionTitle kicker={t.glossary} title={t.glossary} />
          <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {t.terms.map((g) => (
              <div key={g.term} className="border-b border-rule pb-3">
                <dt className="text-[15px] font-semibold text-ink">{g.term}</dt>
                <dd className="mt-1 text-[14px] leading-6 text-ink-soft">{g.means}</dd>
              </div>
            ))}
          </dl>
        </section>
      </PageShell>
    </div>
  );
}
