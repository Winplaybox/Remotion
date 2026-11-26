#!/usr/bin/env node
/**
 * Generate upcoming Unpaper daily episodes using Gemini 2.5 Flash + Google Search grounding.
 *
 * Usage:
 *   node scripts/unpaper/generate-daily.mjs [--days 2] [--max 2] [--dry]
 *
 * Env:
 *   GEMINI_API_KEY   Required
 *   GEMINI_MODEL     Optional (default: gemini-2.5-flash)
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const dailyDir = path.join(root, "content", "unpaper", "daily");
const publicDailyDir = path.join(root, "public", "unpaper", "daily");

const args = process.argv.slice(2);
const opt = (k, def) => (args.includes(k) ? args[args.indexOf(k) + 1] : def);
const dry = args.includes("--dry");
const days = Math.max(1, Number(opt("--days", "2")) || 2);
const maxCreate = Math.max(1, Number(opt("--max", "2")) || 2);
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set");
  process.exit(1);
}

const istDate = (offsetDays = 0) => {
  const now = new Date(Date.now() + 5.5 * 3600_000 + offsetDays * 86400_000);
  return now.toISOString().slice(0, 10);
};

const existingFiles = fs.existsSync(dailyDir)
  ? fs.readdirSync(dailyDir).filter((f) => /^\d{4}-\d{2}-\d{2}-(am|pm)\.json$/.test(f))
  : [];

const existingTopics = [];
for (const f of existingFiles) {
  try {
    const ep = JSON.parse(fs.readFileSync(path.join(dailyDir, f), "utf8"));
    existingTopics.push(`${ep.id}: ${ep.title} (${ep.sourceUrl})`);
  } catch {}
}

const missingSlots = [];
for (let d = 0; d <= days; d++) {
  const date = istDate(d);
  for (const slot of ["am", "pm"]) {
    // Skip today's AM if it's already past 08:30 IST
    if (d === 0 && slot === "am") {
      const istHour = new Date(Date.now() + 5.5 * 3600_000).getUTCHours();
      if (istHour >= 8) continue;
    }
    const key = `${date}-${slot}`;
    if (!fs.existsSync(path.join(dailyDir, `${key}.json`))) {
      missingSlots.push({ date, slot, key });
    }
  }
}

if (!missingSlots.length) {
  console.log("[unpaper:generate] All upcoming slots are already populated.");
  process.exit(0);
}

const targets = missingSlots.slice(0, maxCreate);
console.log(`[unpaper:generate] Missing slots: ${missingSlots.map((s) => s.key).join(", ")}. Generating: ${targets.map((s) => s.key).join(", ")}`);

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 4096 }
    })
  });
  if (!res.ok) {
    throw new Error(`Gemini API ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("\n").trim();
  const match = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (!match) throw new Error(`No JSON found in Gemini response:\n${text.slice(0, 500)}`);
  return JSON.parse(match[1]);
}

let created = 0;
for (const { date, slot, key } of targets) {
  const prompt = `You are the lead researcher and scriptwriter for "Unpaper" ("Jo document sab share karte hain, par koi padhta nahi, hum 60 sec mein padh ke batate hain").
Use Google Search to find ONE recent, high-impact, real official document from India or global tech/AI (RBI circular/draft, SEBI circular, Supreme Court order, Govt of India notification/PIB, or landmark arXiv AI paper) from the last 14 days that affects everyday Indians.

DO NOT repeat any of these already-covered topics:
${existingTopics.join("\n") || "(none)"}

Target slot: ${date} (${slot === "am" ? "09:00 IST" : "19:00 IST"})

Return ONLY a valid JSON object (wrapped in \`\`\`json ... \`\`\`) with this exact structure:
{
  "date": "${date}",
  "slot": "${slot}",
  "id": "ep-${key}-short-slug",
  "series": "Fine Print" | "Budget Decoded" | "Rule Badla",
  "title": "Catchy Hinglish title (< 90 chars)",
  "sourceUrl": "https://... (direct official document/circular/order URL)",
  "source": {
    "title": "Exact official document title",
    "date": "DD Mon YYYY",
    "issuer": "Issuing body (e.g. Reserve Bank of India / SEBI / Supreme Court of India)"
  },
  "script": {
    "hook": {
      "number": "Short punchy stat or phrase (e.g. '1 Click = Freeze')",
      "line": "3-5 word hook",
      "caption": "Roman Hinglish hook caption",
      "tts": "Devanagari Hindi narration (English tech/legal terms in Latin script are fine)",
      "seconds": 5,
      "proof": { "source": "Short issuer", "page": "Para / Page", "date": "DD Mon YYYY" }
    },
    "doc": {
      "name": "Short doc name",
      "issuer": "Issuing body",
      "date": "DD Mon YYYY",
      "image": "daily/${key}/doc-1.jpg",
      "caption": "Roman Hinglish doc intro",
      "tts": "Devanagari Hindi narration",
      "seconds": 7,
      "proof": { "source": "Short issuer", "page": "Para / Page", "date": "DD Mon YYYY" }
    },
    "points": [
      {
        "title": "Point 1 title",
        "page": "daily/${key}/doc-1.jpg",
        "box": [0.0623, 0.32, 0.83, 0.08],
        "quote": "Short verbatim English quote from the official document (1-2 sentences)",
        "decoded": "Roman Hinglish 1-line takeaway",
        "proof": { "source": "Short issuer", "page": "Para / Page", "date": "DD Mon YYYY" },
        "prop": "rupee" | "gavel" | "house" | "chart",
        "caption": "Roman Hinglish caption",
        "tts": "Devanagari Hindi narration",
        "seconds": 9
      },
      {
        "title": "Point 2 title",
        "page": "daily/${key}/doc-2.jpg",
        "box": [0.0623, 0.14, 0.83, 0.08],
        "quote": "Short verbatim English quote from the official document",
        "decoded": "Roman Hinglish 1-line takeaway",
        "proof": { "source": "Short issuer", "page": "Para / Page", "date": "DD Mon YYYY" },
        "prop": "rupee" | "gavel" | "house" | "chart",
        "caption": "Roman Hinglish caption",
        "tts": "Devanagari Hindi narration",
        "seconds": 10
      },
      {
        "title": "Point 3 title",
        "page": "daily/${key}/doc-2.jpg",
        "box": [0.0623, 0.42, 0.83, 0.08],
        "quote": "Short verbatim English quote from the official document",
        "decoded": "Roman Hinglish 1-line takeaway",
        "proof": { "source": "Short issuer", "page": "Para / Page", "date": "DD Mon YYYY" },
        "prop": "rupee" | "gavel" | "house" | "chart",
        "caption": "Roman Hinglish caption",
        "tts": "Devanagari Hindi narration",
        "seconds": 9
      }
    ],
    "asar": {
      "lines": ["3 short Roman Hinglish bullet points on personal impact"],
      "proof": { "source": "Short issuer", "page": "Para / Page", "date": "DD Mon YYYY" },
      "prop": "rupee",
      "caption": "Roman Hinglish personal impact",
      "tts": "Devanagari Hindi narration",
      "seconds": 10
    },
    "outro": {
      "caption": "Question for comments + Subscribe karo Unpaper. Poora breakdown YouTube par, slides Instagram par.",
      "tts": "Devanagari Hindi outro with comment question + Subscribe करो Unpaper",
      "seconds": 7
    }
  },
  "cta": {
    "comment": "Specific question for viewers",
    "question": "Kaunsa document decode karein? Comment karo.",
    "nextTeaser": "Next: related follow-up teaser",
    "crossPost": "Poora breakdown YouTube par / slides Instagram par"
  },
  "seo": {
    "title": "<= 100 chars ending with #shorts",
    "description": "Summary bullets + Official source URL + Instagram/FB links + #shorts",
    "tags": ["8-14 relevant English + Hindi tags", "Unpaper"],
    "caption": "Instagram/Facebook Reels caption with emojis + hashtags",
    "categoryId": "27",
    "language": "hi"
  },
  "pinnedComment": "Official Source: <url>\\nAgla kaunsa document decode karein? Comment karo 👇"
}

Rules:
- Every "tts" field MUST contain Devanagari Hindi script (English technical terms in Latin are fine).
- Every "proof" field must have non-empty source, page, and date.
- "seo.title" must be <= 100 chars.
- "id" must match /^[a-z0-9][a-z0-9-]*$/.`;

  const ep = await callGemini(prompt);
  ep.date = date;
  ep.slot = slot;
  ep.id = ep.id.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  ep.seo.title = `${ep.seo.title}`.slice(0, 100);

  const outJson = path.join(dailyDir, `${key}.json`);
  const outImgDir = path.join(publicDailyDir, key);

  if (dry) {
    console.log(`[dry] Would write ${outJson} (${ep.title})`);
    continue;
  }

  fs.mkdirSync(dailyDir, { recursive: true });
  fs.writeFileSync(outJson, JSON.stringify(ep, null, 2) + "\n");

  const py = process.env.PYTHON || "python";
  const boxesJson = execFileSync(
    py,
    [path.join(root, "scripts", "unpaper", "render-pages.py"), "--input", outJson, "--out-dir", outImgDir],
    { encoding: "utf8" }
  ).trim();
  const boxes = JSON.parse(boxesJson);
  ep.script.doc.image = `daily/${key}/doc-1.jpg`;
  ep.script.points[0].page = `daily/${key}/doc-1.jpg`;
  ep.script.points[0].box = boxes.p1;
  ep.script.points[1].page = `daily/${key}/doc-2.jpg`;
  ep.script.points[1].box = boxes.p2;
  ep.script.points[2].page = `daily/${key}/doc-2.jpg`;
  ep.script.points[2].box = boxes.p3;

  fs.writeFileSync(outJson, JSON.stringify(ep, null, 2) + "\n");
  existingTopics.push(`${ep.id}: ${ep.title} (${ep.sourceUrl})`);
  created++;
  console.log(`[unpaper:generate] Created ${key}.json -> ${ep.title}`);
}

if (!dry && created > 0) {
  execFileSync("node", [path.join(root, "scripts", "unpaper", "index-daily.mjs")], { stdio: "inherit" });
}
