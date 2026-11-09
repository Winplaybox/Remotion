import { chakraPuzzleForDay, chakraVoiceLines, oddCellOf, type OddOrbit } from "../../odd-orbit/src/model";
import { FPS as TV_FPS, PHASE, kaaliPeeliForDay, kaaliPeeliVoiceLines, type TrackVehicle } from "../../track-vehicle/src/model";
import { buildSchedule } from "../../track-vehicle/src/schedule";

/**
 * Long-form (16:9, ~8-10 min) built from the daily Shorts engines — for watch hours.
 *  - "orbit": Chakra Puzzle IQ Marathon — 25 levels + bonus.
 *  - "track": Kaali Peeli Chase Championship — 20 rounds + bonus.
 * Format: the viewer keeps score (+1 per correct answer); the last 5 levels are answered only in the Answer Round
 * at the end; the bonus level's answer opens the NEXT episode (comments + a reason to come back).
 */
export type Game = "orbit" | "track";
export interface MarathonLevel { no: number; game: Game; puzzle: OddOrbit | TrackVehicle; difficulty: string; answer: string; levelCard: number; play: number; reveal: number; hidden: boolean }
export interface Checkpoint { after: number; seconds: number; title: string; line: string }
export interface Marathon {
  game: Game;
  episode: number;
  series: string;
  title: string;
  tagline: string;
  /** "LEVEL" / "ROUND" */
  unit: string;
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
/** Last this-many levels are answered in the Answer Round at the end. */
export const HIDDEN_COUNT = 5;
const LOCK_SECONDS = 1.6;
const off = { show: false, title: "", line: "", button: "", seconds: 0 };

// ---------- Chakra Puzzle (orbit) ----------
export const LEVEL_COUNT = 25;
export const HIDDEN_FROM = LEVEL_COUNT - HIDDEN_COUNT + 1;
const ORBIT_TIERS = [
  { upTo: 6, difficulty: "easy", cols: 7, count: 63, jitter: 0.12, strength: 0.7, play: 12 },
  { upTo: 13, difficulty: "medium", cols: 8, count: 88, jitter: 0.16, strength: 0.56, play: 13 },
  { upTo: 20, difficulty: "hard", cols: 10, count: 130, jitter: 0.2, strength: 0.46, play: 14 },
  { upTo: 25, difficulty: "expert", cols: 11, count: 154, jitter: 0.24, strength: 0.38, play: 15 }
] as const;
const ORBIT_BONUS = { difficulty: "expert", cols: 12, count: 160, jitter: 0.26, strength: 0.3, play: 15 } as const;

const orbitAnswer = (p: OddOrbit) => { const { row, col } = oddCellOf(p); return `ROW ${row} · #${col}`; };

function orbitLevel(ep: number, no: number, tier: { difficulty: OddOrbit["difficulty"]; cols: number; count: number; jitter: number; strength: number; play: number }, hidden: boolean): MarathonLevel {
  // The daily generator gives variety (element, rule, palette, glyphs); the tier sets the difficulty.
  // It recurses once per day, so keep the day number small.
  const base = chakraPuzzleForDay(10 + (((ep - 1) * 26 + no) % 180));
  const speedRule = base.oddRule === "faster" || base.oddRule === "slower";
  const puzzle: OddOrbit = {
    ...base, puzzleNo: no, difficulty: tier.difficulty, cols: tier.cols, count: tier.count,
    speedJitter: speedRule ? 0.02 : tier.jitter, oddStrength: tier.strength, seed: `marathon-${ep}-${no}`, oddIndex: -1,
    playSeconds: tier.play, revealSeconds: hidden ? 0 : 3.4, askMode: false, askOutro: undefined, introSeconds: 0, prevAnswer: "",
    voice: [], sound: false, footer: "", revealFooter: "", handle: "", endCard: off
  };
  return { no, game: "orbit", puzzle, difficulty: tier.difficulty, answer: orbitAnswer(puzzle), levelCard: 2, play: tier.play, reveal: hidden ? LOCK_SECONDS : 3.4, hidden };
}

// ---------- Kaali Peeli Chase (track) ----------
export const ROUND_COUNT = 20;
const TRACK_TIERS = [
  { upTo: 5, difficulty: "easy", cols: 3, rows: 3, shuffle: 9, level: 1.7 },
  { upTo: 10, difficulty: "medium", cols: 3, rows: 4, shuffle: 11, level: 2.1 },
  { upTo: 15, difficulty: "hard", cols: 4, rows: 4, shuffle: 13, level: 2.6 },
  { upTo: 20, difficulty: "expert", cols: 4, rows: 4, shuffle: 15, level: 3 }
] as const;
const TRACK_BONUS = { difficulty: "expert", cols: 4, rows: 4, shuffle: 17, level: 3 } as const;
const LONG_VEHICLES = ["bestbus", "truck", "ambulance", "firetruck", "schoolbus", "tanker"];
const TRACK_QUESTION = 2.4, TRACK_ANSWER = 2.6;
const trackLead = (PHASE.intro + PHASE.show + PHASE.hide) / TV_FPS;

function trackLevel(ep: number, no: number, tier: { difficulty: string; cols: number; rows: number; shuffle: number; level: number }, hidden: boolean): MarathonLevel {
  const base = kaaliPeeliForDay(1 + (((ep - 1) * 21 + no) % 140));
  const puzzle: TrackVehicle = {
    ...base, level: no, cols: tier.cols, rows: LONG_VEHICLES.includes(base.vehicle) ? Math.min(tier.rows, 3) : tier.rows,
    seed: `championship-${ep}-${no}`, targetSlot: -1, shuffleSeconds: tier.shuffle, difficulty: tier.level, speedTiers: true, targetBias: 1,
    askMode: false, askOutro: undefined, introSeconds: 0, prevAnswer: "", questionSeconds: TRACK_QUESTION, answerSeconds: hidden ? 0 : TRACK_ANSWER,
    endCard: off, sound: false, voice: [], handle: "", cta: hidden ? "JAWAB VIDEO KE END MEIN 🔒" : "NUMBER YAAD RAKHO 👇"
  };
  const play = trackLead + tier.shuffle + TRACK_QUESTION;
  return { no, game: "track", puzzle, difficulty: tier.difficulty, answer: `#${buildSchedule(puzzle).answerSlot + 1}`, levelCard: 2, play, reveal: hidden ? LOCK_SECONDS : TRACK_ANSWER, hidden };
}

// ---------- episodes ----------
export function bonusLevel(game: Game, ep: number): MarathonLevel {
  return game === "orbit" ? orbitLevel(ep, LEVEL_COUNT + 1, ORBIT_BONUS, true) : trackLevel(ep, ROUND_COUNT + 1, TRACK_BONUS, true);
}

function ranksFor(total: number) {
  return [
    { min: total - 2, title: "TOP 1% 🏆", line: "Eagle eyes! Tum genius ho" },
    { min: Math.round(total * 0.68), title: "GENIUS 🧠", line: "Bahut tez dimaag hai" },
    { min: Math.round(total * 0.4), title: "SHARP 👀", line: "Achha hai — practice se aur tez" },
    { min: 0, title: "BEGINNER 🙂", line: "Roz ek challenge — nazar tez hogi" }
  ];
}

function episode(game: Game, ep: number, levels: MarathonLevel[]): Marathon {
  const n = levels.length, orbit = game === "orbit";
  const prevBonus = ep > 1 ? bonusLevel(game, ep - 1).answer : "";
  return {
    game,
    episode: ep,
    series: orbit ? "CHAKRA PUZZLE · IQ MARATHON" : "KAALI PEELI CHASE · CHAMPIONSHIP",
    title: orbit ? `${n} PUZZLES · KITNE SOLVE KAR PAOGE?` : `${n} ROUNDS · KITNE TRACK KAR PAOGE?`,
    tagline: orbit ? `Level ${n} sirf 1% log solve karte hain 🔥 · + BONUS level` : `Round ${n} pe sabki nazar chook jaati hai 🔥 · + BONUS round`,
    unit: orbit ? "LEVEL" : "ROUND",
    hookSeconds: prevBonus ? 10 : 7,
    prevBonus,
    levels,
    checkpoints: [
      { after: Math.round(n * 0.4), seconds: 5, title: "CHECKPOINT 1", line: `${Math.round(n * 0.4)} mein se ${Math.round(n * 0.32)}+ sahi? Tum sharp ho 👀\nComment mein score likho!` },
      { after: n - HIDDEN_COUNT, seconds: 5, title: "CHECKPOINT 2", line: `Ab EXPERT ${orbit ? "levels" : "rounds"} 🔥 — inke jawab\nvideo ke END mein milenge!` }
    ],
    answerSeconds: 3 + HIDDEN_COUNT * 4,
    resultSeconds: 12,
    bonus: bonusLevel(game, ep),
    bonusAskSeconds: 6,
    handle: orbit ? "@ChakraPuzzle" : "@KaaliPeeliChase",
    ranks: ranksFor(n),
    voice: []
  };
}

/** Chakra Puzzle episode N -> 25 puzzles + bonus (different seeds from the daily Shorts). */
export function marathonForEpisode(ep: number): Marathon {
  const levels = Array.from({ length: LEVEL_COUNT }, (_, i) => orbitLevel(ep, i + 1, ORBIT_TIERS.find((t) => i + 1 <= t.upTo) ?? ORBIT_TIERS[3], i + 1 >= HIDDEN_FROM));
  return episode("orbit", ep, levels);
}

/** Kaali Peeli Chase episode N -> 20 rounds + bonus. */
export function championshipForEpisode(ep: number): Marathon {
  const levels = Array.from({ length: ROUND_COUNT }, (_, i) => trackLevel(ep, i + 1, TRACK_TIERS.find((t) => i + 1 <= t.upTo) ?? TRACK_TIERS[3], i + 1 > ROUND_COUNT - HIDDEN_COUNT));
  return episode("track", ep, levels);
}

// ---------- timeline ----------
export type SegmentKind = "hook" | "level" | "checkpoint" | "answers" | "result" | "bonus";
export interface Segment { kind: SegmentKind; from: number; frames: number; level?: MarathonLevel; checkpoint?: Checkpoint }

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
  let last = "";
  const word = m.unit.charAt(0) + m.unit.slice(1).toLowerCase();
  for (const s of marathonTimeline(m)) {
    if (s.kind === "level" && s.level && s.level.difficulty !== last) { last = s.level.difficulty; lines.push(`${ts(s.from)} ${last.toUpperCase()} — ${word} ${s.level.no}`); }
    if (s.kind === "answers") lines.push(`${ts(s.from)} Expert ${word.toLowerCase()}s ke jawab`);
    if (s.kind === "result") lines.push(`${ts(s.from)} Aapka rank`);
    if (s.kind === "bonus") lines.push(`${ts(s.from)} BONUS ${word.toLowerCase()} (jawab agle episode mein)`);
  }
  return lines.join("\n");
}

