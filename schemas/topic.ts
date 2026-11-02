import { z } from "zod";

export const TopicCategorySchema = z.enum([
  "AI Explained",
  "Internet & Software",
  "Cybersecurity",
  "Future Technology",
]);

export const TopicCandidateSchema = z.object({
  id: z.string(),
  title: z.string().min(5),
  angle: z.string().min(10),
  category: TopicCategorySchema,
  targetDurationSeconds: z.number().min(60).max(180).default(150),
  difficultyLevel: z.enum(["beginner", "intermediate", "deep_dive"]).default("beginner"),
  primaryResearchSourceIds: z.array(z.string()).min(1),
  scoring: z.object({
    curiosityScore: z.number().min(0).max(10),
    educationalValue: z.number().min(0).max(10),
    visualFeasibility: z.number().min(0).max(10),
    overallScore: z.number().min(0).max(10),
  }),
  isApproved: z.boolean().default(false),
  discoveredAt: z.string().datetime().optional(),
});

export type TopicCategory = z.infer<typeof TopicCategorySchema>;
export type TopicCandidate = z.infer<typeof TopicCandidateSchema>;
