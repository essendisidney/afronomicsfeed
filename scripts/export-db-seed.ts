import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { countries } from "../lib/demo/countries";
import { cities } from "../lib/demo/cities";
import { industries } from "../lib/demo/industries";
import { officialSources } from "../lib/demo/sources";
import { instruments } from "../lib/demo/markets";
import { indicators } from "../lib/demo/indicators";
import { companies } from "../lib/demo/companies";
import { newsletterProducts } from "../lib/demo/newsletters";
import { corridors, ports } from "../lib/demo/trade";
import { graphEdges, graphNodes } from "../lib/demo/graph";
import { signals } from "../lib/demo/signals";

const CURRENCY_NAMES: Record<string, string> = {
  DZD: "Algerian dinar",
  AOA: "Angolan kwanza",
  XOF: "West African CFA franc",
  BWP: "Botswana pula",
  BIF: "Burundian franc",
  CVE: "Cape Verdean escudo",
  XAF: "Central African CFA franc",
  KMF: "Comorian franc",
  DJF: "Djiboutian franc",
  CDF: "Congolese franc",
  EGP: "Egyptian pound",
  ERN: "Eritrean nakfa",
  SZL: "Swazi lilangeni",
  ETB: "Ethiopian birr",
  GMD: "Gambian dalasi",
  GHS: "Ghanaian cedi",
  GNF: "Guinean franc",
  KES: "Kenyan shilling",
  LSL: "Lesotho loti",
  LRD: "Liberian dollar",
  LYD: "Libyan dinar",
  MGA: "Malagasy ariary",
  MWK: "Malawian kwacha",
  MRU: "Mauritanian ouguiya",
  MUR: "Mauritian rupee",
  MAD: "Moroccan dirham",
  MZN: "Mozambican metical",
  NAD: "Namibian dollar",
  NGN: "Nigerian naira",
  RWF: "Rwandan franc",
  STN: "São Tomé and Príncipe dobra",
  SCR: "Seychellois rupee",
  SLE: "Sierra Leonean leone",
  SOS: "Somali shilling",
  ZAR: "South African rand",
  SSP: "South Sudanese pound",
  SDG: "Sudanese pound",
  TZS: "Tanzanian shilling",
  TND: "Tunisian dinar",
  UGX: "Ugandan shilling",
  ZMW: "Zambian kwacha",
  ZWG: "Zimbabwe Gold",
};

function q(value: string | null | undefined) {
  if (value == null) return "null";
  return `'${value.replace(/'/g, "''")}'`;
}

