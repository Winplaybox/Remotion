-- Video bot Phase 8: watchdog for stuck jobs, storage retention, global daily cap.

-- Jobs that have not moved for p_minutes become FAILED (timeout) so users get a Retry button. Returns them.
create or replace function public.videobot_fail_stuck_jobs(p_minutes int) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare ids bigint[]; out jsonb;
begin
  with stuck as (
    select id from videobot.jobs
    where status not in ('COMPLETED', 'FAILED', 'CANCELLED')
      and updated_at < now() - make_interval(mins => greatest(p_minutes, 30))
      and not (status = 'SCRIPT_GENERATION' and output->>'awaiting' = 'approval') -- preview waiting for the user
    for update skip locked
  ), upd as (
    update videobot.jobs j set status = 'FAILED', error = 'timeout: no progress', updated_at = now(), completed_at = now() from stuck where j.id = stuck.id returning j.id
  )
  select array_agg(id) into ids from upd;
  insert into videobot.job_events (job_id, status, message) select unnest(coalesce(ids, '{}')), 'FAILED', 'watchdog timeout';
  select coalesce(jsonb_agg(videobot.job_json(j)), '[]') into out from videobot.jobs j where j.id = any(coalesce(ids, '{}'));
  return out;
end $$;

-- Stored files older than p_days whose job has no open/scheduled publication.
create or replace function public.videobot_expired_files(p_days int) returns jsonb
language sql security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('code', j.code, 'file', j.output->>'file', 'thumb', j.output->>'thumb', 'shorts', j.output->'shorts')), '[]')
  from videobot.jobs j
  where j.completed_at < now() - make_interval(days => greatest(p_days, 7))
    and coalesce(j.output->>'file_deleted', 'false') <> 'true'
    and (coalesce(j.output->>'file', '') <> '' or jsonb_typeof(j.output->'shorts') = 'array')
    and not exists (select 1 from videobot.publications p where p.job_id = j.id and p.status in ('PENDING_APPROVAL', 'SCHEDULED', 'PUBLISHING'))
  limit 200
$$;

create or replace function public.videobot_mark_files_deleted(p_codes text[]) returns int
language sql security definer set search_path = '' as $$
  with u as (update videobot.jobs set output = output || '{"file_deleted": true}'::jsonb where code = any(p_codes) returning 1) select count(*)::int from u
$$;

-- Jobs created in the last 24 h across all users (global cap protects Actions minutes and AI quotas).
create or replace function public.videobot_jobs_last_24h() returns int
language sql security definer set search_path = '' as $$
  select count(*)::int from videobot.jobs where created_at > now() - interval '24 hours' and status <> 'CANCELLED'
$$;

do $$
declare f text;
begin
  for f in select p.oid::regprocedure::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname in ('videobot_fail_stuck_jobs', 'videobot_expired_files', 'videobot_mark_files_deleted', 'videobot_jobs_last_24h')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
