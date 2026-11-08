/**
 * Telegram job: a real video -> cartoon / anime / comic / sketch / watercolor, made in Remotion (ToonVideo, SVG filters).
 * Runs in GitHub Actions with env PAYLOAD (JSON): { fileId, style, chatId, messageId?, title?, user? }
 *
 *   npx ts-node scripts/telegram/make-toon.ts --local clip.mp4 --style comic   (local test: no Telegram)
 *
 * Needs TELEGRAM_BOT_TOKEN (download + send) and ffmpeg. Bot API downloads are limited to 20 MB.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { MAX_SECONDS, TOON_STYLES, ToonVideoSchema, type ToonStyle } from "../../engines/toon-video/src/model";
import { renderComposition } from "./render";
import { sendMessage, sendVideo } from "./telegram";
import { JobCancelled, jobTracker } from "./jobs";

interface Job { fileId: string; style: string; chatId: string | number; messageId?: number; title?: string; jobCode?: string; statusMessageId?: number; user?: { name?: string } }

const args = process.argv.slice(2);
const arg = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const local = arg("local");
const job = (local ? { fileId: "", style: arg("style") ?? "cartoon", chatId: 0, title: arg("title") ?? "" } : JSON.parse(process.env.PAYLOAD || "{}")) as Job;
const style = (job.style in TOON_STYLES ? job.style : "cartoon") as ToonStyle;
const root = process.cwd();
const jobId = `t${Date.now().toString(36)}`;
const dir = path.join(root, "public", "tg", jobId);

async function download(fileId: string, to: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const info = (await (await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`)).json()) as { ok: boolean; result?: { file_path: string }; description?: string };
  if (!info.ok || !info.result) throw new Error(info.description?.includes("too big") ? "Video 20 MB se badi hai — chhoti video bhejo." : `Video download nahi hui (${info.description ?? "?"})`);
  const res = await fetch(`https://api.telegram.org/file/bot${token}/${info.result.file_path}`);
  if (!res.ok) throw new Error(`Video download nahi hui (${res.status})`);
  fs.writeFileSync(to, Buffer.from(await res.arrayBuffer()));
}

const probe = (f: string, entries: string) => execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", entries, "-of", "csv=p=0", f]).toString().trim();

/** Re-encode to h264 30 fps, max 90 s, long side <= 1920, always with an audio track (silent if none). */
function normalize(input: string, output: string) {
  const hasAudio = execFileSync("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", input]).toString().trim().length > 0;
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", input,
    ...(hasAudio ? [] : ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"]),
    "-t", String(MAX_SECONDS),
    "-vf", "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))',fps=30,format=yuv420p",
    "-map", "0:v:0", "-map", hasAudio ? "0:a:0" : "1:a:0", "-shortest",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-c:a", "aac", "-b:a", "128k", output
  ]);
}

(async () => {
  fs.mkdirSync(dir, { recursive: true });
  const track = jobTracker({ code: job.jobCode, chatId: job.chatId, statusMessageId: job.statusMessageId });
  try {
    if (!local) await track.step("VALIDATING", 5);
    const raw = path.join(dir, "raw");
    if (local) fs.copyFileSync(local, raw); else await download(job.fileId, raw);
    const input = path.join(dir, "in.mp4");
    normalize(raw, input);
    if (!local) await track.step("RENDERING", 20);
    const [w, h] = probe(input, "stream=width,height").split(",").map(Number);
    const seconds = Math.min(MAX_SECONDS, Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", input]).toString().trim()));
    const props = ToonVideoSchema.parse({ src: `tg/${jobId}/in.mp4`, style, seconds: Math.max(1, Math.floor(seconds * 30) / 30), width: w, height: h, title: (job.title ?? "").slice(0, 60), showBefore: true, handle: "" });
    let lastPct = 20;
    const out = await renderComposition("ToonVideo", props, path.join(root, "output", "tg", `${jobId}-${style}.mp4`), 23, 2 / 3, (p) => {
      const pct = 20 + Math.floor(p * 70);
      if (!local && pct - lastPct >= 10) { lastPct = pct; track.step("RENDERING", pct).catch(() => undefined); }
    });
    console.log(`[toon] ${out} (${style}, ${seconds.toFixed(1)}s, ${w}x${h})`);
    if (local) return;
    await track.step("UPLOADING", 92);
    await sendVideo(job.chatId, out, `🎨 ${TOON_STYLES[style].label} version${job.jobCode ? `\n${job.jobCode}` : ""}`, job.messageId, [720, 1280]);
    await track.done({ title: `${TOON_STYLES[style].label} version`, seconds: Math.round(seconds), style });
    const admin = process.env.TG_ADMIN_ID;
    if (admin && String(admin) !== String(job.chatId)) await sendMessage(admin, `🎨 /style ${style} video bana for ${job.user?.name ?? job.chatId}`).catch(() => undefined);
  } catch (e) {
    if (e instanceof JobCancelled) { console.log(`[job] ${(e as Error).message}`); return; }
    console.error(e);
    if (!local) {
      await track.fail((e as Error).message);
      if (!job.statusMessageId) await sendMessage(job.chatId, `😔 Video convert nahi ho paayi: ${(e as Error).message}`, job.messageId).catch(() => undefined);
    }
    process.exitCode = 1;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
})();
