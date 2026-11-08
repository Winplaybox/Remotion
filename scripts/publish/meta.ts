import fs from "node:fs";

/**
 * Instagram Reel + Facebook Page Reel. Meta pulls the video from a public URL, so the MP4 is first put
 * in a public Supabase Storage bucket (same setup as daily-devotional-shorts).
 */
interface MetaArgs { video: string; caption: string; key: string; pageId?: string | undefined; igUserId?: string | undefined; pageToken?: string | undefined }

const VERSION = process.env.META_GRAPH_API_VERSION ?? "v25.0";
const BASE = `https://graph.facebook.com/${VERSION}`;

async function json(url: string, init: RequestInit = {}) {
  const r = await fetch(url, init);
  const raw = await r.text();
  let d: Record<string, any> = {};
  try { d = raw ? JSON.parse(raw) : {}; } catch { /* keep raw */ }
  if (!r.ok || d.error) throw new Error(`HTTP ${r.status}: ${d.error?.message ?? raw.slice(0, 300)}`);
  return d;
}
const post = (ep: string, params: Record<string, string>, token: string) =>
  json(`${BASE}/${ep}`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ ...params, access_token: token }) });
const get = (ep: string, params: Record<string, string>, token: string) => json(`${BASE}/${ep}?${new URLSearchParams({ ...params, access_token: token })}`);

export async function hostVideo(file: string, key: string): Promise<string> {
  const root = (process.env.SUPABASE_URL ?? "").replace(/\/+$/, "");
  const sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!root || !sk) throw new Error("Meta: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing (needed to host the MP4)");
  const bucket = process.env.SUPABASE_BUCKET ?? "meta-publishing";
  const obj = `remotion/${key}.mp4`.split("/").map(encodeURIComponent).join("/");
  await json(`${root}/storage/v1/object/${bucket}/${obj}`, { method: "POST", headers: { apikey: sk, authorization: `Bearer ${sk}`, "content-type": "video/mp4", "x-upsert": "true" }, body: fs.readFileSync(file) });
  const url = `${root}/storage/v1/object/public/${bucket}/${obj}`;
  if (!(await fetch(url, { method: "HEAD" })).ok) throw new Error(`Meta: bucket "${bucket}" must be public`);
  return url;
}

export async function instagram(url: string, caption: string, token: string, igId: string) {
  const c = await post(`${igId}/media`, { media_type: "REELS", video_url: url, caption, share_to_feed: "true" }, token);
  for (let i = 0; i < 36; i++) {
    const s = await get(c.id, { fields: "status_code,status" }, token);
    if (s.status_code === "FINISHED") return (await post(`${igId}/media_publish`, { creation_id: c.id }, token)).id as string;
    if (s.status_code === "ERROR" || s.status_code === "EXPIRED") throw new Error(`Instagram ${s.status_code}: ${s.status ?? ""}`);
    await new Promise((r) => setTimeout(r, 10_000));
  }
  throw new Error("Instagram processing timed out");
}

export async function facebook(url: string, caption: string, token: string, pageId: string) {
  const start = await post(`${pageId}/video_reels`, { upload_phase: "start" }, token);
  const up = await json(start.upload_url, { method: "POST", headers: { authorization: `OAuth ${token}`, file_url: url } });
  if (up.success !== true) throw new Error("Facebook upload failed");
  const fin = await post(`${pageId}/video_reels`, { video_id: start.video_id, upload_phase: "finish", video_state: "PUBLISHED", description: caption }, token);
  if (fin.success !== true) throw new Error("Facebook publish not confirmed");
  return start.video_id as string;
}

export async function publishMeta({ video, caption, key, pageId, igUserId, pageToken }: MetaArgs): Promise<void> {
  if (!pageToken || (!pageId && !igUserId)) { console.log("[Meta] secrets not set for this channel — skipped"); return; }
  const url = await hostVideo(video, key);
  const jobs: [string, Promise<string>][] = [];
  if (igUserId) jobs.push(["Instagram", instagram(url, caption, pageToken, igUserId)]);
  if (pageId) jobs.push(["Facebook", facebook(url, caption, pageToken, pageId)]);
  const results = await Promise.allSettled(jobs.map(([, p]) => p));
  let failed = 0;
  results.forEach((r, i) => {
    const name = jobs[i]![0];
    if (r.status === "fulfilled") console.log(`[${name}] published ${r.value}`);
    else { failed++; console.error(`[${name}] FAILED: ${r.reason?.message}`); }
  });
  if (failed) throw new Error(`${failed} Meta platform(s) failed — check before retrying to avoid duplicates`);
}
