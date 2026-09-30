-- Newsletter and lead capture for the Afronomics Weekly.
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null default 'other',
  source text,
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

alter table public.subscribers enable row level security;
-- No public policies: only the service role (server routes) can read or write.
