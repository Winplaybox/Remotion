import { z } from "zod";

export const CameraMovementSchema = z.enum([
  "static",
  "push_in",
  "pull_back",
  "pan_left",
  "pan_right",
  "tilt_up",
  "tilt_down",
  "parallax_orbit",
]);

export const VisualLayerTypeSchema = z.enum([
  "layer1_2d_foundation",
  "layer2_25d_spatial",
  "layer3_3d_hero",
]);

export const SceneSchema = z.object({
  id: z.string(),
  index: z.number().int().nonnegative(),
  durationInFrames: z.number().int().positive(),
  visualLayer: VisualLayerTypeSchema,
  sceneComponent: z.string(), // e.g. "NeuralNetworkScene", "SpatialTypography", "FloatingCards"
  cameraMovement: CameraMovementSchema.default("push_in"),
  headline: z.string().optional(),
  subline: z.string().optional(),
  narrationSnippet: z.string(),
  animationDetails: z.object({
    depthLevel: z.number().min(0).max(10).default(5),
    cardTiltX: z.number().default(0),
    cardTiltY: z.number().default(0),
    accentColor: z.string().default("#00F5FF"),
    glowIntensity: z.number().min(0).max(1).default(0.8),
  }).default({
    depthLevel: 5,
    cardTiltX: 0,
    cardTiltY: 0,
    accentColor: "#00F5FF",
    glowIntensity: 0.8,
  }),
  assetsNeeded: z.array(z.string()).default([]),
  citationTag: z.string().optional(),
});

export const StoryboardSchema = z.object({
  id: z.string(),
  scriptId: z.string(),
  fps: z.literal(30).default(30),
  totalDurationInFrames: z.number().int().positive(),
  scenes: z.array(SceneSchema).min(1),
  version: z.number().int().positive().default(1),
  status: z.enum(["draft", "approved", "rejected"]).default("draft"),
});

export type CameraMovement = z.infer<typeof CameraMovementSchema>;
export type VisualLayerType = z.infer<typeof VisualLayerTypeSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type Storyboard = z.infer<typeof StoryboardSchema>;
