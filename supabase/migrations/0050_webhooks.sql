-- NOT YET APPLIED. Apply only on the founder's yes. auction.published webhooks for data-licence holders
-- (founder-strategy-pack.md section H2, M phase 5).
--
-- Adds:
--   * webhook_subscriptions: one https URL per API key (data_keys, 0028), optional market filter. The signing secret
--     is not stored: the site derives it from the cron secret and the subscription id (lib/webhooks.ts).
--   * webhook_deliveries: one row per subscription and event, claimed before the POST so nothing is sent twice.
--   * af_desk_webhook_add, af_desk_webhook_off, af_desk_webhooks, af_webhook_targets, af_webhook_claim,
--     af_webhook_result.
--
-- Same model as 0028/0037: RLS on, no policies, SECURITY DEFINER functions gated by the cron secret.

create table if not exists public.webhook_subscriptions (
  id bigint generated always as identity primary key,
  key_id bigint not null references public.data_keys (id) on delete cascade,
  url text not null check (url ~ '^https://[^\s/$.?#].[^\s]*$' and length(url) <= 500),
  markets text[] check (markets is null or cardinality(markets) <= 20),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.webhook_subscriptions enable row level security;

create table if not exists public.webhook_deliveries (
  subscription_id bigint not null references public.webhook_subscriptions (id) on delete cascade,
  event_id text not null check (length(event_id) <= 120),
  claimed_at timestamptz not null default now(),
  status int,
  primary key (subscription_id, event_id)
);
alter table public.webhook_deliveries enable row level security;

create or replace function public.af_desk_webhook_add(p_secret text, p_key_id bigint, p_url text, p_markets text[])
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare v_id bigint;
begin
  if not public.af_secret_ok(p_secret) then return null; end if;
  if not exists (select 1 from public.data_keys where id = p_key_id and revoked_at is null) then
    return jsonb_build_object('ok', false, 'reason', 'no live API key with that number');
  end if;
  if p_url !~ '^https://[^\s/$.?#].[^\s]*$' or length(p_url) > 500 then
    return jsonb_build_object('ok', false, 'reason', 'an https URL is required');
  end if;
  insert into public.webhook_subscriptions (key_id, url, markets) values (p_key_id, p_url, nullif(p_markets, '{}')) returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id);
end
$function$;

create or replace function public.af_desk_webhook_off(p_secret text, p_id bigint)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
begin
  if not public.af_secret_ok(p_secret) then return null; end if;
  update public.webhook_subscriptions set active = false where id = p_id;
  if not found then return jsonb_build_object('ok', false, 'reason', 'no such webhook'); end if;
  return jsonb_build_object('ok', true);
end
$function$;

create or replace function public.af_desk_webhooks(p_secret text)
returns jsonb language sql stable security definer set search_path to 'public' as $function$
  select case when not public.af_secret_ok(p_secret) then null else coalesce((
    select jsonb_agg(jsonb_build_object('id', s.id, 'key_id', s.key_id, 'key_label', k.label, 'url', s.url, 'markets', s.markets,
      'active', s.active and k.revoked_at is null and (to_jsonb(k) ->> 'expires_at' is null or (to_jsonb(k) ->> 'expires_at')::timestamptz > now()),
      'created_at', s.created_at,
      'delivered', (select count(*) from public.webhook_deliveries d where d.subscription_id = s.id and d.status between 200 and 299),
      'failed', (select count(*) from public.webhook_deliveries d where d.subscription_id = s.id and (d.status is null or d.status not between 200 and 299)))
      order by s.id)
    from public.webhook_subscriptions s join public.data_keys k on k.id = s.key_id), '[]'::jsonb) end
$function$;

-- Active subscriptions whose key is live (not revoked, not expired where 0035 set an expiry).
create or replace function public.af_webhook_targets(p_secret text)
returns jsonb language sql stable security definer set search_path to 'public' as $function$
  select case when not public.af_secret_ok(p_secret) then null else coalesce((
    select jsonb_agg(jsonb_build_object('id', s.id, 'url', s.url, 'markets', s.markets))
    from public.webhook_subscriptions s join public.data_keys k on k.id = s.key_id
    where s.active and k.revoked_at is null and (to_jsonb(k) ->> 'expires_at' is null or (to_jsonb(k) ->> 'expires_at')::timestamptz > now())), '[]'::jsonb) end
$function$;

-- Claim an event for a subscription; false when it was already claimed (sent, or being sent).
create or replace function public.af_webhook_claim(p_secret text, p_sub bigint, p_event text)
returns boolean language plpgsql security definer set search_path to 'public' as $function$
begin
  if not public.af_secret_ok(p_secret) then return null; end if;
  insert into public.webhook_deliveries (subscription_id, event_id) values (p_sub, p_event) on conflict do nothing;
  return found;
end
$function$;

-- Record the receiver's HTTP status. A failure (no 2xx) gives the claim back so the next run tries again, up to the
-- event's own age limit in the sender.
create or replace function public.af_webhook_result(p_secret text, p_sub bigint, p_event text, p_status int)
returns boolean language plpgsql security definer set search_path to 'public' as $function$
begin
  if not public.af_secret_ok(p_secret) then return null; end if;
  if p_status between 200 and 299 then
    update public.webhook_deliveries set status = p_status where subscription_id = p_sub and event_id = p_event;
  else
    delete from public.webhook_deliveries where subscription_id = p_sub and event_id = p_event;
  end if;
  return true;
end
$function$;

revoke all on function public.af_desk_webhook_add(text, bigint, text, text[]) from public;
revoke all on function public.af_desk_webhook_off(text, bigint) from public;
revoke all on function public.af_desk_webhooks(text) from public;
revoke all on function public.af_webhook_targets(text) from public;
revoke all on function public.af_webhook_claim(text, bigint, text) from public;
revoke all on function public.af_webhook_result(text, bigint, text, int) from public;
grant execute on function public.af_desk_webhook_add(text, bigint, text, text[]) to anon, authenticated, service_role;
grant execute on function public.af_desk_webhook_off(text, bigint) to anon, authenticated, service_role;
grant execute on function public.af_desk_webhooks(text) to anon, authenticated, service_role;
grant execute on function public.af_webhook_targets(text) to anon, authenticated, service_role;
grant execute on function public.af_webhook_claim(text, bigint, text) to anon, authenticated, service_role;
grant execute on function public.af_webhook_result(text, bigint, text, int) to anon, authenticated, service_role;
