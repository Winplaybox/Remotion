/**
 * SEO Audit Module
 * Validates YouTube titles (under 100 chars), hashtags, and description metadata across content items.
 * Performs duplicate title detection and never returns manufactured metrics.
 */

import * as fs from "fs";
import * as path from "path";
import { VideoContentSchema, VideoContent } from "../schemas/video";

export interface SeoAuditResult {
  status: "healthy" | "degraded" | "not_configured" | "failed";
  passed: boolean;
  totalVideosScanned: number;
  validSeoCount: number;
  invalidSeoCount: number;
  duplicateTitles: string[];
  issues: Array<{ file: string; issues: string[] }>;
  summary: string;
}

export async function runSeoAudit(): Promise<SeoAuditResult> {
  console.log("[SEO Audit] Starting authentic SEO metadata audit...");

  const contentDirs = [
    path.resolve(process.cwd(), "content/approved"),
    path.resolve(process.cwd(), "content/storyboards"),
    path.resolve(process.cwd(), "content/scripts"),
  ];

  const seenTitles = new Map<string, string>();
  const duplicateTitles: string[] = [];
  const issues: Array<{ file: string; issues: string[] }> = [];

  let totalVideosScanned = 0;
  let validSeoCount = 0;
  let invalidSeoCount = 0;

  for (const dir of contentDirs) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      totalVideosScanned++;
      const fullPath = path.join(dir, file);

      try {
        const rawContent = fs.readFileSync(fullPath, "utf-8");
        const parsedJson = JSON.parse(rawContent);

        // Check if file is a VideoContent item
        const parseResult = VideoContentSchema.safeParse(parsedJson);
        if (!parseResult.success) {
          // If not full video content, check if it has an seo object
          if (parsedJson && typeof parsedJson === "object" && "seo" in parsedJson) {
            const seoIssues = validateSeoObject(parsedJson.seo, file);
            if (seoIssues.length > 0) {
              invalidSeoCount++;
              issues.push({ file, issues: seoIssues });
            } else {
              validSeoCount++;
              checkDuplicate(parsedJson.seo.youtubeTitle, file);
            }
          } else {
            invalidSeoCount++;
            issues.push({
              file,
              issues: ["File does not conform to VideoContentSchema and lacks SEO object."],
            });
          }
          continue;
        }

        const video: VideoContent = parseResult.data;
        const seoIssues = validateSeoObject(video.seo, file);

        if (seoIssues.length > 0) {
          invalidSeoCount++;
          issues.push({ file, issues: seoIssues });
        } else {
          validSeoCount++;
          checkDuplicate(video.seo.youtubeTitle, file);
        }
      } catch (err: unknown) {
        invalidSeoCount++;
        issues.push({
          file,
          issues: [(err as Error).message || "JSON parse error"],
        });
      }
    }
  }

  function validateSeoObject(seo: { youtubeTitle?: string; instagramCaption?: string; hashtags?: string[] }, file: string): string[] {
    const list: string[] = [];
    if (!seo.youtubeTitle || typeof seo.youtubeTitle !== "string") {
      list.push("Missing or invalid youtubeTitle");
    } else {
      if (seo.youtubeTitle.length < 5) list.push(`youtubeTitle too short (${seo.youtubeTitle.length} < 5 chars)`);
      if (seo.youtubeTitle.length > 100) list.push(`youtubeTitle exceeds YouTube 100-char limit (${seo.youtubeTitle.length} chars)`);
    }

    if (!seo.instagramCaption || typeof seo.instagramCaption !== "string") {
      list.push("Missing or invalid instagramCaption");
    } else {
      if (seo.instagramCaption.length > 2200) list.push(`instagramCaption exceeds 2200-char limit`);
    }

    if (!Array.isArray(seo.hashtags) || seo.hashtags.length < 3) {
      list.push(`Hashtags array must contain at least 3 items (found ${Array.isArray(seo.hashtags) ? seo.hashtags.length : 0})`);
    } else {
      for (const tag of seo.hashtags) {
        if (!tag.startsWith("#")) {
          list.push(`Hashtag "${tag}" must begin with '#'`);
        }
      }
    }

    return list;
  }

  function checkDuplicate(title: string, file: string) {
    if (!title) return;
    const normalized = title.trim().toLowerCase();
    if (seenTitles.has(normalized)) {
      duplicateTitles.push(`Duplicate title "${title}" in ${file} (previously in ${seenTitles.get(normalized)})`);
    } else {
      seenTitles.set(normalized, file);
    }
  }

  if (totalVideosScanned === 0) {
    return {
      status: "not_configured",
      passed: false,
      totalVideosScanned: 0,
      validSeoCount: 0,
      invalidSeoCount: 0,
      duplicateTitles: [],
      issues: [],
      summary: "No content or video files found across content/ directories. SEO audit skipped.",
    };
  }

  const passed = invalidSeoCount === 0 && duplicateTitles.length === 0;
  const status = !passed ? "failed" : "healthy";

  return {
    status,
    passed,
    totalVideosScanned,
    validSeoCount,
    invalidSeoCount,
    duplicateTitles,
    issues,
    summary: passed
      ? `SEO audit passed for all ${validSeoCount} scanned file(s).`
      : `SEO audit failed: ${invalidSeoCount} invalid file(s), ${duplicateTitles.length} duplicate title(s).`,
  };
}
