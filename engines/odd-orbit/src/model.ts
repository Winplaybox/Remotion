import { random } from "remotion";
import { z } from "zod";

/** Every orbit element the engine can draw. Add a new renderer in elements.tsx and list it here. */
export const ORBIT_ELEMENTS = ["chakra", "diya", "ring", "planet", "atom", "binary", "comet", "clock", "spinner", "gear", "glyph"] as const;
/** Elements that have a "slightly different shape" variant for the `shape` rule. */
export const SHAPE_ELEMENTS = ["chakra", "gear", "clock", "ring", "diya", "glyph"] as const;
/** How the odd one differs from the rest. */
export const ODD_RULES = ["reverse", "faster", "slower", "tint", "shape"] as const;
export const DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;

export const OddOrbitSchema = z.object({
  /** Narration clips (seconds from start). Filled by scripts/post.ts --auto-narrate. */
  voice: z.array(z.object({ src: z.string(), at: z.number().min(0) })).default([]),
  brand: z.string(),
  handle: z.string(),
  puzzleNo: z.number().int().min(1),
  difficulty: z.enum(DIFFICULTIES),
  title: z.string().min(1),
  subtitle: z.string(),
  footer: z.string(),
  revealFooter: z.string(),
  answerPrefix: z.string(),
  element: z.enum(ORBIT_ELEMENTS),
  /** For element "glyph": [normal, odd] characters, e.g. ["9", "6"]. */
  glyphs: z.tuple([z.string(), z.string()]).default(["9", "6"]),
  oddRule: z.enum(ODD_RULES),
  cols: z.number().int().min(3).max(12),
  count: z.number().int().min(6).max(160),
  /** Grid index of the odd element. -1 = the seed picks it. */
  oddIndex: z.number().int().min(-1),
  seed: z.string().min(1),
  satellites: z.number().int().min(1).max(4),
  /** Revolutions per second for a normal element. */
  speed: z.number().positive(),
  /** 0..0.5 random per-cell speed spread. Keep low for speed rules. */
  speedJitter: z.number().min(0).max(0.5),
  playSeconds: z.number().positive(),
  revealSeconds: z.number().min(0),
  /** Speed ramp: everything starts slow (startSpeed x) and ends fast (endSpeed x) by the end of play. */
  startSpeed: z.number().positive().default(1),
  endSpeed: z.number().positive().default(1),
  endCard: z.object({ show: z.boolean(), title: z.string(), line: z.string(), button: z.string(), seconds: z.number().min(0) }).default({ show: false, title: "", line: "", button: "", seconds: 0 }),
  showTimer: z.boolean(),
  palette: z.object({
    bgTop: z.string(),
    bgBottom: z.string(),
    glow: z.string(),
    line: z.string(),
    body: z.string(),
    accent: z.string(),
    oddTint: z.string()
  })
});

export type OddOrbit = z.infer<typeof OddOrbitSchema>;

/** Channel identity: Chakra Puzzle. Change names/colours here only. */
export const CHAKRA_BRAND = { brand: "CHAKRA PUZZLE", handle: "@ChakraPuzzle" } as const;

export const RULE_COPY: Record<OddOrbit["oddRule"], { title: string; subtitle: string }> = {
  reverse: { title: "ULTA GHOOMNE WALA DHUNDO", subtitle: "Sirf EK ulta ghoom raha hai 👀" },
  faster: { title: "SABSE TEZ WALA DHUNDO", subtitle: "Ek baaki sab se tez bhaag raha hai ⚡" },
  slower: { title: "SABSE DHEEMA WALA DHUNDO", subtitle: "Ek thoda aalsi hai 🐢" },
  tint: { title: "ALAG RANG WALA DHUNDO", subtitle: "Dhyaan se dekho, farak chhota hai 🔍" },
  shape: { title: "JO ALAG HAI USE DHUNDO", subtitle: "Ek ka design thoda alag hai 🔍" }
};

