import { z } from "zod";

/** Built-in paper-cutout props drawn in SVG (props.tsx). Use `image` layers for AI-generated character cutouts. */
export const PROP_NAMES = [
  "moon", "moonPhases", "clouds", "hills", "doorway", "toran", "diya", "diyaRow", "rangoli", "rooftops",
  "lotus", "water", "tree", "temple", "sun", "noteCard", "festivalTracker", "progress", "monthCalendar"
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
  particles: z.enum(["none", "stars", "embers", "petals", "bubbles", "fireflies"]).default("none"),
  camera: z.enum(["still", "push", "panLeft", "panRight"]).default("push")
});

export const StoryDioramaSchema = z.object({
  tag: z.string(),
  tagAccent: z.string(),
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

const P = (prop: PropName, x: number, y: number, extra: Partial<Omit<Extract<StoryLayer, { kind: "prop" }>, "kind" | "prop">> = {}) => ({ kind: "prop" as const, prop, x, y, ...extra });

const DEMO_INPUT: StoryDioramaInput = {
  tag: "DIWALI · DAY ",
  tagAccent: "3/5",
  palette: { paper: "#F5EEDF", ink: "#1C1A17", accent: "#F0533F", accent2: "#F6B93B", accent3: "#5BD17A" },
  transitionFrames: 10,
  scenes: [
    {
      id: "no-moon", seconds: 5, location: "THE SKY · KARTIK MONTH", fig: "FIG. 1", sky: ["#141A44", "#2B2F6B"], particles: "stars",
      headlines: [{ at: 0, lines: [{ text: "KARTIK AMAVASYA:" }, { text: "NO MOON", tone: "accent2" }] }],
      layers: [
        P("clouds", 540, 1420, { depth: 0.3, idle: "drift", data: { count: 3, spread: 260 } }),
        P("moonPhases", 540, 880, { at: 0.4, enter: "pop", depth: 0.8 }),
        P("hills", 540, 1560, { depth: 0.3, data: { color: "#232457" } }),
        P("temple", 540, 1720, { depth: 0.6, enter: "rise", at: 0.8, scale: 0.8 }),
        P("hills", 540, 1760, { depth: 0.5, data: { color: "#15163A" } })
      ]
    },
    {
      id: "doorstep", seconds: 6.5, location: "THE DOORSTEP · DIWALI NIGHT", fig: "FIG. 2", sky: ["#1B1D3F", "#3A2A4A"], ground: { color: "#3B3431", y: 1460 }, particles: "embers",
      headlines: [
        { at: 0, lines: [{ text: "THE DARKEST NIGHT" }, { text: "OF THE YEAR…", tone: "accent" }] },
        { at: 3.3, lines: [{ text: "SO EVERY DOOR" }, { text: "GETS A FLAME", tone: "accent2" }] }
      ],
      layers: [
        P("doorway", 540, 1460, { depth: 0.4, enter: "rise" }),
        P("toran", 540, 735, { depth: 0.5, enter: "drop", at: 0.3, idle: "sway" }),
        P("rangoli", 540, 1640, { depth: 1, at: 0.6, enter: "none", scale: 1.15 }),
        P("diya", 250, 1560, { depth: 1.1, at: 1.6, enter: "pop", scale: 1.3 }),
        P("diya", 830, 1560, { depth: 1.1, at: 1.9, enter: "pop", scale: 1.3 })
      ],
      labels: [
        { text: "RANGOLI", x: 640, y: 1800, toX: 590, toY: 1680, at: 2.4 },
        { text: "DIYA", x: 180, y: 1380, toX: 245, toY: 1525, at: 2.8 }
      ]
    },
    {
      id: "village", seconds: 6, location: "THE VILLAGE · AFTER SUNSET", fig: "FIG. 3", sky: ["#1A1B45", "#6A3F5E"], particles: "stars", camera: "panLeft",
      headlines: [{ at: 0, lines: [{ text: "ONE DIYA," }, { text: "EVERY ROOF", tone: "accent2" }] }],
      layers: [
        P("hills", 540, 1380, { depth: 0.2, data: { color: "#2C2547" } }),
        P("rooftops", 540, 1660, { depth: 0.6, enter: "rise", scale: 0.78, data: { lightAt: 0.8 } }),
        P("progress", 540, 1800, { depth: 0, at: 0.8, enter: "rise", data: { label: "LAMPS LIT", seconds: 4 } })
      ]
    },
    {
      id: "ocean", seconds: 6.5, location: "SAMUDRA MANTHAN · THE CHURNING", fig: "FIG. 4", sky: ["#0F3B4C", "#1E6B78"], particles: "bubbles", camera: "push",
      headlines: [
        { at: 0, lines: [{ text: "FROM THE CHURNING" }, { text: "OF THE OCEAN", tone: "accent2" }] },
        { at: 3.2, lines: [{ text: "LAKSHMI ROSE" }, { text: "ON A LOTUS", tone: "accent" }] }
      ],
      layers: [
        P("sun", 540, 760, { depth: 0.1, idle: "pulse", data: { color: "#FFE3A3" } }),
        P("lotus", 540, 1330, { depth: 0.9, at: 1.2, enter: "rise", idle: "bob", scale: 1.4 }),
        P("water", 540, 1360, { depth: 0.6 })
      ],
      labels: [{ text: "KAMALA · THE LOTUS ONE", x: 760, y: 1110, toX: 610, toY: 1220, at: 4 }]
    },
    {
      id: "tonight", seconds: 5.5, location: "TONIGHT · BEFORE PUJA", fig: "FIG. 5", sky: ["#EFE1C6", "#E2C79B"], tone: "dark", particles: "petals",
      headlines: [{ at: 0, lines: [{ text: "CLEAN HOME," }, { text: "BRIGHT HOME", tone: "accent" }] }],
      layers: [
        P("noteCard", 540, 1020, { depth: 0.7, at: 0.3, enter: "drop", data: { title: "BEFORE LAKSHMI PUJA:", items: ["SWEEP EVERY CORNER", "LIGHT EVERY LAMP", "KEEP THE DOOR OPEN"] } }),
        P("diyaRow", 540, 1650, { depth: 1, at: 0.6, enter: "rise", data: { count: 5, spacing: 190 } })
      ]
    },
    {
      id: "next", seconds: 5, location: "NEXT · TOMORROW", fig: "FIG. 6", sky: ["#2A1E3F", "#5A2E3A"], particles: "embers",
      headlines: [{ at: 0, lines: [{ text: "NEXT: DAY 4" }, { text: "GOVARDHAN", tone: "accent3" }] }],
      layers: [
        P("festivalTracker", 540, 1150, { depth: 0.7, at: 0.3, enter: "drop", data: { title: "DIWALI · 5 DAYS", items: ["DHANTERAS", "CHHOTI DIWALI", "LAKSHMI PUJA", "GOVARDHAN PUJA", "BHAI DOOJ"], done: 3 } })
      ]
    }
  ]
};

export const STORY_DIORAMA_DEMO: StoryDiorama = StoryDioramaSchema.parse(DEMO_INPUT);
