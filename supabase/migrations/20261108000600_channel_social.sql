-- Per-platform social results for each published slot (Instagram / Facebook / Pinterest fan-out after YouTube).
alter table videobot.channel_posts add column if not exists social jsonb not null default '{}';

create or replace function public.videobot_channel_posts_status(p_items jsonb) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('channel', c.channel, 'date', c.date, 'slot', c.slot, 'n', c.n, 'status', c.status,
                                               'youtube_id', c.youtube_id, 'social', c.social)), '[]')
  from videobot.channel_posts c
  join jsonb_to_recordset(coalesce(p_items, '[]')) as i(channel text, date date, slot int) on i.channel = c.channel and i.date = c.date and i.slot = c.slot
$$;

create or replace function public.videobot_channel_post_social(p_channel text, p_date date, p_slot int, p_platform text, p_result jsonb) returns jsonb
language sql security definer set search_path = '' as $$
  update videobot.channel_posts set social = social || jsonb_build_object(p_platform, p_result), updated_at = now()
  where channel = p_channel and date = p_date and slot = p_slot and p_platform in ('instagram', 'facebook', 'pinterest')
  returning social
$$;

revoke all on function public.videobot_channel_post_social(text, date, int, text, jsonb) from public, anon, authenticated;
grant execute on function public.videobot_channel_post_social(text, date, int, text, jsonb) to service_role;
revoke all on function public.videobot_channel_posts_status(jsonb) from public, anon, authenticated;
grant execute on function public.videobot_channel_posts_status(jsonb) to service_role;
