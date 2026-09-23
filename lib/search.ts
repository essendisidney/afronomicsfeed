import { getAllArticles, toIndexItem } from "./content";
import { companies } from "./demo/companies";
import { countries } from "./demo/countries";
import { corridors } from "./demo/trade";
import { articleHref, categoryLabel } from "./format";
import { nav, utilityNav } from "./site";

export type SearchHit = {
  href: string;
  title: string;
  kicker: string;
  summary: string;
};

export function buildSearchIndex(): SearchHit[] {
  const articles = getAllArticles().map(toIndexItem).map((article) => ({
    href: articleHref(article.category, article.slug),
    title: article.title,
    kicker: categoryLabel(article.category),
    summary: article.summary,
  }));

  const countryHits = countries.map((country) => ({
    href: `/countries/${country.slug}`,
    title: country.name,
    kicker: `Country · ${country.region}`,
    summary: `${country.iso} · ${country.currency} · ${country.sectors.join(", ")}`,
  }));

  const companyHits = companies.map((company) => ({
    href: `/companies/${company.slug}`,
    title: company.name,
    kicker: `Company · ${company.country}`,
    summary: company.sector,
  }));

  const corridorHits = corridors.map((corridor) => ({
    href: `/trade/${corridor.slug}`,
    title: corridor.name,
    kicker: "Trade corridor",
    summary: corridor.geography,
  }));

  const navHits = [...nav, ...utilityNav].map((item) => ({
    href: item.href,
    title: item.label,
    kicker: "Layer",
    summary: `Open the ${item.label} intelligence layer`,
  }));

  return [...articles, ...countryHits, ...companyHits, ...corridorHits, ...navHits];
}

export function searchIndex(query: string, index = buildSearchIndex(), limit = 24): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return index.slice(0, 8);
  return index
    .filter((hit) => `${hit.title} ${hit.kicker} ${hit.summary}`.toLowerCase().includes(q))
    .slice(0, limit);
}
