-- Channel publishing reliability.
-- 1) Ledger: one row per (channel, date, slot) once it was published, so a missed hourly run can be caught up later
--    without ever posting a Reel twice.
-- 2) Backup trigger: GitHub drops scheduled runs under load (8 Nov 2026: 06:32-09:32 IST all skipped). pg_cron fires a
--    repository_dispatch every hour; the workflows treat it like their own schedule. Needs a Vault secret named
--    'gh_dispatch_token' (fine-grained PAT, Winplaybox/Remotion, Contents: read & write). Without it the tick does nothing.

create extension if not exists pg_net with schema extensions;

create table if not exists videobot.channel_posts (
  channel text not null,
  date date not null,
  slot int not null,
  n int not null,
  status text not null check (status in ('DONE', 'META_FAILED')),
  youtube_id text not null default '',
  meta text not null default '',
  run_id text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (channel, date, slot)
);
alter table videobot.channel_posts enable row level security;
revoke all on videobot.channel_posts from public, anon, authenticated;

-- [{channel, date, slot}] -> the ones that already have a ledger row (any status: META_FAILED is never auto-retried).
create or replace function public.videobot_channel_posts_status(p_items jsonb) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('channel', c.channel, 'date', c.date, 'slot', c.slot, 'n', c.n, 'status', c.status)), '[]')
  from videobot.channel_posts c
  join jsonb_to_recordset(coalesce(p_items, '[]')) as i(channel text, date date, slot int) on i.channel = c.channel and i.date = c.date and i.slot = c.slot
$$;

create or replace function public.videobot_channel_post_record(p_channel text, p_date date, p_slot int, p_n int, p_status text, p_youtube_id text, p_meta text, p_run_id text) returns jsonb
language sql security definer set search_path = '' as $$
  insert into videobot.channel_posts (channel, date, slot, n, status, youtube_id, meta, run_id)
  values (p_channel, p_date, p_slot, p_n, p_status, coalesce(p_youtube_id, ''), coalesce(p_meta, ''), coalesce(p_run_id, ''))
  on conflict (channel, date, slot) do update set n = excluded.n, status = excluded.status,
    youtube_id = case when excluded.youtube_id = '' then videobot.channel_posts.youtube_id else excluded.youtube_id end,
    meta = excluded.meta, run_id = excluded.run_id, updated_at = now()
  returning jsonb_build_object('channel', channel, 'date', date, 'slot', slot, 'status', status)
$$;

-- Hourly backup tick -> repository_dispatch (publish-tick, maintenance-tick).
create or replace function videobot.github_tick() returns void
language plpgsql security definer set search_path = '' as $$
declare tok text; ev text;
begin
  select decrypted_secret into tok from vault.decrypted_secrets where name = 'gh_dispatch_token' limit 1;
  if coalesce(tok, '') = '' then return; end if;
  foreach ev in array array['publish-tick', 'maintenance-tick'] loop
    perform net.http_post(
      url := 'https://api.github.com/repos/Winplaybox/Remotion/dispatches',
      headers := jsonb_build_object('authorization', 'Bearer ' || tok, 'accept', 'application/vnd.github+json',
                                    'user-agent', 'videobot-tick', 'content-type', 'application/json'),
      body := jsonb_build_object('event_type', ev, 'client_payload', jsonb_build_object('source', 'supabase-cron')));
  end loop;
end $$;
revoke all on function videobot.github_tick() from public, anon, authenticated;

do $$
declare f text;
begin
  for f in select p.oid::regprocedure::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname in ('videobot_channel_posts_status', 'videobot_channel_post_record')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;

-- :07 every hour (GitHub's own cron is :02; duplicates are harmless: concurrency group + ledger).
select cron.unschedule(jobid) from cron.job where jobname = 'videobot-github-tick';
select cron.schedule('videobot-github-tick', '7 * * * *', 'select videobot.github_tick()');
