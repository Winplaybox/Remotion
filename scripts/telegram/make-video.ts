/**
 * Telegram job: topic or script -> narrated video (+ thumbnail, title/description/hashtags, sources) sent back to the chat.
 * Runs in GitHub Actions (.github/workflows/telegram-bot.yml) with the job in env PAYLOAD (JSON):
 *   { kind: "topic"|"script", narrator, text?, fileId? (script document), chatId, messageId?, jobCode?, statusMessageId?,
 *     language?, aspect?, seconds?, enhance?, preview?, draft? (approved preview), ideaCode?, user? }
 *
 *   PAYLOAD='{"kind":"topic","narrator":"dadi","text":"Holi kyun manate hain","chatId":"1"}' npx ts-node scripts/telegram/make-video.ts
 *   ... --dry   (no Gemini/TTS/Telegram: demo beats, silent; for local previews)
 *
 * Needs: GEMINI_API_KEY (topic; optional for script), TELEGRAM_BOT_TOKEN, python edge-tts, ffmpeg.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { NARRATORS, NARRATOR_DEMO, NarratorVideoSchema, sizeOf, type NarratorId, type NarratorVideo } from "../../engines/narrator-video/src/model";
import { DraftSchema, LANGUAGES, defaultMeta, metaText, parseDraft, previewText, researchPrompt, scriptPrompt, splitScript, topicPrompt, voiceFor, type Draft, type Language, type Source } from "./script";
import { downloadFile, sendKeyboard, sendMessage, sendPhoto, sendVideo } from "./telegram";
import { renderComposition, renderStillComposition } from "./render";
import { JobCancelled, completeIdea, jobTracker, saveJobOutput } from "./jobs";
import { storeFile } from "./storage";
import { normalizeLoudness } from "./loudness";

interface Job {
  kind: "topic" | "script"; narrator: string; text?: string; fileId?: string; chatId: string | number; messageId?: number;
  jobCode?: string; statusMessageId?: number; ideaCode?: string; language?: string; aspect?: string; seconds?: number;
  enhance?: boolean; preview?: boolean; draft?: unknown; sources?: Source[]; user?: { id?: number; name?: string };
}

const root = process.cwd();
const dry = process.argv.includes("--dry");
const job = JSON.parse(process.env.PAYLOAD || "{}") as Job;
const narrator = (job.narrator in NARRATORS ? job.narrator : "dost") as NarratorId;
const language = (LANGUAGES.includes(job.language as Language) ? job.language : "hinglish") as Language;
const aspect = job.aspect === "16:9" ? "16:9" : "9:16";
const seconds = Math.max(15, Math.min(180, Number(job.seconds) || 50));
const jobId = `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`;
const py = process.env.PYTHON || "python3";
const OUTRO: Record<Language, string> = { hinglish: "Pasand aaya? FOLLOW karo! 🙏", hindi: "पसंद आया? फॉलो करो! 🙏", english: "Liked it? FOLLOW for more! 🙏" };

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] }; groundingMetadata?: { groundingChunks?: { web?: { uri?: string; title?: string } }[] } }[];
  error?: { message?: string };
}

async function gemini(prompt: string, opts: { json?: boolean; search?: boolean } = { json: true }): Promise<{ text: string; sources: Source[] }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      ...(opts.search ? { tools: [{ google_search: {} }] } : {}),
      generationConfig: { temperature: opts.search ? 0.2 : 0.8, ...(opts.json ? { responseMimeType: "application/json" } : {}) }
    })
  });
  const j = (await res.json()) as GeminiResponse;
  const c = j.candidates?.[0];
  const text = c?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!res.ok || !text) throw new Error(`Gemini: ${j.error?.message ?? res.status}`);
  const sources = (c?.groundingMetadata?.groundingChunks ?? []).flatMap((g) => (g.web?.uri ? [{ title: g.web.title ?? g.web.uri, url: g.web.uri }] : []));
  return { text, sources: sources.filter((s, i, a) => a.findIndex((x) => x.url === s.url) === i) };
}

/** Facts + sources for factual topics (Google Search grounding). Never fatal. */
async function research(topic: string): Promise<{ facts: string; sources: Source[] }> {
  try {
    const r = await gemini(researchPrompt(topic), { search: true });
    if (/NO_RESEARCH_NEEDED/.test(r.text)) return { facts: "", sources: [] };
    return { facts: r.text.trim(), sources: r.sources };
  } catch (e) {
    console.warn(`[research] ${(e as Error).message}`);
    return { facts: "", sources: [] };
  }
}

