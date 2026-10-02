import { countries, type CountryProfile } from "@/lib/data/countries";
import { fetchText } from "./fetcher";

/**
 * The Afronomics Wire: headlines from African business, markets, technology and
 * climate publishers, read from their public RSS feeds. We show the headline, the
 * publisher and the time, and send the reader to the publisher for the story.
 */

export type WireDesk = "markets" | "economy" | "capital" | "technology" | "climate" | "trade" | "policy";

export type WireItem = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  publisherUrl: string;
  publishedAt: string; // ISO
  summary: string;
  countries: CountryProfile[];
  desks: WireDesk[];
};

type Feed = { name: string; url: string; home: string; home_country?: string; default_desk?: WireDesk };

/** Publisher feeds. Each one is optional: a feed that fails is skipped for that cycle. */
export const feeds: Feed[] = [
  { name: "TechCabal", url: "https://techcabal.com/feed/", home: "https://techcabal.com", default_desk: "technology" },
  { name: "Techpoint Africa", url: "https://techpoint.africa/feed/", home: "https://techpoint.africa", default_desk: "technology" },
  { name: "Disrupt Africa", url: "https://disruptafrica.com/feed/", home: "https://disruptafrica.com", default_desk: "technology" },
  { name: "WeeTracker", url: "https://weetracker.com/feed/", home: "https://weetracker.com", default_desk: "technology" },
  { name: "Capital FM Business", url: "https://www.capitalfm.co.ke/business/feed/", home: "https://www.capitalfm.co.ke/business", home_country: "KE", default_desk: "economy" },
  { name: "Nairametrics", url: "https://nairametrics.com/feed/", home: "https://nairametrics.com", home_country: "NG", default_desk: "markets" },
  { name: "BusinessDay", url: "https://businessday.ng/feed/", home: "https://businessday.ng", home_country: "NG", default_desk: "economy" },
  { name: "Moneyweb", url: "https://www.moneyweb.co.za/feed/", home: "https://www.moneyweb.co.za", home_country: "ZA", default_desk: "markets" },
  { name: "The Africa Report", url: "https://www.theafricareport.com/feed/", home: "https://www.theafricareport.com", default_desk: "economy" },
  { name: "African Business", url: "https://african.business/feed", home: "https://african.business", default_desk: "economy" },
  { name: "ESI Africa", url: "https://www.esi-africa.com/feed/", home: "https://www.esi-africa.com", default_desk: "climate" },
  { name: "AllAfrica", url: "https://allafrica.com/tools/headlines/rdf/business/headlines.rdf", home: "https://allafrica.com", default_desk: "economy" },
];

/** AllAfrica's per-country feed names, where they differ from our slugs without hyphens. */
const ALLAFRICA_SLUG: Record<string, string> = {
  "dr-congo": "congo_kinshasa",
  congo: "congo_brazzaville",
  "cabo-verde": "capeverde",
  "cote-divoire": "cotedivoire",
};

export function allAfricaFeedUrl(country: CountryProfile) {
  const slug = ALLAFRICA_SLUG[country.slug] ?? country.slug.replace(/-/g, "");
  return `https://allafrica.com/tools/headlines/rdf/${slug}/headlines.rdf`;
}

const REVALIDATE = 60 * 15;

