-- Video bot Phase 7: store finished videos (private bucket) and publish them only after admin approval.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videobot', 'videobot', false, 524288000, array['video/mp4', 'image/jpeg'])
on conflict (id) do nothing;

create table videobot.publications (
  id bigint generated always as identity primary key,
  code text generated always as ('PUB-' || lpad(id::text, 5, '0')) stored unique,
  job_id bigint not null references videobot.jobs(id),
  requested_by bigint not null,
  status text not null default 'PENDING_APPROVAL' check (status in ('PENDING_APPROVAL', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'PARTIAL', 'FAILED', 'REJECTED', 'CANCELLED')),
  target text not null default '',
  platforms text[] not null default '{}',
  publish_at timestamptz,
  title text not null default '',
  description text not null default '',
  hashtags text[] not null default '{}',
  results jsonb not null default '{}',
  attempts int not null default 0,
  approved_by bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index publications_job_open on videobot.publications (job_id) where status not in ('REJECTED', 'CANCELLED', 'FAILED');
create index publications_due on videobot.publications (status, publish_at);
alter table videobot.publications enable row level security;
revoke all on videobot.publications from public, anon, authenticated;

create or replace function videobot.pub_json(p videobot.publications) returns jsonb language sql stable set search_path = '' as $$
  select to_jsonb(p) || jsonb_build_object('job', (select jsonb_build_object('code', j.code, 'kind', j.kind, 'tg_id', j.tg_id, 'chat_id', j.chat_id, 'output', j.output) from videobot.jobs j where j.id = p.job_id))
$$;

-- Owner (or admin) asks to publish a COMPLETED job that has a stored file. One open request per job.
create or replace function public.videobot_submit_publication(p_job_code text, p_by bigint, p_is_admin boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare j videobot.jobs; p videobot.publications;
begin
  select * into j from videobot.jobs where code = p_job_code;
  if j.id is null then return jsonb_build_object('error', 'job not found'); end if;
  if j.tg_id <> p_by and not p_is_admin then return jsonb_build_object('error', 'not your job'); end if;
  if j.status <> 'COMPLETED' or coalesce(j.output->>'file', '') = '' then return jsonb_build_object('error', 'video not stored'); end if;
  select * into p from videobot.publications where job_id = j.id and status not in ('REJECTED', 'CANCELLED', 'FAILED');
  if p.id is not null then return videobot.pub_json(p) || jsonb_build_object('existing', true); end if;
  insert into videobot.publications (job_id, requested_by, title, description, hashtags)
  values (j.id, p_by, left(coalesce(j.output->>'title', ''), 100), coalesce(j.output->>'description', ''),
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(j.output->'hashtags', '[]')) x), '{}'))
  returning * into p;
  return videobot.pub_json(p);
end $$;

create or replace function public.videobot_review_publication(p_code text, p_by bigint, p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r videobot.publications;
begin
  update videobot.publications set
    status = case
      when p->>'decision' = 'reject' then 'REJECTED'
      when p->>'decision' = 'approve' then 'SCHEDULED'
      when p->>'decision' = 'cancel' then 'CANCELLED'
      when p->>'decision' = 'retry' and status in ('FAILED', 'PARTIAL') then 'SCHEDULED'
      else status end,
    target = coalesce(p->>'target', target),
    platforms = coalesce((select array_agg(x) from jsonb_array_elements_text(p->'platforms') x), platforms),
    publish_at = coalesce((p->>'publish_at')::timestamptz, publish_at, now()),
    title = coalesce(p->>'title', title),
    approved_by = case when p->>'decision' = 'approve' then p_by else approved_by end,
    updated_at = now()
  where code = p_code and (status in ('PENDING_APPROVAL', 'SCHEDULED') or (p->>'decision' = 'retry' and status in ('FAILED', 'PARTIAL')))
  returning * into r;
  if r.id is null then return jsonb_build_object('error', 'not found or already final'); end if;
  return videobot.pub_json(r);
end $$;

-- Worker: claim due publications (SKIP LOCKED so two runners never take the same one).
create or replace function public.videobot_claim_publications(p_limit int) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare ids bigint[]; out jsonb;
begin
  with due as (
    select id from videobot.publications where status = 'SCHEDULED' and coalesce(publish_at, now()) <= now() + interval '15 minutes'
    order by publish_at nulls first limit greatest(1, least(p_limit, 10)) for update skip locked
  ), upd as (
    update videobot.publications p set status = 'PUBLISHING', attempts = attempts + 1, updated_at = now() from due where p.id = due.id returning p.id
  )
  select array_agg(id) into ids from upd;
  select coalesce(jsonb_agg(videobot.pub_json(p)), '[]') into out from videobot.publications p where p.id = any(coalesce(ids, '{}'));
  return out;
end $$;

create or replace function public.videobot_finish_publication(p_code text, p_results jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r videobot.publications; ok int; total int;
begin
  select count(*) filter (where v->>'ok' = 'true'), count(*) into ok, total from jsonb_each(p_results) e(k, v);
  update videobot.publications set
    results = results || p_results,
    status = case when total > 0 and ok = total then 'PUBLISHED' when ok > 0 then 'PARTIAL' else 'FAILED' end,
    updated_at = now()
  where code = p_code and status = 'PUBLISHING' returning * into r;
  if r.id is null then return jsonb_build_object('error', 'not publishing'); end if;
  return videobot.pub_json(r);
end $$;

create or replace function public.videobot_list_publications(p_status text, p_limit int) returns jsonb
language sql security definer set search_path = '' as $$
  select coalesce(jsonb_agg(videobot.pub_json(p) order by p.created_at desc), '[]') from videobot.publications p
  where p.id in (select id from videobot.publications where p_status is null or status = p_status order by created_at desc limit least(coalesce(p_limit, 10), 50))
$$;

create or replace function public.videobot_get_publication(p_code text) returns jsonb
language sql security definer set search_path = '' as $$
  select videobot.pub_json(p) from videobot.publications p where p.code = p_code
$$;

do $$
declare f text;
begin
  for f in select p.oid::regprocedure::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname like 'videobot\_%publication%'
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