async function scriptText(): Promise<string> {
  if (job.text && job.text.trim()) return job.text;
  if (!job.fileId) throw new Error("Script khaali hai");
  const buf = await downloadFile(job.fileId);
  if (buf.length > 200_000) throw new Error("Script file 200 KB se badi hai");
  return buf.toString("utf8").replace(/^﻿/, "").slice(0, 8000);
}

async function makeDraft(): Promise<{ draft: Draft; sources: Source[] }> {
  if (dry) return { draft: { title: NARRATOR_DEMO.title, beats: NARRATOR_DEMO.beats.map((b) => ({ caption: b.caption, voice: b.caption, icon: b.icon })) }, sources: [] };
  if (job.draft) return { draft: DraftSchema.parse(job.draft), sources: job.sources ?? [] }; // approved preview
  if (job.kind === "topic") {
    const { facts, sources } = await research(job.text ?? "");
    const prompt = topicPrompt(narrator, job.text ?? "", { language, seconds, facts });
    for (let attempt = 1; attempt <= 2; attempt++) {
      try { return { draft: parseDraft((await gemini(prompt)).text), sources }; } catch (e) { console.warn(`[draft] attempt ${attempt}: ${(e as Error).message}`); }
    }
    throw new Error("Script nahi likh paaye (AI busy). Thodi der baad dobara bhejo.");
  }
  const text = await scriptText();
  if (process.env.GEMINI_API_KEY) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try { return { draft: parseDraft((await gemini(scriptPrompt(narrator, text, { language, enhance: !!job.enhance }))).text), sources: [] }; } catch (e) { console.warn(`[draft] attempt ${attempt}: ${(e as Error).message}`); }
    }
  }
  return { draft: splitScript(text), sources: [] }; // the user's own words still work without AI
}

const probe = (f: string) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

function voiceBeats(d: Draft): NarratorVideo["beats"] {
  const v = voiceFor(narrator, language);
  const dir = path.join(root, "public", "tg", jobId);
  fs.mkdirSync(dir, { recursive: true });
  return d.beats.map((b, i) => {
    const estimate = Math.min(15, Math.max(2.2, b.caption.split(/\s+/).length * 0.42 + 0.9));
    if (dry) return { caption: b.caption, icon: b.icon, voice: "", seconds: estimate };
    const file = path.join(dir, `b${i + 1}.mp3`);
    try {
      for (let attempt = 1; ; attempt++) {
        try { execFileSync(py, ["-m", "edge_tts", "--voice", v.voice, `--rate=${v.rate}`, "--text", b.voice, "--write-media", file], { stdio: "ignore", timeout: 60_000 }); break; } catch (e) {
          if (attempt >= 3) throw e;
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1500 * attempt); // brief backoff, TTS service hiccups
        }
      }
      const s = probe(file);
      return { caption: b.caption, icon: b.icon, voice: `tg/${jobId}/b${i + 1}.mp3`, seconds: Math.min(15, Math.max(1.6, s + 0.45)) };
    } catch (e) {
      console.warn(`[tts] beat ${i + 1}: ${(e as Error).message}`);
      return { caption: b.caption, icon: b.icon, voice: "", seconds: estimate };
    }
  });
}

