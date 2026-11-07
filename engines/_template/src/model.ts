/**
 * ENGINE TEMPLATE — copy with `node scripts/new-engine.mjs <name> <PascalName>` and replace the puzzle logic.
 * Read docs/NEW_ENGINE.md first. Every engine has exactly these parts:
 *   1. Schema (zod)         -> everything the video needs, nothing random outside `seed`
 *   2. <x>ForDay(n)         -> post number -> complete props (deterministic, never repeats)
 *   3. <x>Duration(p)       -> frames
 *   4. <x>VoiceLines(p)     -> Hinglish lines (Devanagari) + when they play
 *   5. <x>Answer(p)         -> text for the answer comment (puzzles)
 *   6. askOutro             -> REQUIRED for puzzles: the shared ending from engines/ask-outro.ts
 *                              (question + options -> "comment mein likho" + FOLLOW tap). Never reveal the answer
 *                              in the same video and never add a separate end card; the next video opens with
 *                              the previous answer (prevAnswer + PrevAnswerCard). Tests enforce this.
 */
import { random } from "remotion";
import { z } from "zod";
import { AskOutroSchema, askOutro, askOutroSeconds, askOutroVoice } from "../../ask-outro";

export const FPS = 30;

export const TemplateSchema = z.object({
  voice: z.array(z.object({ src: z.string(), at: z.number().min(0) })).default([]),
  sound: z.boolean().default(true),
  brand: z.string(),
  handle: z.string(),
  postNo: z.number().int().min(1),
  title: z.string(),
  subtitle: z.string(),
  cols: z.number().int().min(3).max(10),
  count: z.number().int().min(6).max(100),
  seed: z.string(),
  /** Seconds the viewer has to solve it. Motion ramps startSpeed -> endSpeed over this time. */
  playSeconds: z.number().positive(),
  /** Opening card with the previous post's answer (0 on post 1). */
  introSeconds: z.number().min(0),
  prevAnswer: z.string(),
  askOutro: AskOutroSchema,
  startSpeed: z.number().positive(),
  endSpeed: z.number().positive(),
  palette: z.object({ bgTop: z.string(), bgBottom: z.string(), line: z.string(), body: z.string(), accent: z.string() })
});
export type Template = z.infer<typeof TemplateSchema>;

const PALETTES: Template["palette"][] = [
  { bgTop: "#0A0820", bgBottom: "#1A0F2E", line: "#FFD27A", body: "#FFF4D6", accent: "#FF9F1C" },
  { bgTop: "#04121A", bgBottom: "#0B2230", line: "#9EF0FF", body: "#FFFFFF", accent: "#FFD166" }
];

/** Post N -> one complete, deterministic video. Weekly difficulty ramp, resets every 7 posts. */
export function templateForDay(day: number): Template {
  const d = Math.max(1, Math.floor(day));
  const week = (d - 1) % 7;
  const cols = 6 + Math.floor(week / 2);
  const rows = 8;
  const prev = d > 1 ? templateAnswer({ seed: `template-${d - 1}`, count: (6 + Math.floor(((d - 2) % 7) / 2)) * rows, cols: 6 + Math.floor(((d - 2) % 7) / 2) }) : null;
  return {
    voice: [],
    sound: true,
    brand: "MY CHANNEL",
    handle: "@MyChannel",
    postNo: d,
    title: "ALAG WALA DHUNDO",
    subtitle: "Ek ki dhadkan alag hai 👀",
    cols,
    count: cols * rows,
    seed: `template-${d}`,
    playSeconds: 12,
    introSeconds: prev ? 2.6 : 0,
    prevAnswer: prev ? `ROW ${prev.row} · #${prev.col}` : "",
    askOutro: askOutro({
      question: "ALAG WALA KAHAN HAI?",
      options: [`ROW 1-${rows}`, `NUMBER 1-${cols}`],
      voiceQuestion: "आपका जवाब क्या है? रो और नंबर बताइए।",
      handle: "@MyChannel"
    }),
    startSpeed: 0.45,
    endSpeed: 1.35,
    palette: PALETTES[(d - 1) % PALETTES.length] ?? PALETTES[0]!
  };
}

export const templateDuration = (p: Template) => Math.round((p.introSeconds + p.playSeconds + askOutroSeconds(p.askOutro)) * FPS);

/** The answer, computed from the seed — the video, the voice and the comment all use this. */
export function templateAnswer(p: Pick<Template, "seed" | "count" | "cols">) {
  const index = Math.floor(random(`${p.seed}-odd`) * p.count);
  return { index, row: Math.floor(index / p.cols) + 1, col: (index % p.cols) + 1 };
}

/** Same speed-ramp maths as Chakra Puzzle: slow start, fast finish. */
export function rampedTime(p: Pick<Template, "playSeconds" | "startSpeed" | "endSpeed">, t: number) {
  const T = p.playSeconds, lo = p.startSpeed, hi = p.endSpeed, tt = Math.min(t, T);
  return lo * tt + ((hi - lo) * tt * tt) / (2 * T) + Math.max(0, t - T) * hi;
}

export function templateVoiceLines(p: Template): { file: string; text: string; at: number }[] {
  const o = p.introSeconds;
  return [
    ...(o > 0 ? [{ file: "prev.wav", at: 0.2, text: `पिछले पज़ल का जवाब: ${p.prevAnswer.replace("ROW", "रो").replace("·", ",").replace("#", "नंबर ")}।` }] : []),
    { file: "hook.wav", at: o + 0.4, text: "इनमें से एक की धड़कन अलग है। ढूँढो, कौन सा? टाइम शुरू!" },
    { file: "hurry.wav", at: o + p.playSeconds - 3.2, text: "बस तीन सेकंड!" },
    ...askOutroVoice(p.askOutro, o + p.playSeconds)
  ];
}

export const templateAnswerComment = (p: Template) => { const { row, col } = templateAnswer(p); return `✅ JAWAB: ROW ${row} · #${col}\nAapne pakda? Reply mein batao 👇`; };
