/**
 * Topic / script -> narrator beats + publishing metadata. Pure (no network): prompts, Gemini JSON validation,
 * script splitting. make-video.ts does the network parts (research, Gemini, Edge TTS, render, Telegram).
 */
import { z } from "zod";
import { NARRATORS, type NarratorId } from "../../engines/narrator-video/src/model";

export type Language = "hinglish" | "hindi" | "english";
export const LANGUAGES: Language[] = ["hinglish", "hindi", "english"];

/** One beat before TTS: caption (on screen) + voice (spoken text for TTS) + emoji. */
export const DraftBeatSchema = z.object({
  caption: z.string().min(1).max(160),
  voice: z.string().min(1).max(400),
  icon: z.string().max(16).default("✨")
});
export const MetaSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1500).default(""),
  hashtags: z.array(z.string().max(40)).max(15).default([])
});
export const DraftSchema = z.object({
  title: z.string().min(1).max(60),
  beats: z.array(DraftBeatSchema).min(2).max(20),
  meta: MetaSchema.optional()
});
export type Draft = z.infer<typeof DraftSchema>;
export type Meta = z.infer<typeof MetaSchema>;
export interface Source { title: string; url: string }

/** ~5.5 s per beat, 4..16 beats. */
export const beatsFor = (seconds = 50) => Math.max(4, Math.min(16, Math.round(seconds / 5.5)));

/** Edge TTS voice per narrator and language (English uses the Indian-English voices of the same gender). */
export function voiceFor(narrator: NarratorId, language: Language): { voice: string; rate: string } {
  const n = NARRATORS[narrator];
  if (language !== "english") return { voice: n.voice, rate: n.rate };
  return { voice: n.voice === "hi-IN-SwaraNeural" ? "en-IN-NeerjaNeural" : "en-IN-PrabhatNeural", rate: n.rate };
}

const LANG_RULES: Record<Language, string> = {
  hinglish: `- caption: Hinglish in Roman script (as Indians type on WhatsApp), max 14 words, one idea per beat.
- voice: the SAME sentence written in Devanagari (Hindi script) so a Hindi TTS voice reads it naturally. English words may be written in Devanagari.
- title: max 6 words, Hinglish in Roman script, UPPERCASE, a curiosity hook (e.g. "DIWALI PE DIYE KYUN?").`,
  hindi: `- caption: simple Hindi in Devanagari, max 14 words, one idea per beat.
- voice: the same text (Devanagari).
- title: max 6 words in Devanagari Hindi, a curiosity hook.`,
  english: `- caption: simple Indian English, max 14 words, one idea per beat.
- voice: the same text.
- title: max 6 words, English, UPPERCASE, a curiosity hook.`
};

const rules = (language: Language) => `Rules:
- Output ONLY JSON: {"title": string, "beats": [{"caption": string, "voice": string, "icon": string}], "meta": {"title": string, "description": string, "hashtags": string[]}}.
${LANG_RULES[language]}
- icon: exactly one emoji that fits the beat.
- meta.title: a YouTube Shorts title (max 70 characters) in the same language style, no clickbait lies; meta.description: 2-4 short lines + a question for comments; meta.hashtags: 5-8 hashtags without spaces, including #shorts.
- Family-friendly. No medical, legal or financial advice, no hate, no politics, no claims you are not sure of. Never invent quotes, numbers or dates.
- If the request is unsafe or not something to make a video about, return {"title":"NAHI BANA SAKTE","beats":[{"caption":"Is topic pe video nahi bana sakte.","voice":"इस टॉपिक पर वीडियो नहीं बना सकते।","icon":"🙏"},{"caption":"Koi aur topic bhejo!","voice":"कोई और टॉपिक भेजो!","icon":"💡"}]}.`;

export interface PromptOpts { language?: Language; seconds?: number; facts?: string }

