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
import { HighlightReelSchema, ShortClipSchema } from "../../engines/short-clip/src/model";
import { planTighten, cutFilter } from "./tighten";
import { ClipsSchema, cleanClips, clipWords, fallbackClips, highlightsPrompt, rankClips, reelPlan, type Clip, type Segment } from "./shorts";
import { renderComposition, renderStillComposition } from "./render";
import { downloadFile, sendMessage, sendPhoto, sendVideo } from "./telegram";
import { JobCancelled, jobTracker } from "./jobs";
import { storeFile } from "./storage";
import { normalizeLoudness } from "./loudness";

interface Job { fileId?: string; url?: string; chatId: string | number; messageId?: number; jobCode?: string; statusMessageId?: number; count?: number; seconds?: number; language?: string; user?: { name?: string }; brand?: { name?: string; logo?: string; accent?: string; handle?: string }; reel?: boolean; tighten?: boolean }

const args = process.argv.slice(2);
const arg = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const local = arg("local");
const job = (local ? { chatId: 0, count: Number(arg("count") ?? 2), seconds: Number(arg("seconds") ?? 40) } : JSON.parse(process.env.PAYLOAD || "{}")) as Job;
const count = Math.max(1, Math.min(10, Number(job.count) || 10));
const target = Math.max(20, Math.min(60, Number(job.seconds) || 45));
const root = process.cwd();
const jobId = `s${Date.now().toString(36)}`;
const dir = path.join(root, "public", "tg", jobId);
const py = process.env.PYTHON || "python3";
const MAX_SECONDS = 60 * 60;
const brand = { name: job.brand?.name ?? process.env.BRAND_NAME ?? "", logo: job.brand?.logo ?? "", accent: job.brand?.accent ?? "#FFD23F", handle: job.brand?.handle ?? process.env.BRAND_HANDLE ?? "" };
const wantReel = job.reel !== false;
const wantTighten = job.tighten !== false && process.env.SHORTS_TIGHTEN !== "0";
const hindi = (job.language ?? "hinglish") !== "english";

/**
 * AI voice-over line -> audio file under /public. Kokoro-82M first (free, CPU; Hindi voices read Devanagari), Edge TTS as fallback.
 * Voice: KOKORO_VOICE (default hm_omega for Hindi/Hinglish, af_heart for English). TTS_ENGINE=edge forces Edge TTS.
 * Returns { file, seconds } or null when no engine works (the reel then simply has no voice line).
 */
function tts(text: string, name: string): { file: string; seconds: number } | null {
  if (local && !process.env.TTS_LOCAL) return null;
  const base = name.replace(/\.\w+$/, "");
  const attempt = (ext: string, fn: (out: string) => void) => {
    const out = path.join(dir, `${base}.${ext}`);
    try { fn(out); return { file: `tg/${jobId}/${base}.${ext}`, seconds: Number(probe(out, "format=duration")) + 0.3 }; } catch (e) { console.warn(`[tts] ${base}: ${(e as Error).message.split("\n")[0]}`); return null; }
  };
  if (process.env.TTS_ENGINE !== "edge") {
    const voice = process.env.KOKORO_VOICE || (hindi ? "hm_omega" : "af_heart");
    const r = attempt("wav", (out) => { execFileSync(py, ["scripts/telegram/kokoro.py", out, "--text", text, "--voice", voice, "--lang", hindi ? "hi" : "en-us", "--speed", "1.0"], { stdio: "ignore", timeout: 120_000 }); });
    if (r) return r;
  }
  const edgeVoice = hindi ? "hi-IN-MadhurNeural" : "en-US-GuyNeural";
  for (let n = 1; n <= 3; n++) {
    const r = attempt("mp3", (out) => { execFileSync(py, ["-m", "edge_tts", "--voice", edgeVoice, "--rate=+6%", "--text", text, "--write-media", out], { stdio: "ignore", timeout: 60_000 }); });
    if (r) return r;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1500 * n);
  }
  return null;
}

const HI_NUM = ["शून्य", "एक", "दो", "तीन", "चार", "पाँच", "छह", "सात", "आठ", "नौ", "दस"];
/** Fallback intro when the AI gave none: Devanagari for Hindi voices (Roman text would be mispronounced). */
const introFor = (rank: number, hook: string) => (hindi ? `नंबर ${HI_NUM[rank] ?? rank}!` : `Number ${rank}: ${hook}`);

