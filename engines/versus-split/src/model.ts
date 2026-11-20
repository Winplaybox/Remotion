import { z } from "zod";
import {
  AskOutroSchema,
  askOutro,
  askOutroSeconds,
  askOutroVoice
} from "../../ask-outro";
import type { VoiceLine } from "../../../channels/channels";

export const FPS = 30;

export const FighterSchema = z.object({
  name: z.string(),
  title: z.string(),
  franchise: z.string(), // "DBZ", "ONE PUNCH MAN", "POKEMON", "WWE", "NARUTO"
  color: z.string(),
  signatureMove: z.string(),
  signaturePower: z.number().min(50).max(100),
  speedStat: z.number().min(50).max(100),
  durabilityStat: z.number().min(50).max(100)
});

export const BattleRoundSchema = z.object({
  roundNo: z.number().int().min(1).max(3),
  name: z.string(), // "SIGNATURE ATTACK", "SPEED & AGILITY", "DURABILITY & POWER"
  statA: numberOrString(),
  statB: numberOrString(),
  win: z.enum(["a", "b", "tie"])
});

function numberOrString() {
  return z.union([z.number(), z.string()]);
}

export const VersusSplitSchema = z.object({
  voice: z.array(z.object({ src: z.string(), at: z.number().min(0) })).default([]),
  sound: z.boolean().default(true),
  brand: z.string(),
  handle: z.string(),
  postNo: z.number().int().min(1),
  fighterA: FighterSchema,
  fighterB: FighterSchema,
  rounds: z.array(BattleRoundSchema).length(3),
  winner: z.enum(["a", "b"]),
  climaxSeconds: z.number().positive(),
  playSeconds: z.number().positive(),
  introSeconds: z.number().min(0),
  prevAnswer: z.string(),
  askOutro: AskOutroSchema,
  verdictReason: z.string()
});
export type VersusSplit = z.infer<typeof VersusSplitSchema>;

export interface BattlePreset {
  a: z.infer<typeof FighterSchema>;
  b: z.infer<typeof FighterSchema>;
  r1Name: string;
  r1A: string | number;
  r1B: string | number;
  r1Win: "a" | "b" | "tie";
  r2Name: string;
  r2A: string | number;
  r2B: string | number;
  r2Win: "a" | "b" | "tie";
  r3Name: string;
  r3A: string | number;
  r3B: string | number;
  r3Win: "a" | "b" | "tie";
  winner: "a" | "b";
  voiceHook: string;
  verdictHi: string;
  verdictReason: string;
}

import { MASTER_ROSTER } from "./roster";
export const BATTLES: BattlePreset[] = MASTER_ROSTER;

export function versusSplitForDay(day: number): VersusSplit {
  const d = Math.max(1, Math.floor(day));
  const b = BATTLES[(d - 1) % BATTLES.length]!;

  const outro = askOutro({
    question: `Aapka Winner Kaun Hai? ${b.a.name} ya ${b.b.name}?`,
    options: [`1. ${b.a.name} 🔥`, `2. ${b.b.name} ⚡`, `3. TIE THA 🤝`],
    voiceQuestion: `आपके हिसाब से असली विनर कौन है? ${b.a.name} या ${b.b.name}?`,
    handle: "@VersusSplitClash"
  });

  const introSeconds = d === 1 ? 0 : 2.6;
  const playSeconds = 17.0;
  const climaxSeconds = 4.0;
  const prevAnswer = d === 1 ? "" : `Pichhla winner: ${BATTLES[(d - 2) % BATTLES.length]!.winner === "a" ? BATTLES[(d - 2) % BATTLES.length]!.a.name : BATTLES[(d - 2) % BATTLES.length]!.b.name} ne baazi maari thi.`;

  return {
    voice: [],
    sound: true,
    brand: "VERSUS SPLIT",
    handle: "@VersusSplitClash",
    postNo: d,
    fighterA: b.a,
    fighterB: b.b,
    rounds: [
      { roundNo: 1, name: b.r1Name, statA: b.r1A, statB: b.r1B, win: b.r1Win },
      { roundNo: 2, name: b.r2Name, statA: b.r2A, statB: b.r2B, win: b.r2Win },
      { roundNo: 3, name: b.r3Name, statA: b.r3A, statB: b.r3B, win: b.r3Win }
    ],
    winner: b.winner,
    climaxSeconds,
    playSeconds,
    introSeconds,
    prevAnswer,
    askOutro: outro,
    verdictReason: b.verdictReason
  };
}

export function versusSplitDuration(p: VersusSplit): number {
  return Math.round((p.introSeconds + p.playSeconds + askOutroSeconds(p.askOutro)) * FPS);
}

export function versusSplitVoiceLines(p: VersusSplit): VoiceLine[] {
  const lines: VoiceLine[] = [];
  const b = BATTLES[(p.postNo - 1) % BATTLES.length]!;
  let t = 0;

  if (p.introSeconds > 0) {
    lines.push({ file: "prev.wav", text: "पिछले मैच का नतीजा आपकी स्क्रीन पर।", at: 0 });
    t += p.introSeconds;
  }

  // Hook line
  lines.push({ file: `hook_${p.postNo}.wav`, text: b.voiceHook, at: +t.toFixed(2) });
  t += 6.5;

  // Verdict line
  lines.push({ file: `verdict_${p.postNo}.wav`, text: b.verdictHi, at: +t.toFixed(2) });
  t += 6.5;

  // Ask outro lines
  const outroLines = askOutroVoice(p.askOutro, p.introSeconds + p.playSeconds);
  lines.push(...outroLines);

  return lines;
}

export function versusSplitAnswerComment(p: VersusSplit): string {
  const b = BATTLES[(p.postNo - 1) % BATTLES.length]!;
  const winFighter = b.winner === "a" ? b.a.name : b.b.name;
  return `👑 OFFICIAL VERDICT #${p.postNo}: Crown lands on ${winFighter}! ${b.verdictReason} Aap kiske fan ho? Subscribe karein @VersusSplitClash!`;
}