const ALIASES: Record<string, string[]> = {
  KE: ["Kenya", "Kenyan", "Nairobi", "Mombasa", "CBK", "Safaricom", "NSE Kenya", "KES"],
  NG: ["Nigeria", "Nigerian", "Lagos", "Abuja", "CBN", "naira", "NGX", "Dangote"],
  ZA: ["South Africa", "South African", "Johannesburg", "Cape Town", "JSE", "SARB", "rand", "Eskom", "Pretoria"],
  EG: ["Egypt", "Egyptian", "Cairo", "Suez", "EGX"],
  GH: ["Ghana", "Ghanaian", "Accra", "cedi", "Bank of Ghana"],
  ET: ["Ethiopia", "Ethiopian", "Addis Ababa", "birr"],
  TZ: ["Tanzania", "Tanzanian", "Dar es Salaam", "Dodoma"],
  UG: ["Uganda", "Ugandan", "Kampala"],
  RW: ["Rwanda", "Rwandan", "Kigali"],
  MA: ["Morocco", "Moroccan", "Casablanca", "Rabat"],
  CI: ["Côte d’Ivoire", "Cote d'Ivoire", "Côte d'Ivoire", "Ivory Coast", "Ivorian", "Abidjan"],
  SN: ["Senegal", "Senegalese", "Dakar"],
  ZM: ["Zambia", "Zambian", "Lusaka", "kwacha"],
  ZW: ["Zimbabwe", "Zimbabwean", "Harare"],
  CD: ["DR Congo", "DRC", "Democratic Republic of Congo", "Kinshasa"],
  AO: ["Angola", "Angolan", "Luanda"],
  MZ: ["Mozambique", "Mozambican", "Maputo"],
  TN: ["Tunisia", "Tunisian", "Tunis"],
  DZ: ["Algeria", "Algerian", "Algiers"],
  CM: ["Cameroon", "Cameroonian", "Douala", "Yaoundé"],
  BW: ["Botswana", "Gaborone"],
  NA: ["Namibia", "Namibian", "Windhoek"],
  MW: ["Malawi", "Malawian", "Lilongwe"],
  SO: ["Somalia", "Somali", "Mogadishu"],
  SS: ["South Sudan"],
  SD: ["Sudan", "Sudanese", "Khartoum"],
  LY: ["Libya", "Libyan", "Tripoli"],
  MU: ["Mauritius", "Mauritian"],
  MG: ["Madagascar", "Malagasy"],
  ML: ["Mali", "Malian", "Bamako"],
  BF: ["Burkina Faso"],
  NE: ["Niger", "Nigerien", "Niamey"],
  BJ: ["Benin", "Cotonou"],
  TG: ["Togo", "Lomé"],
  SL: ["Sierra Leone", "Freetown"],
  LR: ["Liberia", "Liberian", "Monrovia"],
  GN: ["Guinea", "Conakry"],
  DJ: ["Djibouti"],
  GA: ["Gabon", "Libreville"],
};

function aliasesFor(country: CountryProfile) {
  return ALIASES[country.iso] ?? [country.name];
}

const aliasRules = countries.map((country) => ({
  country,
  rule: new RegExp(`(^|[^\\p{L}])(${aliasesFor(country).map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?=$|[^\\p{L}])`, "u"),
}));

const DESK_RULES: Array<[WireDesk, RegExp]> = [
  ["markets", /\b(shares?|stocks?|bourse|exchange|NSE|JSE|NGX|bond|eurobond|yield|T-bill|treasury bill|currency|naira|shilling|rand|cedi|forex|FX|IPO|listing|dividend|investors?)\b/i],
  ["economy", /\b(inflation|GDP|economy|economic|growth|central bank|interest rate|MPC|policy rate|budget|tax|IMF|revenue|debt|fiscal)\b/i],
  ["capital", /\b(raises?|raised|funding|investment|invests?|fund|venture|VC|seed|series [a-e]|acquires?|acquisition|merger|private equity|DFI|loan facility|financing)\b/i],
  ["technology", /\b(fintech|startup|tech|digital|AI|mobile money|M-Pesa|telecom|data centre|data center|software|app|e-commerce|crypto|blockchain)\b/i],
  ["climate", /\b(climate|solar|renewable|energy|power|electricity|carbon|green|emissions|drought|flood|geothermal|hydro|oil|gas|LPG|mining|minerals)\b/i],
  ["trade", /\b(trade|exports?|imports?|AfCFTA|port|shipping|logistics|tariff|customs|corridor|rail)\b/i],
  ["policy", /\b(regulat|law|bill|licen[cs]e|compliance|CBK|CBN|SARB|CMA|parliament|ministry|minister|government)\b/i],
];

function decode(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return match ? match[1] : "";
}

function hash(value: string) {
  let h = 0;
  for (let index = 0; index < value.length; index += 1) h = (Math.imul(31, h) + value.charCodeAt(index)) | 0;
  return (h >>> 0).toString(36);
}

