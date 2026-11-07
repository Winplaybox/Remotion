/**
 * Telegram job: topic or script -> narrated Short -> sent back to the chat.
 * Runs in GitHub Actions (.github/workflows/telegram-bot.yml) with the job in env PAYLOAD (JSON):
 *   { kind: "topic" | "script", narrator, text, chatId, messageId?, user?: { id, name } }
 *
 *   PAYLOAD='{"kind":"topic","narrator":"dadi","text":"Holi kyun manate hain","chatId":"1"}' npx ts-node scripts/telegram/make-video.ts
 *   ... --dry   (no Gemini/TTS/Telegram: demo beats, silent; for local previews)
 *
 * Needs: GEMINI_API_KEY (topic; optional for script), TELEGRAM_BOT_TOKEN, python edge-tts, ffmpeg.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { NARRATORS, NARRATOR_DEMO, NarratorVideoSchema, type NarratorId, type NarratorVideo } from "../../engines/narrator-video/src/model";
import { parseDraft, scriptPrompt, splitScript, topicPrompt, type Draft } from "./script";
import { sendMessage, sendVideo } from "./telegram";
import { renderComposition } from "./render";

interface Job { kind: "topic" | "script"; narrator: string; text: string; chatId: string | number; messageId?: number; user?: { id?: number; name?: string } }

const root = process.cwd();
const dry = process.argv.includes("--dry");
const job = JSON.parse(process.env.PAYLOAD || "{}") as Job;
const narrator = (job.narrator in NARRATORS ? job.narrator : "dost") as NarratorId;
const jobId = `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`;
const py = process.env.PYTHON || "python3";

async function gemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.8 } })
  });
  const j = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[]; error?: { message?: string } };
  const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!res.ok || !text) throw new Error(`Gemini: ${j.error?.message ?? res.status}`);
  return text;
}

async function draft(): Promise<Draft> {
  if (dry) return { title: NARRATOR_DEMO.title, beats: NARRATOR_DEMO.beats.map((b) => ({ caption: b.caption, voice: b.caption, icon: b.icon })) };
  const prompt = job.kind === "topic" ? topicPrompt(narrator, job.text) : scriptPrompt(narrator, job.text);
  for (let attempt = 1; attempt <= 2; attempt++) {
    try { return parseDraft(await gemini(prompt)); } catch (e) {
      console.warn(`[draft] attempt ${attempt}: ${(e as Error).message}`);
    }
  }
  if (job.kind === "script") return splitScript(job.text); // user's own words still work without AI
  throw new Error("Script nahi likh paaye (AI busy). Thodi der baad dobara bhejo.");
}

const probe = (f: string) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

function voiceBeats(d: Draft): NarratorVideo["beats"] {
  const n = NARRATORS[narrator];
  const dir = path.join(root, "public", "tg", jobId);
  fs.mkdirSync(dir, { recursive: true });
  return d.beats.map((b, i) => {
    const estimate = Math.min(15, Math.max(2.2, b.caption.split(/\s+/).length * 0.42 + 0.9));
    if (dry) return { caption: b.caption, icon: b.icon, voice: "", seconds: estimate };
    const file = path.join(dir, `b${i + 1}.mp3`);
    try {
      execFileSync(py, ["-m", "edge_tts", "--voice", n.voice, `--rate=${n.rate}`, "--text", b.voice, "--write-media", file], { stdio: "ignore" });
      const s = probe(file);
      return { caption: b.caption, icon: b.icon, voice: `tg/${jobId}/b${i + 1}.mp3`, seconds: Math.min(15, Math.max(1.6, s + 0.45)) };
    } catch (e) {
      console.warn(`[tts] beat ${i + 1}: ${(e as Error).message}`);
      return { caption: b.caption, icon: b.icon, voice: "", seconds: estimate };
    }
  });
}

const render = (props: NarratorVideo) => renderComposition("NarratorVideo", props, path.join(root, "output", "tg", `${jobId}.mp4`));

(async () => {
  if (!dry && (!job.kind || !job.text || !job.chatId)) throw new Error("PAYLOAD needs kind, text, chatId");
  try {
    const d = await draft();
    const props = NarratorVideoSchema.parse({ narrator, title: d.title, beats: voiceBeats(d), outro: "Pasand aaya? FOLLOW karo! 🙏", handle: "", sound: true });
    const file = await render(props);
    console.log(`[render] ${file} (${props.beats.length} beats)`);
    if (dry) return;
    await sendVideo(job.chatId, file, `🎬 ${d.title}\nNarrator: ${NARRATORS[narrator].label}`, job.messageId);
    const admin = process.env.TG_ADMIN_ID;
    if (admin && String(admin) !== String(job.chatId)) await sendMessage(admin, `🎬 ${job.kind} video bana: "${d.title}" (${NARRATORS[narrator].label}) for ${job.user?.name ?? job.chatId}`).catch(() => undefined);
  } catch (e) {
    console.error(e);
    if (!dry) await sendMessage(job.chatId, `😔 Video nahi ban paaya: ${(e as Error).message}`, job.messageId).catch(() => undefined);
    process.exitCode = 1;
  } finally {
    fs.rmSync(path.join(root, "public", "tg", jobId), { recursive: true, force: true });
  }
})();
