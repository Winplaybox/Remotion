import { chakraPuzzleForDay, chakraVoiceLines, oddCellOf, type OddOrbit } from "../../odd-orbit/src/model";

/**
 * Long-form "IQ Puzzle Marathon" (16:9, ~9-10 min) built from Chakra Puzzle levels.
 * Watch-hour format:
 *  - 25 levels, Easy -> Expert, the viewer keeps score (+1 per correct answer).
 *  - Levels 1-20: answer right after the level. Expert levels 21-25: answers only in the Answer Round at the end.
 *  - Bonus level after the result: its answer opens the NEXT episode (comments + a reason to come back).
 */
export interface MarathonLevel { no: number; puzzle: OddOrbit; levelCard: number; play: number; reveal: number; hidden: boolean }
export interface Checkpoint { after: number; seconds: number; title: string; line: string }
export interface Marathon {
  episode: number;
  title: string;
  hookSeconds: number;
  /** Previous episode's bonus answer, shown + spoken at the start ("" for episode 1). */
  prevBonus: string;
  levels: MarathonLevel[];
  checkpoints: Checkpoint[];
  answerSeconds: number;
  resultSeconds: number;
  bonus: MarathonLevel;
  bonusAskSeconds: number;
  handle: string;
  ranks: { min: number; title: string; line: string }[];
  voice: { src: string; at: number }[];
}

export const FPS = 30;
export const LEVEL_COUNT = 25;
/** Levels from here on are answered in the Answer Round at the end. */
export const HIDDEN_FROM = 21;
const LOCK_SECONDS = 1.6;

const TIERS = [
  { upTo: 6, difficulty: "easy", cols: 7, count: 63, jitter: 0.12, strength: 0.7, play: 12 },
  { upTo: 13, difficulty: "medium", cols: 8, count: 88, jitter: 0.16, strength: 0.56, play: 13 },
  { upTo: 20, difficulty: "hard", cols: 10, count: 130, jitter: 0.2, strength: 0.46, play: 14 },
  { upTo: 25, difficulty: "expert", cols: 11, count: 154, jitter: 0.24, strength: 0.38, play: 15 }
] as const;
const BONUS_TIER = { difficulty: "expert", cols: 12, count: 160, jitter: 0.26, strength: 0.3, play: 15 } as const;

function level(ep: number, no: number, tier: { difficulty: OddOrbit["difficulty"]; cols: number; count: number; jitter: number; strength: number; play: number }, hidden: boolean): MarathonLevel {
  // The daily generator gives variety (element, rule, palette, glyphs); the tier sets the difficulty.
  // It recurses once per day, so keep the day number small.
  const base = chakraPuzzleForDay(10 + (((ep - 1) * 26 + no) % 180));
  const speedRule = base.oddRule === "faster" || base.oddRule === "slower";
  const puzzle: OddOrbit = {
    ...base,
    puzzleNo: no,
    difficulty: tier.difficulty,
    cols: tier.cols,
    count: tier.count,
    speedJitter: speedRule ? 0.02 : tier.jitter,
    oddStrength: tier.strength,
    seed: `marathon-${ep}-${no}`,
    oddIndex: -1,
    playSeconds: tier.play,
    revealSeconds: hidden ? 0 : 3.4,
    askMode: false,
    askOutro: undefined,
    introSeconds: 0,
    prevAnswer: "",
    voice: [],
    sound: false,
    footer: "",
    revealFooter: "",
    handle: "",
    endCard: { show: false, title: "", line: "", button: "", seconds: 0 }
  };
  return { no, puzzle, levelCard: 2, play: tier.play, reveal: hidden ? LOCK_SECONDS : 3.4, hidden };
}

export const bonusLevel = (ep: number) => level(ep, LEVEL_COUNT + 1, BONUS_TIER, true);
export const answerText = (p: OddOrbit) => { const { row, col } = oddCellOf(p); return `ROW ${row} · #${col}`; };

