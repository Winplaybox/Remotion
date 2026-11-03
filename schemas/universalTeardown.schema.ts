import { z } from "zod";

// ─── Primitive tokens ────────────────────────────────────────────────────────

export const HexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a 6-digit hex color");

export const FrameRangeSchema = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().positive(),
});

export const Vector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

// ─── Source citation ─────────────────────────────────────────────────────────

export const SourceCitationSchema = z.object({
  document: z.string().min(1),
  page: z.number().int().positive().optional(),
  section: z.string().optional(),
  url: z.string().url().optional(),
  accessedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// ─── Layer types ─────────────────────────────────────────────────────────────

export const LayerKindSchema = z.enum([
  "title",
  "subtitle",
  "body",
  "metric",
  "chart",
  "divider",
  "logo",
  "icon",
  "3d-object",
  "background",
  "caption",
  "hud-overlay",
]);

export const AnimationPresetSchema = z.enum([
  "fade-up",
  "fade-in",
  "scale-in",
  "slide-left",
  "slide-right",
  "typewriter",
  "counter",
  "draw-line",
  "expand-bar",
  "orbit-in",
]);

export const LayerSchema = z.object({
  id: z.string().min(1),
  kind: LayerKindSchema,
  content: z.string(),
  animation: AnimationPresetSchema,
  enterFrame: z.number().int().nonnegative(),
  exitFrame: z.number().int().positive().optional(),
  source: SourceCitationSchema.optional(),
  style: z
    .object({
      color: HexColorSchema.optional(),
      fontSize: z.number().positive().optional(),
      fontWeight: z.union([z.literal(400), z.literal(600), z.literal(700), z.literal(800)]).optional(),
      textAlign: z.enum(["left", "center", "right"]).optional(),
    })
    .optional(),
});

// ─── Scene types ─────────────────────────────────────────────────────────────

export const SceneKindSchema = z.enum([
  "cinematic-intro",
  "hook",
  "explainer",
  "data-reveal",
  "teardown",
  "comparison",
  "archive-scan",
  "hud-telemetry",
  "cinematic-outro",
]);

export const SceneSchema = z.object({
  id: z.string().min(1),
  kind: SceneKindSchema,
  label: z.string().min(1),
  durationFrames: z.number().int().positive(),
  layers: z.array(LayerSchema).min(1),
  background: HexColorSchema.default("#07090E"),
  notes: z.string().optional(),
});

// ─── Universal Teardown (full episode schema) ─────────────────────────────────

export const StyleVariantSchema = z.enum([
  "exploded-teardown",
  "data-physicalization",
  "archive-light-table",
  "visual-investigation",
]);

export const UniversalTeardownSchema = z.object({
  episodeId: z.string().regex(/^ep\d{2}$/),
  title: z.string().min(1).max(120),
  hinglishTitle: z.string().min(1).max(120),
  channel: z.number().int().min(1).max(5),
  styleVariant: StyleVariantSchema,

  fps: z.literal(30),
  widthPx: z.literal(1080),
  heightPx: z.literal(1920),

  hookLine: z.string().max(140),
  narrationScript: z.string().min(100),
  estimatedDurationSeconds: z.number().min(60).max(180),

  scenes: z.array(SceneSchema).min(3).max(12),
  totalFrames: z.number().int().positive(),

  primarySources: z.array(SourceCitationSchema).min(1),

  seo: z.object({
    youtubeTitle: z.string().max(100),
    description: z.string().max(5000),
    tags: z.array(z.string()).min(5).max(30),
    thumbnailConcept: z.string().max(300),
  }),

  workflowStatus: z.enum([
    "research",
    "script-review",
    "storyboard-review",
    "render-ready",
    "rendered",
    "quality-review",
    "approved",
    "published",
    "rejected",
  ]),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  approvedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type UniversalTeardown = z.infer<typeof UniversalTeardownSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type Layer = z.infer<typeof LayerSchema>;
export type SourceCitation = z.infer<typeof SourceCitationSchema>;
export type StyleVariant = z.infer<typeof StyleVariantSchema>;
