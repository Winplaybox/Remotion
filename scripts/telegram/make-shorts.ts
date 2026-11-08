/**
 * Telegram job: long video -> several vertical Shorts (word captions, hook, original audio), each sent back with title + hashtags.
 * PAYLOAD: { fileId? | url?, chatId, messageId?, jobCode?, statusMessageId?, count?, seconds?, language?, user? }
 *
 *   npx ts-node scripts/telegram/make-shorts.ts --local long.mp4 [--transcript t.json] [--count 2]   (local test, no Telegram)
 *
 * Needs ffmpeg, python faster-whisper (model downloads from Hugging Face on first run), optional GEMINI_API_KEY, optional yt-dlp for URLs.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ShortClipSchema } from "../../engines/short-clip/src/model";
import { ClipsSchema, cleanClips, clipWords, fallbackClips, highlightsPrompt, type Clip, type Segment } from "./shorts";
import { renderComposition } from "./render";
import { downloadFile, sendMessage, sendVideo } from "./telegram";
import { JobCancelled, jobTracker } from "./jobs";
import { storeFile } from "./storage";
import { normalizeLoudness } from "./loudness";

interface Job { fileId?: string; url?: string; chatId: string | number; messageId?: number; jobCode?: string; statusMessageId?: number; count?: number; seconds?: number; language?: string; user?: { name?: string } }

const args = process.argv.slice(2);
const arg = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const local = arg("local");
const job = (local ? { chatId: 0, count: Number(arg("count") ?? 2), seconds: Number(arg("seconds") ?? 40) } : JSON.parse(process.env.PAYLOAD || "{}")) as Job;
const count = Math.max(1, Math.min(5, Number(job.count) || 3));
const target = Math.max(20, Math.min(60, Number(job.seconds) || 45));
const root = process.cwd();
const jobId = `s${Date.now().toString(36)}`;
const dir = path.join(root, "public", "tg", jobId);
const py = process.env.PYTHON || "python3";
const MAX_SECONDS = 60 * 60;

const run = (cmd: string, a: string[]) => execFileSync(cmd, a, { stdio: ["ignore", "pipe", "inherit"] }).toString();
const probe = (f: string, entries: string, stream = "") => run("ffprobe", ["-v", "error", ...(stream ? ["-select_streams", stream] : []), "-show_entries", entries, "-of", "csv=p=0", f]).trim();

async function fetchSource(to: string) {
  if (local) { fs.copyFileSync(local, to); return; }
  if (job.fileId) { fs.writeFileSync(to, await downloadFile(job.fileId)); return; }
  if (job.url) {
    if (/\.(mp4|mov|webm|mkv)(\?|$)/i.test(job.url)) {
      const res = await fetch(job.url);
      if (!res.ok) throw new Error(`Link se video nahi mili (${res.status})`);
      fs.writeFileSync(to, Buffer.from(await res.arrayBuffer()));
      return;
    }
    run("yt-dlp", ["-f", "bv*[height<=1080]+ba/b[height<=1080]/b", "--merge-output-format", "mp4", "--max-filesize", "1500M", "-o", to, "--no-playlist", job.url]);
    return;
  }
  throw new Error("Video ya link nahi mila");
}

async function gemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("no GEMINI_API_KEY");
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.5-flash"}:generateContent`, {
    method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.4 } })
  });
  const j = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[]; error?: { message?: string } };
  const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!res.ok || !text) throw new Error(`Gemini: ${j.error?.message ?? res.status}`);
  return text;
}

async function pickClips(segs: Segment[], duration: number): Promise<Clip[]> {
  try {
    const raw = ClipsSchema.parse(JSON.parse((await gemini(highlightsPrompt(segs, count, target, job.language ?? "hinglish"))).replace(/^```(?:json)?\s*|```\s*$/g, "")));
    const c = cleanClips(raw.clips, segs, duration, count);
    if (c.length) return c;
  } catch (e) { console.warn(`[highlights] ${(e as Error).message} — using fallback`); }
  return fallbackClips(segs, count, target);
}

(async () => {
  fs.mkdirSync(dir, { recursive: true });
  const track = jobTracker({ code: job.jobCode, chatId: job.chatId, statusMessageId: job.statusMessageId });
  try {
    if (!local) await track.step("VALIDATING", 3);
    const raw = path.join(dir, "raw.mp4");
    await fetchSource(raw);
    const duration = Number(probe(raw, "format=duration"));
    if (!duration || duration < 30) throw new Error("Video kam se kam 30 second ki chahiye");
    if (duration > MAX_SECONDS) throw new Error("Video 60 minute tak ki bhejo");
    // Normalise once: h264 30fps, long side <= 1920, audio track guaranteed.
    const src = path.join(dir, "src.mp4");
    const hasAudio = probe(raw, "stream=index", "a").length > 0;
    if (!hasAudio) throw new Error("Video mein awaaz nahi hai — Shorts ke liye speech chahiye");
    run("ffmpeg", ["-v", "error", "-y", "-i", raw, "-vf", "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))',fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-c:a", "aac", "-b:a", "160k", src]);
    const [w, h] = probe(src, "stream=width,height", "v:0").split(",").map(Number);

    if (!local) await track.step("AUDIO_PROCESSING", 10, "transcribing");
    let tr: { language: string; segments: Segment[] };
    const given = arg("transcript");
    if (given) tr = JSON.parse(fs.readFileSync(given, "utf8"));
    else {
      const wav = path.join(dir, "a.wav");
      run("ffmpeg", ["-v", "error", "-y", "-i", src, "-ac", "1", "-ar", "16000", wav]);
      const out = path.join(dir, "t.json");
      execFileSync(py, ["scripts/telegram/transcribe.py", wav, out, "--model", process.env.WHISPER_MODEL || "small"], { stdio: "inherit" });
      tr = JSON.parse(fs.readFileSync(out, "utf8"));
    }
    if (!tr.segments.length) throw new Error("Video mein bolne wala hissa nahi mila");

    if (!local) await track.step("SCRIPT_GENERATION", 35, "choosing highlights");
    const clips = await pickClips(tr.segments, duration);
    if (!clips.length) throw new Error("Achhe hisse nahi mile");
    console.log(`[shorts] ${clips.length} clips: ${clips.map((c) => `${c.start}-${c.end}`).join(", ")}`);

    const delivered: { title: string; start: number; end: number; file: string; hashtags: string[] }[] = [];
    for (const [i, c] of clips.entries()) {
      if (!local) await track.step("RENDERING", 40 + Math.floor((i / clips.length) * 50), `short ${i + 1}/${clips.length}`);
      const props = ShortClipSchema.parse({ src: `tg/${jobId}/src.mp4`, start: c.start, end: c.end, width: w, height: h, framing: "fit", words: clipWords(tr.segments, c), hook: c.hook.toUpperCase(), handle: "" });
      const file = await renderComposition("ShortClip", props, path.join(root, "output", "tg", `${jobId}-${i + 1}.mp4`), 23);
      normalizeLoudness(file);
      console.log(`[shorts] ${file}`);
      if (local) continue;
      await sendVideo(job.chatId, file, `✂️ Short ${i + 1}/${clips.length}: ${c.title}\n${c.hashtags.join(" ")}\n⏱ ${Math.round(c.start)}s–${Math.round(c.end)}s`, i === 0 ? job.messageId : undefined);
      delivered.push({ title: c.title, start: c.start, end: c.end, hashtags: c.hashtags, file: await storeFile(file, `jobs/${job.jobCode ?? jobId}/short-${i + 1}.mp4`) });
    }
    if (local) return;
    await track.done({ title: `${delivered.length} Shorts`, shorts: delivered, language: tr.language });
  } catch (e) {
    if (e instanceof JobCancelled) { console.log(`[job] ${(e as Error).message}`); return; }
    console.error(e);
    if (!local) {
      await track.fail((e as Error).message);
      if (!job.statusMessageId) await sendMessage(job.chatId, `😔 Shorts nahi ban paaye: ${(e as Error).message}`, job.messageId).catch(() => undefined);
    }
    process.exitCode = 1;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
})();
