-- iBuddy server-side lock policy and atomic per-user AI rate limits.
create table if not exists public.locked_domains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  domain text not null check (length(domain) between 1 and 253),
  is_locked boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, domain)
);

alter table public.locked_domains enable row level security;
create policy "Users manage their own locked domains"
  on public.locked_domains for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.ibuddy_ai_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null check (length(bucket) between 1 and 64),
  window_started_at timestamptz not null,
  request_count integer not null default 0,
  primary key (user_id, bucket)
);
alter table public.ibuddy_ai_rate_limits enable row level security;
revoke all on public.ibuddy_ai_rate_limits from anon, authenticated;

create or replace function public.ibuddy_consume_ai_rate_limit(
  p_user_id uuid, p_bucket text, p_limit integer
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare allowed boolean;
begin
  if p_limit < 1 or p_limit > 100 then return false; end if;
  insert into public.ibuddy_ai_rate_limits(user_id, bucket, window_started_at, request_count)
  values (p_user_id, p_bucket, now(), 1)
  on conflict (user_id, bucket) do update
    set window_started_at = case
      when public.ibuddy_ai_rate_limits.window_started_at < now() - interval '1 minute' then now()
      else public.ibuddy_ai_rate_limits.window_started_at end,
    request_count = case
      when public.ibuddy_ai_rate_limits.window_started_at < now() - interval '1 minute' then 1
      else public.ibuddy_ai_rate_limits.request_count + 1 end;
  select request_count <= p_limit into allowed
  from public.ibuddy_ai_rate_limits where user_id = p_user_id and bucket = p_bucket;
  return coalesce(allowed, false);
end;
$$;
revoke all on function public.ibuddy_consume_ai_rate_limit(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.ibuddy_consume_ai_rate_limit(uuid, text, integer) to service_role;

-- User-owned saved artifacts are created in later phases; no page text is stored by these functions.
