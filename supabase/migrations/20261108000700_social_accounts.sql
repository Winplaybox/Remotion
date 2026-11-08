-- Social accounts connected from the admin dashboard (no tokens in GitHub secrets).
-- Tokens are stored AES-256-GCM encrypted by the app (key derived from the service-role key), never in plain text.
create table if not exists videobot.social_accounts (
  channel text not null,
  platform text not null check (platform in ('meta', 'pinterest')),
  account_name text not null default '',
  page_id text not null default '',        -- meta: Facebook Page
  page_name text not null default '',
  ig_user_id text not null default '',     -- meta: Instagram professional account linked to the Page
  ig_username text not null default '',
  board_id text not null default '',       -- pinterest
  board_name text not null default '',
  token_enc text not null default '',      -- meta: Page token · pinterest: access token
  refresh_enc text not null default '',    -- pinterest refresh token
  expires_at timestamptz,
  options jsonb not null default '{}',     -- pages / boards to pick from after connecting (no tokens)
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (channel, platform)
);
alter table videobot.social_accounts enable row level security;
revoke all on videobot.social_accounts from public, anon, authenticated;

-- Short-lived OAuth handoff (e.g. the encrypted list of Pages + tokens until the admin picks one).
create table if not exists videobot.oauth_pending (
  nonce text primary key,
  platform text not null,
  channel text not null,
  data_enc text not null,
  created_at timestamptz not null default now()
);
alter table videobot.oauth_pending enable row level security;
revoke all on videobot.oauth_pending from public, anon, authenticated;

-- Merge fields into a channel's account row (creates it).
create or replace function public.videobot_social_save(p_channel text, p_platform text, p_fields jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r videobot.social_accounts;
begin
  insert into videobot.social_accounts (channel, platform) values (p_channel, p_platform) on conflict do nothing;
  update videobot.social_accounts a set
    account_name = coalesce(p_fields->>'account_name', a.account_name),
    page_id = coalesce(p_fields->>'page_id', a.page_id), page_name = coalesce(p_fields->>'page_name', a.page_name),
    ig_user_id = coalesce(p_fields->>'ig_user_id', a.ig_user_id), ig_username = coalesce(p_fields->>'ig_username', a.ig_username),
    board_id = coalesce(p_fields->>'board_id', a.board_id), board_name = coalesce(p_fields->>'board_name', a.board_name),
    token_enc = coalesce(p_fields->>'token_enc', a.token_enc), refresh_enc = coalesce(p_fields->>'refresh_enc', a.refresh_enc),
    expires_at = case when p_fields ? 'expires_at' then (p_fields->>'expires_at')::timestamptz else a.expires_at end,
    options = coalesce(p_fields->'options', a.options),
    connected_at = case when p_fields ? 'token_enc' then now() else a.connected_at end,
    updated_at = now()
  where a.channel = p_channel and a.platform = p_platform
  returning * into r;
  return jsonb_build_object('channel', r.channel, 'platform', r.platform);
end $$;

-- With tokens (workers / server only).
create or replace function public.videobot_social_get(p_channel text, p_platform text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select to_jsonb(a) from videobot.social_accounts a where a.channel = p_channel and a.platform = p_platform
$$;

-- Without tokens (dashboard).
create or replace function public.videobot_social_list() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(to_jsonb(a) - 'token_enc' - 'refresh_enc' || jsonb_build_object('has_token', a.token_enc <> '') order by a.channel, a.platform), '[]')
  from videobot.social_accounts a
$$;

create or replace function public.videobot_social_delete(p_channel text, p_platform text) returns int
language sql security definer set search_path = '' as $$
  with d as (delete from videobot.social_accounts where channel = p_channel and platform = p_platform returning 1) select count(*)::int from d
$$;

create or replace function public.videobot_oauth_put(p_nonce text, p_platform text, p_channel text, p_data_enc text) returns void
language sql security definer set search_path = '' as $$
  delete from videobot.oauth_pending where created_at < now() - interval '1 hour';
  insert into videobot.oauth_pending (nonce, platform, channel, data_enc) values (p_nonce, p_platform, p_channel, p_data_enc)
  on conflict (nonce) do update set data_enc = excluded.data_enc, created_at = now();
$$;

create or replace function public.videobot_oauth_get(p_nonce text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select to_jsonb(o) from videobot.oauth_pending o where o.nonce = p_nonce and o.created_at > now() - interval '1 hour'
$$;

do $$
declare f text;
begin
  for f in select p.oid::regprocedure::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname in ('videobot_social_save', 'videobot_social_get', 'videobot_social_list', 'videobot_social_delete', 'videobot_oauth_put', 'videobot_oauth_get')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
