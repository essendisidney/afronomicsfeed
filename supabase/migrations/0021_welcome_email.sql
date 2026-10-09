-- Welcome email (9 Oct 2026). af_subscribe_v2 says whether the address is new, so the site sends exactly one
-- welcome email (with the free guide) to each new subscriber, and lets someone who unsubscribed sign up again.
-- At most 60 welcome emails an hour overall, so the form cannot be used to send mail in bulk to other people.
-- af_subscribe (v1) stays for the deploy window.

alter table public.subscribers add column if not exists welcomed_at timestamptz;

create or replace function public.af_subscribe_v2(p_email text, p_role text default 'other', p_source text default null)
returns text
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_email text := lower(trim(p_email));
  v_row public.subscribers%rowtype;
begin
  if v_email is null or length(v_email) > 200 or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then
    raise exception 'invalid email';
  end if;
  select * into v_row from public.subscribers where email = v_email;
  if found then
    if v_row.unsubscribed_at is null then
      return 'exists';
    end if;
    update public.subscribers set unsubscribed_at = null where email = v_email;
  else
    insert into public.subscribers (email, role, source)
    values (v_email,
            case when p_role in ('investor','bank','dfi','corporate','research','founder','other') then p_role else 'other' end,
            left(coalesce(p_source, ''), 120));
  end if;
  -- One welcome per address, and no more than 60 an hour overall.
  if (select welcomed_at from public.subscribers where email = v_email) is not null
     or (select count(*) from public.subscribers where welcomed_at > now() - interval '1 hour') >= 60 then
    return 'added';
  end if;
  update public.subscribers set welcomed_at = now() where email = v_email;
  return 'welcome';
end;
$function$;

revoke all on function public.af_subscribe_v2(text, text, text) from public;
grant execute on function public.af_subscribe_v2(text, text, text) to anon, authenticated, service_role;
