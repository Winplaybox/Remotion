/**
 * JHOOTH KAUN? (liar-lineup) — crime scene → 3 clues → 3 suspects give alibis in a spotlight →
 * "Kaun jhooth bol raha hai? [1][2][3]". Answer comes in the next video (shared AskOutro).
 *
 * Contract (docs/NEW_ENGINE.md): schema · liarLineupForDay(n) · duration · answer · voice lines.
 * Every case is generated from engines/liar-lineup/src/content.ts: one RULE (clue) makes exactly one alibi impossible.
 * The timeline (`liarBeats`) is derived from the voice text lengths so the video, voice and captions never drift apart.
 */
import { genderOf } from "../../../packages/visuals/src/rig/cast";
import { random } from "remotion";
import { z } from "zod";
import { AskOutroSchema, askOutro, askOutroSeconds, askOutroVoice } from "../../ask-outro";
import { FLAVOR, HONEST, ITEMS, NAMES, RULES, SETS, fill, type Bi, type SetKey } from "./content";

export const FPS = 30;
export const HANDLE = "@JasoosBhaiCases";

const BiSchema = z.object({ r: z.string(), d: z.string() });
const SuspectSchema = z.object({
  preset: z.string(),
  gender: z.enum(["m", "f"]),
  name: BiSchema,
  role: BiSchema,
  alibi: BiSchema
});

export const LiarLineupSchema = z.object({
  voice: z.array(z.object({ src: z.string(), at: z.number().min(0) })).default([]),
  sound: z.boolean().default(true),
  brand: z.string(),
  handle: z.string(),
  postNo: z.number().int().min(1),
  set: z.enum(["haveli", "village", "flat"]),
  victim: BiSchema,
  place: BiSchema,
  item: BiSchema,
  title: z.string(),
  time: BiSchema,
  ruleId: z.string(),
  clues: z.array(BiSchema.extend({ key: z.boolean() })).length(3),
  suspects: z.array(SuspectSchema).length(3),
  /** index (0..2) of the suspect whose alibi breaks the key clue */
  liar: z.number().int().min(0).max(2),
  why: BiSchema,
  /** Opening card with the previous case's answer (0 on post 1). */
  introSeconds: z.number().min(0),
  prevAnswer: z.string(),
  prevVoice: z.string(),
  /** Seconds the viewer gets to think (ticking countdown) before the question. */
  thinkSeconds: z.number().min(2),
  askOutro: AskOutroSchema,
  accent: z.string(),
  /** Measured voice clip lengths (file -> seconds), filled at render time by withSpokenDurations; beats stretch to fit. */
  spoken: z.record(z.string(), z.number()).default({})
});
export type LiarLineup = z.infer<typeof LiarLineupSchema>;
export type Suspect = LiarLineup["suspects"][number];

const ACCENTS = ["#FFD23F", "#FF8A3D", "#4FD1C5", "#FF5D8F", "#9B8CFF"];
const NUM_DEV = ["एक", "दो", "तीन"];

const pick = <T,>(arr: readonly T[], seed: string): T => arr[Math.floor(random(seed) * arr.length) % arr.length]!;
function shuffle<T>(arr: readonly T[], seed: string): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random(`${seed}-${i}`) * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Core case without the "previous answer" intro (so forDay(n) can look at n-1 without recursion). */
export function liarCase(day: number) {
  const d = Math.max(1, Math.floor(day));
  const seed = `liar-${d}`;
  // rules rotate in shuffled blocks: every block of RULES.length posts uses each rule once
  const block = Math.floor((d - 1) / RULES.length);
  const rule = shuffle(RULES, `rules-${block}`)[(d - 1) % RULES.length]!;
  const set: SetKey = pick(rule.sets, `${seed}-set`);
  const info = SETS[set];
  const roles = shuffle(info.roles, `${seed}-roles`).slice(0, 3);
  const used = new Set<string>();
  const liar = Math.floor(random(`${seed}-liar`) * 3) % 3;
  const honestPool = shuffle(
    HONEST.filter((h) => !h.breaks.includes(rule.id) && (h.when === "any" || h.when === rule.when)),
    `${seed}-honest`
  );
  let hi = 0;
  const suspects: Suspect[] = roles.map((role, i) => {
    const preset = role.preset;
    const gender = genderOf(preset);
    const names = shuffle(NAMES[gender], `${seed}-names-${i}`);
    const name = names.find((n) => !used.has(n.r)) ?? names[0]!;
    used.add(name.r);
    const raw: Bi = i === liar ? pick(rule.liars, `${seed}-lie`) : honestPool[hi++]!;
    return { preset, gender, name, role: role.role, alibi: fill(raw, gender, info.victim) };
  });
  const flavor = shuffle(FLAVOR, `${seed}-flavor`).slice(0, 2);
  const keyAt = Math.floor(random(`${seed}-keyAt`) * 3) % 3;
  const clues = [...flavor];
  clues.splice(keyAt, 0, fill(rule.clue, "m", info.victim));
  const item = pick(ITEMS, `${seed}-item`);
  return {
    set, rule, info, item, suspects, liar,
    clues: clues.map((c, i) => ({ ...c, key: i === keyAt })),
    time: rule.time
  };
}