export function topicPrompt(narrator: NarratorId, topic: string, o: PromptOpts = {}): string {
  const n = NARRATORS[narrator];
  const beats = beatsFor(o.seconds);
  return `You write YouTube Shorts scripts for an Indian audience. Narrator: ${n.persona}.
Write a ${o.seconds ?? 50}-second video about this topic: "${topic.replace(/"/g, "'")}".
Structure: beat 1 = hook question, middle beats = the story/explanation with concrete details, last beat = one-line takeaway + "comment mein batao" style question.
Exactly ${beats} beats.
${o.facts ? `Use ONLY these researched facts for factual claims (do not add other facts):\n"""\n${o.facts.slice(0, 6000)}\n"""\n` : ""}${rules(o.language ?? "hinglish")}`;
}

export function scriptPrompt(narrator: NarratorId, script: string, o: PromptOpts & { enhance?: boolean } = {}): string {
  const n = NARRATORS[narrator];
  const keep = o.enhance
    ? "IMPROVE the script for a Short: keep the user's story, characters, dialogue and order, but tighten wording and add a hook and a closing question. Do not add new facts."
    : "KEEP THE USER'S WORDS, dialogue and order — only split into beats (1-2 sentences each), fix obvious typos, and add the voice line and an emoji per beat. Do not add new facts. Do not remove dialogue.";
  return `Turn this user-written script into beats for a narrated video. Narrator: ${n.persona}.
${keep}
Script:
"""
${script}
"""
${rules(o.language ?? "hinglish")}`;
}

/** Research step (Gemini + Google Search grounding): plain facts, sources come from grounding metadata. */
export const researchPrompt = (topic: string) => `Research this topic for a short factual video for Indian viewers: "${topic.replace(/"/g, "'")}".
Return 6-10 short bullet points of verified facts (names, dates, numbers only when you are sure). For religious/mythological topics name the scripture or tradition each point comes from. If the topic is opinion, fiction or a story with no facts to check, reply exactly: NO_RESEARCH_NEEDED.`;

/** Parse Gemini text (may be wrapped in ```json fences) into a valid draft. Throws with a readable message. */
export function parseDraft(text: string): Draft {
  const json = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  let raw: unknown;
  try { raw = JSON.parse(json); } catch { throw new Error("Script AI ne sahi JSON nahi diya"); }
  const d = DraftSchema.parse(raw);
  return {
    title: d.title.toUpperCase().slice(0, 60),
    beats: d.beats.map((b) => ({ ...b, caption: b.caption.trim(), voice: b.voice.trim() })),
    ...(d.meta ? { meta: { ...d.meta, hashtags: d.meta.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`).replace(/\s+/g, "")) } } : {})
  };
}

/** Fallback metadata when the AI gave none. */
export function defaultMeta(d: Draft): Meta {
  return { title: `${d.title} #shorts`.slice(0, 100), description: `${d.beats[0]?.caption ?? ""}\nComment mein batao 👇`, hashtags: ["#shorts", "#hindi", "#facts"] };
}

/** No-AI fallback for /script: split into beats of 1-2 sentences; voice = same text. */
export function splitScript(script: string, maxBeats = 16): Draft {
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

/** Text shown before rendering in preview mode (user can approve or send an edited /script). */
export function previewText(d: Draft): string {
  return [`📝 ${d.title}`, "", ...d.beats.map((b, i) => `${i + 1}. ${b.icon} ${b.caption}`)].join("\n").slice(0, 3900);
}

/** Message with title/description/hashtags/sources sent after the video. */
export function metaText(meta: Meta, sources: Source[]): string {
  const src = sources.length ? `\n\n📚 Sources:\n${sources.slice(0, 6).map((s, i) => `${i + 1}. ${s.title} — ${s.url}`).join("\n")}` : "\n\n📚 Sources: (AI-written, verify facts before publishing)";
  return `🏷️ Title:\n${meta.title}\n\n📝 Description:\n${meta.description}\n\n#️⃣ ${meta.hashtags.join(" ")}${src}`.slice(0, 4000);
}
