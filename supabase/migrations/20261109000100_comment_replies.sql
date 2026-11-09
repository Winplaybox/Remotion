-- Comment auto-reply (YouTube / Instagram / Facebook).
-- comment_replies: one row per viewer comment we answered -> never reply twice, daily caps (YouTube quota).
-- channel_settings: per-channel switches from the admin dashboard (auto_reply on/off).

create table if not exists videobot.comment_replies (
  platform text not null check (platform in ('youtube', 'instagram', 'facebook')),
  comment_id text not null,
  channel text not null,
  post_n int not null default 0,
  kind text not null default '',
  reply_id text not null default '',
  created_at timestamptz not null default now(),
  primary key (platform, comment_id)
);
create index if not exists comment_replies_recent on videobot.comment_replies (platform, created_at desc);
alter table videobot.comment_replies enable row level security;
revoke all on videobot.comment_replies from public, anon, authenticated;

create table if not exists videobot.channel_settings (
  channel text primary key,
  settings jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table videobot.channel_settings enable row level security;
revoke all on videobot.channel_settings from public, anon, authenticated;

-- Which of these comment ids were already answered.
create or replace function public.videobot_comment_replied(p_platform text, p_ids text[]) returns text[]
language sql stable security definer set search_path = '' as $$
  select coalesce(array_agg(comment_id), '{}') from videobot.comment_replies where platform = p_platform and comment_id = any(coalesce(p_ids, '{}'))
$$;

create or replace function public.videobot_comment_reply_record(p_platform text, p_comment_id text, p_channel text, p_n int, p_kind text, p_reply_id text) returns boolean
language sql security definer set search_path = '' as $$
  insert into videobot.comment_replies (platform, comment_id, channel, post_n, kind, reply_id)
  values (p_platform, p_comment_id, p_channel, coalesce(p_n, 0), coalesce(p_kind, ''), coalesce(p_reply_id, ''))
  on conflict (platform, comment_id) do nothing
  returning true
$$;

-- Replies sent on a platform since a moment (daily cap).
create or replace function public.videobot_comment_reply_count(p_platform text, p_since timestamptz) returns int
language sql stable security definer set search_path = '' as $$
  select count(*)::int from videobot.comment_replies where platform = p_platform and created_at >= p_since
$$;

-- Ledger rows of the last days for one channel (post number <-> YouTube / Instagram / Facebook ids).
create or replace function public.videobot_channel_posts_recent(p_channel text, p_days int) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('n', n, 'date', date, 'slot', slot, 'status', status, 'youtube_id', youtube_id,
                                               'social', social, 'created_at', created_at) order by n), '[]')
  from videobot.channel_posts
  where channel = p_channel and created_at >= now() - make_interval(days => greatest(1, least(coalesce(p_days, 7), 30)))
$$;

create or replace function public.videobot_channel_settings_list() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('channel', s.channel, 'settings', s.settings, 'updated_at', s.updated_at,
    'replies_24h', (select count(*) from videobot.comment_replies r where r.channel = s.channel and r.created_at >= now() - interval '24 hours'))), '[]')
  from (select channel, settings, updated_at from videobot.channel_settings
        union select distinct r.channel, '{}'::jsonb, null::timestamptz from videobot.comment_replies r
        where not exists (select 1 from videobot.channel_settings c where c.channel = r.channel)) s
$$;

create or replace function public.videobot_channel_settings_save(p_channel text, p_patch jsonb) returns jsonb
language sql security definer set search_path = '' as $$
  insert into videobot.channel_settings (channel, settings) values (p_channel, coalesce(p_patch, '{}'))
  on conflict (channel) do update set settings = videobot.channel_settings.settings || excluded.settings, updated_at = now()
  returning settings
$$;

do $$ declare f text; begin
  foreach f in array array[
    'public.videobot_comment_replied(text, text[])',
    'public.videobot_comment_reply_record(text, text, text, int, text, text)',
    'public.videobot_comment_reply_count(text, timestamptz)',
    'public.videobot_channel_posts_recent(text, int)',
    'public.videobot_channel_settings_list()',
    'public.videobot_channel_settings_save(text, jsonb)'] loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
