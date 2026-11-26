#!/usr/bin/env node
/**
 * MindNest Tales — 5-Phase Viral Blueprint Fable Generator
 *
 * Generates a new Chintu & Rani fable across the 8 active MindNest languages
 * (hi, es, ar, de, ja, ko, fil, vi — excluding disabled en, pt, fr) using the
 * 5-Phase Viral Blueprint (Outlier Angle, <55-char CTR packaging, 0-3s hook +
 * 40-50% mid-story twist + visual cues, SEO/IG/FB metadata, and Viral Stress-Test),
 * plus image prompts for MindNest V2 art plates.
 *
 * Usage:
 *   node scripts/mindnest/generate-fable.mjs --topic "Chintu learns why sharing beats hoarding" [--out fable-draft.json]
 */
import fs from "node:fs";
import path from "node:path";

const ACTIVE_LANGS = ["hi", "es", "ar", "de", "ja", "ko", "fil", "vi"];
const args = process.argv.slice(2);
const opt = (k, def) => (args.includes(k) ? args[args.indexOf(k) + 1] : def);
const topic = opt("--topic", "Chintu discovers a glowing stone in the forest and learns why honesty beats a quick shortcut");
const outPath = opt("--out", "");

const geminiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const ghToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const ghModel = process.env.GH_MODELS_MODEL || "gpt-4o-mini";

const prompt = `Act as a top 0.1% YouTube Strategist, Viral Scriptwriter, and Packaging Director for "MindNest Tales" (kid-safe, parent-approved 60-second animated bedtime fables starring Chintu the cheetah cub and his mother Rani).

Topic / Moral: ${topic}
Active languages (${ACTIVE_LANGS.length}): ${ACTIVE_LANGS.join(", ")} (Note: en, pt, fr are disabled).
COPPA rule: YouTube comments are disabled for Made-for-Kids videos, so never ask viewers to comment on YouTube; instead use a "see you tomorrow" curiosity cliffhanger for retention + Instagram/Facebook Reels captions for parent engagement.

Execute the 5-PHASE VIRAL BLUEPRINT in order and return ONLY a valid JSON object (wrapped in \`\`\`json ... \`\`\`):
{
  "phase1_outlierAngle": {
    "whyGenericFails": "...",
    "outlierAngle": "..."
  },
  "phase2_packaging": {
    "titlesUnder55Chars": ["...", "...", "..."],
    "bestTitle": "<= 55 chars",
    "thumbnailConcept": { "layout": "...", "max3Words": "..." }
  },
  "phase3_scriptAndVisuals": {
    "hook_0_3s": "...",
    "pages": [
      { "page": 1, "beat": "Once upon a time + pattern interrupt", "visualCue": "...", "motion": "hop|slide|rise|drop" },
      { "page": 2, "beat": "Problem / mistake", "visualCue": "...", "motion": "hop|slide|rise|drop" },
      { "page": 3, "beat": "40-50% Mid-Video Re-Hook / Twist", "visualCue": "...", "motion": "hop|slide|rise|drop" },
      { "page": 4, "beat": "Resolution + seamless loop / tomorrow teaser", "visualCue": "...", "motion": "hop|slide|rise|drop" }
    ]
  },
  "phase4_engagementAndSeo": {
    "parentReelsQuestion": "1-word or polarizing question for Instagram/Facebook Reels caption",
    "seoDescription3Lines": "...",
    "hashtags5": ["#...", "#...", "#...", "#...", "#..."]
  },
  "phase5_viralStressTest": {
    "clickability": 9,
    "retention": 9,
    "shareability": 9,
    "weakestPart": "...",
    "appliedFix": "..."
  },
  "v2ArtPrompts": {
    "plates": ["4 calm-top-30% Storybook Classic background plate prompts (no characters)"],
    "poses": ["Character cut-out pose descriptions using storybook-classic/characters.png as reference"]
  },
  "translations": {
    "hi": { "title": "<= 55 chars", "pages": ["p1", "p2", "p3", "p4"], "moral": "..." },
    "es": { "title": "<= 55 chars", "pages": ["p1", "p2", "p3", "p4"], "moral": "..." },
    "ar": { "title": "<= 55 chars", "pages": ["p1", "p2", "p3", "p4"], "moral": "..." },
    "de": { "title": "<= 55 chars", "pages": ["p1", "p2", "p3", "p4"], "moral": "..." },
    "ja": { "title": "<= 55 chars", "pages": ["p1", "p2", "p3", "p4"], "moral": "..." },
    "ko": { "title": "<= 55 chars", "pages": ["p1", "p2", "p3", "p4"], "moral": "..." },
    "fil": { "title": "<= 55 chars", "pages": ["p1", "p2", "p3", "p4"], "moral": "..." },
    "vi": { "title": "<= 55 chars", "pages": ["p1", "p2", "p3", "p4"], "moral": "..." }
  }
}`;

async function run() {
  if (!geminiKey && !ghToken) {
    console.error("Set GEMINI_API_KEY or GITHUB_TOKEN to generate a MindNest fable.");
    process.exit(1);
  }
  let rawText = "";
  if (geminiKey) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 4096 } })
    });
    if (res.ok) {
      const data = await res.json();
      rawText = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("\n");
    }
  }
  if (!rawText && ghToken) {
    const res = await fetch("https://models.inference.ai.azure.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ghToken}` },
      body: JSON.stringify({ model: ghModel, messages: [{ role: "user", content: prompt }], temperature: 0.6, max_tokens: 4000 })
    });
    if (res.ok) {
      const data = await res.json();
      rawText = data.choices?.[0]?.message?.content || "";
    }
  }
  const match = rawText.match(/```json\s*([\s\S]*?)```/) || rawText.match(/(\{[\s\S]*\})/);
  if (!match) {
    console.error("Failed to generate JSON from LLM.");
    process.exit(1);
  }
  const parsed = JSON.parse(match[1]);
  const pretty = JSON.stringify(parsed, null, 2) + "\n";
  if (outPath) {
    fs.writeFileSync(path.resolve(outPath), pretty);
    console.log(`[mindnest:generate] Wrote ${outPath}`);
  } else {
    console.log(pretty);
  }
}

run();
