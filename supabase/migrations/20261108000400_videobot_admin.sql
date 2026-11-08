-- Video bot: admin dashboard v2 — paged + searchable lists with per-status counts, detail views, overview charts.
-- service_role only, like every other public.videobot_* function.

-- Escape LIKE wildcards in user search text.
create or replace function videobot.like_pattern(q text) returns text language sql immutable set search_path = '' as $$
  select '%' || replace(replace(replace(coalesce(q, ''), '\', '\\'), '%', '\%'), '_', '\_') || '%'
$$;

-- p_entity: ideas | jobs | publications | users. Returns {rows, total, counts: {STATUS: n}}.
-- counts ignore p_status (so the filter chips always show every status) but respect the search text.
create or replace function public.videobot_admin_list(p_entity text, p_status text, p_q text, p_limit int, p_offset int) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  lim int := least(greatest(coalesce(p_limit, 25), 1), 100);
  off int := greatest(coalesce(p_offset, 0), 0);
  q text := nullif(trim(coalesce(p_q, '')), '');
  pat text := videobot.like_pattern(trim(coalesce(p_q, '')));
  rows jsonb; total int; counts jsonb;
begin
  if p_entity = 'ideas' then
    with base as (
      select i.* from videobot.ideas i left join videobot.users u on u.tg_id = i.tg_id
      where q is null or i.code ilike pat or i.title ilike pat or i.description ilike pat or i.category ilike pat
         or u.name ilike pat or u.username ilike pat or i.tg_id::text = q)
    select (select coalesce(jsonb_object_agg(status, n), '{}') from (select status, count(*) n from base group by status) s),
           (select count(*) from base where p_status is null or status = p_status),
           (select coalesce(jsonb_agg(videobot.idea_json(x) order by x.created_at desc), '[]') from
             (select * from base where p_status is null or status = p_status order by created_at desc limit lim offset off) x)
    into counts, total, rows;
  elsif p_entity = 'jobs' then
    with base as (
      select j.* from videobot.jobs j left join videobot.users u on u.tg_id = j.tg_id
      where q is null or j.code ilike pat or j.kind ilike pat or j.error ilike pat or j.input::text ilike pat
         or coalesce(j.output->>'title', '') ilike pat or u.name ilike pat or u.username ilike pat or j.tg_id::text = q)
    select (select coalesce(jsonb_object_agg(status, n), '{}') from (select status, count(*) n from base group by status) s),
           (select count(*) from base where p_status is null or status = p_status),
           (select coalesce(jsonb_agg(videobot.job_json(x) || jsonb_build_object('user',
               (select jsonb_build_object('name', u.name, 'username', u.username) from videobot.users u where u.tg_id = x.tg_id),
               'last_message', (select e.message from videobot.job_events e where e.job_id = x.id and e.message <> '' order by e.id desc limit 1))
             order by x.created_at desc), '[]') from
             (select * from base where p_status is null or status = p_status order by created_at desc limit lim offset off) x)
    into counts, total, rows;
  elsif p_entity = 'publications' then
    with base as (
      select p.* from videobot.publications p left join videobot.jobs j on j.id = p.job_id
      where q is null or p.code ilike pat or p.title ilike pat or p.target ilike pat or j.code ilike pat)
    select (select coalesce(jsonb_object_agg(status, n), '{}') from (select status, count(*) n from base group by status) s),
           (select count(*) from base where p_status is null or status = p_status),
           (select coalesce(jsonb_agg(videobot.pub_json(x) order by x.created_at desc), '[]') from
             (select * from base where p_status is null or status = p_status order by created_at desc limit lim offset off) x)
    into counts, total, rows;
  elsif p_entity = 'users' then
    with base as (
      select u.* from videobot.users u
      where q is null or u.name ilike pat or u.username ilike pat or u.tg_id::text = q)
    select (select coalesce(jsonb_object_agg(role, n), '{}') from (select role, count(*) n from base group by role) s),
           (select count(*) from base where p_status is null or role = lower(p_status)),
           (select coalesce(jsonb_agg(jsonb_build_object('tg_id', x.tg_id, 'name', x.name, 'username', x.username, 'role', x.role,
               'created_at', x.created_at, 'last_seen', x.last_seen,
               'jobs', (select count(*) from videobot.jobs j where j.tg_id = x.tg_id),
               'jobs_completed', (select count(*) from videobot.jobs j where j.tg_id = x.tg_id and j.status = 'COMPLETED'),
               'ideas', (select count(*) from videobot.ideas i where i.tg_id = x.tg_id)) order by x.last_seen desc), '[]') from
             (select * from base where p_status is null or role = lower(p_status) order by last_seen desc limit lim offset off) x)
    into counts, total, rows;
  else
    return jsonb_build_object('error', 'unknown entity');
  end if;
  return jsonb_build_object('rows', rows, 'total', total, 'counts', counts, 'limit', lim, 'offset', off);
end $$;

-- One job with its owner, timeline and publications.
create or replace function public.videobot_admin_job(p_code text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select videobot.job_json(j) || jsonb_build_object(
    'user', (select jsonb_build_object('tg_id', u.tg_id, 'name', u.name, 'username', u.username, 'role', u.role) from videobot.users u where u.tg_id = j.tg_id),
    'events', (select coalesce(jsonb_agg(jsonb_build_object('status', e.status, 'progress', e.progress, 'message', e.message, 'at', e.at) order by e.id), '[]') from videobot.job_events e where e.job_id = j.id),
    'publications', (select coalesce(jsonb_agg(videobot.pub_json(p) order by p.id desc), '[]') from videobot.publications p where p.job_id = j.id))
  from videobot.jobs j where j.code = p_code
$$;

-- One idea with its history and the jobs produced from it.
create or replace function public.videobot_admin_idea(p_code text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select videobot.idea_json(i) || jsonb_build_object(
    'events', (select coalesce(jsonb_agg(jsonb_build_object('status', e.status, 'by', e.by_tg_id, 'note', e.note, 'at', e.at) order by e.id), '[]') from videobot.idea_events e where e.idea_id = i.id),
    'jobs', (select coalesce(jsonb_agg(jsonb_build_object('code', j.code, 'status', j.status, 'created_at', j.created_at) order by j.id desc), '[]') from videobot.jobs j where j.input->>'ideaCode' = i.code))
  from videobot.ideas i where i.code = p_code
$$;

-- Overview: totals, last 14 days per day (IST), breakdown by kind, top failure reasons, render times.
create or replace function public.videobot_admin_overview() returns jsonb
language sql stable security definer set search_path = '' as $$
  select public.videobot_stats() || jsonb_build_object(
    'jobs_24h', (select count(*) from videobot.jobs where created_at > now() - interval '24 hours'),
    'completed_24h', (select count(*) from videobot.jobs where status = 'COMPLETED' and completed_at > now() - interval '24 hours'),
    'pubs_pending', (select count(*) from videobot.publications where status = 'PENDING_APPROVAL'),
    'pubs_scheduled', (select count(*) from videobot.publications where status = 'SCHEDULED'),
    'pubs_published', (select count(*) from videobot.publications where status = 'PUBLISHED'),
    'avg_minutes', (select round(avg(extract(epoch from completed_at - created_at)) / 60.0, 1) from videobot.jobs
                    where status = 'COMPLETED' and completed_at > now() - interval '14 days'),
    'daily', (select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'created', c.created, 'completed', c.completed, 'failed', c.failed) order by d), '[]')
              from generate_series((now() at time zone 'Asia/Kolkata')::date - 13, (now() at time zone 'Asia/Kolkata')::date, interval '1 day') d
              cross join lateral (select count(*) created,
                                         count(*) filter (where status = 'COMPLETED') completed,
                                         count(*) filter (where status = 'FAILED') failed
                                  from videobot.jobs where (created_at at time zone 'Asia/Kolkata')::date = d::date) c),
    'by_kind', (select coalesce(jsonb_object_agg(kind, n), '{}') from (select kind, count(*) n from videobot.jobs group by kind) k),
    'top_errors', (select coalesce(jsonb_agg(jsonb_build_object('error', e, 'n', n) order by n desc), '[]') from
                   (select left(error, 80) e, count(*) n from videobot.jobs where status = 'FAILED' and created_at > now() - interval '14 days'
                    group by 1 order by 2 desc limit 5) t))
$$;

do $$
declare f text;
begin
  for f in select p.oid::regprocedure::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname in ('videobot_admin_list', 'videobot_admin_job', 'videobot_admin_idea', 'videobot_admin_overview')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;

-- Actions from the web dashboard come without a Telegram name: keep the stored name/username then.
create or replace function public.videobot_touch_user(p_tg_id bigint, p_name text, p_username text, p_admin boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare u videobot.users;
begin
  insert into videobot.users (tg_id, name, username, role) values (p_tg_id, coalesce(p_name, ''), coalesce(p_username, ''), case when p_admin then 'admin' else 'user' end)
  on conflict (tg_id) do update set
    name = case when coalesce(excluded.name, '') = '' then videobot.users.name else excluded.name end,
    username = case when coalesce(excluded.name, '') = '' then videobot.users.username else excluded.username end,
    last_seen = now(),
    role = case when p_admin then 'admin' when videobot.users.role = 'admin' then 'user' else videobot.users.role end
  returning * into u;
  insert into videobot.user_preferences (tg_id) values (p_tg_id) on conflict do nothing;
  return jsonb_build_object('tg_id', u.tg_id, 'role', u.role,
    'prefs', (select to_jsonb(p) - 'tg_id' - 'updated_at' from videobot.user_preferences p where p.tg_id = p_tg_id));
end $$;
revoke all on function public.videobot_touch_user(bigint, text, text, boolean) from public, anon, authenticated;
grant execute on function public.videobot_touch_user(bigint, text, text, boolean) to service_role;
