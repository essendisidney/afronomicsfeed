-- Afronomics Feed core schema
-- Observations are append-only. Model output never writes verified facts.
-- Apply on a dedicated Afronomics Supabase project. Service role stays server-side.

create extension if not exists pgcrypto;
create extension if not exists vector;

do $$ begin
  create type data_status as enum (
    'verified',
    'primary_source',
    'secondary_source',
    'estimated',
    'modelled',
    'unverified',
    'demo'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type subscription_tier as enum ('free', 'pro', 'professional', 'enterprise');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type editorial_role as enum ('admin', 'editor', 'analyst', 'contributor');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type article_kind as enum ('original', 'analysis', 'from_the_web');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  organisation text,
  role editorial_role,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  tier subscription_tier not null default 'free',
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  publisher text not null,
  url text,
  document_title text,
  dataset text,
  publication_date date,
  retrieved_at timestamptz,
  observation_date date,
  confidence data_status not null default 'unverified',
  methodology text,
  created_at timestamptz not null default now()
);

create table if not exists public.publishers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  homepage text,
  kind text
);

create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique
);

create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  iso2 char(2) not null unique,
  region_id uuid references public.regions (id),
  currency_code char(3)
);

create table if not exists public.industries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  kind text not null,
  country_id uuid references public.countries (id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.entity_relationships (
  id uuid primary key default gen_random_uuid(),
  from_entity_id uuid not null references public.entities (id) on delete cascade,
  to_entity_id uuid not null references public.entities (id) on delete cascade,
  rel_type text not null,
  source_id uuid references public.sources (id),
  as_of date,
  unique (from_entity_id, to_entity_id, rel_type)
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  kind article_kind not null default 'original',
  status text not null default 'draft',
  published_at timestamptz,
  author_id uuid references public.authors (id),
  body_markdown text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.article_sources (
  article_id uuid not null references public.articles (id) on delete cascade,
  source_id uuid not null references public.sources (id) on delete cascade,
  primary key (article_id, source_id)
);

create table if not exists public.article_entities (
  article_id uuid not null references public.articles (id) on delete cascade,
  entity_id uuid not null references public.entities (id) on delete cascade,
  primary key (article_id, entity_id)
);

create table if not exists public.economic_indicators (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  unit text,
  frequency text
);

create table if not exists public.indicator_observations (
  id uuid primary key default gen_random_uuid(),
  indicator_id uuid not null references public.economic_indicators (id),
  country_id uuid references public.countries (id),
  geography text,
  value numeric,
  unit text,
  currency char(3),
  source_id uuid not null references public.sources (id),
  observation_date date not null,
  retrieved_at timestamptz not null default now(),
  status data_status not null default 'unverified',
  methodology text
);

create table if not exists public.currencies (
  code char(3) primary key,
  name text not null,
  country_id uuid references public.countries (id)
);

create table if not exists public.exchanges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  country_id uuid references public.countries (id),
  homepage text
);

create table if not exists public.market_prices (
  id uuid primary key default gen_random_uuid(),
  instrument text not null,
  value numeric,
  unit text,
  currency char(3),
  source_id uuid not null references public.sources (id),
  observation_date timestamptz not null,
  retrieved_at timestamptz not null default now(),
  delay_note text,
  status data_status not null default 'unverified'
);

create table if not exists public.investors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  kind text
);

create table if not exists public.funds (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  investor_id uuid references public.investors (id)
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  country_id uuid references public.countries (id),
  industry_id uuid references public.industries (id),
  listed boolean,
  exchange_id uuid references public.exchanges (id),
  website text,
  claimed_by uuid references public.profiles (id)
);

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role_title text
);

create table if not exists public.capital_transactions (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references public.investors (id),
  fund_id uuid references public.funds (id),
  company_id uuid references public.companies (id),
  country_id uuid references public.countries (id),
  capital_type text not null,
  amount numeric,
  currency char(3),
  stage text,
  announced_on date,
  source_id uuid not null references public.sources (id),
  observation_date date,
  retrieved_at timestamptz not null default now(),
  status data_status not null default 'unverified'
);

create table if not exists public.startups (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id),
  year_founded int,
  business_model text,
  status text
);

create table if not exists public.funding_rounds (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups (id),
  capital_transaction_id uuid references public.capital_transactions (id)
);

create table if not exists public.climate_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  country_id uuid references public.countries (id),
  sector text,
  sponsor text,
  stage text,
  funding_status text,
  source_id uuid references public.sources (id)
);

create table if not exists public.climate_finance (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.climate_projects (id),
  country_id uuid references public.countries (id),
  committed numeric,
  deployed numeric,
  requirement numeric,
  currency char(3),
  source_id uuid not null references public.sources (id),
  observation_date date not null,
  retrieved_at timestamptz not null default now(),
  status data_status not null default 'unverified',
  methodology text
);

create table if not exists public.infrastructure_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  country_id uuid references public.countries (id),
  corridor text,
  source_id uuid references public.sources (id)
);

create table if not exists public.trade_flows (
  id uuid primary key default gen_random_uuid(),
  reporter_country_id uuid references public.countries (id),
  partner_country_id uuid references public.countries (id),
  commodity text,
  flow text,
  value numeric,
  currency char(3),
  source_id uuid not null references public.sources (id),
  observation_date date not null,
  retrieved_at timestamptz not null default now(),
  status data_status not null default 'unverified'
);

create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  country_id uuid references public.countries (id),
  sector text,
  category text not null,
  direction text,
  confidence text,
  severity text,
  time_horizon text,
  fact text,
  calculation text,
  model_note text,
  interpretation text,
  created_at timestamptz not null default now()
);