function dollar(value: string, tag: string) {
  if (value.includes(`$${tag}$`)) throw new Error(`Dollar tag collision: ${tag}`);
  return `$${tag}$${value}$${tag}$`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const outDir = path.join(process.cwd(), "supabase", "seed");
fs.mkdirSync(outDir, { recursive: true });

const lines: string[] = [];
lines.push("-- Reference catalogue migrated from the app files.");
lines.push("-- Example tape values, capital amounts, and observation cells are not inserted.");

const regionNames = [...new Set(countries.map((country) => country.region))];
for (const name of regionNames) {
  lines.push(
    `insert into public.regions (name) values (${q(name)}) on conflict (name) do nothing;`,
  );
}

for (const country of countries) {
  lines.push(
    `insert into public.countries (slug, name, iso2, region_id, currency_code)
select ${q(country.slug)}, ${q(country.name)}, ${q(country.iso)}, id, ${q(country.currency)}
from public.regions where name = ${q(country.region)}
on conflict (slug) do update set name = excluded.name, iso2 = excluded.iso2, region_id = excluded.region_id, currency_code = excluded.currency_code;`,
  );
}

for (const industry of industries) {
  lines.push(
    `insert into public.industries (slug, name) values (${q(industry.slug)}, ${q(industry.label)})
on conflict (slug) do update set name = excluded.name;`,
  );
}

const currencyUsers = new Map<string, string[]>();
for (const country of countries) {
  const list = currencyUsers.get(country.currency) ?? [];
  list.push(country.slug);
  currencyUsers.set(country.currency, list);
}
for (const [code, users] of currencyUsers) {
  const name = CURRENCY_NAMES[code];
  if (!name) throw new Error(`Missing currency name for ${code}`);
  const countrySlug = users.length === 1 ? users[0] : null;
  const countrySql = countrySlug
    ? `(select id from public.countries where slug = ${q(countrySlug)})`
    : "null";
  lines.push(
    `insert into public.currencies (code, name, country_id) values (${q(code)}, ${q(name)}, ${countrySql})
on conflict (code) do update set name = excluded.name, country_id = excluded.country_id;`,
  );
}

for (const source of officialSources) {
  lines.push(
    `insert into public.publishers (name, homepage, kind) values (${q(source.label)}, ${q(source.href)}, ${q(source.kind)})
on conflict (name) do update set homepage = excluded.homepage, kind = excluded.kind;`,
  );
  lines.push(
    `insert into public.sources (publisher, url, confidence, methodology)
select ${q(source.label)}, ${q(source.href)}, 'unverified', ${q(source.note)}
where not exists (select 1 from public.sources where url = ${q(source.href)});`,
  );
}

for (const item of instruments.filter((row) => row.kind === "exchange")) {
  lines.push(
    `insert into public.exchanges (slug, name, country_id, homepage)
select ${q(item.slug)}, ${q(item.label)}, id, ${q(item.href)}
from public.countries where slug = ${q(item.countrySlug)}
on conflict (slug) do update set name = excluded.name, country_id = excluded.country_id, homepage = excluded.homepage;`,
  );
}

for (const indicator of indicators) {
  lines.push(
    `insert into public.economic_indicators (slug, name, unit, frequency)
values (${q(indicator.slug)}, ${q(indicator.name)}, ${q(indicator.unit)}, null)
on conflict (slug) do update set name = excluded.name, unit = excluded.unit;`,
  );
}

function industryForSector(sector: string) {
  const text = sector.toLowerCase();
  if (text.includes("bank")) return "banking";
  if (text.includes("telecom") || text.includes("payment")) return "telecoms";
  return null;
}

for (const company of companies.filter((item) => !item.example)) {
  const industry = industryForSector(company.sector);
  const exchangeSlug = company.exchangeHref?.split("/").pop() ?? null;
  lines.push(
    `insert into public.companies (slug, name, country_id, industry_id, listed, exchange_id, website)
select ${q(company.slug)}, ${q(company.name)}, c.id,
  ${industry ? `(select id from public.industries where slug = ${q(industry)})` : "null"},
  true,
  ${exchangeSlug ? `(select id from public.exchanges where slug = ${q(exchangeSlug)})` : "null"},
  ${q(company.door?.href ?? null)}
from public.countries c where c.slug = ${q(company.countrySlug)}
on conflict (slug) do update set name = excluded.name, country_id = excluded.country_id, industry_id = excluded.industry_id, listed = excluded.listed, exchange_id = excluded.exchange_id, website = excluded.website;`,
  );
}

for (const item of newsletterProducts) {
  lines.push(
    `insert into public.newsletters (slug, name) values (${q(item.slug)}, ${q(item.label)})
on conflict (slug) do update set name = excluded.name;`,
  );
}

for (const corridor of corridors) {
  const countrySql =
    corridor.countrySlugs.length === 1
      ? `(select id from public.countries where slug = ${q(corridor.countrySlugs[0])})`
      : "null";
  lines.push(
    `insert into public.infrastructure_projects (slug, name, country_id, corridor)
select ${q(corridor.slug)}, ${q(corridor.name)}, ${countrySql}, ${q(corridor.geography)}
where not exists (select 1 from public.infrastructure_projects where slug = ${q(corridor.slug)});`,
  );
}

for (const signal of signals) {
  const countrySql = signal.countrySlug
    ? `(select id from public.countries where slug = ${q(signal.countrySlug)})`
    : "null";
  lines.push(
    `insert into public.signals (title, country_id, sector, category, direction, confidence, severity, time_horizon, fact, interpretation)
select ${q(signal.title)}, ${countrySql}, ${q(signal.sector)}, ${q(signal.category)}, ${q(signal.direction)}, ${q(signal.confidence)}, ${q(signal.severity)}, ${q(signal.horizon)}, ${q(signal.fact)}, ${q(signal.interpretation)}
where not exists (select 1 from public.signals where title = ${q(signal.title)});`,
  );
}

type EntitySeed = {
  slug: string;
  name: string;
  kind: string;
  countrySlug: string | null;
  metadata: Record<string, string | null>;
};

const entities = new Map<string, EntitySeed>();
const cityBySlug = new Map(cities.map((city) => [city.slug, city]));
const corridorBySlug = new Map<string, (typeof corridors)[number]>(
  corridors.map((corridor) => [corridor.slug, corridor]),
);
const companyBySlug = new Map(companies.map((company) => [company.slug, company]));

for (const node of graphNodes) {
  let countrySlug: string | null = null;
  if (node.kind === "country") countrySlug = node.id;
  if (node.kind === "city") countrySlug = cityBySlug.get(node.id)?.countrySlug ?? null;
  if (node.kind === "company") countrySlug = companyBySlug.get(node.id)?.countrySlug ?? null;
  if (node.kind === "corridor") {
    const corridor = corridorBySlug.get(node.id);
    countrySlug = corridor?.countrySlugs.length === 1 ? corridor.countrySlugs[0] : null;
  }
  entities.set(node.id, {
    slug: node.id,
    name: node.label,
    kind: node.kind,
    countrySlug,
    metadata: { href: node.href ?? null },
  });
}

for (const city of cities) {
  const existing = entities.get(city.slug);
  if (existing) {
    existing.countrySlug = city.countrySlug;
    existing.metadata.role = city.role;
    if (city.portSlug) existing.metadata.portSlug = city.portSlug;
  } else {
    entities.set(city.slug, {
      slug: city.slug,
      name: city.name,
      kind: "city",
      countrySlug: city.countrySlug,
      metadata: { href: `/cities/${city.slug}`, role: city.role, portSlug: city.portSlug ?? null },
    });
  }
}

for (const port of ports) {
  const existing = entities.get(port.slug);
  if (existing) {
    existing.metadata.waters = port.waters;
    existing.metadata.corridorSlug = port.corridorSlug ?? null;
  } else {
    entities.set(port.slug, {
      slug: port.slug,
      name: port.name,
      kind: "port",
      countrySlug: port.countrySlug,
      metadata: {
        href: `/trade/ports/${port.slug}`,
        waters: port.waters,
        corridorSlug: port.corridorSlug ?? null,
      },
    });
  }
}

for (const industry of industries) {
  if (!entities.has(industry.slug)) {
    entities.set(industry.slug, {
      slug: industry.slug,
      name: industry.label,
      kind: "industry",
      countrySlug: null,
      metadata: { href: `/industries/${industry.slug}` },
    });
  }
}

const entityLines: string[] = [];
for (const entity of entities.values()) {
  const meta = Object.fromEntries(Object.entries(entity.metadata).filter((entry) => entry[1]));
  const countrySql = entity.countrySlug
    ? `(select id from public.countries where slug = ${q(entity.countrySlug)})`
    : "null";
  entityLines.push(
    `insert into public.entities (slug, name, kind, country_id, metadata)
select ${q(entity.slug)}, ${q(entity.name)}, ${q(entity.kind)}, ${countrySql}, ${q(JSON.stringify(meta))}::jsonb
on conflict (slug) do update set name = excluded.name, kind = excluded.kind, country_id = excluded.country_id, metadata = excluded.metadata;`,
  );
}

const edgeLines: string[] = [];
let skippedEdges = 0;
for (const edge of graphEdges) {
  if (!entities.has(edge.from) || !entities.has(edge.to)) {
    skippedEdges += 1;
    continue;
  }
  edgeLines.push(
    `insert into public.entity_relationships (from_entity_id, to_entity_id, rel_type)
select f.id, t.id, ${q(edge.rel)}
from public.entities f, public.entities t
where f.slug = ${q(edge.from)} and t.slug = ${q(edge.to)}
on conflict (from_entity_id, to_entity_id, rel_type) do nothing;`,
  );
}

const articleLines: string[] = [];
const contentRoot = path.join(process.cwd(), "content");
const categories = ["briefs", "weekly", "explainers"] as const;
let articleCount = 0;
for (const folder of categories) {
  const dir = path.join(contentRoot, folder);
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".md"))) {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const parsed = matter(raw);
    const data = parsed.data as {
      title: string;
      date: string;
      authors: string[];
      summary: string;
      category: string;
      sources: { name: string; url: string; date: string }[];
    };
    const slug = file.replace(/\.md$/, "");
    const author = data.authors[0];
    const authorSlug = slugify(author);
    const kind = data.category === "explainer" ? "analysis" : "original";
    articleLines.push(
      `insert into public.authors (name, slug) values (${q(author)}, ${q(authorSlug)}) on conflict (slug) do nothing;`,
    );
    articleLines.push(
      `insert into public.articles (slug, title, summary, kind, status, published_at, author_id, body_markdown, featured)
select ${q(slug)}, ${q(data.title)}, ${q(data.summary)}, ${q(kind)}, 'published', ${q(data.date)}::timestamptz, id, ${dollar(parsed.content.trim(), `md${articleCount}`)}, false
from public.authors where slug = ${q(authorSlug)}
on conflict (slug) do update set title = excluded.title, summary = excluded.summary, kind = excluded.kind, status = excluded.status, published_at = excluded.published_at, body_markdown = excluded.body_markdown;`,
    );
    for (const source of data.sources) {
      articleLines.push(
        `insert into public.sources (publisher, url, document_title, publication_date, confidence, methodology)
select ${q(source.name)}, ${q(source.url)}, ${q(data.title)}, ${q(source.date)}::date, 'unverified', 'Cited on the published article. Not an observation print.'
where not exists (select 1 from public.sources where url = ${q(source.url)} and publisher = ${q(source.name)});`,
      );
      articleLines.push(
        `insert into public.article_sources (article_id, source_id)
select a.id, s.id from public.articles a
join public.sources s on s.url = ${q(source.url)} and s.publisher = ${q(source.name)}
where a.slug = ${q(slug)}
on conflict do nothing;`,
      );
    }
    articleCount += 1;
  }
}