(async () => {
  if (!dry && (!job.kind || (!job.text && !job.fileId && !job.draft) || !job.chatId)) throw new Error("PAYLOAD needs kind, text|fileId|draft, chatId");
  const track = jobTracker({ code: job.jobCode, chatId: job.chatId, statusMessageId: job.statusMessageId });
  try {
    if (!dry) await track.step("SCRIPT_GENERATION", 10);
    const { draft: d, sources } = await makeDraft();

    if (job.preview && !job.draft && !dry) {
      // Stop here: the user approves (▶️ Render) or sends an edited /script.
      await saveJobOutput(job.jobCode, { draft: d, sources, awaiting: "approval" });
      await track.step("SCRIPT_GENERATION", 100, "preview sent");
      await sendKeyboard(job.chatId, `${previewText(d)}\n\n✏️ Badalna ho to edited script /script ke saath bhejo.`, [[{ text: "▶️ Render", callback_data: `job:render:${job.jobCode}` }, { text: "🛑 Cancel", callback_data: `job:cancel:${job.jobCode}` }]]);
      return;
    }

    if (!dry) await track.step("NARRATION", 30, d.title);
    const beats = voiceBeats(d);
    if (!dry) await track.step("RENDERING", 45);
    const props = NarratorVideoSchema.parse({ narrator, title: d.title, beats, outro: OUTRO[language], handle: "", sound: true, aspect });
    let lastPct = 45;
    const file = await renderComposition("NarratorVideo", props, path.join(root, "output", "tg", `${jobId}.mp4`), 24, 1, (p) => {
      const pct = 45 + Math.floor(p * 40);
      if (!dry && pct - lastPct >= 10) { lastPct = pct; track.step("RENDERING", pct).catch(() => undefined); }
    });
    if (!dry) { await track.step("AUDIO_PROCESSING", 86, "loudness"); normalizeLoudness(file); }
    if (!dry) await track.step("VISUAL_GENERATION", 88, "thumbnail");
    const thumb = await renderStillComposition("NarratorThumbnail", { narrator, title: d.title, icon: d.beats[0]?.icon ?? "✨", aspect }, path.join(root, "output", "tg", `${jobId}-thumb.jpg`)).catch((e: Error) => { console.warn(`[thumb] ${e.message}`); return ""; });
    console.log(`[render] ${file} (${props.beats.length} beats, ${aspect}, ${language})${thumb ? ` + ${thumb}` : ""}`);
    if (dry) return;

    await track.step("UPLOADING", 92);
    const meta = d.meta ?? defaultMeta(d);
    const size = sizeOf(aspect);
    await sendVideo(job.chatId, file, `🎬 ${meta.title}\nNarrator: ${NARRATORS[narrator].label}${job.jobCode ? ` · ${job.jobCode}` : ""}`, job.messageId, [size.width, size.height]);
    if (thumb) await sendPhoto(job.chatId, thumb, "🖼️ Thumbnail").catch((e: Error) => console.warn(`[thumb] ${e.message}`));
    await sendMessage(job.chatId, metaText(meta, sources)).catch((e: Error) => console.warn(`[meta] ${e.message}`));
    const key = `jobs/${job.jobCode ?? jobId}`;
    const stored = await storeFile(file, `${key}/video.mp4`);
    const storedThumb = thumb ? await storeFile(thumb, `${key}/thumb.jpg`, "image/jpeg") : "";
    await completeIdea(job.ideaCode, job.jobCode);
    await track.done({ file: stored, thumb: storedThumb, title: meta.title, video_title: d.title, description: meta.description, hashtags: meta.hashtags, sources, beats: props.beats.length, seconds: Math.round(props.beats.reduce((s, b) => s + b.seconds, 0)), aspect, language, narrator, idea: job.ideaCode ?? null });
    if (stored && job.jobCode) await sendKeyboard(job.chatId, "📤 Is video ko channel pe publish karna hai? Admin approve karega.", [[{ text: "📤 Publish ke liye bhejo", callback_data: `pub:submit:${job.jobCode}` }]]).catch(() => undefined);
    const admin = process.env.TG_ADMIN_ID;
    if (admin && String(admin) !== String(job.chatId)) await sendMessage(admin, `🎬 ${job.jobCode ?? job.kind} bana: "${d.title}" (${NARRATORS[narrator].label}) for ${job.user?.name ?? job.chatId}`).catch(() => undefined);
  } catch (e) {
    if (e instanceof JobCancelled) { console.log(`[job] ${(e as Error).message}`); return; }
    console.error(e);
    if (!dry) {
      await track.fail((e as Error).message);
      if (!job.statusMessageId) await sendMessage(job.chatId, `😔 Video nahi ban paaya: ${(e as Error).message}`, job.messageId).catch(() => undefined);
    }
    process.exitCode = 1;
  } finally {
    fs.rmSync(path.join(root, "public", "tg", jobId), { recursive: true, force: true });
  }
})();
