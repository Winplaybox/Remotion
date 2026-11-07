import { z } from "zod";

/** Built-in paper-cutout props drawn in SVG (props.tsx). Use `image` layers for AI-generated character cutouts. */
export const PROP_NAMES = [
  "moon", "moonPhases", "clouds", "hills", "doorway", "toran", "diya", "diyaRow", "rangoli", "rooftops",
  "lotus", "water", "tree", "temple", "sun", "noteCard", "festivalTracker", "progress", "monthCalendar",
  "fish", "boat", "kamandalu", "growthSteps", "towing", "vedas"
] as const;
export type PropName = (typeof PROP_NAMES)[number];

const ENTER = z.enum(["none", "fade", "rise", "drop", "pop", "slideLeft", "slideRight"]);
const IDLE = z.enum(["none", "bob", "sway", "drift", "pulse", "walk"]);
const TONE = z.enum(["paper", "ink", "accent", "accent2", "accent3"]);

const LayerBase = {
  x: z.number(),
  y: z.number(),
  scale: z.number().positive().default(1),
  /** Seconds after scene start. */
  at: z.number().min(0).default(0),
  enter: ENTER.default("fade"),
  idle: IDLE.default("none"),
  /** 0 = background (barely moves with camera), 1 = foreground. */
  depth: z.number().min(0).max(1.5).default(0.5),
  flip: z.boolean().default(false)
};

export const LayerSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("prop"), prop: z.enum(PROP_NAMES), data: z.record(z.unknown()).default({}), ...LayerBase }),
  /** PNG/WebP with transparent background placed in /public, e.g. "story/lakshmi.png". x/y = bottom-centre. */
  z.object({ kind: z.literal("image"), src: z.string().min(1), width: z.number().positive(), ...LayerBase })
]);

export const SceneSchema = z.object({
  id: z.string(),
  seconds: z.number().positive(),
  location: z.string(),
  fig: z.string(),
  sky: z.tuple([z.string(), z.string()]),
  ground: z.object({ color: z.string(), y: z.number() }).optional(),
  tone: z.enum(["light", "dark"]).default("light"),
  headlines: z.array(z.object({ at: z.number().min(0), lines: z.array(z.object({ text: z.string(), tone: TONE.optional() })).min(1) })).min(1),
  layers: z.array(LayerSchema),
  labels: z.array(z.object({ text: z.string(), x: z.number(), y: z.number(), toX: z.number(), toY: z.number(), at: z.number().min(0) })).default([]),
  particles: z.enum(["none", "stars", "embers", "petals", "bubbles", "fireflies", "rain"]).default("none"),
  /** Devanagari text sent to TTS (IndicF5 / Edge). */
  narration: z.string().default(""),
  /** Roman Hinglish on-screen caption. Empty = no captions for this scene. */
  caption: z.string().default(""),
  /** Narration audio in /public, e.g. "audio/ebs/vishnu-01/scene-1.wav". Scene length stretches to fit it. */
  audio: z.string().optional(),
  camera: z.enum(["still", "push", "panLeft", "panRight"]).default("push")
});

export const StoryDioramaSchema = z.object({
  /** Channel name shown top-left. */
  brand: z.string().default("EPIC BHARAT SAGA"),
  handle: z.string().default(""),
  /** e.g. "VISHNU SEASON · EP " */
  tag: z.string(),
  /** e.g. "01/10" */
  tagAccent: z.string(),
  showCaptions: z.boolean().default(true),
  palette: z.object({ paper: z.string(), ink: z.string(), accent: z.string(), accent2: z.string(), accent3: z.string() }),
  transitionFrames: z.number().int().min(0).max(30),
  scenes: z.array(SceneSchema).min(1)
});

export type StoryLayer = z.infer<typeof LayerSchema>;
export type StoryScene = z.infer<typeof SceneSchema>;
export type StoryDiorama = z.infer<typeof StoryDioramaSchema>;
export type StoryDioramaInput = z.input<typeof StoryDioramaSchema>;

export const FPS = 30;
export function storyDioramaDuration(p: StoryDiorama): number {
  return Math.round(p.scenes.reduce((sum, s) => sum + s.seconds, 0) * FPS);
}

/** Shorthand for a built-in prop layer in content files. */
export const P = (prop: PropName, x: number, y: number, extra: Partial<Omit<Extract<StoryLayer, { kind: "prop" }>, "kind" | "prop">> = {}) => ({ kind: "prop" as const, prop, x, y, ...extra });
