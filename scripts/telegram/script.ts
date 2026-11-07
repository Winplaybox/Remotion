/**
 * Topic / script -> narrator beats. Pure (no network): prompt building, Gemini JSON validation, script splitting.
 * make-video.ts does the network parts (Gemini, Edge TTS, render, Telegram).
 */
import { z } from "zod";
import { NARRATORS, type NarratorId } from "../../engines/narrator-video/src/model";

/** One beat before TTS: caption (roman Hinglish, on screen) + voice (Devanagari, spoken) + emoji. */
export const DraftBeatSchema = z.object({
  caption: z.string().min(1).max(160),
  voice: z.string().min(1).max(400),
  icon: z.string().max(16).default("✨")
});
export const DraftSchema = z.object({
  title: z.string().min(1).max(60),
  beats: z.array(DraftBeatSchema).min(2).max(16)
});
export type Draft = z.infer<typeof DraftSchema>;

const RULES = `Rules:
- Output ONLY JSON: {"title": string, "beats": [{"caption": string, "voice": string, "icon": string}]}.
- title: max 6 words, Hinglish in Roman script, UPPERCASE, a curiosity hook (e.g. "DIWALI PE DIYE KYUN?").
- caption: what appears on screen — Hinglish in Roman script, max 14 words, one idea per beat.
- voice: the SAME sentence written in Devanagari (Hindi script) so a Hindi TTS voice reads it naturally. English words may be written in Devanagari.
- icon: exactly one emoji that fits the beat.
- Family-friendly. No medical, legal or financial advice, no hate, no politics, no claims you are not sure of.
- If the request is unsafe or not something to make a video about, return {"title":"NAHI BANA SAKTE","beats":[{"caption":"Is topic pe video nahi bana sakte.","voice":"इस टॉपिक पर वीडियो नहीं बना सकते।","icon":"🙏"},{"caption":"Koi aur topic bhejo!","voice":"कोई और टॉपिक भेजो!","icon":"💡"}]}.`;

export function topicPrompt(narrator: NarratorId, topic: string): string {
  const n = NARRATORS[narrator];
  return `You write YouTube Shorts scripts for an Indian audience. Narrator: ${n.persona}.
Write a 40-55 second Short about this topic: "${topic.replace(/"/g, "'")}".
Structure: beat 1 = hook question, beats 2-8 = the story/explanation with concrete details, last beat = one-line takeaway + "comment mein batao" question.
8 to 10 beats.
${RULES}`;
}

export function scriptPrompt(narrator: NarratorId, script: string): string {
  const n = NARRATORS[narrator];
  return `Turn this user-written script into beats for a narrated YouTube Short. Narrator: ${n.persona}.
KEEP THE USER'S WORDS and order — only split into beats (1-2 sentences each), fix obvious typos, and add the Devanagari voice line and an emoji per beat. Do not add new facts.
Script:
"""
${script}
"""
${RULES}`;
}

/** Parse Gemini text (may be wrapped in ```json fences) into a valid draft. Throws with a readable message. */
export function parseDraft(text: string): Draft {
  const json = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  let raw: unknown;
  try { raw = JSON.parse(json); } catch { throw new Error("Script AI ne sahi JSON nahi diya"); }
  const d = DraftSchema.parse(raw);
  return { title: d.title.toUpperCase().slice(0, 60), beats: d.beats.map((b) => ({ ...b, caption: b.caption.trim(), voice: b.voice.trim() })) };
}

/** No-AI fallback for /script: split into beats of 1-2 sentences; voice = same text. */
export function splitScript(script: string, maxBeats = 14): Draft {
  const lines = script.replace(/\r/g, "").split("\n").map((l) => l.trim()).filter(Boolean);
  const titleLine = lines.length > 1 && lines[0]!.length <= 40 ? lines.shift()! : "";
  const sentences = lines.join(" ").split(/(?<=[.!?।|])\s+/).map((s) => s.trim()).filter(Boolean);
  const beats: { caption: string; voice: string; icon: string }[] = [];
  let cur = "";
  for (const s of sentences) {
    const next = cur ? `${cur} ${s}` : s;
    if (next.length > 110 && cur) { beats.push({ caption: cur, voice: cur, icon: "✨" }); cur = s; } else cur = next;
  }
  if (cur) beats.push({ caption: cur, voice: cur, icon: "✨" });
  const merged = beats.slice(0, maxBeats).map((b) => ({ ...b, caption: b.caption.slice(0, 160), voice: b.voice.slice(0, 400) }));
  if (merged.length < 2) merged.push({ caption: "Comment mein batao, kaisa laga!", voice: "कमेंट में बताओ, कैसा लगा!", icon: "💬" });
  const title = (titleLine || sentences[0] || "SUNO").split(/\s+/).slice(0, 6).join(" ").toUpperCase().slice(0, 60);
  return { title, beats: merged };
}
