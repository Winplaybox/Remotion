import { z } from "zod";

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
  videoId: z.string().regex(/^vc_[a-z0-9]{8}$/),
  episodeRef: z.string().regex(/^ep\d{2}$/),
  workflowStatus: WorkflowStatusSchema,
  scriptHash: z.string().length(64),
  storyboardHash: z.string().length(64),
  createdAt: z.string(),
  updatedAt: z.string(),
  approvedAt: z.string().optional(),
  publishedAt: z.string().optional(),
  renderArtifactPath: z.string().optional(),
  qualityReport: z
    .object({
      passed: z.boolean(),
      durationSeconds: z.number(),
      subtitleAlignment: z.boolean(),
      sourceTraceability: z.boolean(),
      issues: z.array(z.string()),
    })
    .optional(),
});

export type VideoContent = z.infer<typeof VideoContentSchema>;
export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;
