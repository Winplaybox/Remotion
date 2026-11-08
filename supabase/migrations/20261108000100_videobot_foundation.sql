-- Video bot platform (Phase 1): users, ideas, jobs, idempotency, preferences.
-- Lives in its own schema `videobot` inside the shared Supabase project. Not exposed through PostgREST:
-- the bot (Render) and the GitHub Actions workers reach it only through the SECURITY DEFINER functions
-- `public.videobot_*`, which are executable by service_role only.

create extension if not exists pg_trgm with schema extensions;
create schema if not exists videobot;
revoke all on schema videobot from public, anon, authenticated;

create table videobot.users (
  tg_id bigint primary key,
  name text not null default '',
  username text not null default '',
  role text not null default 'user' check (role in ('user', 'creator', 'admin')),
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

create table videobot.ideas (
  id bigint generated always as identity primary key,
  code text generated always as ('IDEA-' || lpad(id::text, 5, '0')) stored unique,
  tg_id bigint not null references videobot.users(tg_id),
  title text not null,
  description text not null default '',
  category text not null default 'general',
  tags text[] not null default '{}',
  link text not null default '',
  media_file_id text not null default '',
  priority int not null default 3 check (priority between 1 and 5),
  channel text not null default '',
  status text not null default 'PENDING_REVIEW'
    check (status in ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'IN_PRODUCTION', 'COMPLETED', 'MERGED')),
  admin_notes text not null default '',
  duplicate_of bigint references videobot.ideas(id),
  norm text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ideas_status_idx on videobot.ideas (status, created_at desc);
create index ideas_tg_idx on videobot.ideas (tg_id, created_at desc);
create index ideas_norm_trgm on videobot.ideas using gin (norm extensions.gin_trgm_ops);

create table videobot.idea_events (
  id bigint generated always as identity primary key,
  idea_id bigint not null references videobot.ideas(id) on delete cascade,
  status text not null,
  by_tg_id bigint,
  note text not null default '',
  at timestamptz not null default now()
);

create table videobot.jobs (
  id bigint generated always as identity primary key,
  code text generated always as ('JOB-' || lpad(id::text, 5, '0')) stored unique,
  tg_id bigint not null references videobot.users(tg_id),
  chat_id bigint not null,
  kind text not null check (kind in ('topic', 'script', 'style', 'shorts', 'thumbnail', 'translate', 'publish')),
  input jsonb not null default '{}',
  status text not null default 'QUEUED' check (status in ('QUEUED', 'VALIDATING', 'SCRIPT_GENERATION', 'NARRATION', 'VISUAL_GENERATION',
    'AI_TRANSFORMATION', 'AUDIO_PROCESSING', 'RENDERING', 'UPLOADING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  progress int not null default 0 check (progress between 0 and 100),
  output jsonb not null default '{}',
  error text not null default '',
  retry_count int not null default 0,
  status_message_id bigint,
  run_id bigint,
  idem_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create index jobs_tg_idx on videobot.jobs (tg_id, created_at desc);
create index jobs_status_idx on videobot.jobs (status, created_at desc);

create table videobot.job_events (
  id bigint generated always as identity primary key,
  job_id bigint not null references videobot.jobs(id) on delete cascade,
  status text not null,
  progress int not null default 0,
  message text not null default '',
  at timestamptz not null default now()
);

create table videobot.processed_updates (
  update_id bigint primary key,
  at timestamptz not null default now()
);

create table videobot.user_preferences (
  tg_id bigint primary key references videobot.users(tg_id),
  narrator text not null default 'dost',
  language text not null default 'hinglish' check (language in ('hinglish', 'hindi', 'english')),
  aspect text not null default '9:16' check (aspect in ('9:16', '16:9')),
  seconds int not null default 50 check (seconds between 15 and 180),
  updated_at timestamptz not null default now()
);

alter table videobot.users enable row level security;
alter table videobot.ideas enable row level security;
alter table videobot.idea_events enable row level security;
alter table videobot.jobs enable row level security;
alter table videobot.job_events enable row level security;
alter table videobot.processed_updates enable row level security;
alter table videobot.user_preferences enable row level security;
revoke all on all tables in schema videobot from public, anon, authenticated;

-- ---------- helpers ----------
create or replace function videobot.norm(t text) returns text language sql immutable set search_path = '' as $$
  select trim(regexp_replace(lower(coalesce(t, '')), '[^[:alnum:][:space:]]+', ' ', 'g'))
$$;

create or replace function videobot.idea_json(i videobot.ideas) returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object('id', i.id, 'code', i.code, 'tg_id', i.tg_id, 'title', i.title, 'description', i.description,
    'category', i.category, 'tags', i.tags, 'link', i.link, 'media_file_id', i.media_file_id, 'priority', i.priority,
    'channel', i.channel, 'status', i.status, 'admin_notes', i.admin_notes, 'created_at', i.created_at,
    'duplicate_of', (select d.code from videobot.ideas d where d.id = i.duplicate_of),
    'user', (select jsonb_build_object('name', u.name, 'username', u.username) from videobot.users u where u.tg_id = i.tg_id))
$$;

create or replace function videobot.job_json(j videobot.jobs) returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object('id', j.id, 'code', j.code, 'tg_id', j.tg_id, 'chat_id', j.chat_id, 'kind', j.kind, 'input', j.input,
    'status', j.status, 'progress', j.progress, 'output', j.output, 'error', j.error, 'retry_count', j.retry_count,
    'status_message_id', j.status_message_id, 'created_at', j.created_at, 'updated_at', j.updated_at, 'completed_at', j.completed_at)
$$;

-- ---------- RPC (service_role only) ----------

-- Returns true the first time an update id is seen (Telegram retries are ignored).
create or replace function public.videobot_claim_update(p_update_id bigint) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  insert into videobot.processed_updates (update_id) values (p_update_id) on conflict do nothing;
  if not found then return false; end if;
  delete from videobot.processed_updates where at < now() - interval '3 days';
  return true;
end $$;

create or replace function public.videobot_touch_user(p_tg_id bigint, p_name text, p_username text, p_admin boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare u videobot.users;
begin
  insert into videobot.users (tg_id, name, username, role) values (p_tg_id, coalesce(p_name, ''), coalesce(p_username, ''), case when p_admin then 'admin' else 'user' end)
  on conflict (tg_id) do update set name = excluded.name, username = excluded.username, last_seen = now(),
    role = case when p_admin then 'admin' when videobot.users.role = 'admin' then 'user' else videobot.users.role end
  returning * into u;
  insert into videobot.user_preferences (tg_id) values (p_tg_id) on conflict do nothing;
  return jsonb_build_object('tg_id', u.tg_id, 'role', u.role,
    'prefs', (select to_jsonb(p) - 'tg_id' - 'updated_at' from videobot.user_preferences p where p.tg_id = p_tg_id));
end $$;

create or replace function public.videobot_set_role(p_tg_id bigint, p_role text) returns void
language sql security definer set search_path = '' as $$
  update videobot.users set role = p_role where tg_id = p_tg_id and role <> 'admin'
$$;

create or replace function public.videobot_set_prefs(p_tg_id bigint, p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r videobot.user_preferences;
begin
  update videobot.user_preferences set
    narrator = coalesce(p->>'narrator', narrator),
    language = coalesce(p->>'language', language),
    aspect = coalesce(p->>'aspect', aspect),
    seconds = coalesce((p->>'seconds')::int, seconds),
    updated_at = now()
  where tg_id = p_tg_id returning * into r;
  return to_jsonb(r) - 'tg_id' - 'updated_at';
end $$;

-- New idea. Never starts production. Flags a likely duplicate (trigram similarity >= 0.55 on recent ideas).
create or replace function public.videobot_add_idea(p_tg_id bigint, p_title text, p_description text, p_category text, p_tags text[], p_link text, p_media text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare n text := videobot.norm(p_title || ' ' || coalesce(p_description, '')); dup videobot.ideas; i videobot.ideas;
begin
  if length(n) >= 12 then
    select * into dup from videobot.ideas d
    where d.status <> 'REJECTED' and d.created_at > now() - interval '180 days' and extensions.similarity(d.norm, n) >= 0.55
    order by extensions.similarity(d.norm, n) desc limit 1;
  end if;
  insert into videobot.ideas (tg_id, title, description, category, tags, link, media_file_id, norm, duplicate_of)
  values (p_tg_id, left(coalesce(nullif(p_title, ''), '(untitled)'), 200), left(coalesce(p_description, ''), 3500), coalesce(nullif(p_category, ''), 'general'),
    coalesce(p_tags, '{}'), coalesce(p_link, ''), coalesce(p_media, ''), n, dup.id)
  returning * into i;
  insert into videobot.idea_events (idea_id, status, by_tg_id, note) values (i.id, i.status, p_tg_id, 'submitted');
  return videobot.idea_json(i);
end $$;

create or replace function public.videobot_update_idea(p_code text, p_by bigint, p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare i videobot.ideas; target bigint;
begin
  if p ? 'merge_into' then
    select id into target from videobot.ideas where code = p->>'merge_into';
    if target is null then raise exception 'unknown idea %', p->>'merge_into'; end if;
  end if;
  update videobot.ideas set
    status = case when target is not null then 'MERGED' else coalesce(p->>'status', status) end,
    duplicate_of = coalesce(target, duplicate_of),
    priority = coalesce((p->>'priority')::int, priority),
    channel = coalesce(p->>'channel', channel),
    category = coalesce(p->>'category', category),
    title = coalesce(p->>'title', title),
    admin_notes = case when p ? 'note' then trim(admin_notes || E'\n' || (p->>'note')) else admin_notes end,
    updated_at = now()
  where code = p_code returning * into i;
  if i.id is null then raise exception 'unknown idea %', p_code; end if;
  insert into videobot.idea_events (idea_id, status, by_tg_id, note) values (i.id, i.status, p_by, coalesce(p->>'note', ''));
  return videobot.idea_json(i);
end $$;

create or replace function public.videobot_get_idea(p_code text) returns jsonb
language sql security definer set search_path = '' as $$
  select videobot.idea_json(i) from videobot.ideas i where i.code = p_code
$$;

create or replace function public.videobot_list_ideas(p_status text, p_tg_id bigint, p_limit int) returns jsonb
language sql security definer set search_path = '' as $$
  select coalesce(jsonb_agg(videobot.idea_json(i) order by i.priority, i.created_at desc), '[]') from (
    select * from videobot.ideas
    where (p_status is null or status = p_status) and (p_tg_id is null or tg_id = p_tg_id)
    order by priority, created_at desc limit least(coalesce(p_limit, 10), 50)) i
$$;

-- New job; idempotent on p_idem; refuses when the user's daily limit is used up (limit <= 0 = unlimited).
create or replace function public.videobot_create_job(p_tg_id bigint, p_chat_id bigint, p_kind text, p_input jsonb, p_idem text, p_daily_limit int)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare j videobot.jobs; used int;
begin
  select * into j from videobot.jobs where idem_key = p_idem;
  if j.id is not null then return videobot.job_json(j) || jsonb_build_object('duplicate', true); end if;
  select count(*) into used from videobot.jobs where tg_id = p_tg_id and created_at > now() - interval '24 hours' and status <> 'CANCELLED';
  if p_daily_limit > 0 and used >= p_daily_limit then
    return jsonb_build_object('limited', true, 'used', used);
  end if;
  insert into videobot.jobs (tg_id, chat_id, kind, input, idem_key) values (p_tg_id, p_chat_id, p_kind, coalesce(p_input, '{}'), p_idem)
  returning * into j;
  insert into videobot.job_events (job_id, status, progress, message) values (j.id, j.status, 0, 'request received');
  return videobot.job_json(j);
end $$;

-- Worker/bot progress. Terminal states are final (a cancelled job is never moved back to running).
create or replace function public.videobot_update_job(p_code text, p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare j videobot.jobs;
begin
  update videobot.jobs set
    status = coalesce(p->>'status', status),
    progress = coalesce((p->>'progress')::int, progress),
    output = output || coalesce(p->'output', '{}'),
    error = coalesce(p->>'error', error),
    retry_count = retry_count + coalesce((p->>'retry')::int, 0),
    status_message_id = coalesce((p->>'status_message_id')::bigint, status_message_id),
    run_id = coalesce((p->>'run_id')::bigint, run_id),
    updated_at = now(),
    completed_at = case when coalesce(p->>'status', status) in ('COMPLETED', 'FAILED', 'CANCELLED') then now() else completed_at end
  where code = p_code and status not in ('COMPLETED', 'FAILED', 'CANCELLED')
  returning * into j;
  if j.id is null then
    select * into j from videobot.jobs where code = p_code;
    return videobot.job_json(j) || jsonb_build_object('final', true);
  end if;
  insert into videobot.job_events (job_id, status, progress, message) values (j.id, j.status, j.progress, coalesce(p->>'message', ''));
  return videobot.job_json(j);
end $$;

create or replace function public.videobot_get_job(p_code text) returns jsonb
language sql security definer set search_path = '' as $$
  select videobot.job_json(j) from videobot.jobs j where j.code = p_code
$$;

create or replace function public.videobot_list_jobs(p_tg_id bigint, p_status text, p_limit int) returns jsonb
language sql security definer set search_path = '' as $$
  select coalesce(jsonb_agg(videobot.job_json(j) order by j.created_at desc), '[]') from (
    select * from videobot.jobs
    where (p_tg_id is null or tg_id = p_tg_id) and (p_status is null or status = p_status)
    order by created_at desc limit least(coalesce(p_limit, 10), 50)) j
$$;

create or replace function public.videobot_stats() returns jsonb
language sql security definer set search_path = '' as $$
  select jsonb_build_object(
    'users', (select count(*) from videobot.users),
    'active_users_7d', (select count(*) from videobot.users where last_seen > now() - interval '7 days'),
    'ideas', (select count(*) from videobot.ideas),
    'ideas_pending', (select count(*) from videobot.ideas where status = 'PENDING_REVIEW'),
    'ideas_approved', (select count(*) from videobot.ideas where status = 'APPROVED'),
    'jobs_active', (select count(*) from videobot.jobs where status not in ('COMPLETED', 'FAILED', 'CANCELLED')),
    'jobs_completed', (select count(*) from videobot.jobs where status = 'COMPLETED'),
    'jobs_failed', (select count(*) from videobot.jobs where status = 'FAILED'))
$$;

do $$
declare f text;
begin
  for f in select p.oid::regprocedure::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname like 'videobot\_%'
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
