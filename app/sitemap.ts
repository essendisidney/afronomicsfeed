import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/content";
import { countries } from "@/lib/data/countries";
import { pairSlug } from "@/lib/data/fx";
import { indicatorDefs } from "@/lib/data/indicators";
import { articleHref } from "@/lib/format";
import { marketDates } from "@/lib/data/market-stories";
import { mmfMonths } from "@/lib/data/mmf-months";
import { lenderHref, loadLenders } from "@/lib/data/loan-apps";
import { billMarkets } from "@/lib/data/sovereign-bills";
import { site } from "@/lib/site";
import { visibleCases } from "@/lib/cases";
import { institutions as registryInstitutions } from "@/lib/registry";
import { learnLangs, loadLessons } from "@/lib/learn-i18n";
import { institutions, topics } from "@/lib/taxonomy";
import { allTbillWeeks, bondDates } from "@/lib/data/auction-stories";
import { loadBondMarket } from "@/lib/data/sovereign-bonds";
import { issuersOf, marketsWithRows } from "@/components/bonds/stats";
import { allAuctionPaths } from "@/components/bonds/auction";
import { allBillsUpdated, allBondsUpdated, billUpdated, bondUpdated, fileUpdated, newest } from "@/lib/seo/freshness";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // Data pages carry the date their data file was last updated; everything else the build time.
  const page = (path: string, changeFrequency: "hourly" | "daily" | "weekly" | "monthly" | "yearly", priority: number, lastModified?: Date | null) => ({
    url: `${site.url}${path}`,
    lastModified: lastModified ?? now,
    changeFrequency,
    priority,
  });

  const publicCases = visibleCases(false);
  const bills = allBillsUpdated();
  const bonds = allBondsUpdated();
  const debt = newest(bills, bonds);

  const hubs = [
    page("/compare", "daily", 0.9),
    page("/numbers", "daily", 0.9),
    page("/stories", "daily", 0.9),
    page("/", "hourly", 1),
    page("/news", "hourly", 0.9),
    page("/markets", "hourly", 0.9),
    page("/markets/kenya-tbills", "daily", 0.9, billUpdated("kenya")),
    page("/markets/kenya-bonds", "daily", 0.9, bondUpdated("kenya")),
    page("/markets/tbills", "daily", 0.9, bills),
    page("/markets/kenya-tbills/auction", "daily", 0.9, billUpdated("kenya")),
    page("/markets/borrowing-costs", "daily", 0.9, bills),
    page("/markets/eurobonds", "daily", 0.9),
    page("/markets/bill-index", "weekly", 0.9, bills),
    page("/markets/bill-index/release", "weekly", 0.7, bills),
    page("/markets/bonds", "daily", 0.9, bonds),
    // Only markets whose page exists (dynamicParams is off, so an empty market's URL would 404).
    ...marketsWithRows().map(({ market: m }) => page(`/markets/bonds/${m.slug}`, "daily", 0.8, bondUpdated(m.slug))),
    // Each WAEMU issuer has its own page (/markets/bonds/waemu/senegal): the queries are per country.
    ...issuersOf(loadBondMarket("waemu").rows).map((i) => page(`/markets/bonds/waemu/${i.slug}`, "daily", 0.8, bondUpdated("waemu"))),
    page("/markets/auction-week", "daily", 0.8, debt),
    page("/morning", "hourly", 0.9),
    page("/morning/sw", "daily", 0.6),
    page("/sw", "daily", 0.7),
    page("/registry", "monthly", 0.8),
    ...registryInstitutions().map((i) => page(`/registry/${i.slug}`, "monthly", 0.5)),
    // The casebook is listed once a case is signed off; drafts never are.
    ...(publicCases.length ? [page("/casebook", "weekly", 0.8), ...publicCases.map((c) => page(`/casebook/${c.id}`, "monthly", 0.7))] : []),
    page("/rates/kenya", "daily", 0.9, fileUpdated("kenya/rates.json")),
    page("/guides/where-your-shilling-earns-most", "daily", 0.9),
    page("/rates/kenya/money-market-funds", "daily", 0.9),
    page("/rates/kenya/best-money-market-fund", "daily", 0.9),
    ...mmfMonths()
      .filter((m) => m.complete)
      .map((m) => page(`/rates/kenya/best-money-market-fund/${m.month}`, "monthly", 0.6)),
    page("/rates/remittances", "monthly", 0.8),
    page("/rates/what-readers-paid", "daily", 0.8),
    page("/rates/kenya/saccos", "monthly", 0.8),
    page("/chama", "daily", 0.9),
    page("/rates/kenya/check", "weekly", 0.8),
    page("/rates/nigeria/check", "weekly", 0.8),
    page("/rates/ghana/check", "weekly", 0.8),
    page("/rates/policy", "daily", 0.9, fileUpdated("policy_rates.json")),
    page("/status", "daily", 0.5),
    page("/learn", "weekly", 0.9),
    page("/rates/nigeria/savings-bond", "weekly", 0.9),
    ...learnLangs.flatMap((l) => [page(`/learn/${l}`, "weekly", 0.8), ...loadLessons(l).map((x) => page(`/learn/${l}/${x.slug}`, "monthly", 0.7))]),
    page("/rates/kenya/mobile-loans", "weekly", 0.9),
    page("/rates/kenya/loan-apps", "weekly", 0.9),
    ...[...(loadLenders()?.lenders ?? []), ...(loadLenders()?.removed ?? [])].map((l) => page(lenderHref(l.name), "monthly", 0.6)),
    page("/for-institutions", "monthly", 0.7),
    page("/pack", "monthly", 0.7),
    page("/developers", "monthly", 0.6, debt),
    page("/data-api", "monthly", 0.7, bills),
    page("/data/frontier-local-debt", "weekly", 0.9, debt),
    page("/data/frontier-local-debt/monitor", "daily", 0.8, debt),
    // From the market list, so a new bill market is in the sitemap the day it ships (Kenya has its own page above).
    ...billMarkets.filter((m) => m.slug !== "kenya").map((m) => page(`/markets/tbills/${m.slug}`, "daily", 0.8, billUpdated(m.slug))),
    page("/east-africa", "daily", 0.8, debt),
    page("/countries", "daily", 0.9),
    page("/data", "daily", 0.9),
    page("/alerts", "monthly", 0.5),
    page("/reference", "monthly", 0.6),
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
    page("/editorial-standards", "monthly", 0.5),
    page("/trust", "weekly", 0.6),
    page("/buying", "monthly", 0.6),
    page("/pricing", "monthly", 0.5),
    page("/prices", "monthly", 0.4),
    page("/subscribe", "monthly", 0.5),
    page("/advisory", "monthly", 0.4),
    page("/contact", "monthly", 0.3),
    page("/corrections", "monthly", 0.3),
    page("/imprint", "yearly", 0.2),
    page("/legal/terms", "yearly", 0.2),
    page("/legal/privacy", "yearly", 0.2),
    page("/legal/cookies", "yearly", 0.2),
    page("/legal/disclaimer", "yearly", 0.2),
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
    ...billMarkets
      .filter((m) => m.slug !== "kenya")
      .flatMap((m) =>
        marketDates(m.slug).map((week) => ({
          url: `${site.url}/markets/tbills/${m.slug}/${week.date}`,
          lastModified: new Date(`${week.date}T12:00:00+03:00`),
          changeFrequency: "yearly" as const,
          priority: 0.5,
        })),
      ),
    ...bondDates().map((date) => ({
      url: `${site.url}/markets/kenya-bonds/${date}`,
      lastModified: new Date(`${date}T12:00:00+03:00`),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    // Every other market's dated bond auction pages (WAEMU per issuer). Kenya's are the kenya-bonds dates above.
    ...marketsWithRows()
      .filter(({ market: m }) => m.slug !== "kenya")
      .flatMap(({ market: m }) =>
        allAuctionPaths(m.slug).map(({ path, date }) => ({
          url: `${site.url}${path}`,
          lastModified: new Date(`${date}T12:00:00+03:00`),
          changeFrequency: "yearly" as const,
          priority: 0.5,
        })),
      ),
    ...institutions.map((item) => page(`/institutions/${item.slug}`, "monthly", 0.3)),
    ...topics.map((item) => page(`/topics/${item.slug}`, "monthly", 0.3)),
  ];
}
