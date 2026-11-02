import { z } from "zod";

export const MotionGraphicsStyleSchema = z.enum([
  "exploded-teardown",
  "data-physicalization",
  "archive-light-table",
  "visual-investigation",
]);

export type MotionGraphicsStyle = z.infer<typeof MotionGraphicsStyleSchema>;

export const LayerMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  change: z.string().optional(),
  unit: z.string().optional(),
});

export const LayerCalloutSchema = z.object({
  title: z.string(),
  description: z.string(),
  specCode: z.string(),
  xPct: z.number().min(0).max(100),
  yPct: z.number().min(0).max(100),
});

export const TeardownLayerSchema = z.object({
  id: z.string(),
  layerCode: z.string(), // e.g. "L01-UI", "L02-TENSOR", "L03-SILICON"
  name: z.string(),
  category: z.string(),
  depthZ: z.number(), // Z-depth in 3D preserve-3d space
  tiltX: z.number().default(-18),
  tiltY: z.number().default(24),
  metrics: z.array(LayerMetricSchema).default([]),
  callouts: z.array(LayerCalloutSchema).default([]),
  accentColor: z.string(),
  wireframe: z.boolean().default(false),
});

export const PhysicalPlateSchema = z.object({
  yearOrStep: z.string(),
  densityValue: z.number(), // 0 - 100 for visual plate height
  metricFormatted: z.string(),
  annotation: z.string(),
  plateColor: z.string(),
});

export const TelemetryDialSchema = z.object({
  code: z.string(),
  label: z.string(),
  value: z.number(),
  formattedValue: z.string(),
  min: z.number().default(0),
  max: z.number().default(100),
  unit: z.string(),
  status: z.enum(["nominal", "elevated", "critical"]).default("nominal"),
});

export const SmpteBeatSchema = z.object({
  beatIndex: z.number().int().min(1),
  startFrame: z.number().int().min(0),
  durationInFrames: z.number().int().positive(),
  cameraMove: z.enum(["static", "orbit_push", "layer_split", "loupe_scan", "telemetry_pulse"]),
  activeLayerCode: z.string().optional(),
  narrationCue: z.string(),
  smpteTimecode: z.string(), // e.g. "00:00:02:14"
});

export const UniversalTeardownSceneSchema = z.object({
  episodeId: z.string(), // e.g. "EP01"
  channel: z.enum([
    "AI, Technology & Future Explained",
    "Human Psychology & Science Explained",
    "History, Civilizations & Hidden Stories",
    "Business, Companies & Economics Explained",
    "Space, Science & Discoveries",
  ]),
  title: z.string(),
  hookHeadline: z.string(),
  style: MotionGraphicsStyleSchema,
  smpteBase: z.string().default("00:00:00:00"),
  dimensions: z.object({
    width: z.literal(1080).default(1080),
    height: z.literal(1920).default(1920),
    fps: z.literal(30).default(30),
    totalDurationInFrames: z.number().int().default(1800), // Default 60s
  }),
  palette: z.object({
    background: z.string().default("#07090E"),
    surface: z.string().default("rgba(13, 17, 23, 0.92)"),
    border: z.string().default("#1F293D"),
    primaryAccent: z.string(), // e.g. #00F5FF or #F59E0B
    secondaryAccent: z.string(),
    cadGridColor: z.string().default("rgba(255, 255, 255, 0.04)"),
    textPrimary: z.string().default("#F0F6FC"),
    textSecondary: z.string().default("#8B949E"),
  }),
  citation: z.object({
    source: z.string(), // e.g. "Stanford AI Index 2026"
    chapter: z.string(), // e.g. "Chapter 1: Research & Development"
    page: z.number().int().positive(),
    verifiedMetric: z.string(),
    doiOrUrl: z.string().optional(),
  }),
  layers: z.array(TeardownLayerSchema).default([]),
  plates: z.array(PhysicalPlateSchema).default([]),
  dials: z.array(TelemetryDialSchema).default([]),
  beats: z.array(SmpteBeatSchema),
});

export type UniversalTeardownScene = z.infer<typeof UniversalTeardownSceneSchema>;
