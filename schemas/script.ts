import { z } from "zod";

export const ScriptSectionSchema = z.object({
  id: z.string(),
  name: z.enum([
    "hook",
    "context_problem",
    "core_explanation",
    "real_world_analogy",
    "technical_breakdown",
    "future_implication",
    "cta",
  ]),
  spokenHinglish: z.string().min(5),
  estimatedDurationSeconds: z.number().positive(),
  visualCues: z.string(),
  referencedClaimIds: z.array(z.string()).default([]),
});

export const VideoScriptSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  language: z.literal("hinglish").default("hinglish"),
  targetDurationSeconds: z.number().min(60).max(180),
  actualAudioDurationSeconds: z.number().optional(),
  sections: z.array(ScriptSectionSchema).min(3),
  fullHinglishText: z.string().min(50),
  status: z.enum(["draft", "reviewed", "approved", "rejected"]).default("draft"),
  version: z.number().int().positive().default(1),
  approvedBy: z.string().optional(),
  approvedAt: z.string().datetime().optional(),
});

export type ScriptSection = z.infer<typeof ScriptSectionSchema>;
export type VideoScript = z.infer<typeof VideoScriptSchema>;
