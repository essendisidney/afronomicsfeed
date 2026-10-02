-- Jobs board: submissions are free, publication follows a job_listing payment (af_job_publish) or the desk.
-- Applied 2026-10-02 via MCP; see pg_get_functiondef for af_job_submit / af_jobs / af_job_publish.
create table if not exists public.af_jobs (
  id bigserial primary key,
  title text not null,
  institution text not null,
  location text,
  role_type text,
  closes date,
  apply_url text,
  description text,
  email text not null,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.af_jobs enable row level security;
