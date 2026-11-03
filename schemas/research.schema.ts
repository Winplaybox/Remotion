import { z } from "zod";
import { SourceCitationSchema } from "./universalTeardown.schema";

export const ExtractedMetricSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  unit: z.string().optional(),
  year: z.number().int().optional(),
  source: SourceCitationSchema,
});

export const ResearchChunkSchema = z.object({
  id: z.string(),
  heading: z.string(),
  bodyText: z.string(),
  metrics: z.array(ExtractedMetricSchema),
  keyTerms: z.array(z.string()),
  source: SourceCitationSchema,
});

export const ResearchDocumentSchema = z.object({
  documentId: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  publishYear: z.number().int(),
  extractedAt: z.string(),
  totalPages: z.number().int().positive(),
  chunks: z.array(ResearchChunkSchema).min(1),
  rawTextPath: z.string(),
});

export type ResearchDocument = z.infer<typeof ResearchDocumentSchema>;
export type ResearchChunk = z.infer<typeof ResearchChunkSchema>;
export type ExtractedMetric = z.infer<typeof ExtractedMetricSchema>;