const run = (cmd: string, a: string[]) => execFileSync(cmd, a, { stdio: ["ignore", "pipe", "inherit"] }).toString();
const probe = (f: string, entries: string, stream = "") => run("ffprobe", ["-v", "error", ...(stream ? ["-select_streams", stream] : []), "-show_entries", entries, "-of", "csv=p=0", f]).trim();

/**
 * Optional polish: cut long silences and stumbles out of one clip (ffmpeg, re-encoded to src-quality). Returns the source/range/words to
 * render. ANY problem (no gain, ffmpeg error, empty output) returns the untouched clip, so tightening can never break a job.
 */
function tightenClip(key: string, c: { start: number; end: number }, words: { start: number; end: number; word: string }[], srcAbs: string): { src: string; start: number; end: number; words: { start: number; end: number; word: string }[] } {
  const plain = { src: `tg/${jobId}/src.mp4`, start: c.start, end: c.end, words };
  if (!wantTighten) return plain;
  try {
    const plan = planTighten(words, c.end - c.start);
    if (!plan.changed) return plain;
    const out = path.join(dir, `cut-${key}.mp4`);
    const hasAudio = probe(srcAbs, "stream=index", "a").length > 0;
    run("ffmpeg", ["-v", "error", "-y", "-ss", String(c.start), "-t", String(c.end - c.start), "-i", srcAbs, "-filter_complex", cutFilter(plan.keep, hasAudio), "-map", "[v]", ...(hasAudio ? ["-map", "[a]"] : []), "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", ...(hasAudio ? ["-c:a", "aac", "-b:a", "160k"] : []), out]);
    const got = Number(probe(out, "format=duration"));
    if (!(got > 1) || Math.abs(got - plan.duration) > 0.6) throw new Error(`unexpected length ${got} vs ${plan.duration}`);
    console.log(`[tighten] ${key}: -${plan.removed}s (${(c.end - c.start).toFixed(1)}s -> ${got.toFixed(1)}s)`);
    return { src: `tg/${jobId}/cut-${key}.mp4`, start: 0, end: +got.toFixed(2), words: plan.words };
  } catch (e) {
    console.warn(`[tighten] ${key}: skipped (${(e as Error).message.split("\n")[0]})`);
    return plain;
  }
}

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
    const downloaderArgs = [
      "-f", "bv*[height<=1080]+ba/b[height<=1080]/b",
      "--merge-output-format", "mp4",
      "--max-filesize", "1500M",
      "--no-playlist",
      "--js-runtimes", "deno",
    ];
    const cookiesB64 = process.env.YOUTUBE_COOKIES_B64?.trim();
    if (cookiesB64) {
      const cookiePath = path.join(dir, "youtube-cookies.txt");
      const cookieText = Buffer.from(cookiesB64, "base64").toString("utf8");
      if (!cookieText.includes("# Netscape HTTP Cookie File") && !cookieText.includes("# HTTP Cookie File")) {
        throw new Error("YOUTUBE_COOKIES_B64 is not a valid base64-encoded Netscape cookies.txt file");
      }
      fs.writeFileSync(cookiePath, cookieText, { mode: 0o600 });
      downloaderArgs.push("--cookies", cookiePath);
    }
    downloaderArgs.push("-o", to, job.url);
    try {
      run("yt-dlp", downloaderArgs);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      if (/Sign in to confirm|not a bot|cookies/i.test(detail)) {
        throw new Error(
          "YouTube blocked this server download with its bot check. Upload the source video directly to Telegram, use a direct MP4 link, or configure the YOUTUBE_COOKIES_B64 GitHub Actions secret with a base64-encoded Netscape cookies.txt file from an account authorized to access the video. Cookies are optional and are never printed in logs."
        );
      }
      throw new Error(`YouTube download failed: ${detail}`);
    }
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

    const ranked = rankClips(clips);
    const delivered: { rank: number; score: number; title: string; start: number; end: number; file: string; hashtags: string[] }[] = [];
    for (const [i, c] of ranked.entries()) {
      if (!local) await track.step("RENDERING", 40 + Math.floor((i / (ranked.length + (wantReel ? 2 : 0))) * 50), `short ${i + 1}/${ranked.length}`);
      const tc = tightenClip(`s${i + 1}`, c, clipWords(tr.segments, c), src);
      const props = ShortClipSchema.parse({ src: tc.src, start: tc.start, end: tc.end, width: w, height: h, framing: "fit", words: tc.words, hook: c.hook.toUpperCase(), handle: brand.handle, brand: brand.name, logo: brand.logo, accent: brand.accent, badge: `#${i + 1}` });
      const file = await renderComposition("ShortClip", props, path.join(root, "output", "tg", `${jobId}-${i + 1}.mp4`), 23);
      normalizeLoudness(file);
      console.log(`[shorts] #${i + 1} score ${c.score} ${file}`);
      if (local) continue;
      await sendVideo(job.chatId, file, `✂️ #${i + 1}/${ranked.length} 🔥 Viral score ${c.score}/100: ${c.title}${c.reason ? `\n💡 ${c.reason}` : ""}\n${c.hashtags.join(" ")}\n⏱ ${Math.round(c.start)}s–${Math.round(c.end)}s`, i === 0 ? job.messageId : undefined);
      delivered.push({ rank: i + 1, score: c.score, title: c.title, start: c.start, end: c.end, hashtags: c.hashtags, file: await storeFile(file, `jobs/${job.jobCode ?? jobId}/short-${i + 1}.mp4`) });
    }

    // Best-of countdown reel: voice-over intros (AI script + TTS), rank badges, branding, thumbnail.
    let reelFile = "", reelThumb = "", reelMeta = { title: "", description: "" };
    if (wantReel && ranked.length >= 3) {
      if (!local) await track.step("RENDERING", 85, "best-of reel");
      const plan = reelPlan(ranked, tr.segments);
      const topic = ranked[0]!.title.replace(/#\w+/g, "").trim();
      const clipsProps = plan.map((e) => {
        const line = e.clip.intro || introFor(e.rank, e.clip.hook || e.clip.title);
        const v = tts(line, `v${e.rank}.mp3`);
        const tc = tightenClip(`r${e.rank}`, e, clipWords(tr.segments, e), src);
        return ShortClipSchema.parse({ src: tc.src, start: tc.start, end: tc.end, width: w, height: h, framing: "fit", words: tc.words, hook: "", handle: brand.handle, accent: brand.accent, badge: `#${e.rank}`, voice: v?.file ?? "", voiceSeconds: v?.seconds ?? 0 });
      });
      const title = `TOP ${plan.length} MOMENTS`;
      const introVoice = tts(hindi ? `ये हैं सबसे ज़बरदस्त ${HI_NUM[plan.length] ?? plan.length} पल। चलिए गिनती शुरू करते हैं!` : `Here are the ${plan.length} best moments. Let's count down!`, "intro.mp3");
      const reelProps = HighlightReelSchema.parse({ title, subtitle: topic.slice(0, 70), intro: introVoice?.file ?? "", introSeconds: introVoice?.seconds ?? 0, cta: hindi ? "Aur dekhne ke liye follow karo" : "Follow for more", clips: clipsProps, accent: brand.accent, brand: brand.name, logo: brand.logo });
      reelFile = await renderComposition("HighlightReel", reelProps, path.join(root, "output", "tg", `${jobId}-reel.mp4`), 23);
      normalizeLoudness(reelFile);
      reelThumb = await renderStillComposition("ShortThumbnail", { src: `tg/${jobId}/src.mp4`, at: ranked[0]!.start + 1, width: w, height: h, title: ranked[0]!.hook || ranked[0]!.title, accent: brand.accent, brand: brand.name, logo: brand.logo, badge: `TOP ${plan.length}` }, path.join(root, "output", "tg", `${jobId}-reel-thumb.jpg`)).catch((e: Error) => { console.warn(`[thumb] ${e.message}`); return ""; });
      const tags = [...new Set(ranked.flatMap((c) => c.hashtags))].slice(0, 8);
      reelMeta = { title: `${topic} — Top ${plan.length} Moments 🔥 #shorts`.slice(0, 100), description: `${plan.slice().reverse().map((e) => `#${e.rank} ${e.clip.title}`).join("\n")}\n\n${tags.join(" ")}` };
      console.log(`[reel] ${reelFile}${reelThumb ? ` + ${reelThumb}` : ""}`);
      if (!local) {
        await sendVideo(job.chatId, reelFile, `🏆 Best-of reel: ${reelMeta.title}\n\n${reelMeta.description}`);
        if (reelThumb) await sendPhoto(job.chatId, reelThumb, "🖼️ Thumbnail").catch((e: Error) => console.warn(`[thumb] ${e.message}`));
      }
    }
    if (local) return;
    const reel = reelFile ? await storeFile(reelFile, `jobs/${job.jobCode ?? jobId}/reel.mp4`) : "";
    const thumb = reelThumb ? await storeFile(reelThumb, `jobs/${job.jobCode ?? jobId}/thumb.jpg`, "image/jpeg") : "";
    await track.done({ title: reelMeta.title || `${delivered.length} Shorts`, description: reelMeta.description, shorts: delivered, reel, thumb, language: tr.language });
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
