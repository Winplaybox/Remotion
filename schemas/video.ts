import { z } from "zod";
import { ResearchClaimSchema } from "./research";
import { SceneSchema } from "./storyboard";

export const WorkflowStatusSchema = z.enum([
  "research",
  "script-review",
  "storyboard-review",
  "render-ready",
  "rendered",
  "quality-review",
  "approved",
  "published",
  "rejected",
]);

export const VideoContentSchema = z.object({
  id: z.string(),
  title: z.string().min(5),
  slug: z.string(),
  language: z.literal("hinglish").default("hinglish"),
  targetDurationSeconds: z.number().min(60).max(180),
  actualDurationSeconds: z.number().optional(),
  fps: z.literal(30).default(30),
  width: z.literal(1080).default(1080),
  height: z.literal(1920).default(1920),
  research: z.object({
    sourceIds: z.array(z.string()),
    claims: z.array(ResearchClaimSchema),
    verificationStatus: z.enum(["pending", "verified", "rejected"]),
  }),
  script: z.object({
    hook: z.string(),
    narration: z.string(),
    cta: z.string(),
  }),
  scenes: z.array(SceneSchema),
  media: z.object({
    narrationPath: z.string().optional(),
    subtitlePath: z.string().optional(),
    waveformColor: z.string().default("#00F5FF"),
  }),
  seo: z.object({
    youtubeTitle: z.string().max(100),
    instagramCaption: z.string().max(2200),
    hashtags: z.array(z.string()).min(3),
  }),
  workflowStatus: WorkflowStatusSchema.default("research"),
  approvalHistory: z.array(
    z.object({
      stage: WorkflowStatusSchema,
      action: z.enum(["approved", "rejected", "modified"]),
      actor: z.string(),
      timestamp: z.string().datetime(),
      notes: z.string().optional(),
    })
  ).default([]),
});

export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;
export type VideoContent = z.infer<typeof VideoContentSchema>;
