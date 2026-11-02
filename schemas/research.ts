import { z } from "zod";

export const ResearchClaimSchema = z.object({
  id: z.string(),
  claim: z.string().min(5),
  sourceId: z.string(),
  pageNumber: z.number().int().positive().optional(),
  sectionTitle: z.string().optional(),
  quote: z.string().optional(),
  verificationStatus: z.enum(["verified", "pending", "unsupported", "disputed"]).default("pending"),
  verifiedBy: z.string().optional(),
  notes: z.string().optional(),
});

export const ResearchDocumentSchema = z.object({
  id: z.string(),
  title: z.string().min(3),
  authors: z.array(z.string()).default([]),
  publisherOrOrg: z.string(),
  publicationYear: z.number().int().optional(),
  sourceUrl: z.string().url().optional(),
  pdfFilePath: z.string(),
  totalPages: z.number().int().positive(),
  extractedAt: z.string().datetime().optional(),
  claims: z.array(ResearchClaimSchema).default([]),
  license: z.string().default("Open Access / Research Use"),
});

export type ResearchClaim = z.infer<typeof ResearchClaimSchema>;
export type ResearchDocument = z.infer<typeof ResearchDocumentSchema>;
