import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/content";
import { countries } from "@/lib/data/countries";
import { pairSlug } from "@/lib/data/fx";
import { indicatorDefs } from "@/lib/data/indicators";
import { articleHref } from "@/lib/format";
import { site } from "@/lib/site";
import { institutions, topics } from "@/lib/taxonomy";
import { allTbillWeeks, bondDates } from "@/lib/data/auction-stories";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, changeFrequency: "hourly" | "daily" | "weekly" | "monthly", priority: number) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  const hubs = [
    page("/", "hourly", 1),
    page("/news", "hourly", 0.9),
    page("/markets", "hourly", 0.9),
    page("/markets/kenya-tbills", "daily", 0.9),
    page("/markets/kenya-bonds", "daily", 0.9),
    page("/markets/tbills", "daily", 0.9),
    page("/markets/tbills/nigeria", "daily", 0.8),
    page("/markets/tbills/ghana", "daily", 0.8),
    page("/economy", "daily", 0.8),
    page("/capital", "daily", 0.8),
    page("/climate", "daily", 0.8),
    page("/technology", "daily", 0.8),
    page("/trade", "daily", 0.8),
    page("/countries", "daily", 0.9),
    page("/data", "daily", 0.9),
    page("/signals", "daily", 0.7),
    page("/brief", "weekly", 0.7),
    page("/weekly", "daily", 0.8),
    page("/widgets", "monthly", 0.6),
    page("/licensing", "monthly", 0.6),
    page("/advertise", "monthly", 0.5),
    page("/explainers", "weekly", 0.5),
    page("/archive", "weekly", 0.4),
    page("/institutions", "monthly", 0.3),
    page("/topics", "monthly", 0.3),
    page("/about", "monthly", 0.5),
    page("/method", "monthly", 0.6),
    page("/pricing", "monthly", 0.5),
    page("/subscribe", "monthly", 0.5),
    page("/advisory", "monthly", 0.4),
    page("/contact", "monthly", 0.3),
    page("/corrections", "monthly", 0.3),
  ];

  const currencyCodes = [...new Set(countries.map((country) => country.currency))];

  return [
    ...hubs,
    ...countries.map((country) => page(`/countries/${country.slug}`, "daily", 0.8)),
    ...indicatorDefs.map((def) => page(`/data/${def.slug}`, "weekly", 0.7)),
    ...currencyCodes.map((code) => page(`/markets/currencies/${pairSlug(code)}`, "hourly", 0.6)),
    ...getAllArticles().map((article) => ({
      url: `${site.url}${articleHref(article.category, article.slug)}`,
      lastModified: new Date(`${article.date}T00:00:00+03:00`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...allTbillWeeks().map((week) => ({
      url: `${site.url}/markets/kenya-tbills/${week.date}`,
      lastModified: new Date(`${week.date}T12:00:00+03:00`),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    ...bondDates().map((date) => ({
      url: `${site.url}/markets/kenya-bonds/${date}`,
      lastModified: new Date(`${date}T12:00:00+03:00`),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    ...institutions.map((item) => page(`/institutions/${item.slug}`, "monthly", 0.3)),
    ...topics.map((item) => page(`/topics/${item.slug}`, "monthly", 0.3)),
  ];
}