function writeText(name: string, body: string) {
  const file = path.join(outDir, name);
  fs.writeFileSync(file, body.endsWith("\n") ? body : `${body}\n`);
  return file;
}

const countryValues = countries
  .map((country) => `(${q(country.slug)}, ${q(country.name)}, ${q(country.iso)}, ${q(country.region)}, ${q(country.currency)})`)
  .join(",\n");
const industryValues = industries.map((industry) => `(${q(industry.slug)}, ${q(industry.label)})`).join(",\n");
const currencyValues = [...currencyUsers.entries()]
  .map(([code, users]) => {
    const name = CURRENCY_NAMES[code];
    if (!name) throw new Error(`Missing currency name for ${code}`);
    return `(${q(code)}, ${q(name)}, ${q(users.length === 1 ? users[0] : "")})`;
  })
  .join(",\n");
const publisherValues = officialSources
  .map((source) => `(${q(source.label)}, ${q(source.href)}, ${q(source.kind)})`)
  .join(",\n");
const sourceValues = officialSources
  .map((source) => `(${q(source.label)}, ${q(source.href)}, ${q(source.note)})`)
  .join(",\n");
const exchangeValues = instruments
  .filter((row) => row.kind === "exchange")
  .map((item) => `(${q(item.slug)}, ${q(item.label)}, ${q(item.countrySlug ?? "")}, ${q(item.href)})`)
  .join(",\n");
