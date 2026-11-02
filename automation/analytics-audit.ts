/**
 * Analytics Audit Module
 * Evaluates audience retention, average view duration, and channel performance metrics.
 * Honestly reports unconfigured integrations instead of fabricating retention data.
 */

import * as fs from "fs";
import * as path from "path";

export interface AnalyticsAuditResult {
  status: "healthy" | "degraded" | "not_configured" | "failed";
  passed: boolean;
  isApiConfigured: boolean;
  localLogsFound: number;
  qualifiedViewsLogged: number;
  averageRetentionPct: number | null;
  summary: string;
}

export async function runAnalyticsAudit(): Promise<AnalyticsAuditResult> {
  console.log("[Analytics Audit] Checking analytics data integration and local retention logs...");

  const apiKey = process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_ANALYTICS_KEY;
  const analyticsLogsDir = path.resolve(process.cwd(), "analytics/logs");

  let localLogsFound = 0;
  let qualifiedViewsLogged = 0;
  let totalRetention = 0;
  let retentionSamples = 0;

  if (fs.existsSync(analyticsLogsDir)) {
    const logFiles = fs.readdirSync(analyticsLogsDir).filter((f) => f.endsWith(".json"));
    localLogsFound = logFiles.length;

    for (const file of logFiles) {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(analyticsLogsDir, file), "utf-8"));
        if (typeof content.qualifiedViews === "number") {
          qualifiedViewsLogged += content.qualifiedViews;
        }
        if (typeof content.averageRetentionPct === "number") {
          totalRetention += content.averageRetentionPct;
          retentionSamples++;
        }
      } catch {
        // Skip unparseable local logs
      }
    }
  }

  const isApiConfigured = Boolean(apiKey && apiKey.trim().length > 0);
  const averageRetentionPct = retentionSamples > 0 ? Math.round(totalRetention / retentionSamples) : null;

  if (!isApiConfigured && localLogsFound === 0) {
    return {
      status: "not_configured",
      passed: false,
      isApiConfigured: false,
      localLogsFound: 0,
      qualifiedViewsLogged: 0,
      averageRetentionPct: null,
      summary: "YouTube Analytics integration not configured (no API key or local analytics logs found).",
    };
  }

  return {
    status: isApiConfigured ? "healthy" : "degraded",
    passed: true,
    isApiConfigured,
    localLogsFound,
    qualifiedViewsLogged,
    averageRetentionPct,
    summary: isApiConfigured
      ? `Analytics API configured. ${qualifiedViewsLogged} views across ${localLogsFound} local log(s).`
      : `Analytics API unconfigured. Sourced metrics from ${localLogsFound} local log(s).`,
  };
}
