import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/data/PageShell";
import { MarkdownBody } from "@/components/ui/MarkdownBody";
import { getLesson, isLearnLang, langMeta, learnLangs, loadLessons, ui } from "@/lib/learn-i18n";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return learnLangs.flatMap((lang) => loadLessons(lang).map((l) => ({ lang, slug: l.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLearnLang(lang)) return {};
  const lesson = getLesson(lang, slug);
  if (!lesson) return {};
  return {
    title: lesson.title,
    description: lesson.summary,
    alternates: { canonical: `${site.url}/learn/${lang}/${slug}`, languages: lesson.en ? { en: `${site.url}/explainers/${lesson.en}` } : undefined },
  };
}

const dateFmt = (lang: string) => new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function LearnLessonPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLearnLang(lang)) notFound();
  const lesson = getLesson(lang, slug);
  if (!lesson) notFound();
  const t = ui[lang];

  return (
    <div lang={lang} dir={langMeta[lang].dir} className="overflow-x-clip">
      <PageShell
        crumbs={[{ href: "/learn", label: "Learn" }, { href: `/learn/${lang}`, label: langMeta[lang].native }, { label: lesson.title }]}
        kicker={`${t.kicker} · ${t.minutes(lesson.minutes)}`}
        title={lesson.title}
        lede={<p>{lesson.summary}</p>}
      >
        <div className="max-w-3xl">
          <MarkdownBody content={lesson.body} />
          <p className="mt-8 text-sm italic text-muted">{t.notAdvice}</p>
          <section className="mt-10 border-t border-rule pt-6 text-sm">
            <h2 className="font-semibold text-ink">{t.sources}</h2>
            <ul className="mt-2 space-y-1">
              {lesson.sources.map((s) => (
                <li key={s.url + s.name}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-2">
                    {s.name}
                  </a>{" "}
                  <span className="text-muted">· {s.date}</span>
                </li>
              ))}
            </ul>
            {lesson.asOf ? (
              <p className="mt-2 text-muted">
                {t.asOf} {dateFmt(lang).format(new Date(lesson.asOf))}
              </p>
            ) : null}
          </section>
          <p className="mt-8 flex flex-wrap gap-4 text-[14px] font-medium">
            <Link href={`/learn/${lang}`} className="text-forest hover:text-gold">
              {t.back}
            </Link>
            {lesson.en ? (
              <Link href={`/explainers/${lesson.en}`} lang="en" className="text-forest hover:text-gold">
                {t.english}
              </Link>
            ) : null}
          </p>
        </div>
      </PageShell>
    </div>
  );
}