export function liarLineupForDay(day: number): LiarLineup {
  const d = Math.max(1, Math.floor(day));
  const c = liarCase(d);
  const prev = d > 1 ? liarCase(d - 1) : null;
  const pl = prev ? prev.suspects[prev.liar]! : null;
  const prevVoice = prev && pl ? `पिछले केस का जवाब: नंबर ${NUM_DEV[prev.liar]}, ${pl.name.d}! ${prev.rule.why.d}` : "";
  return {
    voice: [],
    sound: true,
    brand: "JASOOS BHAI",
    handle: HANDLE,
    postNo: d,
    set: c.set,
    victim: c.info.victim,
    place: c.info.place,
    item: { r: c.item.r, d: c.item.d },
    title: c.item.title,
    time: c.time,
    ruleId: c.rule.id,
    clues: c.clues,
    suspects: c.suspects,
    liar: c.liar,
    why: c.rule.why,
    introSeconds: prevVoice ? Math.round(Math.max(3.4, speakSeconds(prevVoice) + 0.3) * 10) / 10 : 0,
    prevAnswer: prev && pl ? `#${prev.liar + 1} ${pl.name.r.toUpperCase()}` : "",
    prevVoice,
    thinkSeconds: 4,
    askOutro: askOutro({
      question: "KAUN JHOOTH BOL RAHA HAI?",
      options: c.suspects.map((s, i) => `#${i + 1} ${s.name.r.toUpperCase()}`),
      voiceQuestion: "कौन झूठ बोल रहा है? एक, दो या तीन?",
      handle: HANDLE,
      questionSeconds: 4.6,
      ctaSeconds: 5.8
    }),
    accent: ACCENTS[(d - 1) % ACCENTS.length]!,
    spoken: {}
  };
}

// ---------- timeline ----------
export type BeatKind = "prev" | "hook" | "clue" | "lineup" | "alibi" | "think";
export interface Beat { kind: BeatKind; start: number; dur: number; file: string; d: string; r: string; index: number }

/** Seconds a Devanagari line needs (Edge TTS hi-IN ≈ 13 chars/s) plus breathing room. */
export const speakSeconds = (dev: string) => Math.max(1.6, dev.length / 14 + 0.45);

export function liarBeats(p: LiarLineup): Beat[] {
  const beats: Beat[] = [];
  let t = 0;
  const add = (kind: BeatKind, file: string, d: string, r: string, index = 0, min = 0, gap = 0.15) => {
    const real = p.spoken[file];
    const dur = Math.max(min, real !== undefined ? real + 0.35 : speakSeconds(d));
    beats.push({ kind, start: t, dur, file, d, r, index });
    t += dur + gap;
  };
  if (p.introSeconds > 0) {
    const real = p.spoken["prev.wav"];
    const intro = Math.max(p.introSeconds, real !== undefined ? real + 0.5 : 0);
    beats.push({ kind: "prev", start: 0, dur: intro, file: "prev.wav", d: p.prevVoice, r: p.prevAnswer, index: 0 });
    t = intro;
  }
  add("hook", "hook.wav", `केस नंबर ${p.postNo}! ${p.victim.d} का ${p.item.d} गायब। चोरी ${p.time.d}।`,
    `${p.victim.r} ka ${p.item.r.toLowerCase()} gaayab! Chori ${p.time.r}.`, 0, 3.6);
  p.clues.forEach((c, i) => add("clue", `clue${i + 1}.wav`, c.d, c.r, i, 2.6));
  add("lineup", "lineup.wav", "घर में तीन लोग थे। सुनो बयान!", "Ghar mein 3 log the. Suno bayaan!", 0, 2.2);
  p.suspects.forEach((s, i) =>
    add("alibi", `alibi${i + 1}.wav`, `${s.name.d}: ${s.alibi.d.replace("उस वक़्त ", "")}`, s.alibi.r, i, 3, 0.3)
  );
  add("think", "think.wav", "एक झूठ बोल रहा है। पकड़ो!", "EK jhooth bol raha hai. Pakdo!", 0, p.thinkSeconds, 0);
  return beats;
}

export const outroStart = (p: LiarLineup) => {
  const b = liarBeats(p);
  const last = b[b.length - 1]!;
  return last.start + last.dur;
};

/** Seconds the "previous answer" card stays up (stretched to the measured prev.wav). */
export const introLength = (p: LiarLineup) => (p.introSeconds > 0 ? liarBeats(p)[0]!.dur : 0);

export const liarLineupDuration = (p: LiarLineup) => Math.round((outroStart(p) + askOutroSeconds(p.askOutro)) * FPS);

/** The answer — video, voice and comment all read this. */
export const liarAnswer = (p: Pick<LiarLineup, "liar" | "suspects">) => {
  const s = p.suspects[p.liar]!;
  return { index: p.liar, label: `#${p.liar + 1} ${s.name.r.toUpperCase()}`, suspect: s };
};

export function liarLineupVoiceLines(p: LiarLineup): { file: string; text: string; at: number }[] {
  return [
    ...liarBeats(p).map((b) => ({ file: b.file, at: b.start + (b.kind === "prev" ? 0.2 : 0.15), text: b.d })),
    ...askOutroVoice(p.askOutro, outroStart(p))
  ];
}

export const liarLineupAnswerComment = (p: LiarLineup) => {
  const a = liarAnswer(p);
  const key = p.clues.find((c) => c.key)!;
  return `✅ JAWAB: ${a.label} (${a.suspect.role.r}) 🤥\nSuraag: "${key.r}"\nPar ${a.suspect.name.r} ne kaha: "${a.suspect.alibi.r}" — ${p.why.r}\nAapne pakda? Reply mein batao 👇`;
};
