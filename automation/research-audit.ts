/**
 * Research Audit Module
 * Verifies all research documents have valid source files, page references, and verification status.
 * Never reports healthy when files are missing or unverified.
 */

import * as fs from "fs";
import * as path from "path";
import { ResearchDocumentSchema, ResearchDocument } from "../schemas/research";

export interface ResearchAuditResult {
  status: "healthy" | "degraded" | "not_configured" | "failed";
  passed: boolean;
  totalDocuments: number;
  validDocuments: number;
  invalidDocuments: number;
  totalClaims: number;
  verifiedClaims: number;
  unverifiedClaims: number;
  missingPdfFiles: string[];
  schemaErrors: Array<{ file: string; errors: string[] }>;
  summary: string;
}

export async function runResearchAudit(): Promise<ResearchAuditResult> {
  console.log("[Research Audit] Starting authentic research repository audit...");

  const registryDir = path.resolve(process.cwd(), "research/registry");
  const missingPdfFiles: string[] = [];
  const schemaErrors: Array<{ file: string; errors: string[] }> = [];

  let totalDocuments = 0;
  let validDocuments = 0;
  let invalidDocuments = 0;
  let totalClaims = 0;
  let verifiedClaims = 0;
  let unverifiedClaims = 0;

  if (!fs.existsSync(registryDir)) {
    return {
      status: "not_configured",
      passed: false,
      totalDocuments: 0,
      validDocuments: 0,
      invalidDocuments: 0,
      totalClaims: 0,
      verifiedClaims: 0,
      unverifiedClaims: 0,
      missingPdfFiles: [],
      schemaErrors: [],
      summary: `Research registry directory does not exist at ${registryDir}`,
    };
  }

  const files = fs.readdirSync(registryDir).filter((file) => file.endsWith(".json"));
  totalDocuments = files.length;

  if (totalDocuments === 0) {
    return {
      status: "not_configured",
      passed: false,
      totalDocuments: 0,
      validDocuments: 0,
      invalidDocuments: 0,
      totalClaims: 0,
      verifiedClaims: 0,
      unverifiedClaims: 0,
      missingPdfFiles: [],
      schemaErrors: [],
      summary: "No research documents found in research/registry. Research ingestion has not been run.",
    };
  }

  for (const file of files) {
    const fullPath = path.join(registryDir, file);
    try {
      const rawContent = fs.readFileSync(fullPath, "utf-8");
      const parsedJson = JSON.parse(rawContent);

      const parseResult = ResearchDocumentSchema.safeParse(parsedJson);
      if (!parseResult.success) {
        invalidDocuments++;
        schemaErrors.push({
          file,
          errors: parseResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
        });
        continue;
      }

      validDocuments++;
      const doc: ResearchDocument = parseResult.data;

      // Verify physical PDF existence
      const resolvedPdfPath = path.isAbsolute(doc.pdfFilePath)
        ? doc.pdfFilePath
        : path.resolve(process.cwd(), doc.pdfFilePath);

      if (!fs.existsSync(resolvedPdfPath)) {
        missingPdfFiles.push(`${file} -> missing ${doc.pdfFilePath}`);
      }

      // Verify claims
      if (Array.isArray(doc.claims)) {
        for (const claim of doc.claims) {
          totalClaims++;
          if (claim.verificationStatus === "verified") {
            verifiedClaims++;
          } else {
            unverifiedClaims++;
          }
        }
      }
    } catch (err: unknown) {
      invalidDocuments++;
      schemaErrors.push({
        file,
        errors: [(err as Error).message || "Unknown JSON parse error"],
      });
    }
  }

  const passed =
    validDocuments > 0 &&
    invalidDocuments === 0 &&
    missingPdfFiles.length === 0 &&
    unverifiedClaims === 0;

  const status =
    totalDocuments === 0
      ? "not_configured"
      : !passed
      ? "failed"
      : "healthy";

  return {
    status,
    passed,
    totalDocuments,
    validDocuments,
    invalidDocuments,
    totalClaims,
    verifiedClaims,
    unverifiedClaims,
    missingPdfFiles,
    schemaErrors,
    summary: passed
      ? `Audit passed: ${validDocuments} valid research document(s), ${verifiedClaims} verified claim(s).`
      : `Audit failed: ${invalidDocuments} schema error(s), ${missingPdfFiles.length} missing PDF(s), ${unverifiedClaims} unverified claim(s).`,
  };
}