/** Letter / number pairs for "glyph" puzzles: everyone sees [0], one cell shows [1]. */
export const GLYPH_PAIRS: [string, string][] = [["9", "6"], ["O", "Q"], ["E", "F"], ["8", "B"], ["M", "N"], ["C", "G"], ["P", "R"], ["5", "S"], ["W", "V"], ["1", "7"]];
const GLYPH_VOICE: Record<string, string> = { "9": "नौ", "6": "छह", O: "ओ", Q: "क्यू", E: "ई", F: "एफ", "8": "आठ", B: "बी", M: "एम", N: "एन", C: "सी", G: "जी", P: "पी", R: "आर", "5": "पाँच", S: "एस", W: "डब्ल्यू", V: "वी", "1": "एक", "7": "सात" };

const PALETTES: OddOrbit["palette"][] = [
  { bgTop: "#0A0820", bgBottom: "#1A0F2E", glow: "#5B2C83", line: "#FFD27A", body: "#FFF4D6", accent: "#FF9F1C", oddTint: "#FF6B9A" },
  { bgTop: "#04121A", bgBottom: "#0B2230", glow: "#0E5A6B", line: "#9EF0FF", body: "#FFFFFF", accent: "#FFD166", oddTint: "#FF9F68" },
  { bgTop: "#140708", bgBottom: "#2A0E10", glow: "#7A2A1A", line: "#FFC9A3", body: "#FFF1E6", accent: "#FFD23F", oddTint: "#7CF7D4" },
  { bgTop: "#06140C", bgBottom: "#0D2418", glow: "#1F6B3E", line: "#C8FFD9", body: "#FFFFFF", accent: "#FFB938", oddTint: "#FF7AB6" }
];

const ELEMENT_ROTATION: OddOrbit["element"][] = ["chakra", "ring", "diya", "atom", "planet", "clock", "gear", "comet", "binary", "spinner"];
const LEVELS = [
  { difficulty: "easy", cols: 6, count: 42, jitter: 0.08 },
  { difficulty: "medium", cols: 7, count: 63, jitter: 0.12 },
  { difficulty: "hard", cols: 9, count: 99, jitter: 0.18 },
  { difficulty: "expert", cols: 10, count: 130, jitter: 0.22 }
] as const;

/** Day N of the channel (1-based) -> a complete, deterministic puzzle. */
export function chakraPuzzleForDay(day: number): OddOrbit {
  const d = Math.max(1, Math.floor(day));
  // weekly ramp: Mon-Tue easy/medium ... weekend expert
  const level = LEVELS[Math.min(3, Math.floor(((d - 1) % 7) / 2))] ?? LEVELS[0];
  // Puzzle type rotates daily: spin direction, odd design, speed, hidden letter, colour...
  // Posts 1-3 were published before the new modes existed; keep them exactly as uploaded.
  const MODES = ["reverse", "shape", "faster", "glyph", "reverse", "slower", "shape", "tint", "glyph"] as const;
  const LEGACY: Record<number, (typeof MODES)[number]> = { 1: "reverse", 2: "reverse", 3: "faster" };
  const mode = LEGACY[d] ?? MODES[(d - 1) % MODES.length] ?? "reverse";
  let element: OddOrbit["element"] = ELEMENT_ROTATION[(d - 1) % ELEMENT_ROTATION.length] ?? "chakra";
  let oddRule: OddOrbit["oddRule"] = mode === "glyph" ? "shape" : mode;
  if (mode === "glyph") element = "glyph";
  else if (oddRule === "shape" && !(SHAPE_ELEMENTS as readonly string[]).includes(element)) element = SHAPE_ELEMENTS[Math.floor(d / MODES.length) % 5] ?? "chakra";
  if (element === "gear" && oddRule === "reverse") oddRule = "faster";
  const glyphs = GLYPH_PAIRS[(d * 7 + 2) % GLYPH_PAIRS.length] ?? GLYPH_PAIRS[0]!;
  const speedRule = oddRule === "faster" || oddRule === "slower";
  const copy = element === "glyph" ? { title: `${glyphs[0]} KE BEECH ${glyphs[1]} DHUNDO`, subtitle: `Sab ${glyphs[0]} hain... ek ${glyphs[1]} chhupa hai 👀` } : RULE_COPY[oddRule];
  return {
    ...CHAKRA_BRAND,
    voice: [],
    puzzleNo: d,
    difficulty: level.difficulty,
    title: copy.title,
    subtitle: copy.subtitle,
    footer: "COMMENT KARO: ROW + NUMBER 👇",
    revealFooter: "SAHI PAKDA? KAL NAYA PUZZLE 🔥",
    answerPrefix: "JAWAB",
    element,
    oddRule,
    glyphs,
    cols: level.cols,
    count: level.count,
    oddIndex: -1,
    seed: `chakra-${d}`,
    satellites: element === "ring" ? 2 : 1,
    speed: element === "gear" || element === "chakra" ? 0.28 : element === "clock" ? 0.35 : 0.45,
    speedJitter: speedRule ? 0.02 : level.jitter,
    playSeconds: 12 + Math.min(1, Math.floor(((d - 1) % 7) / 4)),
    revealSeconds: 2.6,
    startSpeed: 0.45,
    endSpeed: 1.35,
    endCard: { show: true, title: "CHAKRA PUZZLE", line: "Kal ka naya puzzle miss mat karna!", button: "FOLLOW KARO, KAL NAYA PUZZLE KHELO", seconds: 5 },
    showTimer: true,
    palette: PALETTES[(d - 1) % PALETTES.length] ?? PALETTES[0]!
  };
}

