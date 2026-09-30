-- One-question page feedback ("Did you find what you were looking for?"). Anonymous; no identifiers stored.
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path text not null,
  found boolean,
  looking_for text,
  role text,
  country text not null default ''
);
alter table public.feedback enable row level security;
-- af_feedback(p_path, p_found, p_text, p_role, p_country): validated insert, 30/minute global cap. Security definer.