function parseFeed(xml: string, feed: Feed): WireItem[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  const home = feed.home_country ? countries.find((country) => country.iso === feed.home_country) : undefined;
  return blocks.flatMap((block) => {
    const title = decode(tag(block, "title"));
    const url = decode(tag(block, "link")) || decode(tag(block, "guid"));
    const dateRaw = decode(tag(block, "pubDate")) || decode(tag(block, "dc:date"));
    const published = new Date(dateRaw);
    if (!title || !/^https?:\/\//.test(url) || Number.isNaN(published.getTime())) return [];
    const summary = decode(tag(block, "description")).slice(0, 280);
    const categories = (block.match(/<category[^>]*>([\s\S]*?)<\/category>/gi) ?? []).map(decode).join(" ");
    const haystack = `${title} ${summary} ${categories}`;

    const tagged = aliasRules.filter(({ rule }) => rule.test(haystack)).map(({ country }) => country);
    const found = tagged.length === 0 && home ? [home] : tagged;
    const desks = DESK_RULES.filter(([, rule]) => rule.test(haystack)).map(([desk]) => desk);
    if (desks.length === 0 && feed.default_desk) desks.push(feed.default_desk);

    return [
      {
        id: hash(url),
        title,
        url,
        publisher: feed.name,
        publisherUrl: feed.home,
        publishedAt: published.toISOString(),
        summary,
        countries: found.slice(0, 4),
        desks,
      },
    ];
  });
}

export async function loadWire(): Promise<WireItem[]> {
  const results = await Promise.all(
    feeds.map(async (feed) => {
      const xml = await fetchText(feed.url, {
        revalidate: REVALIDATE,
        timeoutMs: 10000,
        retries: 0,
        accept: "application/rss+xml, application/xml, text/xml",
      });
      return xml ? parseFeed(xml, feed) : [];
    }),
  );

  const horizon = Date.now() - 1000 * 60 * 60 * 24 * 10;
  const seen = new Set<string>();
  const items: WireItem[] = [];
  for (const item of results.flat().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 80);
    if (seen.has(key) || seen.has(item.url)) continue;
    if (new Date(item.publishedAt).getTime() < horizon) continue;
    if (new Date(item.publishedAt).getTime() > Date.now() + 1000 * 60 * 60) continue;
    seen.add(key);
    seen.add(item.url);
    items.push(item);
  }
  return items;
}

/**
 * Country headlines: the main wire's items for the country, topped up from AllAfrica's country feed
 * when the business publishers carried little about it this week.
 */
export async function loadCountryWire(country: CountryProfile, wire: WireItem[], limit = 12): Promise<WireItem[]> {
  const own = wireFor(wire, { iso: country.iso }, limit);
  if (own.length >= 6) return own;
  const xml = await fetchText(allAfricaFeedUrl(country), {
    revalidate: REVALIDATE * 4,
    timeoutMs: 10000,
    retries: 0,
    accept: "application/rss+xml, application/rdf+xml, application/xml, text/xml",
  });
  const horizon = Date.now() - 1000 * 60 * 60 * 24 * 14;
  const extra = xml
    ? parseFeed(xml, { name: "AllAfrica", url: allAfricaFeedUrl(country), home: "https://allafrica.com", home_country: country.iso })
        .filter((item) => new Date(item.publishedAt).getTime() > horizon)
        .map((item) => (item.countries.some((c) => c.iso === country.iso) ? item : { ...item, countries: [country, ...item.countries].slice(0, 4) }))
    : [];
  const seen = new Set(own.map((item) => item.url));
  return [...own, ...extra.filter((item) => !seen.has(item.url))]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

export function wireFor(items: WireItem[], filter: { desk?: WireDesk; iso?: string }, limit = 12) {
  return items
    .filter((item) => (filter.desk ? item.desks.includes(filter.desk) : true))
    .filter((item) => (filter.iso ? item.countries.some((country) => country.iso === filter.iso) : true))
    .slice(0, limit);
}

export function publishersLive(items: WireItem[]) {
  return new Set(items.map((item) => item.publisher)).size;
}