export const ODD_ORBIT_DEMO: OddOrbit = chakraPuzzleForDay(1);

/** Preview compositions in Studio: one per element. */
export const ODD_ORBIT_VARIANTS: Record<string, Partial<OddOrbit>> = Object.fromEntries(
  ELEMENT_ROTATION.map((el, i) => [el, chakraPuzzleForDay(i + 1)])
);

export const FPS = 30;
export function oddOrbitDuration(p: OddOrbit): number {
  return Math.round((p.playSeconds + p.revealSeconds + (p.endCard.show ? p.endCard.seconds : 0)) * FPS);
}

/** "Effective seconds" of spin at time t with a linear speed ramp (slow start, fast finish). */
export function rampedTime(p: Pick<OddOrbit, "playSeconds" | "startSpeed" | "endSpeed">, t: number): number {
  const T = p.playSeconds, lo = p.startSpeed, hi = p.endSpeed;
  const tt = Math.min(t, T);
  return lo * tt + ((hi - lo) * tt * tt) / (2 * T) + Math.max(0, t - T) * hi;
}

/** Grid position of the odd element (same rule the composition uses). */
export function oddCellOf(p: Pick<OddOrbit, "oddIndex" | "count" | "seed" | "cols">): { index: number; row: number; col: number } {
  const index = p.oddIndex >= 0 && p.oddIndex < p.count ? p.oddIndex : Math.floor(random(`${p.seed}-odd`) * p.count);
  return { index, row: Math.floor(index / p.cols) + 1, col: (index % p.cols) + 1 };
}

/** Hinglish voice lines (Devanagari so the Hindi TTS voice reads them naturally). */
const RULE_VOICE: Record<OddOrbit["oddRule"], string> = {
  reverse: "इनमें से एक उल्टा घूम रहा है। ढूँढो, कौन सा?",
  faster: "इनमें से एक सबसे तेज़ घूम रहा है। ढूँढो, कौन सा?",
  slower: "इनमें से एक सबसे धीरे घूम रहा है। ढूँढो, कौन सा?",
  tint: "इनमें से एक का रंग थोड़ा अलग है। ढूँढो, कौन सा?",
  shape: "इनमें से एक का डिज़ाइन थोड़ा अलग है। ढूँढो, कौन सा?"
};

export function chakraVoiceLines(p: OddOrbit): { file: string; text: string; at: number }[] {
  const { row, col } = oddCellOf(p);
  return [
    { file: "hook.wav", at: 0.4, text: `${p.element === "glyph" ? `सारे ${GLYPH_VOICE[p.glyphs[0]] ?? p.glyphs[0]} हैं, बस एक ${GLYPH_VOICE[p.glyphs[1]] ?? p.glyphs[1]} छुपा है। ढूँढो!` : RULE_VOICE[p.oddRule]} टाइम शुरू!` },
    { file: "hurry.wav", at: Math.max(3, p.playSeconds - 3.2), text: "बस तीन सेकंड! कमेंट में लिखो।" },
    { file: "reveal.wav", at: p.playSeconds + 0.2, text: `जवाब: रो ${row}, नंबर ${col}!` },
    ...(p.endCard.show ? [{ file: "outro.wav", at: p.playSeconds + p.revealSeconds + 0.2, text: "कल का नया चक्र पज़ल देखने के लिए फॉलो करो!" }] : [])
  ];
}