// ---------- voice ----------
const HINDI_NUM = ["", "एक", "दो", "तीन", "चार", "पाँच", "छह", "सात", "आठ", "नौ", "दस", "ग्यारह", "बारह", "तेरह", "चौदह", "पंद्रह", "सोलह", "सत्रह", "अठारह", "उन्नीस", "बीस", "इक्कीस", "बाईस", "तेईस", "चौबीस", "पच्चीस"];
const TIER_VOICE: Record<string, string> = { medium: "अब मीडियम!", hard: "अब हार्ड!", expert: "अब एक्सपर्ट! इनके जवाब एंड में मिलेंगे।" };
const sayAnswer = (l: MarathonLevel) => {
  if (l.game === "orbit") { const c = oddCellOf(l.puzzle as OddOrbit); return `रो ${c.row}, नंबर ${c.col}`; }
  return `नंबर ${l.answer.replace("#", "")}`;
};

/** Hinglish narration (Edge TTS in Actions). Times are seconds from the start of the video. */
export function marathonVoiceLines(m: Marathon): { file: string; text: string; at: number }[] {
  const out: { file: string; text: string; at: number }[] = [];
  const orbit = m.game === "orbit";
  const unitV = orbit ? "लेवल" : "राउंड";
  if (m.prevBonus) out.push({ file: "prev-bonus.wav", at: 0.3, text: `पिछले एपिसोड के बोनस का जवाब: ${sayAnswer(bonusLevel(m.game, m.episode - 1))}। सही था?` });
  out.push({ file: "hook.wav", at: m.prevBonus ? 3.6 : 0.4, text: `${HINDI_NUM[m.levels.length] ?? m.levels.length} ${orbit ? "पज़ल्स" : "राउंड्स"} और एक बोनस! पेपर पेन ले लो, हर सही जवाब का एक पॉइंट। चलो शुरू करते हैं!` });
  let lastTier = "easy";
  for (const s of marathonTimeline(m)) {
    const at = s.from / FPS;
    if ((s.kind === "level" || s.kind === "bonus") && s.level) {
      const l = s.level, bonus = s.kind === "bonus";
      const tag = (x: string) => `${bonus ? "bonus" : `l${String(l.no).padStart(2, "0")}`}-${x}.wav`;
      const tierLine = !bonus && l.difficulty !== lastTier ? ` ${TIER_VOICE[l.difficulty] ?? ""}` : "";
      if (!bonus) lastTier = l.difficulty;
      out.push({ file: tag("card"), at: at + 0.15, text: bonus ? `बोनस ${unitV}! सिर्फ एक परसेंट लोग इसे सॉल्व कर पाते हैं।` : `${unitV} ${l.no}!${tierLine}` });
      const start = at + l.levelCard;
      if (l.game === "orbit") {
        const p = l.puzzle as OddOrbit;
        const hook = chakraVoiceLines({ ...p, askMode: false, introSeconds: 0, endCard: off }).find((x) => x.file === "hook.wav");
        if (hook) out.push({ file: tag("rule"), at: start + 0.4, text: hook.text });
        out.push({ file: tag("hurry"), at: start + l.play - 3.2, text: "बस तीन सेकंड!" });
      } else {
        const p = l.puzzle as TrackVehicle;
        for (const x of kaaliPeeliVoiceLines(p, Number(l.answer.replace("#", "")))) {
          if (x.file === "reveal.wav" || x.file === "outro.wav" || x.file === "prev.wav") continue;
          out.push({ file: tag(x.file.replace(".wav", "")), at: start + x.at, text: x.text });
        }
      }
      if (bonus) out.push({ file: tag("ask"), at: start + l.play + 0.3, text: "इसका जवाब अगले एपिसोड में! कमेंट में लिखो, और सब्सक्राइब कर लो।" });
      else if (l.hidden) out.push({ file: tag("lock"), at: start + l.play + 0.2, text: "जवाब लॉक करो!" });
      else out.push({ file: tag("reveal"), at: start + l.play + 0.2, text: `जवाब: ${sayAnswer(l)}!` });
    }
    if (s.kind === "checkpoint" && s.checkpoint) {
      const last = s.checkpoint.after >= m.levels.length - HIDDEN_COUNT;
      out.push({ file: `cp${s.checkpoint.after}.wav`, at: at + 0.3, text: last ? `चेकपॉइंट! अब एक्सपर्ट ${unitV}, इनके जवाब वीडियो के एंड में!` : "चेकपॉइंट! कमेंट में अपना स्कोर लिखो, और सब्सक्राइब कर लो!" });
    }
    if (s.kind === "answers") {
      out.push({ file: "answers.wav", at: at + 0.3, text: `अब एक्सपर्ट ${unitV} के जवाब!` });
      m.levels.filter((l) => l.hidden).forEach((l, i) => out.push({ file: `ans${l.no}.wav`, at: at + answerAt(i) + 0.3, text: `${unitV} ${l.no}: ${sayAnswer(l)}` }));
    }
    if (s.kind === "result") out.push({ file: "result.wav", at: at + 0.4, text: `अब अपना स्कोर गिनो! ${HINDI_NUM[m.ranks[0]!.min] ?? m.ranks[0]!.min} से ऊपर, तो आप टॉप वन परसेंट हो! कमेंट में अपना स्कोर लिखो।` });
  }
  return out;
}
