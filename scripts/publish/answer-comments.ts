/**
 * Post the answer as a comment on puzzle videos that went public in the last few hours.
 * Runs hourly from publish-channels.yml. Idempotent: skips videos that already have a comment from the channel.
 * The YouTube API cannot pin comments; pin it in YouTube Studio (one tap) if you want it on top.
 *
 *   npx ts-node scripts/publish/answer-comments.ts [--hours 6] [--dry]
 */
import { CHANNELS, type ChannelId } from "../../channels/channels";
import { youtubeClient } from "./youtube";

const args = process.argv.slice(2);
const hours = Number(args[args.indexOf("--hours") + 1] || 6) || 6;
const dry = args.includes("--dry");

/** "Puzzle #12" / "Level 12" / "EP 12" -> 12 */
const postNo = (title: string) => Number(/(?:#|Level |EP )(\d+)/.exec(title)?.[1] ?? NaN);

async function run(id: ChannelId) {
  const cfg = CHANNELS[id] as { youtubeTokenSecret: string; answer?: (n: number) => string; name: string };
  if (!cfg.answer) return;
  const token = process.env[cfg.youtubeTokenSecret];
  if (!token) { console.log(`[${cfg.name}] no token, skip`); return; }
  const yt = youtubeClient(token, process.env[`${cfg.youtubeTokenSecret}_CLIENT`] || process.env.YT_CLIENT_SECRET_JSON);
  const ch = await yt.channels.list({ part: ["id", "contentDetails"], mine: true });
  const me = ch.data.items?.[0];
  const uploads = me?.contentDetails?.relatedPlaylists?.uploads;
  if (!me?.id || !uploads) throw new Error(`[${cfg.name}] channel not found`);
  const items = await yt.playlistItems.list({ part: ["contentDetails"], playlistId: uploads, maxResults: 15 });
  const ids = (items.data.items ?? []).map((i) => i.contentDetails?.videoId).filter((v): v is string => !!v);
  if (!ids.length) return;
  const vids = await yt.videos.list({ part: ["snippet", "status"], id: ids });
  const since = Date.now() - hours * 3600_000;
  for (const v of vids.data.items ?? []) {
    const publishedAt = Date.parse(v.status?.publishAt ?? v.snippet?.publishedAt ?? "");
    if (v.status?.privacyStatus !== "public" || !(publishedAt >= since)) continue;
    const n = postNo(v.snippet?.title ?? "");
    if (!Number.isFinite(n)) continue;
    const threads = await yt.commentThreads.list({ part: ["snippet"], videoId: v.id!, maxResults: 50 });
    const already = (threads.data.items ?? []).some((t) => t.snippet?.topLevelComment?.snippet?.authorChannelId?.value === me.id);
    if (already) continue;
    const text = cfg.answer(n);
    console.log(`[${cfg.name}] ${v.id} (#${n}) -> answer comment${dry ? " (dry)" : ""}`);
    if (!dry) await yt.commentThreads.insert({ part: ["snippet"], requestBody: { snippet: { videoId: v.id!, topLevelComment: { snippet: { textOriginal: text } } } } });
  }
}

(async () => {
  for (const id of Object.keys(CHANNELS) as ChannelId[]) {
    try { await run(id); } catch (e) { console.warn(`[answers] ${id}: ${(e as Error).message}`); }
  }
})();