create table if not exists public.signal_evidence (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.signals (id) on delete cascade,
  source_id uuid references public.sources (id),
  note text
);

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  name text not null
);

create table if not exists public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  watchlist_id uuid not null references public.watchlists (id) on delete cascade,
  entity_id uuid references public.entities (id),
  label text
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  query text not null,
  channel text not null default 'email',
  active boolean not null default true
);

create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  query text not null
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_id uuid references public.sources (id),
  uri text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding vector(1536)
);

create table if not exists public.citations (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents (id),
  source_id uuid references public.sources (id),
  excerpt text
);

create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  newsletter_id uuid references public.newsletters (id),
  created_at timestamptz not null default now()
);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  hashed_key text not null unique,
  label text,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists public.api_usage (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid not null references public.api_keys (id) on delete cascade,
  path text not null,
  called_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  entity text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists indicator_observations_lookup_idx
  on public.indicator_observations (indicator_id, country_id, observation_date desc);
create index if not exists market_prices_lookup_idx
  on public.market_prices (instrument, observation_date desc);
create index if not exists capital_tx_lookup_idx
  on public.capital_transactions (country_id, capital_type, announced_on desc);
create index if not exists climate_finance_lookup_idx
  on public.climate_finance (country_id, observation_date desc);
create index if not exists entity_rel_from_idx on public.entity_relationships (from_entity_id);
create index if not exists document_chunks_doc_idx on public.document_chunks (document_id);

-- Approximate nearest neighbour once embeddings exist.
do $$ begin
  create index document_chunks_embedding_idx
    on public.document_chunks
    using hnsw (embedding vector_cosine_ops);
exception when undefined_object then null;
end $$;

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.sources enable row level security;
alter table public.publishers enable row level security;
alter table public.authors enable row level security;
alter table public.regions enable row level security;
alter table public.countries enable row level security;
alter table public.industries enable row level security;
alter table public.entities enable row level security;
alter table public.entity_relationships enable row level security;
alter table public.articles enable row level security;
alter table public.article_sources enable row level security;
alter table public.article_entities enable row level security;
alter table public.economic_indicators enable row level security;
alter table public.indicator_observations enable row level security;
alter table public.currencies enable row level security;
alter table public.exchanges enable row level security;
alter table public.market_prices enable row level security;
alter table public.investors enable row level security;
alter table public.funds enable row level security;
alter table public.companies enable row level security;
alter table public.people enable row level security;
alter table public.capital_transactions enable row level security;
alter table public.startups enable row level security;
alter table public.funding_rounds enable row level security;
alter table public.climate_projects enable row level security;
alter table public.climate_finance enable row level security;
alter table public.infrastructure_projects enable row level security;
alter table public.trade_flows enable row level security;
alter table public.signals enable row level security;
alter table public.signal_evidence enable row level security;
alter table public.watchlists enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.alerts enable row level security;
alter table public.saved_searches enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.citations enable row level security;
alter table public.newsletters enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.api_keys enable row level security;
alter table public.api_usage enable row level security;
alter table public.audit_logs enable row level security;

-- Public read of reference and published intelligence. Writes stay on the service role.
create policy sources_read on public.sources for select using (true);
create policy publishers_read on public.publishers for select using (true);
create policy authors_read on public.authors for select using (true);
create policy regions_read on public.regions for select using (true);
create policy countries_read on public.countries for select using (true);
create policy industries_read on public.industries for select using (true);
create policy entities_read on public.entities for select using (true);
create policy relationships_read on public.entity_relationships for select using (true);
create policy articles_read on public.articles for select using (status = 'published');
create policy article_sources_read on public.article_sources for select using (true);
create policy article_entities_read on public.article_entities for select using (true);
create policy indicators_read on public.economic_indicators for select using (true);
create policy observations_read on public.indicator_observations for select using (true);
create policy currencies_read on public.currencies for select using (true);
create policy exchanges_read on public.exchanges for select using (true);
create policy prices_read on public.market_prices for select using (true);
create policy investors_read on public.investors for select using (true);
create policy funds_read on public.funds for select using (true);
create policy companies_read on public.companies for select using (true);
create policy people_read on public.people for select using (true);
create policy capital_read on public.capital_transactions for select using (true);
create policy startups_read on public.startups for select using (true);
create policy rounds_read on public.funding_rounds for select using (true);
create policy climate_projects_read on public.climate_projects for select using (true);
create policy climate_finance_read on public.climate_finance for select using (true);
create policy infra_read on public.infrastructure_projects for select using (true);
create policy trade_read on public.trade_flows for select using (true);
create policy signals_read on public.signals for select using (true);
create policy signal_evidence_read on public.signal_evidence for select using (true);
create policy newsletters_read on public.newsletters for select using (true);
create policy documents_read on public.documents for select using (published = true);
create policy chunks_read on public.document_chunks for select using (
  exists (select 1 from public.documents d where d.id = document_id and d.published = true)
);
create policy citations_read on public.citations for select using (true);

create policy profiles_own on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy subscriptions_own on public.subscriptions
  for select using (profile_id = auth.uid());

create policy watchlists_own on public.watchlists
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy watchlist_items_own on public.watchlist_items
  for all using (
    exists (select 1 from public.watchlists w where w.id = watchlist_id and w.profile_id = auth.uid())
  ) with check (
    exists (select 1 from public.watchlists w where w.id = watchlist_id and w.profile_id = auth.uid())
  );

create policy alerts_own on public.alerts
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy saved_searches_own on public.saved_searches
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy api_keys_own on public.api_keys
  for select using (profile_id = auth.uid());

create policy newsletter_insert on public.newsletter_subscribers
  for insert with check (true);

-- Claimed company profiles may not overwrite editorial fields from the client.
-- Editorial writes use the service role after audit.
