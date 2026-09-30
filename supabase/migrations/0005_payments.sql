-- Paystack records, written by /api/paystack/webhook after signature verification.
create table if not exists public.payments (
  reference text primary key,
  email text,
  plan text,
  amount bigint not null default 0,
  currency text,
  status text not null,
  channel text,
  paid_at timestamptz,
  raw jsonb,
  created_at timestamptz not null default now()
);
create index if not exists payments_email_idx on public.payments (email);

create table if not exists public.paid_subscriptions (
  subscription_code text primary key,
  email text,
  plan_code text,
  status text not null,
  next_payment_date timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists paid_subscriptions_email_idx on public.paid_subscriptions (email);

alter table public.payments enable row level security;
alter table public.paid_subscriptions enable row level security;
