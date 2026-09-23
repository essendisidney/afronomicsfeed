import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/content";
import { companies } from "@/lib/demo/companies";
import { countrySeries } from "@/lib/demo/country-series";
import { countries } from "@/lib/demo/countries";
import { capitalBooks } from "@/lib/demo/capital";
import { signalCategories, signalCategorySlug, signals } from "@/lib/demo/signals";
import { indicators } from "@/lib/demo/indicators";
import { instruments } from "@/lib/demo/markets";
import { askQuestions } from "@/lib/demo/ask";
import { datasets } from "@/lib/demo/datasets";
import { techLenses } from "@/lib/demo/tech";
import { corridorCountryParams, corridors, ports, tradeRegimes } from "@/lib/demo/trade";
import { industries, industryCountryParams } from "@/lib/demo/industries";
import { agencyCountryParams, agencyKinds } from "@/lib/demo/agencies";
import { cities } from "@/lib/demo/cities";
import { investors } from "@/lib/demo/investors";
import { personCountryParams, personRoles } from "@/lib/demo/people";
import { graphDesks } from "@/lib/demo/graph";
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
    "/projects",
    "/trade/ports",
    "/industries",
    "/agencies",
    "/cities",
    "/investors",
    "/people",
    "/developers",
    "/account",
    "/signup",
    "/graph",
    "/graph/resolve",
    "/watchlists",
    "/alerts",
    "/exports",
    "/ask/corpus",
    "/method/registry",
    "/account/usage",
    "/packs",
    "/sources",
    "/compare",
    "/ingestion",
    "/feeds",
    "/status",
    "/searches",
    "/licensing",
    "/notifications",
    "/changelog",
    "/audit",
    "/reports",
    "/calendar",
    "/partners",
    "/coverage",
    "/glossary",
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
    ...countries.map((country) => ({
      url: `${site.url}/climate/${country.slug}`,
      lastModified: now,
    })),
    ...signals.map((signal) => ({
      url: `${site.url}/signals/${signal.slug}`,
      lastModified: now,
    })),
    ...signalCategories.map((category) => ({
      url: `${site.url}/signals/categories/${signalCategorySlug(category)}`,
      lastModified: now,
    })),
    ...indicators.map((indicator) => ({
      url: `${site.url}/indicators/${indicator.slug}`,
      lastModified: now,
    })),
    ...indicators.flatMap((indicator) =>
      countries.map((country) => ({
        url: `${site.url}/indicators/${indicator.slug}/${country.slug}`,
        lastModified: now,
      })),
    ),
    ...instruments.map((item) => ({
      url: `${site.url}${item.fileHref}`,
      lastModified: now,
    })),
    ...capitalBooks.map((book) => ({
      url: `${site.url}/capital/${book.slug}`,
      lastModified: now,
    })),
    ...capitalBooks.flatMap((book) =>
      countries.map((country) => ({
        url: `${site.url}/capital/${book.slug}/${country.slug}`,
        lastModified: now,
      })),
    ),
    ...corridors.map((corridor) => ({
      url: `${site.url}/trade/${corridor.slug}`,
      lastModified: now,
    })),
    ...corridorCountryParams().map((item) => ({
      url: `${site.url}/trade/${item.slug}/${item.country}`,
      lastModified: now,
    })),
    ...ports.map((port) => ({
      url: `${site.url}/trade/ports/${port.slug}`,
      lastModified: now,
    })),
    ...tradeRegimes.map((regime) => ({
      url: `${site.url}/trade/regimes/${regime.slug}`,
      lastModified: now,
    })),
    ...countries.map((country) => ({
      url: `${site.url}/projects/${country.slug}`,
      lastModified: now,
    })),
    ...askQuestions.map((item) => ({
      url: `${site.url}/ask/${item.slug}`,
      lastModified: now,
    })),
    ...datasets.map((item) => ({
      url: `${site.url}/data/${item.slug}`,
      lastModified: now,
    })),
    ...countries.map((country) => ({
      url: `${site.url}/economy/${country.slug}`,
      lastModified: now,
    })),
    ...techLenses.map((lens) => ({
      url: `${site.url}/technology/${lens.slug}`,
      lastModified: now,
    })),
    ...techLenses.flatMap((lens) =>
      countries.map((country) => ({
        url: `${site.url}/technology/${lens.slug}/${country.slug}`,
        lastModified: now,
      })),
    ),
    ...industries.map((item) => ({
      url: `${site.url}/industries/${item.slug}`,
      lastModified: now,
    })),
    ...industryCountryParams().map((item) => ({
      url: `${site.url}/industries/${item.slug}/${item.country}`,
      lastModified: now,
    })),
    ...agencyKinds.map((kind) => ({
      url: `${site.url}/agencies/${kind.slug}`,
      lastModified: now,
    })),
    ...agencyCountryParams().map((item) => ({
      url: `${site.url}/agencies/${item.kind}/${item.country}`,
      lastModified: now,
    })),
    ...cities.map((city) => ({
      url: `${site.url}/cities/${city.slug}`,
      lastModified: now,
    })),
    ...investors.map((investor) => ({
      url: `${site.url}/investors/${investor.slug}`,
      lastModified: now,
    })),
    ...personRoles.map((role) => ({
      url: `${site.url}/people/${role.slug}`,
      lastModified: now,
    })),
    ...personCountryParams().map((item) => ({
      url: `${site.url}/people/${item.role}/${item.country}`,
      lastModified: now,
    })),
    ...graphDesks.map((desk) => ({
      url: `${site.url}/graph/${desk.slug}`,
      lastModified: now,
    })),
  ];
}
