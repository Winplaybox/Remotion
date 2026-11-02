import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runResearchAudit } from "../automation/research-audit";
import { runSeoAudit } from "../automation/seo-audit";
import { runAnalyticsAudit } from "../automation/analytics-audit";
import { runAudit } from "../automation/daily-orchestrator";

describe("Phase 1: Audit Integrity & Honest Metrics", () => {
  it("research audit should report not_configured and passed=false when registry is empty", async () => {
    const result = await runResearchAudit();
    assert.equal(typeof result.passed, "boolean");
    assert.equal(typeof result.totalDocuments, "number");
    assert.equal(typeof result.summary, "string");

    // Since research/registry is currently empty, it must not fabricate a healthy passing state
    if (result.totalDocuments === 0) {
      assert.equal(result.status, "not_configured");
      assert.equal(result.passed, false);
      assert.match(result.summary, /No research documents found/);
    }
  });

  it("seo audit should report not_configured when no content files exist", async () => {
    const result = await runSeoAudit();
    assert.equal(typeof result.passed, "boolean");
    assert.equal(typeof result.totalVideosScanned, "number");

    if (result.totalVideosScanned === 0) {
      assert.equal(result.status, "not_configured");
      assert.equal(result.passed, false);
      assert.match(result.summary, /No content or video files found/);
    }
  });

  it("analytics audit should report not_configured when no API key or local logs exist", async () => {
    // Clear keys temporarily if any
    const originalKey = process.env.YOUTUBE_API_KEY;
    delete process.env.YOUTUBE_API_KEY;

    try {
      const result = await runAnalyticsAudit();
      assert.equal(typeof result.isApiConfigured, "boolean");
      if (!result.isApiConfigured && result.localLogsFound === 0) {
        assert.equal(result.status, "not_configured");
        assert.equal(result.passed, false);
        assert.equal(result.averageRetentionPct, null);
      }
    } finally {
      if (originalKey) process.env.YOUTUBE_API_KEY = originalKey;
    }
  });

  it("daily orchestrator should aggregate real audit states and write a report", async () => {
    const report = await runAudit("full");
    assert.ok(report.timestamp);
    assert.ok(["healthy", "degraded", "not_configured", "failed"].includes(report.systemHealth));
    assert.ok(report.summary.length > 0);
    assert.equal(typeof report.topics.totalTopics, "number");
    assert.equal(typeof report.contentPipeline.readyToRenderCount, "number");
  });
});
