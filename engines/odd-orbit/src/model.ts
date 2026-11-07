import { z } from "zod";

/** Every orbit element the engine can draw. Add a new renderer in elements.tsx and list it here. */
export const ORBIT_ELEMENTS = ["chakra", "diya", "ring", "planet", "atom", "binary", "comet", "clock", "spinner", "gear"] as const;
/** How the odd one differs from the rest. */
export const ODD_RULES = ["reverse", "faster", "slower", "tint"] as const;
export const DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;

export const OddOrbitSchema = z.object({
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
  reverse: { title: "FIND THE ONE SPINNING BACKWARDS", subtitle: "Only ONE moves the other way 👀" },
  faster: { title: "FIND THE FASTEST ONE", subtitle: "One is spinning faster than the rest ⚡" },
  slower: { title: "FIND THE SLOWEST ONE", subtitle: "One of them is a little lazy 🐢" },
  tint: { title: "FIND THE ODD COLOR", subtitle: "Look closely — the difference is tiny 🔍" }
};

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
  const element = ELEMENT_ROTATION[(d - 1) % ELEMENT_ROTATION.length] ?? "chakra";
  // weekly ramp: Mon-Tue easy/medium ... weekend expert
  const level = LEVELS[Math.min(3, Math.floor(((d - 1) % 7) / 2))] ?? LEVELS[0];
  const ruleCycle: OddOrbit["oddRule"][] = ["reverse", "reverse", "faster", "reverse", "slower", "reverse", "tint"];
  let oddRule = ruleCycle[(d - 1) % ruleCycle.length] ?? "reverse";
  if (element === "gear" && oddRule === "reverse") oddRule = "faster";
  const speedRule = oddRule === "faster" || oddRule === "slower";
  const copy = RULE_COPY[oddRule];
  return {
    ...CHAKRA_BRAND,
    puzzleNo: d,
    difficulty: level.difficulty,
    title: copy.title,
    subtitle: copy.subtitle,
    footer: "COMMENT THE ROW + NUMBER 👇",
    revealFooter: "GOT IT? NEW PUZZLE EVERY DAY 🔥",
    answerPrefix: "ANSWER",
    element,
    oddRule,
    cols: level.cols,
    count: level.count,
    oddIndex: -1,
    seed: `chakra-${d}`,
    satellites: element === "ring" ? 2 : 1,
    speed: element === "gear" || element === "chakra" ? 0.28 : element === "clock" ? 0.35 : 0.45,
    speedJitter: speedRule ? 0.02 : level.jitter,
    playSeconds: 10 + Math.min(3, Math.floor(((d - 1) % 7) / 2)),
    revealSeconds: 3,
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
  return Math.round((p.playSeconds + p.revealSeconds) * FPS);
}
