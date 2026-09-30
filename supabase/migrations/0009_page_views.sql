-- Privacy-first page counts (applied 30 Sep 2026). See app/api/hit/route.ts.
create table if not exists public.page_views (
  day date not null,
  path text not null,
  referrer text not null default '',
  country text not null default '',
  views integer not null default 0,
  primary key (day, path, referrer, country)
);
alter table public.page_views enable row level security;
-- af_hit(p_path, p_referrer, p_country) increments a row; af_traffic(p_days) returns totals. Both security definer.
