import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import type { LearnLang } from "./learn-ui";

export { isLearnLang, langMeta, learnLangs, ui, type LearnLang } from "./learn-ui";

/**
 * Learn, in African languages. Lessons live in content/learn/<lang>/<slug>.md with light frontmatter
 * (title, summary, minutes, order, en: the English lesson's slug, sources[], asOf). Interface text is in
 * lib/learn-ui.ts. Arabic is right-to-left.
 */

export type LearnLesson = {
  lang: LearnLang;
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  en: string;
  asOf: string;
  sources: { name: string; url: string; date: string }[];
  body: string;
};

const ROOT = path.join(process.cwd(), "content", "learn");

export const loadLessons = cache((lang: LearnLang): LearnLesson[] => {
  const dir = path.join(ROOT, lang);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      if (!data.title || !data.summary || !Array.isArray(data.sources) || !data.sources.length) throw new Error(`Missing frontmatter in content/learn/${lang}/${f}`);
      return {
        lang,
        slug: f.replace(/\.md$/, ""),
        title: data.title,
        summary: data.summary,
        minutes: data.minutes ?? 3,
        en: data.en,
        asOf: data.asOf,
        sources: data.sources,
        body: content,
        order: data.order ?? 99,
      } as LearnLesson & { order: number };
    })
    .sort((a, b) => a.order - b.order);
});

export function getLesson(lang: LearnLang, slug: string) {
  return loadLessons(lang).find((l) => l.slug === slug) ?? null;
}

