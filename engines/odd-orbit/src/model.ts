import { z } from "zod";

/** Every orbit element the engine can draw. Add a new renderer in elements.tsx and list it here. */
export const ORBIT_ELEMENTS = ["ring", "planet", "atom", "binary", "comet", "clock", "spinner", "gear"] as const;
/** How the odd one differs from the rest. */
export const ODD_RULES = ["reverse", "faster", "slower", "tint"] as const;

export const OddOrbitSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string(),
  footer: z.string(),
  brand: z.string(),
  element: z.enum(ORBIT_ELEMENTS),
  oddRule: z.enum(ODD_RULES),
  cols: z.number().int().min(3).max(12),
  count: z.number().int().min(6).max(160),
  /** Grid index of the odd element. Omit (-1) to let the seed pick it. */
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

export const ODD_ORBIT_DEMO: OddOrbit = {
  title: "FIND THE ONE GOING BACKWARDS",
  subtitle: "Only one orbit moves the other way 👀",
  footer: "COMMENT WHERE YOU FOUND IT",
  brand: "LOOP LAB",
  element: "ring",
  oddRule: "reverse",
  cols: 9,
  count: 100,
  oddIndex: -1,
  seed: "loop-001",
  satellites: 2,
  speed: 0.45,
  speedJitter: 0.18,
  playSeconds: 11,
  revealSeconds: 3,
  showTimer: true,
  palette: {
    bgTop: "#05060F",
    bgBottom: "#0B0D22",
    glow: "#3B2E7A",
    line: "#C9D6FF",
    body: "#FFFFFF",
    accent: "#7CF7D4",
    oddTint: "#FFB86B"
  }
};

export const ODD_ORBIT_VARIANTS: Record<string, Partial<OddOrbit>> = {
  Atom: { element: "atom", title: "ONE ATOM SPINS BACKWARDS", subtitle: "Can you spot it in 10 seconds?", cols: 7, count: 63, seed: "atom-7", palette: { ...ODD_ORBIT_DEMO.palette, glow: "#0E4D6B", line: "#8FE9FF", accent: "#FFE066" } },
  Planet: { element: "planet", title: "ONE MOON ORBITS THE WRONG WAY", subtitle: "Look closely 🔭", cols: 6, count: 48, seed: "planet-3", palette: { ...ODD_ORBIT_DEMO.palette, glow: "#5A2A12", line: "#FFD9A8", accent: "#FF7AB6" } },
  Clock: { element: "clock", title: "ONE CLOCK RUNS BACKWARDS", subtitle: "Every second counts ⏱", cols: 7, count: 70, seed: "clock-9", speed: 0.35, palette: { ...ODD_ORBIT_DEMO.palette, glow: "#1F3B2A", line: "#D9FFE8", accent: "#FFD166" } },
  Gear: { element: "gear", oddRule: "faster", title: "ONE GEAR IS FASTER", subtitle: "Only one breaks the rhythm ⚙️", cols: 7, count: 63, seed: "gear-2", speed: 0.25, speedJitter: 0.02, palette: { ...ODD_ORBIT_DEMO.palette, glow: "#4A3A10", line: "#FFE7A3", accent: "#7CF7D4" } },
  Binary: { element: "binary", title: "FIND THE REVERSED STAR PAIR", subtitle: "Two stars, one wrong direction ✨", cols: 8, count: 88, seed: "bin-4" },
  Comet: { element: "comet", title: "ONE COMET FLIES BACKWARDS", subtitle: "Follow the tails ☄️", cols: 8, count: 80, seed: "comet-5", palette: { ...ODD_ORBIT_DEMO.palette, glow: "#123A5C", line: "#A8D8FF", accent: "#FF9F68" } },
  Spinner: { element: "spinner", title: "ONE LOADER IS REVERSED", subtitle: "Your brain will skip it 🌀", cols: 8, count: 96, seed: "spin-6", speed: 0.6 }
};

export const FPS = 30;
export function oddOrbitDuration(p: OddOrbit): number {
  return Math.round((p.playSeconds + p.revealSeconds) * FPS);
}
