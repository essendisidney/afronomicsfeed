-- The Afronomics archive: history the public APIs don't keep.

-- One row per currency per day, from the reference feed.
create table if not exists public.fx_daily (
  day date not null,
  base text not null default 'USD',
  code text not null,
  rate numeric not null,
  source text not null,
  captured_at timestamptz not null default now(),
  primary key (day, base, code)
);

-- Every headline the Wire has carried, tagged by country and desk.
create table if not exists public.wire_archive (
  url text primary key,
  title text not null,
  publisher text not null,
  published_at timestamptz not null,
  summary text,
  countries text[] not null default '{}',
  desks text[] not null default '{}',
  captured_at timestamptz not null default now()
);

create index if not exists wire_archive_published_idx on public.wire_archive (published_at desc);
create index if not exists wire_archive_countries_idx on public.wire_archive using gin (countries);

alter table public.fx_daily enable row level security;
alter table public.wire_archive enable row level security;
-- Server-side (service role) access only.
