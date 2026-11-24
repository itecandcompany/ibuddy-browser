-- iBuddy database advisor follow-up: index user-owned foreign keys and cache auth.uid() per statement.
create index if not exists conversations_user_id_idx on public.conversations(user_id);
create index if not exists messages_user_id_idx on public.messages(user_id);

drop policy if exists "Users manage their own locked domains" on public.locked_domains;
create policy "Users manage their own locked domains"
  on public.locked_domains for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Profiles are private to their owner" on public.profiles;
create policy "Profiles are private to their owner"
  on public.profiles for all
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "Settings are private to their owner" on public.user_settings;
create policy "Settings are private to their owner"
  on public.user_settings for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Bookmarks are private to their owner" on public.bookmarks;
create policy "Bookmarks are private to their owner"
  on public.bookmarks for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "History is private to their owner" on public.history;
create policy "History is private to their owner"
  on public.history for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Conversations are private to their owner" on public.conversations;
create policy "Conversations are private to their owner"
  on public.conversations for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Messages are private to their owner" on public.messages;
create policy "Messages are private to their owner"
  on public.messages for all
  using (
    user_id = (select auth.uid())
    and exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = (select auth.uid()))
  )
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = (select auth.uid()))
  );

drop policy if exists "Analyses are private to their owner" on public.analyses;
create policy "Analyses are private to their owner"
  on public.analyses for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
