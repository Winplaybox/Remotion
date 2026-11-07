/**
 * ENGINE TEMPLATE — copy with `node scripts/new-engine.mjs <name> <PascalName>` and replace the puzzle logic.
 * Read docs/NEW_ENGINE.md first. Every engine has exactly these parts:
 *   1. Schema (zod)         -> everything the video needs, nothing random outside `seed`
 *   2. <x>ForDay(n)         -> post number -> complete props (deterministic, never repeats)
 *   3. <x>Duration(p)       -> frames
 *   4. <x>VoiceLines(p)     -> Hinglish lines (Devanagari) + when they play
 *   5. <x>Answer(p)         -> text for the answer comment (puzzles)
 */
import { random } from "remotion";
import { z } from "zod";

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
  revealSeconds: z.number().min(0),
  startSpeed: z.number().positive(),
  endSpeed: z.number().positive(),
  endCard: z.object({ show: z.boolean(), title: z.string(), line: z.string(), button: z.string(), seconds: z.number().min(0) }),
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
  return {
    voice: [],
    sound: true,
    brand: "MY CHANNEL",
    handle: "@MyChannel",
    postNo: d,
    title: "ALAG WALA DHUNDO",
    subtitle: "Ek ki dhadkan alag hai 👀",
    cols: 6 + Math.floor(week / 2),
    count: (6 + Math.floor(week / 2)) * 8,
    seed: `template-${d}`,
    playSeconds: 12,
    revealSeconds: 2.6,
    startSpeed: 0.45,
    endSpeed: 1.35,
    endCard: { show: true, title: "MY CHANNEL", line: "Main ek solo dev hoon — ek cozy game bana raha hoon 🎮", button: "FOLLOW KARO, SABSE PEHLE KHELO", seconds: 5 },
    palette: PALETTES[(d - 1) % PALETTES.length] ?? PALETTES[0]!
  };
}

export const templateDuration = (p: Template) => Math.round((p.playSeconds + p.revealSeconds + (p.endCard.show ? p.endCard.seconds : 0)) * FPS);

/** The answer, computed from the seed — the video, the voice and the comment all use this. */
export function templateAnswer(p: Template) {
  const index = Math.floor(random(`${p.seed}-odd`) * p.count);
  return { index, row: Math.floor(index / p.cols) + 1, col: (index % p.cols) + 1 };
}

/** Same speed-ramp maths as Chakra Puzzle: slow start, fast finish. */
export function rampedTime(p: Pick<Template, "playSeconds" | "startSpeed" | "endSpeed">, t: number) {
  const T = p.playSeconds, lo = p.startSpeed, hi = p.endSpeed, tt = Math.min(t, T);
  return lo * tt + ((hi - lo) * tt * tt) / (2 * T) + Math.max(0, t - T) * hi;
}

export function templateVoiceLines(p: Template): { file: string; text: string; at: number }[] {
  const { row, col } = templateAnswer(p);
  return [
    { file: "hook.wav", at: 0.4, text: "इनमें से एक की धड़कन अलग है। ढूँढो, कौन सा? टाइम शुरू!" },
    { file: "hurry.wav", at: p.playSeconds - 3.2, text: "बस तीन सेकंड! कमेंट में लिखो।" },
    { file: "reveal.wav", at: p.playSeconds + 0.2, text: `जवाब: रो ${row}, नंबर ${col}!` },
    { file: "outro.wav", at: p.playSeconds + p.revealSeconds + 0.2, text: "मैं एक सोलो डेवलपर हूँ। फॉलो करो, सबसे पहले खेलो!" }
  ];
}

export const templateAnswerComment = (p: Template) => { const { row, col } = templateAnswer(p); return `✅ JAWAB: ROW ${row} · #${col}\nAapne pakda? Reply mein batao 👇`; };