const indicatorValues = indicators
  .map((indicator) => `(${q(indicator.slug)}, ${q(indicator.name)}, ${q(indicator.unit)})`)
  .join(",\n");
const companyValues = companies
  .filter((item) => !item.example)
  .map((company) => {
    const industry = industryForSector(company.sector) ?? "";
    const exchangeSlug = company.exchangeHref?.split("/").pop() ?? "";
    return `(${q(company.slug)}, ${q(company.name)}, ${q(company.countrySlug)}, ${q(industry)}, ${q(exchangeSlug)}, ${q(company.door?.href ?? "")})`;
  })
  .join(",\n");
const newsletterValues = newsletterProducts.map((item) => `(${q(item.slug)}, ${q(item.label)})`).join(",\n");
const corridorValues = corridors
  .map((corridor) => `(${q(corridor.slug)}, ${q(corridor.name)}, ${q(corridor.countrySlugs.length === 1 ? corridor.countrySlugs[0] : "")}, ${q(corridor.geography)})`)
  .join(",\n");
const signalValues = signals
  .map(
    (signal) =>
      `(${q(signal.title)}, ${q(signal.countrySlug ?? "")}, ${q(signal.sector)}, ${q(signal.category)}, ${q(signal.direction)}, ${q(signal.confidence)}, ${q(signal.severity)}, ${q(signal.horizon)}, ${q(signal.fact)}, ${q(signal.interpretation)})`,
  )
  .join(",\n");