/** Episode N -> 25 deterministic puzzles + a bonus (different seeds from the daily Shorts). */
export function marathonForEpisode(ep: number): Marathon {
  const levels = Array.from({ length: LEVEL_COUNT }, (_, i) => {
    const no = i + 1;
    return level(ep, no, TIERS.find((t) => no <= t.upTo) ?? TIERS[TIERS.length - 1]!, no >= HIDDEN_FROM);
  });
  const prevBonus = ep > 1 ? answerText(bonusLevel(ep - 1).puzzle) : "";
  const m: Marathon = {
    episode: ep,
    title: "25 PUZZLES · KITNE SOLVE KAR PAOGE?",
    hookSeconds: prevBonus ? 10 : 7,
    prevBonus,
    levels,
    checkpoints: [
      { after: 10, seconds: 5, title: "CHECKPOINT 1", line: "10 mein se 8+ sahi? Tum sharp ho 👀\nComment mein score likho!" },
      { after: 20, seconds: 5, title: "CHECKPOINT 2", line: "Ab EXPERT levels 🔥 — inke jawab\nvideo ke END mein milenge!" }
    ],
    answerSeconds: 3 + (LEVEL_COUNT - HIDDEN_FROM + 1) * 4,
    resultSeconds: 12,
    bonus: bonusLevel(ep),
    bonusAskSeconds: 6,
    handle: "@ChakraPuzzle",
    ranks: [
      { min: 23, title: "TOP 1% 🏆", line: "Eagle eyes! Tum genius ho" },
      { min: 17, title: "GENIUS 🧠", line: "Bahut tez dimaag hai" },
      { min: 10, title: "SHARP 👀", line: "Achha hai — practice se aur tez" },
      { min: 0, title: "BEGINNER 🙂", line: "Roz ek puzzle — dimaag tez hoga" }
    ],
    voice: []
  };
  return m;
}

export type SegmentKind = "hook" | "level" | "checkpoint" | "answers" | "result" | "bonus";
export interface Segment { kind: SegmentKind; from: number; frames: number; level?: MarathonLevel; checkpoint?: Checkpoint }

/** Timeline in frames. */
export function marathonTimeline(m: Marathon): Segment[] {
  const out: Segment[] = [];
  let f = 0;
  const push = (s: Omit<Segment, "from">) => { out.push({ ...s, from: f }); f += s.frames; };
  const sec = (s: number) => Math.round(s * FPS);
  push({ kind: "hook", frames: sec(m.hookSeconds) });
  for (const l of m.levels) {
    push({ kind: "level", frames: sec(l.levelCard + l.play + l.reveal), level: l });
    const cp = m.checkpoints.find((c) => c.after === l.no);
    if (cp) push({ kind: "checkpoint", frames: sec(cp.seconds), checkpoint: cp });
  }
  push({ kind: "answers", frames: sec(m.answerSeconds) });
  push({ kind: "result", frames: sec(m.resultSeconds) });
  push({ kind: "bonus", frames: sec(m.bonus.levelCard + m.bonus.play + m.bonusAskSeconds), level: m.bonus });
  return out;
}

export const marathonDuration = (m: Marathon) => marathonTimeline(m).reduce((a, s) => a + s.frames, 0);

/** Answer Round layout: seconds from the segment start at which hidden level i (0-based) is shown. */
export const answerAt = (i: number) => 3 + i * 4;

