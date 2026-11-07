/**
 * ASK OUTRO — the shared "answer in the next video" ending every puzzle engine uses (from its ASK_FROM post on).
 * Pure data + timing + voice + sfx; the visual is packages/visuals/src/AskOutro.tsx.
 *
 * Flow (scene stays visible underneath, never dimmed, so viewers can re-check and the Short loops):
 *   1. QUESTION  (questionSeconds) top banner: the question + answer-format chips   -> voice "ask_q.wav"
 *   2. CTA       (ctaSeconds)      yellow banner "APNA JAWAB COMMENT MEIN LIKHO!"
 *                                  + "Sahi jawab dekhne ke liye FOLLOW karo" + FOLLOW button that a cursor taps
 *                                  -> "✓ FOLLOWING"                                  -> voice "ask_cta.wav"
 * No separate end card after this. The next video opens with the answer (PrevAnswerCard),
 * and scripts/publish/answer-comments.ts posts it as a comment once the next video is public.
 */
import { z } from "zod";

export const ASK_CTA_VOICE = "अपना जवाब कमेंट में लिखो! और सही जवाब देखने के लिए फॉलो करो।";

export const AskOutroSchema = z.object({
  /** On-screen question, Hinglish caps, e.g. "6 KAHAN CHHUPA HAI?" */
  question: z.string().min(1),
  /** Answer-format chips under the question, e.g. ["#1", "#2", "#3"] or ["ROW 1-8", "#1-7"]. Keeps comments one word. */
  options: z.array(z.string()).max(9).default([]),
  /** Spoken question (Devanagari for the Hindi TTS voice). */
  voiceQuestion: z.string().min(1),
  cta: z.string().default("APNA JAWAB COMMENT MEIN LIKHO! 👇"),
  ctaSub: z.string().default("Sahi jawab dekhne ke liye FOLLOW karo!"),
  voiceCta: z.string().default(ASK_CTA_VOICE),
  handle: z.string().min(1),
  questionSeconds: z.number().min(2).default(4),
  ctaSeconds: z.number().min(3).default(5)
});
export type AskOutro = z.infer<typeof AskOutroSchema>;
export type AskOutroInput = z.input<typeof AskOutroSchema>;

/** Build a complete outro (fills defaults) — use this in <engine>ForDay. */
export const askOutro = (a: AskOutroInput): AskOutro => AskOutroSchema.parse(a);

export const askOutroSeconds = (a: AskOutro) => a.questionSeconds + a.ctaSeconds;

/** Seconds into the CTA phase when the cursor taps FOLLOW. */
export const followTapAt = (a: AskOutro) => Math.min(a.ctaSeconds - 1.2, 2.4);

/** Voice lines; `start` = video seconds where the outro begins. */
export const askOutroVoice = (a: AskOutro, start: number) => [
  { file: "ask_q.wav", at: start + 0.15, text: a.voiceQuestion },
  { file: "ask_cta.wav", at: start + a.questionSeconds + 0.15, text: a.voiceCta }
];

/** SFX (same shape as @visuals/Sound Sfx). */
export const askOutroSfx = (a: AskOutro, start: number) => [
  { src: "sfx/whoosh.mp3", at: start, volume: 0.4 },
  { src: "sfx/pop.mp3", at: start + a.questionSeconds, volume: 0.5 },
  { src: "sfx/tick.mp3", at: start + a.questionSeconds + followTapAt(a), volume: 0.7 },
  { src: "sfx/ding.mp3", at: start + a.questionSeconds + followTapAt(a) + 0.1, volume: 0.35 }
];

/** YouTube description / IG caption lines for ask-mode posts — same message as the video ending. */
export const ASK_META = {
  description: "Apna jawab comment mein likho 👇 Sahi jawab agli video mein — FOLLOW karo!\nDost ko tag karo jo ye nahi pakad paayega 👀",
  caption: "Jawab comment mein likho 👇 Sahi jawab agli video mein — follow karo! Dost ko tag karo 👀"
};
