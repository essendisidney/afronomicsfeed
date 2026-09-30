import { getAllArticles, toIndexItem } from "./content";
import { countries } from "./data/countries";
import { deskLabels, indicatorDefs } from "./data/indicators";
import { articleHref, categoryLabel } from "./format";
import { footerNav } from "./site";

import type { SearchHit } from "./search-core";

export type { SearchHit };

export function buildSearchIndex(): SearchHit[] {
  const countryHits = countries.map((country) => ({
    href: `/countries/${country.slug}`,
    title: country.name,
    kicker: `Country file · ${country.region}`,
    summary: `${country.iso} · ${country.currency} · data, DFI projects and headlines`,
  }));

  const indicatorHits = indicatorDefs.map((def) => ({
    href: `/data/${def.slug}`,
    title: def.label,
    kicker: `Data · ${deskLabels[def.desk]}`,
    summary: `All 54 countries ranked, with history and CSV. ${def.about}`,
  }));

  const articleHits = getAllArticles()
    .map(toIndexItem)
    .map((article) => ({
      href: articleHref(article.category, article.slug),
      title: article.title,
      kicker: categoryLabel(article.category),
      summary: article.summary,
    }));

  const pageHits = footerNav.map((item) => ({
    href: item.href,
    title: item.label,
    kicker: "Section",
    summary: "",
  }));

  return [...countryHits, ...indicatorHits, ...articleHits, ...pageHits];
}

