-- Optional user-owned data. iBuddy does not insert page content unless the user chooses Save.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  save_analyses boolean not null default false,
  history_sync_enabled boolean not null default false,
  analysis_retention_days integer not null default 0 check (analysis_retention_days between 0 and 3650),
  updated_at timestamptz not null default now()
);
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null check (url like 'https://%'),
  title text not null default '',
  created_at timestamptz not null default now(),
  unique(user_id, url)
);
create table if not exists public.history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null check (url like 'https://%'),
  title text not null default '',
  visited_at timestamptz not null default now()
);
create index if not exists history_user_visited_idx on public.history(user_id, visited_at desc);
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation',
  source_url text check (source_url is null or source_url like 'https://%'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null check (length(content) <= 12000),
  created_at timestamptz not null default now()
);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_url text not null check (source_url like 'https://%'),
  title text not null default '',
  summary text not null check (length(summary) <= 16000),
  created_at timestamptz not null default now()
);
create index if not exists analyses_user_created_idx on public.analyses(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.bookmarks enable row level security;
alter table public.history enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.analyses enable row level security;

create policy "Profiles are private to their owner" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Settings are private to their owner" on public.user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Bookmarks are private to their owner" on public.bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "History is private to their owner" on public.history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Conversations are private to their owner" on public.conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Messages are private to their owner" on public.messages for all
  using (auth.uid() = user_id and exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()))
  with check (auth.uid() = user_id and exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));
create policy "Analyses are private to their owner" on public.analyses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Rate-limit records remain service-role only; no direct client access.
revoke all on public.ibuddy_ai_rate_limits from anon, authenticated;
