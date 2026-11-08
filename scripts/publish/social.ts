/**
 * Social fan-out after YouTube — every platform drives viewers back to the YouTube channel:
 *   YouTube goes public at the slot time T (scheduled upload, scripts/publish/youtube.ts)
 *   T + 5 min  Instagram Reel  — same video, caption: watch the series + subscribe on YouTube
 *   T + 10 min Facebook Reel   — short teaser cut (no answer), "full video + answer on YouTube"
 *   T + 15 min Pinterest Pin   — thumbnail image, link = the YouTube Short
 * Each channel has its own Instagram / Facebook / Pinterest accounts (secret prefixes in channels/channels.ts).
 * A platform without secrets is skipped. Each result goes into the ledger; a platform that already succeeded or
 * failed for this slot is never posted again automatically (a failed post must be checked by hand — no duplicates).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { ChannelConfig, PostMeta } from "../../channels/channels";
import { facebook, hostVideo, instagram } from "./meta";
import { metaCreds, pinterestCreds } from "./social-accounts";

export type Platform = "instagram" | "facebook" | "pinterest";
export interface SocialResult { ok: boolean; id?: string; error?: string; at: string }
export const PLATFORM_ORDER: Platform[] = ["instagram", "facebook", "pinterest"];

const shortUrl = (id: string) => `https://youtube.com/shorts/${id}`;
const channelUrl = (handle: string) => `https://youtube.com/${handle}`;

/** Captions with the YouTube call to action. Instagram captions have no clickable links, so the handle leads. */
export function socialCopy(cfg: Pick<ChannelConfig, "name" | "youtubeHandle">, meta: PostMeta, youtubeId: string) {
  const yt = shortUrl(youtubeId);
  const sub = `🔔 YouTube pe subscribe karo: ${cfg.youtubeHandle}`;
  return {
    instagram: [meta.caption.trim(), "", `▶️ Roz naya video pehle YouTube pe aata hai — search karo ${cfg.youtubeHandle}`, sub, "🔗 Link bio mein"].join("\n").slice(0, 2200),
    facebook: [meta.title.replace(/#shorts/gi, "").trim(), "", `👀 Ye sirf jhalak hai — pura video aur jawab YouTube pe:`, yt, "", sub, channelUrl(cfg.youtubeHandle)].join("\n").slice(0, 2200),
    pinterest: {
      title: meta.title.replace(/#[A-Za-z]\w*/g, "").replace(/\s{2,}/g, " ").trim().slice(0, 100),
      description: `${meta.description.split("\n")[0]?.trim() ?? ""}\n▶️ Pura video YouTube pe dekho aur subscribe karo ${cfg.youtubeHandle}`.slice(0, 800),
      link: yt
    }
  };
}

const ffmpeg = (args: string[]) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
const duration = (file: string) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim()) || 0;
const FONT = ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/System/Library/Fonts/Supplemental/Arial Bold.ttf", "C:/Windows/Fonts/arialbd.ttf"].find((f) => fs.existsSync(f));
const hasAudio = (file: string) => execFileSync("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", file]).toString().trim() !== "";
const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/'/g, "\u2019").replace(/:/g, "\\:");
/** Dark strip + yellow text near the bottom; `from` = seconds after which it shows (videos). No font -> no banner. */
export function bannerFilter(text: string, yFromBottom: number, from?: number): string {
  if (!FONT) return "";
  const en = from === undefined ? "" : `enable='gte(t,${from})':`;
  return `drawbox=${en}x=0:y=ih-${yFromBottom}:w=iw:h=150:color=black@0.72:t=fill,` +
    `drawtext=${en}fontfile='${FONT.replace(/:/g, "\\:")}':text='${esc(text)}':fontcolor=0xFFC94A:fontsize=56:x=(w-text_w)/2:y=h-${yFromBottom}+46`;
}

/** Facebook teaser: first ~60% (max 12 s, before the answer/ask); the last 2.5 s carry a "full video on YouTube" banner. */
export function makeTeaser(video: string, out: string): string {
  const len = Math.max(4, Math.min(12, Math.round(duration(video) * 0.6)));
  const b = bannerFilter("Pura video + jawab YouTube pe", 420, len - 2.5);
  const audio = hasAudio(video);
  ffmpeg(["-i", video, "-t", String(len), "-vf", `fade=t=out:st=${len - 0.6}:d=0.6${b ? `,${b}` : ""}`,
    ...(audio ? ["-af", `afade=t=out:st=${len - 0.6}:d=0.6`, "-c:a", "aac", "-b:a", "128k"] : ["-an"]),
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]);
  return out;
}

/** Pinterest image: a frame from the middle of the video (puzzle on screen) with a "watch on YouTube" banner, 1000x1778. */
export function makePinImage(video: string, out: string): string {
  const at = (duration(video) * 0.35).toFixed(2);
  const b = bannerFilter("YouTube pe pura dekho", 190);
  ffmpeg(["-ss", at, "-i", video, "-frames:v", "1", "-vf", `scale=1000:1778${b ? `,${b}` : ""}`, "-q:v", "3", out]);
  return out;
}

export async function pinterestToken(prefix: string): Promise<string | null> {
  const refresh = process.env[`${prefix}_REFRESH_TOKEN`], id = process.env.PINTEREST_APP_ID, secret = process.env.PINTEREST_APP_SECRET;
  if (!refresh || !id || !secret) return null;
  const r = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: { authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`, "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh })
  });
  const d = (await r.json().catch(() => ({}))) as { access_token?: string; message?: string };
  if (!r.ok || !d.access_token) throw new Error(`Pinterest token refresh ${r.status}: ${d.message ?? ""}`);
  return d.access_token;
}

export async function pinterestPin(token: string, boardId: string, image: string, pin: { title: string; description: string; link: string }): Promise<string> {
  const r = await fetch("https://api.pinterest.com/v5/pins", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ board_id: boardId, title: pin.title, description: pin.description, link: pin.link, alt_text: pin.title,
      media_source: { source_type: "image_base64", content_type: "image/jpeg", data: fs.readFileSync(image).toString("base64") } })
  });
  const d = (await r.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!r.ok || !d.id) throw new Error(`Pinterest ${r.status}: ${d.message ?? "no pin id"}`);
  return d.id;
}

const sleepUntil = async (t: number, label: string) => {
  const ms = t - Date.now();
  if (ms > 0) { console.log(`[social] waiting ${Math.round(ms / 60000)} min for ${label} (${new Date(t).toISOString()})`); await new Promise((r) => setTimeout(r, ms)); }
};

export interface FanoutArgs {
  cfg: ChannelConfig; meta: PostMeta; video: string; youtubeId: string; publishAt: string; key: string;
  done: Partial<Record<Platform, SocialResult>>;
  record: (platform: Platform, result: SocialResult) => Promise<void>;
  gapMinutes?: number;
}

/** Posts the platforms in order, each `gap` minutes after the previous (starting `gap` after YouTube goes public). */
export async function fanout({ cfg, meta, video, youtubeId, publishAt, key, done, record, gapMinutes = Number(process.env.SOCIAL_GAP_MIN || 5) }: FanoutArgs): Promise<number> {
  const copy = socialCopy(cfg, meta, youtubeId);
  const channel = key.split("/")[0]!;
  const m = await metaCreds(channel, cfg);
  const pin = await pinterestCreds(channel, cfg, pinterestToken);
  const ready: Record<Platform, boolean> = {
    instagram: !!(m.pageToken && m.igUserId),
    facebook: !!(m.pageToken && m.pageId),
    pinterest: !!(pin.accessToken && pin.boardId)
  };
  console.log(`[social] accounts: Meta ${m.source}${m.igUserId ? " +IG" : ""}${m.pageId ? " +FB" : ""} · Pinterest ${pin.source}${pin.boardId ? "" : pin.accessToken ? " (no board)" : ""}`);
  const live = Math.max(Date.parse(publishAt), Date.now() - gapMinutes * 60_000);
  let failed = 0;
  let videoUrl: string | null = null;
  for (const [i, platform] of PLATFORM_ORDER.entries()) {
    if (done[platform]) { console.log(`[${platform}] already ${done[platform]!.ok ? "posted" : "FAILED earlier — check by hand"} for this slot, skipping`); continue; }
    if (!ready[platform]) { console.log(`[${platform}] not connected for ${cfg.name} (dashboard → Social) — skipped`); continue; }
    await sleepUntil(live + (i + 1) * gapMinutes * 60_000, platform);
    let result: SocialResult;
    try {
      let id: string;
      if (platform === "instagram") {
        videoUrl ??= await hostVideo(video, key);
        id = await instagram(videoUrl, copy.instagram, m.pageToken!, m.igUserId!);
      } else if (platform === "facebook") {
        const teaser = makeTeaser(video, path.join(path.dirname(video), `${path.basename(video, ".mp4")}.teaser.mp4`));
        id = await facebook(await hostVideo(teaser, `${key}-teaser`), copy.facebook, m.pageToken!, m.pageId!);
      } else {
        const img = makePinImage(video, path.join(path.dirname(video), `${path.basename(video, ".mp4")}.pin.jpg`));
        id = await pinterestPin(pin.accessToken!, pin.boardId!, img, copy.pinterest);
      }
      result = { ok: true, id, at: new Date().toISOString() };
      console.log(`[${platform}] published ${id}`);
    } catch (e) {
      // Pinterest Trial apps can't create Pins in production: nothing was posted, so skip quietly (no ledger
      // entry, no failure) — the slot posts normally once Standard access is approved.
      if (platform === "pinterest" && /Trial access/i.test((e as Error).message)) {
        console.log("[pinterest] app still has Trial access (needs Standard access) — skipped");
        continue;
      }
      failed++;
      result = { ok: false, error: (e as Error).message.slice(0, 300), at: new Date().toISOString() };
      console.error(`[${platform}] FAILED: ${result.error}`);
    }
    await record(platform, result).catch((e: Error) => console.error(`[ledger] ${e.message}`));
  }
  return failed;
}
