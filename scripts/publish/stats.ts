/**
 * Channel performance report (YouTube Data + Analytics API), one section per channel token.
 * Writes out/channel-stats/report.md + stats.json. Run by .github/workflows/channel-stats.yml.
 *
 *   npx ts-node scripts/publish/stats.ts [--days 28]
 */
import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";
import { CHANNELS } from "../../channels/channels";
import { youtubeAuth } from "./youtube";

const args = process.argv.slice(2);
const DAYS = Number(args.includes("--days") ? args[args.indexOf("--days") + 1] : 28) || 28;
const OUT = "out/channel-stats";
const day = (d: Date) => d.toISOString().slice(0, 10);
const iso = (s: string) => { const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(s) ?? []; return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0); };

interface VideoRow { id: string; title: string; published: string; seconds: number; views: number; likes: number; comments: number; avgViewSec?: number; avgViewPct?: number; minutes?: number; subs?: number }

async function channelReport(secret: string, names: string[]) {
  const token = process.env[secret];
  if (!token) return { secret, names, error: "token secret not set" };
  const auth = youtubeAuth(token, process.env[`${secret}_CLIENT`] || process.env.YT_CLIENT_SECRET_JSON);
  const yt = google.youtube({ version: "v3", auth });
  const ya = google.youtubeAnalytics({ version: "v2", auth });
  const ch = (await yt.channels.list({ part: ["snippet", "statistics", "contentDetails", "brandingSettings"], mine: true })).data.items?.[0];
  if (!ch) return { secret, names, error: "no channel for this token" };
  // All uploads (newest first, up to 200).
  const ids: string[] = [];
  let page: string | undefined;
  do {
    const r = await yt.playlistItems.list({ part: ["contentDetails"], playlistId: ch.contentDetails!.relatedPlaylists!.uploads!, maxResults: 50, ...(page ? { pageToken: page } : {}) });
    ids.push(...(r.data.items ?? []).map((i) => i.contentDetails!.videoId!));
    page = r.data.nextPageToken ?? undefined;
  } while (page && ids.length < 200);
  const vids: VideoRow[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const r = await yt.videos.list({ part: ["snippet", "statistics", "contentDetails", "status"], id: ids.slice(i, i + 50) });
    for (const v of r.data.items ?? []) {
      if (v.status?.privacyStatus !== "public") continue;
      vids.push({ id: v.id!, title: v.snippet?.title ?? "", published: v.snippet?.publishedAt ?? "", seconds: iso(v.contentDetails?.duration ?? ""),
        views: Number(v.statistics?.viewCount ?? 0), likes: Number(v.statistics?.likeCount ?? 0), comments: Number(v.statistics?.commentCount ?? 0) });
    }
  }
  const end = new Date(), start = new Date(Date.now() - DAYS * 86_400_000);
  let totals: Record<string, number> = {}, byType: Record<string, Record<string, number>> = {}, analyticsError = "";
  try {
    const t = await ya.reports.query({ ids: "channel==MINE", startDate: day(start), endDate: day(end), metrics: "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost,likes,comments,shares" });
    const h = (t.data.columnHeaders ?? []).map((c) => c.name!), row = t.data.rows?.[0] ?? [];
    totals = Object.fromEntries(h.map((k, i) => [k, Number(row[i] ?? 0)]));
    const pv = await ya.reports.query({ ids: "channel==MINE", startDate: day(start), endDate: day(end), dimensions: "video", metrics: "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained", sort: "-views", maxResults: 200 });
    for (const r of pv.data.rows ?? []) {
      const v = vids.find((x) => x.id === r[0]);
      if (v) Object.assign(v, { minutes: Number(r[2]), avgViewSec: Number(r[3]), avgViewPct: Number(r[4]), subs: Number(r[5]) });
    }
    try {
      const ct = await ya.reports.query({ ids: "channel==MINE", startDate: day(start), endDate: day(end), dimensions: "creatorContentType", metrics: "views,estimatedMinutesWatched" });
      for (const r of ct.data.rows ?? []) byType[String(r[0])] = { views: Number(r[1]), minutes: Number(r[2]) };
    } catch { /* dimension not available for this channel */ }
  } catch (e) { analyticsError = (e as Error).message; }
  return {
    secret, names, title: ch.snippet?.title, handle: ch.snippet?.customUrl, created: ch.snippet?.publishedAt,
    subscribers: Number(ch.statistics?.subscriberCount ?? 0), totalViews: Number(ch.statistics?.viewCount ?? 0), videoCount: Number(ch.statistics?.videoCount ?? 0),
    description: ch.brandingSettings?.channel?.description ?? "", keywords: ch.brandingSettings?.channel?.keywords ?? "",
    totals, byType, analyticsError, videos: vids
  };
}

(async () => {
  const bySecret = new Map<string, string[]>();
  for (const [id, c] of Object.entries(CHANNELS)) bySecret.set(c.youtubeTokenSecret, [...(bySecret.get(c.youtubeTokenSecret) ?? []), id]);
  const reports = [];
  for (const [secret, names] of bySecret) {
    try { reports.push(await channelReport(secret, names)); } catch (e) { reports.push({ secret, names, error: (e as Error).message }); }
  }
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "stats.json"), JSON.stringify({ at: new Date().toISOString(), days: DAYS, reports }, null, 1));
  const md: string[] = [`# Channel stats (last ${DAYS} days) — ${new Date().toISOString()}`];
  for (const r of reports as Record<string, unknown>[]) {
    md.push("", `## ${r.title ?? r.names} (${r.handle ?? r.secret})`);
    if (r.error) { md.push(`error: ${r.error}`); continue; }
    const t = r.totals as Record<string, number>;
    md.push(`subs ${r.subscribers} · views ${r.totalViews} · public videos ${(r.videos as VideoRow[]).length} · ${DAYS}d: views ${t.views ?? "?"}, watch h ${((t.estimatedMinutesWatched ?? 0) / 60).toFixed(1)}, avg view ${t.averageViewDuration ?? "?"}s (${(t.averageViewPercentage ?? 0).toFixed?.(0)}%), subs +${t.subscribersGained ?? "?"}/-${t.subscribersLost ?? "?"}, likes ${t.likes ?? "?"}, comments ${t.comments ?? "?"}, shares ${t.shares ?? "?"}`);
    if (r.analyticsError) md.push(`analytics: ${r.analyticsError}`);
    if (Object.keys(r.byType as object).length) md.push(`by type: ${JSON.stringify(r.byType)}`);
    md.push("", "| views | likes | cmts | len | avg view | % | subs | title |", "|---|---|---|---|---|---|---|---|");
    for (const v of (r.videos as VideoRow[]).sort((a, b) => b.views - a.views).slice(0, 25))
      md.push(`| ${v.views} | ${v.likes} | ${v.comments} | ${v.seconds}s | ${v.avgViewSec ?? ""}s | ${v.avgViewPct?.toFixed(0) ?? ""} | ${v.subs ?? ""} | ${v.title.slice(0, 70)} |`);
  }
  fs.writeFileSync(path.join(OUT, "report.md"), md.join("\n") + "\n");
  console.log(md.join("\n"));
})();
