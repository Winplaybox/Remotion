/**
 * Daily Orchestrator for PDF2Shorts Studio
 * Runs deterministic checks and audits for research, SEO, content, and analytics.
 * Enforces real metrics, zero fabricated passing results, and proper exit codes.
 */

import * as fs from "fs";
import * as path from "path";
import { runResearchAudit, ResearchAuditResult } from "./research-audit";
import { runSeoAudit, SeoAuditResult } from "./seo-audit";
import { runAnalyticsAudit, AnalyticsAuditResult } from "./analytics-audit";
import { TopicCandidateSchema, TopicCandidate } from "../schemas/topic";
import { VideoContentSchema } from "../schemas/video";

export interface OrchestratorReport {
  timestamp: string;
  auditType: "full" | "research" | "seo" | "analytics";
  systemHealth: "healthy" | "degraded" | "not_configured" | "failed";
  research: ResearchAuditResult | null;
  seo: SeoAuditResult | null;
  analytics: AnalyticsAuditResult | null;
  topics: {
    totalTopics: number;
    validTopics: number;
    duplicateTopics: string[];
    schemaErrors: Array<{ file: string; errors: string[] }>;
  };
  contentPipeline: {
    readyToRenderCount: number;
    approvedVideos: string[];
    invalidApprovedVideos: Array<{ file: string; errors: string[] }>;
  };
  summary: string;
}

export async function runAudit(type: "full" | "research" | "seo" | "analytics" = "full"): Promise<OrchestratorReport> {
  console.log(`[Daily Orchestrator] Starting authentic scheduled audit: ${type.toUpperCase()}`);
  const timestamp = new Date().toISOString();
  const reportsDir = path.resolve(process.cwd(), "reports");

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  let researchResult: ResearchAuditResult | null = null;
  let seoResult: SeoAuditResult | null = null;
  let analyticsResult: AnalyticsAuditResult | null = null;

  if (type === "full" || type === "research") {
    researchResult = await runResearchAudit();
  }

  if (type === "full" || type === "seo") {
    seoResult = await runSeoAudit();
  }

  if (type === "full" || type === "analytics") {
    analyticsResult = await runAnalyticsAudit();
  }

  // 1. Audit Topics in content/topics
  const topicsDir = path.resolve(process.cwd(), "content/topics");
  let totalTopics = 0;
  let validTopics = 0;
  const duplicateTopics: string[] = [];
  const topicSchemaErrors: Array<{ file: string; errors: string[] }> = [];
  const seenTopicTitles = new Map<string, string>();

  if (fs.existsSync(topicsDir)) {
    const topicFiles = fs.readdirSync(topicsDir).filter((f) => f.endsWith(".json"));
    totalTopics = topicFiles.length;

    for (const file of topicFiles) {
      try {
        const raw = fs.readFileSync(path.join(topicsDir, file), "utf-8");
        const parsed = JSON.parse(raw);
        const result = TopicCandidateSchema.safeParse(parsed);

        if (!result.success) {
          topicSchemaErrors.push({
            file,
            errors: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
          });
          continue;
        }

        validTopics++;
        const topic: TopicCandidate = result.data;
        const norm = topic.title.trim().toLowerCase();
        if (seenTopicTitles.has(norm)) {
          duplicateTopics.push(`Duplicate topic "${topic.title}" in ${file} (previously in ${seenTopicTitles.get(norm)})`);
        } else {
          seenTopicTitles.set(norm, file);
        }
      } catch (err: unknown) {
        topicSchemaErrors.push({
          file,
          errors: [(err as Error).message || "JSON parse error"],
        });
      }
    }
  }

  // 2. Audit content/approved for ready-to-render items
  const approvedDir = path.resolve(process.cwd(), "content/approved");
  const approvedVideos: string[] = [];
  const invalidApprovedVideos: Array<{ file: string; errors: string[] }> = [];

  if (fs.existsSync(approvedDir)) {
    const approvedFiles = fs.readdirSync(approvedDir).filter((f) => f.endsWith(".json"));
    for (const file of approvedFiles) {
      try {
        const raw = fs.readFileSync(path.join(approvedDir, file), "utf-8");
        const parsed = JSON.parse(raw);
        const result = VideoContentSchema.safeParse(parsed);

        if (!result.success) {
          invalidApprovedVideos.push({
            file,
            errors: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
          });
        } else if (result.data.workflowStatus === "approved") {
          approvedVideos.push(file);
        }
      } catch (err: unknown) {
        invalidApprovedVideos.push({
          file,
          errors: [(err as Error).message || "JSON parse error"],
        });
      }
    }
  }

  // 3. Determine Overall System Health
  let systemHealth: "healthy" | "degraded" | "not_configured" | "failed" = "healthy";

  const hasFailures =
    (researchResult && researchResult.status === "failed") ||
    (seoResult && seoResult.status === "failed") ||
    (analyticsResult && analyticsResult.status === "failed") ||
    topicSchemaErrors.length > 0 ||
    invalidApprovedVideos.length > 0 ||
    duplicateTopics.length > 0;

  const isNotConfigured =
    (researchResult && researchResult.status === "not_configured") ||
    (seoResult && seoResult.status === "not_configured") ||
    (analyticsResult && analyticsResult.status === "not_configured");

  if (hasFailures) {
    systemHealth = "failed";
  } else if (isNotConfigured) {
    systemHealth = "not_configured";
  } else if (analyticsResult && analyticsResult.status === "degraded") {
    systemHealth = "degraded";
  }

  const summary = `System health: ${systemHealth.toUpperCase()}. Research: ${researchResult?.status ?? "skipped"}, SEO: ${seoResult?.status ?? "skipped"}, Analytics: ${analyticsResult?.status ?? "skipped"}. Valid topics: ${validTopics}/${totalTopics}, Ready-to-render videos: ${approvedVideos.length}.`;

  const report: OrchestratorReport = {
    timestamp,
    auditType: type,
    systemHealth,
    research: researchResult,
    seo: seoResult,
    analytics: analyticsResult,
    topics: {
      totalTopics,
      validTopics,
      duplicateTopics,
      schemaErrors: topicSchemaErrors,
    },
    contentPipeline: {
      readyToRenderCount: approvedVideos.length,
      approvedVideos,
      invalidApprovedVideos,
    },
    summary,
  };

  const reportPath = path.join(reportsDir, `audit-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
  console.log(`[Daily Orchestrator] Audit complete. Report written to ${reportPath}`);
  console.log(`[Daily Orchestrator] ${summary}`);

  return report;
}

if (require.main === module) {
  const auditType = (process.argv[2] as "full" | "research" | "seo" | "analytics") || "full";
  runAudit(auditType)
    .then((report) => {
      if (report.systemHealth === "failed") {
        console.error("[Daily Orchestrator] One or more audit gates failed validation.");
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error("[Daily Orchestrator] Unexpected fatal execution error:", err);
      process.exit(1);
    });
}
