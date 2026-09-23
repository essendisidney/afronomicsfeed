import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/content";
import { companies } from "@/lib/demo/companies";
import { countrySeries } from "@/lib/demo/country-series";
import { countries } from "@/lib/demo/countries";
import { indicators } from "@/lib/demo/indicators";
import { corridors } from "@/lib/demo/trade";
import { articleHref } from "@/lib/format";
import { site } from "@/lib/site";
import { institutions, topics } from "@/lib/taxonomy";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/brief",
    "/weekly",
    "/explainers",
    "/trackers",
    "/trackers/regulatory",
    "/trackers/banks",
    "/trackers/debt",
    "/pricing",
    "/subscribe",
    "/about",
    "/method",
    "/archive",
    "/today",
    "/institutions",
    "/topics",
    "/corrections",
    "/advisory",
    "/legal/privacy",
    "/legal/terms",
    "/legal/disclaimer",
    "/markets",
    "/economy",
    "/capital",
    "/climate",
    "/technology",
    "/trade",
    "/companies",
    "/countries",
    "/data",
    "/opinion",
    "/signals",
    "/search",
    "/pro",
    "/ask",
    "/terminal",
  ];

  const now = new Date();

  return [
    ...staticPaths.map((path) => ({
      url: `${site.url}${path || "/"}`,
      lastModified: now,
    })),
    ...institutions.map((institution) => ({
      url: `${site.url}/institutions/${institution.slug}`,
      lastModified: now,
    })),
    ...topics.map((topic) => ({
      url: `${site.url}/topics/${topic.slug}`,
      lastModified: now,
    })),
    ...getAllArticles().map((article) => ({
      url: `${site.url}${articleHref(article.category, article.slug)}`,
      lastModified: new Date(`${article.date}T00:00:00+03:00`),
    })),
    ...countries.map((country) => ({
      url: `${site.url}/countries/${country.slug}`,
      lastModified: now,
    })),
    ...countries.flatMap((country) =>
      countrySeries.map((series) => ({
        url: `${site.url}/countries/${country.slug}/${series.slug}`,
        lastModified: now,
      })),
    ),
    ...companies.map((company) => ({
      url: `${site.url}/companies/${company.slug}`,
      lastModified: now,
    })),
    ...indicators.map((indicator) => ({
      url: `${site.url}/indicators/${indicator.slug}`,
      lastModified: now,
    })),
    ...corridors.map((corridor) => ({
      url: `${site.url}/trade/${corridor.slug}`,
      lastModified: now,
    })),
  ];
}