const compactReference = `-- Reference catalogue. Example prices and observation values are omitted.
insert into public.regions (name) values
${regionNames.map((name) => `(${q(name)})`).join(",\n")}
on conflict (name) do nothing;

insert into public.countries (slug, name, iso2, region_id, currency_code)
select v.slug, v.name, v.iso2, r.id, v.currency
from (values
${countryValues}
) as v(slug, name, iso2, region, currency)
join public.regions r on r.name = v.region
on conflict (slug) do update set name = excluded.name, iso2 = excluded.iso2, region_id = excluded.region_id, currency_code = excluded.currency_code;

insert into public.industries (slug, name)
select v.slug, v.name from (values
${industryValues}
) as v(slug, name)
on conflict (slug) do update set name = excluded.name;

insert into public.currencies (code, name, country_id)
select v.code, v.name, c.id
from (values
${currencyValues}
) as v(code, name, country)
left join public.countries c on c.slug = v.country and v.country <> ''
on conflict (code) do update set name = excluded.name, country_id = excluded.country_id;

insert into public.publishers (name, homepage, kind)
select v.name, v.homepage, v.kind from (values
${publisherValues}
) as v(name, homepage, kind)
on conflict (name) do update set homepage = excluded.homepage, kind = excluded.kind;

insert into public.sources (publisher, url, confidence, methodology)
select v.publisher, v.url, 'unverified', v.note
from (values
${sourceValues}
) as v(publisher, url, note)
where not exists (select 1 from public.sources s where s.url = v.url);

insert into public.exchanges (slug, name, country_id, homepage)
select v.slug, v.name, c.id, v.homepage
from (values
${exchangeValues}
) as v(slug, name, country, homepage)
join public.countries c on c.slug = v.country
on conflict (slug) do update set name = excluded.name, country_id = excluded.country_id, homepage = excluded.homepage;

insert into public.economic_indicators (slug, name, unit, frequency)
select v.slug, v.name, v.unit, null from (values
${indicatorValues}
) as v(slug, name, unit)
on conflict (slug) do update set name = excluded.name, unit = excluded.unit;

insert into public.companies (slug, name, country_id, industry_id, listed, exchange_id, website)
select v.slug, v.name, c.id, i.id, true, e.id, nullif(v.website, '')
from (values
${companyValues}
) as v(slug, name, country, industry, exchange, website)
join public.countries c on c.slug = v.country
left join public.industries i on i.slug = v.industry and v.industry <> ''
left join public.exchanges e on e.slug = v.exchange and v.exchange <> ''
on conflict (slug) do update set name = excluded.name, country_id = excluded.country_id, industry_id = excluded.industry_id, listed = excluded.listed, exchange_id = excluded.exchange_id, website = excluded.website;

insert into public.newsletters (slug, name)
select v.slug, v.name from (values
${newsletterValues}
) as v(slug, name)
on conflict (slug) do update set name = excluded.name;

insert into public.infrastructure_projects (slug, name, country_id, corridor)
select v.slug, v.name, c.id, v.geography
from (values
${corridorValues}
) as v(slug, name, country, geography)
left join public.countries c on c.slug = v.country and v.country <> ''
where not exists (select 1 from public.infrastructure_projects p where p.slug = v.slug);

insert into public.signals (title, country_id, sector, category, direction, confidence, severity, time_horizon, fact, interpretation)
select v.title, c.id, v.sector, v.category, v.direction, v.confidence, v.severity, v.horizon, v.fact, v.interpretation
from (values
${signalValues}
) as v(title, country, sector, category, direction, confidence, severity, horizon, fact, interpretation)
left join public.countries c on c.slug = v.country and v.country <> ''
where not exists (select 1 from public.signals s where s.title = v.title);
`;

