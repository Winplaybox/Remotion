import type { ParticleKind } from "../types";
import type { StoryStyleId } from "../presets";

/**
 * Per-episode ART manifests: one background plate + pose cut-outs per page, positioned in 1080x1920 frame pixels.
 * Language-free: every channel renders exactly this; only voice + text change.
 *
 * Times are FRACTIONS of the page (0 = page start, 1 = page end) so a slower language stretches the action with it.
 * Art for a fable lives in public/<style.assetDir>/fable-<n>/ (backgrounds jpg, cut-outs webp with alpha).
 */

export type Enter = "hop" | "slide-left" | "slide-right" | "rise" | "drop" | "none";
export type Idle = "breathe" | "gallop" | "sad" | "wave" | "still";

export interface PathKey { t: number; x: number; y: number; s?: number }

export interface Actor {
  /** File in the fable folder. */
  src: string;
  /** Width on screen (px); height follows the image. */
  w: number;
  /** Feet anchor: horizontal centre + ground line (px). */
  x: number;
  y: number;
  enter: Enter;
  /** Page fraction when it appears / fades out (pose swaps cross-fade over ~8 frames). */
  at?: number;
  until?: number;
  idle: Idle;
  /** Optional travel: x/y feet positions over the page (overrides x/y). */
  path?: PathKey[];
  /** Mud splash burst when it lands (drop). */
  splash?: string;
  /** Contact shadow width share (default 0.8). */
  shadow?: number;
}

export interface Butterfly {
  src: string;
  /** Centre positions; s = width px. Holds the last key after it. */
  path: PathKey[];
  /** Page fraction after which wings flap slowly (landed). */
  restAt?: number;
}

export interface PageArt {
  bg: string;
  particles: ParticleKind;
  particleColor: string;
  actors: Actor[];
  butterfly?: Butterfly;
  /** Warm light pool behind the characters (CSS colour) — dusk / night pages. */
  glow?: string;
}

export interface EpisodeArt {
  dir: string;
  /** Hook card: emblem over a softened first plate. */
  title: { bg: string; emblem: string };
  /** One entry per non-title page, in order: story x4, moral, goodbye. */
  pages: PageArt[];
}

const B = "butterfly.webp";

/** Fable 1 "patience" — Chintu, mum Rani, the blue butterfly. Storybook Classic. */
const PATIENCE_STORYBOOK: EpisodeArt = {
  dir: "mindnest-v2/storybook-classic/fable-1",
  title: { bg: "bg-p1.jpg", emblem: "emblem.webp" },
  pages: [
    // 1. Chintu lives with his mum Rani; he loves to run.
    { bg: "bg-p1.jpg", particles: "pollen", particleColor: "#FFE7A0",
      actors: [{ src: "p1-pair.webp", w: 860, x: 540, y: 1545, enter: "hop", idle: "breathe" }] },
    // 2. He sees a shining blue butterfly — "I'll catch it!" — and runs after it.
    { bg: "bg-p2.jpg", particles: "petals", particleColor: "#F4A6C0",
      actors: [
        { src: "p2-leap.webp", w: 540, x: 390, y: 1560, enter: "slide-left", until: 0.66, idle: "breathe" },
        { src: "p2-run.webp", w: 660, x: 420, y: 1560, enter: "none", at: 0.64, idle: "gallop", path: [{ t: 0.64, x: 380, y: 1560 }, { t: 1, x: 640, y: 1560 }] }
      ],
      butterfly: { src: B, path: [{ t: 0, x: 860, y: 860, s: 96 }, { t: 0.2, x: 760, y: 780, s: 100 }, { t: 0.45, x: 700, y: 830, s: 100 }, { t: 0.65, x: 860, y: 720, s: 96 }, { t: 1, x: 1010, y: 600, s: 90 }] } },
    // 3. The faster he runs, the faster it flies. Splash! He slips into the mud.
    { bg: "bg-p3.jpg", particles: "leaves", particleColor: "#C9973E",
      actors: [
        { src: "p2-run.webp", w: 620, x: 300, y: 1530, enter: "slide-left", until: 0.55, idle: "gallop", path: [{ t: 0, x: 200, y: 1530 }, { t: 0.55, x: 560, y: 1540 }] },
        { src: "p3-muddy.webp", w: 540, x: 540, y: 1600, enter: "drop", at: 0.55, idle: "sad", splash: "#6E4A26" }
      ],
      butterfly: { src: B, path: [{ t: 0, x: 620, y: 860, s: 90 }, { t: 0.25, x: 820, y: 760, s: 88 }, { t: 0.5, x: 980, y: 600, s: 80 }, { t: 0.62, x: 1160, y: 470, s: 72 }] } },
    // 4. "Sit quietly and wait." Chintu sits still... and the butterfly lands on his nose.
    { bg: "bg-p4.jpg", particles: "pollen", particleColor: "#FFF2C0",
      actors: [{ src: "p4-calm.webp", w: 900, x: 540, y: 1550, enter: "rise", idle: "still" }],
      // Nose of the cub in p4-calm.webp is at (0.631, 0.477) of the image -> (658, 1124) on screen.
      butterfly: { src: B, restAt: 0.86, path: [{ t: 0, x: 1180, y: 560, s: 96 }, { t: 0.45, x: 1180, y: 560, s: 96 }, { t: 0.58, x: 930, y: 700, s: 96 }, { t: 0.72, x: 780, y: 900, s: 90 }, { t: 0.86, x: 660, y: 1096, s: 78 }] } },
    // 5. Moral.
    { bg: "bg-p5.jpg", particles: "petals", particleColor: "#FFC46B", glow: "rgba(255,196,110,0.55)",
      actors: [{ src: "p5-hug.webp", w: 820, x: 540, y: 1560, enter: "hop", idle: "breathe" }] },
    // 6. See you tomorrow.
    { bg: "bg-outro.jpg", particles: "fireflies", particleColor: "#FFD877", glow: "rgba(255,206,110,0.45)",
      actors: [{ src: "outro-wave.webp", w: 820, x: 540, y: 1565, enter: "rise", idle: "wave" }] }
  ]
};

const ART: Partial<Record<StoryStyleId, Record<number, EpisodeArt>>> = {
  "storybook-classic": { 1: PATIENCE_STORYBOOK }
};

export function episodeArtFor(style: StoryStyleId, fable: number): EpisodeArt | null {
  return ART[style]?.[fable] ?? null;
}

/** Fables that can render as a full V2 episode in this style (everything else fails closed). */
export function fablesWithArt(style: StoryStyleId): number[] {
  return Object.keys(ART[style] ?? {}).map(Number).sort((a, b) => a - b);
}
