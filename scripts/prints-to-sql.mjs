import fs from "node:fs";

const raw = JSON.parse(fs.readFileSync(new URL("./prints.json", import.meta.url), "utf8"));
const best = new Map();
for (const print of raw) {
  const key = `${print.indicatorSlug}|${print.iso}`;
  const current = best.get(key);
  if (!current || print.year > current.year) best.set(key, print);
}
const prints = [...best.values()];
const counts = {};
for (const print of prints) counts[print.indicatorSlug] = (counts[print.indicatorSlug] ?? 0) + 1;
const bad = prints.filter((print) => !Number.isFinite(print.value) || !/^[A-Z]{2}$/.test(print.iso) || !/^\d{4}-01-01$/.test(print.observationDate));
if (bad.length) throw new Error(`Refusing ${bad.length} malformed prints`);

const quote = (value) => String(value).replaceAll("'", "''");
const values = prints.map((print) => `('${print.indicatorSlug}','${print.iso}',${print.value},'${quote(print.unit)}','${print.observationDate}','${quote(print.seriesCode)}','${quote(print.seriesName)}')`).join(",\n");

const sql = `insert into public.publishers (name, homepage, kind)
values ('World Bank', 'https://data.worldbank.org/', 'international')
on conflict (name) do update set homepage = excluded.homepage;

insert into public.sources (publisher, url, document_title, dataset, confidence, methodology, retrieved_at)
select 'World Bank', 'https://api.worldbank.org/v2/', 'World Bank Open Data API', 'annual indicators', 'secondary_source',
  'Structured API. A row is written only when a finite value and a year are present.', now()
where not exists (select 1 from public.sources where url = 'https://api.worldbank.org/v2/');

insert into public.indicator_observations (
  indicator_id, country_id, geography, value, unit, source_id, observation_date, status, methodology
)
select i.id, c.id, c.name, v.value, v.unit, s.id, v.observation_date::date, 'secondary_source',
  'World Bank Open Data series ' || v.code || ' (' || v.series_name || '). Latest non-null annual value. The date is 1 January of the published year.'
from (values
${values}
) as v(indicator_slug, iso2, value, unit, observation_date, code, series_name)
join public.economic_indicators i on i.slug = v.indicator_slug
join public.countries c on c.iso2 = v.iso2
join public.sources s on s.url = 'https://api.worldbank.org/v2/'
where not exists (
  select 1 from public.indicator_observations o
  where o.indicator_id = i.id
    and o.country_id = c.id
    and o.observation_date = v.observation_date::date
    and o.source_id = s.id
    and o.value = v.value
);
`;

fs.writeFileSync(new URL("./prints.sql", import.meta.url), sql);
console.log(JSON.stringify({ prints: prints.length, counts, sql: sql.length }));