const entityValues = [...entities.values()]
  .map((entity) => {
    const meta = Object.fromEntries(Object.entries(entity.metadata).filter((entry) => entry[1]));
    return `(${q(entity.slug)}, ${q(entity.name)}, ${q(entity.kind)}, ${q(entity.countrySlug ?? "")}, ${q(JSON.stringify(meta))})`;
  })
  .join(",\n");
const compactEntities = `insert into public.entities (slug, name, kind, country_id, metadata)
select v.slug, v.name, v.kind, c.id, v.meta::jsonb
from (values
${entityValues}
) as v(slug, name, kind, country, meta)
left join public.countries c on c.slug = v.country and v.country <> ''
on conflict (slug) do update set name = excluded.name, kind = excluded.kind, country_id = excluded.country_id, metadata = excluded.metadata;
`;

const keptEdges = graphEdges.filter((edge) => entities.has(edge.from) && entities.has(edge.to));
const edgeValues = keptEdges.map((edge) => `(${q(edge.from)}, ${q(edge.to)}, ${q(edge.rel)})`).join(",\n");
const compactEdges = `insert into public.entity_relationships (from_entity_id, to_entity_id, rel_type)
select f.id, t.id, v.rel
from (values
${edgeValues}
) as v(from_slug, to_slug, rel)
join public.entities f on f.slug = v.from_slug
join public.entities t on t.slug = v.to_slug
on conflict (from_entity_id, to_entity_id, rel_type) do nothing;
`;

function write(name: string, body: string[]) {
  const file = path.join(outDir, name);
  fs.writeFileSync(file, `${body.join("\n")}\n`);
  return file;
}

const compactReferenceFile = writeText("c01_reference.sql", compactReference);
const compactEntityFile = writeText("c02_entities.sql", compactEntities);
const compactEdgeFile = writeText("c03_edges.sql", compactEdges);
const referenceFile = write("001_reference.sql", lines);
const entityFile = write("002_entities.sql", entityLines);
const edgeFile = write("003_relationships.sql", edgeLines);
const articleFile = write("004_articles.sql", articleLines);

console.log(
  JSON.stringify({
    regions: regionNames.length,
    countries: countries.length,
    industries: industries.length,
    currencies: currencyUsers.size,
    sources: officialSources.length,
    exchanges: instruments.filter((row) => row.kind === "exchange").length,
    companies: companies.filter((item) => !item.example).length,
    newsletters: newsletterProducts.length,
    corridors: corridors.length,
    signals: signals.length,
    entities: entities.size,
    edges: edgeLines.length,
    skippedEdges,
    articles: articleCount,
    files: [compactReferenceFile, compactEntityFile, compactEdgeFile, referenceFile, entityFile, edgeFile, articleFile].map((file) => ({
      file,
      bytes: fs.statSync(file).size,
    })),
  }),
);
