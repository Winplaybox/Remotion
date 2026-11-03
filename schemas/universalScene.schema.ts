import { z } from "zod";

export const NicheSchema = z.enum(["ai-tech", "psychology", "history", "business", "space"]);
export const EvidenceStyleSchema = z.enum([
  "exploded-teardown",
  "data-physicalization",
  "archive-light-table",
  "visual-investigation",
]);

export const EpisodeCitationSchema = z.object({
  source: z.string(),
  chapter: z.string(),
  page: z.number().int().positive(),
  url: z.string().optional(),
  verifiedMetric: z.string(),
});

export const EpisodeMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  unit: z.string().optional(),
  change: z.string().optional(),
});

export const EpisodeCalloutSchema = z.object({
  title: z.string(),
  description: z.string(),
  specCode: z.string(),
  xPct: z.number().min(0).max(100),
  yPct: z.number().min(0).max(100),
});

export const EpisodeLayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  visualType: z.enum(["chart", "stack", "panel", "telemetry", "figure", "diagram"]),
  metricLabel: z.string().optional(),
  metricValue: z.string().default("TBD"),
  sourceCitation: z.string(),
  accentColor: z.string().default("#00F5FF"),
  layerCode: z.string().optional(),
  depthZ: z.number().default(0),
  tiltX: z.number().default(0),
  tiltY: z.number().default(0),
  metrics: z.array(EpisodeMetricSchema).default([]),
  callouts: z.array(EpisodeCalloutSchema).default([]),
});

export const EpisodeBeatSchema = z.object({
  beatIndex: z.number().int().min(1),
  startFrame: z.number().int().min(0),
  durationInFrames: z.number().int().positive(),
  cameraMove: z.enum(["static", "orbit_push", "layer_split", "loupe_scan", "telemetry_pulse"]),
  activeLayerCode: z.string().optional(),
  narrationCue: z.string(),
  smpteTimecode: z.string(),
});

export const UniversalSceneSchema = z.object({
  episodeId: z.string(),
  niche: NicheSchema,
  channel: z.string(),
  title: z.string(),
  hookHeadline: z.string(),
  style: EvidenceStyleSchema,
  smpteBase: z.string().default("00:00:00:00"),
  dimensions: z.object({
    width: z.literal(1080).default(1080),
    height: z.literal(1920).default(1920),
    fps: z.literal(30).default(30),
    totalDurationInFrames: z.number().int().positive(),
  }),
  palette: z.object({
    background: z.string().default("#07090E"),
    surface: z.string().default("rgba(13, 17, 23, 0.92)"),
    border: z.string().default("#1F293D"),
    primaryAccent: z.string().default("#00F5FF"),
    secondaryAccent: z.string().default("#F59E0B"),
    cadGridColor: z.string().default("rgba(255, 255, 255, 0.04)"),
    textPrimary: z.string().default("#F0F6FC"),
    textSecondary: z.string().default("#8B949E"),
  }),
  citation: EpisodeCitationSchema,
  layers: z.array(EpisodeLayerSchema).default([]),
  plates: z.array(
    z.object({
      yearOrStep: z.string(),
      densityValue: z.number().min(0).max(100),
      metricFormatted: z.string(),
      annotation: z.string(),
      plateColor: z.string(),
    }),
  ).default([]),
  dials: z.array(
    z.object({
      code: z.string(),
      label: z.string(),
      value: z.number(),
      formattedValue: z.string(),
      min: z.number().default(0),
      max: z.number().default(100),
      unit: z.string().default("%"),
      status: z.enum(["nominal", "elevated", "critical"]).default("nominal"),
    }),
  ).default([]),
  beats: z.array(EpisodeBeatSchema),
});

export type UniversalScene = z.infer<typeof UniversalSceneSchema>;
export type ScenarioNiche = z.infer<typeof NicheSchema>;
export type ScenarioStyle = z.infer<typeof EvidenceStyleSchema>;