/** YouTube chapters for the description. */
export function marathonChapters(m: Marathon): string {
  const ts = (fr: number) => { const s = Math.floor(fr / FPS); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
  const lines = ["0:00 Start"];
  for (const s of marathonTimeline(m)) {
    if (s.kind === "level" && s.level && (s.level.no === 1 || s.level.no === 7 || s.level.no === 14 || s.level.no === 21)) lines.push(`${ts(s.from)} ${s.level.puzzle.difficulty.toUpperCase()} — Level ${s.level.no}`);
    if (s.kind === "answers") lines.push(`${ts(s.from)} Expert levels ke jawab`);
    if (s.kind === "result") lines.push(`${ts(s.from)} Aapka rank`);
    if (s.kind === "bonus") lines.push(`${ts(s.from)} BONUS level (jawab agle episode mein)`);
  }
  return lines.join("\n");
}

const TIER_VOICE: Record<string, string> = { medium: "अब मीडियम!", hard: "अब हार्ड!", expert: "अब एक्सपर्ट! इनके जवाब एंड में मिलेंगे।" };
const say = (n: { row: number; col: number }) => `रो ${n.row}, नंबर ${n.col}`;

/** Hinglish narration (Edge TTS in Actions). Times are seconds from the start of the video. */
export function marathonVoiceLines(m: Marathon): { file: string; text: string; at: number }[] {
  const out: { file: string; text: string; at: number }[] = [];
  const tl = marathonTimeline(m);
  if (m.prevBonus) {
    const prev = oddCellOf(bonusLevel(m.episode - 1).puzzle);
    out.push({ file: "prev-bonus.wav", at: 0.3, text: `पिछले एपिसोड के बोनस का जवाब: ${say(prev)}। सही था?` });
  }
  out.push({ file: "hook.wav", at: m.prevBonus ? 3.6 : 0.4, text: "पच्चीस पज़ल्स और एक बोनस! पेपर पेन ले लो, हर सही जवाब का एक पॉइंट। चलो शुरू करते हैं!" });
  let lastTier = "easy";
  for (const s of tl) {
    const at = s.from / FPS;
    const tag = (x: string) => `${s.kind === "bonus" ? "bonus" : `l${String(s.level?.no ?? 0).padStart(2, "0")}`}-${x}.wav`;
    if ((s.kind === "level" || s.kind === "bonus") && s.level) {
      const l = s.level, p = l.puzzle;
      const tierLine = s.kind === "level" && p.difficulty !== lastTier ? ` ${TIER_VOICE[p.difficulty] ?? ""}` : "";
      lastTier = p.difficulty;
      out.push({ file: tag("card"), at: at + 0.15, text: s.kind === "bonus" ? "बोनस लेवल! सिर्फ एक परसेंट लोग इसे सॉल्व कर पाते हैं।" : `लेवल ${l.no}!${tierLine}` });
      const daily = chakraVoiceLines({ ...p, askMode: false, introSeconds: 0, endCard: { ...p.endCard, show: false } });
      const start = at + l.levelCard;
      const hook = daily.find((x) => x.file === "hook.wav");
      if (hook) out.push({ file: tag("rule"), at: start + 0.4, text: hook.text });
      out.push({ file: tag("hurry"), at: start + l.play - 3.2, text: "बस तीन सेकंड!" });
      if (s.kind === "bonus") out.push({ file: tag("ask"), at: start + l.play + 0.3, text: "इसका जवाब अगले एपिसोड में! कमेंट में लिखो, और सब्सक्राइब कर लो।" });
      else if (l.hidden) out.push({ file: tag("lock"), at: start + l.play + 0.2, text: "जवाब लॉक करो!" });
      else out.push({ file: tag("reveal"), at: start + l.play + 0.2, text: `जवाब: ${say(oddCellOf(p))}!` });
    }
    if (s.kind === "checkpoint" && s.checkpoint) out.push({ file: `cp${s.checkpoint.after}.wav`, at: at + 0.3, text: s.checkpoint.after >= 20 ? "चेकपॉइंट! अब एक्सपर्ट लेवल्स, इनके जवाब वीडियो के एंड में!" : "चेकपॉइंट! कमेंट में अपना स्कोर लिखो, और सब्सक्राइब कर लो!" });
    if (s.kind === "answers") {
      out.push({ file: "answers.wav", at: at + 0.3, text: "अब एक्सपर्ट लेवल्स के जवाब!" });
      m.levels.filter((l) => l.hidden).forEach((l, i) => out.push({ file: `ans${l.no}.wav`, at: at + answerAt(i) + 0.3, text: `लेवल ${l.no}: ${say(oddCellOf(l.puzzle))}` }));
    }
    if (s.kind === "result") out.push({ file: "result.wav", at: at + 0.4, text: "अब अपना स्कोर गिनो! तेईस से ऊपर, तो आप टॉप वन परसेंट हो! कमेंट में अपना स्कोर लिखो।" });
  }
  return out;
}
