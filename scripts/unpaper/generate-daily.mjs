#!/usr/bin/env node
/**
 * Generate upcoming Unpaper daily episodes from real official RSS/Atom feeds
 * using GitHub Models (GITHUB_TOKEN, free in Actions) or Gemini API (GEMINI_API_KEY).
 *
 * Usage:
 *   node scripts/unpaper/generate-daily.mjs [--days 2] [--max 2] [--dry]
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

const ghToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const ghModel = process.env.GH_MODELS_MODEL || "gpt-4o-mini";
const geminiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";

if (!ghToken && !geminiKey) {
  console.error("Neither GITHUB_TOKEN nor GEMINI_API_KEY is set");
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
const usedUrls = new Set();
for (const f of existingFiles) {
  try {
    const ep = JSON.parse(fs.readFileSync(path.join(dailyDir, f), "utf8"));
    existingTopics.push(`${ep.id}: ${ep.title} (${ep.sourceUrl})`);
    if (ep.sourceUrl) usedUrls.add(ep.sourceUrl);
  } catch {}
}

const missingSlots = [];
for (let d = 0; d <= days; d++) {
  const date = istDate(d);
  for (const slot of ["am", "pm"]) {
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

const FEEDS = [
  { issuer: "Reserve Bank of India", series: "Rule Badla", url: "https://www.rbi.org.in/pressreleases_rss.xml" },
  { issuer: "Press Information Bureau (Govt of India)", series: "Fine Print", url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3" },
  { issuer: "LiveLaw (Supreme Court / High Court)", series: "Fine Print", url: "https://www.livelaw.in/rss/top-stories" },
  { issuer: "arXiv AI Research", series: "Fine Print", url: "https://export.arxiv.org/rss/cs.AI" }
];

const stripXml = (s = "") =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

async function fetchFeedItems() {
  const items = [];
  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, { headers: { "User-Agent": "UnpaperBot/1.0" }, signal: AbortSignal.timeout(12000) });
      if (!res.ok) continue;
      const xml = await res.text();
      for (const m of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
        const block = m[1];
        const title = stripXml(block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
        const link = stripXml(block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]);
        const desc = stripXml(block.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1]);
        const pubDate = stripXml(block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]);
        if (title && link && /^https?:\/\//.test(link) && !usedUrls.has(link)) {
          items.push({ issuer: feed.issuer, series: feed.series, title, link, desc: desc.slice(0, 700), pubDate });
        }
        if (items.length >= 24) break;
      }
    } catch (e) {
      console.warn(`[unpaper:generate] Feed skip (${feed.issuer}): ${e.message}`);
    }
  }
  return items;
}

async function fetchPageSnippet(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(12000) });
    if (!res.ok) return "";
    const text = await res.text();
    return text
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3500);
  } catch {
    return "";
  }
}

async function callLLM(prompt, fallbackEp) {
  if (ghToken) {
    try {
      const res = await fetch("https://models.inference.ai.azure.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ghToken}`
        },
        body: JSON.stringify({
          model: ghModel,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
          max_tokens: 3500
        })
      });
      const raw = await res.text();
      if (res.ok) {
        const data = JSON.parse(raw);
        const text = data.choices?.[0]?.message?.content || "";
        const match = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
        if (match) return JSON.parse(match[1]);
      } else {
        console.warn(`[unpaper:generate] GitHub Models ${res.status}: ${raw.slice(0, 300)}`);
      }
    } catch (e) {
      console.warn(`[unpaper:generate] GitHub Models error: ${e.message}`);
    }
  }

  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 4096 }
        })
      });
      const raw = await res.text();
      if (res.ok) {
        const data = JSON.parse(raw);
        const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("\n").trim();
        const match = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
        if (match) return JSON.parse(match[1]);
      } else {
        console.warn(`[unpaper:generate] Gemini API ${res.status}: ${raw.slice(0, 300)}`);
      }
    } catch (e) {
      console.warn(`[unpaper:generate] Gemini API error: ${e.message}`);
    }
  }

  console.warn("[unpaper:generate] Using deterministic official-source fallback.");
  return fallbackEp;
}

const candidates = await fetchFeedItems();
if (!candidates.length) {
  console.error("[unpaper:generate] No fresh RSS items found.");
  process.exit(1);
}

const targets = missingSlots.slice(0, maxCreate);
console.log(`[unpaper:generate] Missing slots: ${missingSlots.map((s) => s.key).join(", ")}. Generating: ${targets.map((s) => s.key).join(", ")}`);

let created = 0;
for (let i = 0; i < targets.length; i++) {
  const { date, slot, key } = targets[i];
  const pick = candidates.find((c) => !usedUrls.has(c.link));
  if (!pick) break;
  usedUrls.add(pick.link);

  const pageText = await fetchPageSnippet(pick.link);
  const sourceContext = `Issuer: ${pick.issuer}
Title: ${pick.title}
Date: ${pick.pubDate || date}
URL: ${pick.link}
Summary: ${pick.desc}
Extracted text: ${pageText || pick.desc}`;

  const prompt = `Act as a top 0.1% YouTube Strategist, Viral Scriptwriter, and Packaging Director (combining MrBeast for retention, Fireship for pacing, and vidIQ for data-backed packaging) for "Unpaper" ("Jo document sab share karte hain, par koi padhta nahi, hum 60 sec mein padh ke batate hain").
Target audience: Indian Gen-Z & working professionals (Hinglish).

Execute this 5-PHASE VIRAL BLUEPRINT internally on the official document below, and output ONLY the final improved JSON:
- PHASE 1 (Outlier Angle): Identify why generic explainers get swiped away, and pick 1 urgent, high-curiosity Outlier Angle ("how this hits your wallet/rights/career").
- PHASE 2 (High-CTR Packaging): Brainstorm 3 curiosity-gap titles strictly under 55 chars (no fake clickbait) and pick the strongest one for "seo.title" (append " #shorts" only if it stays <= 55 chars, otherwise keep <= 55 chars).
- PHASE 3 (Retention & Pacing):
  - 0-3s Hook: Zero intro, zero "Hey guys". Open with a pattern-interrupt stat or urgent claim.
  - Body: Short, punchy sentences (every beat drives a 3-5s visual cue).
  - 40-50% Mid-Video Re-Hook (Point 2): Start Point 2 with a twist/re-hook ("Lekin ruko, asli twist toh abhi baaki hai...").
  - Seamless Loop Ending (outro): Write the last line of outro so it loops smoothly back into the hook's theme + clear reason to subscribe at the 70% mark ("asar"/"outro").
- PHASE 4 (Engagement & SEO): 1-word or polarizing question in "pinnedComment", 3-line SEO-rich "seo.description", and 5 targeted hashtags (2 broad + 3 niche).
- PHASE 5 (Viral Stress-Test): Mentally score Clickability, Retention, and Shareability out of 10, fix the single weakest beat, and output the polished JSON.

Strictly ground every quote, number, and date in this official source (never invent facts):
${sourceContext}

Target slot: ${date} (${slot === "am" ? "09:00 IST" : "19:00 IST"})

Return ONLY a valid JSON object (wrapped in \`\`\`json ... \`\`\`) with this exact structure:
{
  "date": "${date}",
  "slot": "${slot}",
  "id": "ep-${key}-short-slug",
  "series": "${pick.series}",
  "title": "Catchy Hinglish title (< 55 chars)",
  "sourceUrl": "${pick.link}",
  "source": {
    "title": "${pick.title.replace(/"/g, '\\"')}",
    "date": "${date}",
    "issuer": "${pick.issuer}"
  },
  "script": {
    "hook": {
      "number": "Short punchy stat or 2-3 word hook",
      "line": "3-5 word hook",
      "caption": "Roman Hinglish hook caption",
      "tts": "Devanagari Hindi narration (English tech/legal terms in Latin script are fine)",
      "seconds": 5,
      "proof": { "source": "${pick.issuer}", "page": "Doc · Summary", "date": "${date}" }
    },
    "doc": {
      "name": "Short doc name",
      "issuer": "${pick.issuer}",
      "date": "${date}",
      "image": "daily/${key}/doc-1.jpg",
      "caption": "Roman Hinglish doc intro",
      "tts": "Devanagari Hindi narration",
      "seconds": 7,
      "proof": { "source": "${pick.issuer}", "page": "Doc · Header", "date": "${date}" }
    },
    "points": [
      {
        "title": "Point 1 title",
        "page": "daily/${key}/doc-1.jpg",
        "box": [0.0623, 0.32, 0.83, 0.08],
        "quote": "Short verbatim English quote from the source text (1-2 sentences)",
        "decoded": "Roman Hinglish 1-line takeaway",
        "proof": { "source": "${pick.issuer}", "page": "Point 1", "date": "${date}" },
        "prop": "rupee",
        "caption": "Roman Hinglish caption",
        "tts": "Devanagari Hindi narration",
        "seconds": 9
      },
      {
        "title": "Point 2 title",
        "page": "daily/${key}/doc-2.jpg",
        "box": [0.0623, 0.14, 0.83, 0.08],
        "quote": "Short verbatim English quote from the source text",
        "decoded": "Roman Hinglish 1-line takeaway",
        "proof": { "source": "${pick.issuer}", "page": "Point 2", "date": "${date}" },
        "prop": "chart",
        "caption": "Roman Hinglish caption",
        "tts": "Devanagari Hindi narration",
        "seconds": 10
      },
      {
        "title": "Point 3 title",
        "page": "daily/${key}/doc-2.jpg",
        "box": [0.0623, 0.42, 0.83, 0.08],
        "quote": "Short verbatim English quote from the source text",
        "decoded": "Roman Hinglish 1-line takeaway",
        "proof": { "source": "${pick.issuer}", "page": "Point 3", "date": "${date}" },
        "prop": "gavel",
        "caption": "Roman Hinglish caption",
        "tts": "Devanagari Hindi narration",
        "seconds": 9
      }
    ],
    "asar": {
      "lines": ["3 short Roman Hinglish bullet points on personal impact"],
      "proof": { "source": "${pick.issuer}", "page": "Impact", "date": "${date}" },
      "prop": "rupee",
      "caption": "Roman Hinglish personal impact",
      "tts": "Devanagari Hindi narration",
      "seconds": 10
    },
    "outro": {
      "caption": "Kaunsa document decode karein? Comment karo. Subscribe karo Unpaper. Poora breakdown YouTube par, slides Instagram par.",
      "tts": "कौन सा document decode करें? Comment करो. Subscribe करो Unpaper. पूरा breakdown YouTube पर, slides Instagram पर.",
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
  "pinnedComment": "Official Source: ${pick.link}\\nAgla kaunsa document decode karein? Comment karo 👇"
}

Rules:
- Every "tts" field MUST contain Devanagari Hindi script (English technical terms in Latin are fine).
- Every "proof" field must have non-empty source, page, and date.
- "seo.title" must be <= 100 chars.
- "id" must match /^[a-z0-9][a-z0-9-]*$/.`;

  const sents = (pageText || pick.desc || pick.title)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 35 && s.length < 240);
  const q1 = sents[0] || pick.title;
  const q2 = sents[1] || pick.desc.slice(0, 180) || pick.title;
  const q3 = sents[2] || sents[0] || pick.title;
  const fallbackEp = {
    date,
    slot,
    id: `ep-${key}`,
    series: pick.series,
    title: pick.title.slice(0, 90),
    sourceUrl: pick.link,
    source: { title: pick.title, date, issuer: pick.issuer },
    script: {
      hook: {
        number: "Official Update",
        line: pick.issuer,
        caption: `${pick.issuer} ka naya official update: ${pick.title.slice(0, 75)}.`,
        tts: `${pick.issuer} का नया official update आया है. ${pick.title.slice(0, 75)}.`,
        seconds: 5,
        proof: { source: pick.issuer, page: "Doc · Summary", date }
      },
      doc: {
        name: pick.title.slice(0, 50),
        issuer: pick.issuer,
        date,
        image: `daily/${key}/doc-1.jpg`,
        caption: `Official document: ${pick.title.slice(0, 90)}.`,
        tts: `यह official document ${pick.issuer} की तरफ से जारी किया गया है.`,
        seconds: 7,
        proof: { source: pick.issuer, page: "Doc · Header", date }
      },
      points: [
        {
          title: "Key Point 1",
          page: `daily/${key}/doc-1.jpg`,
          box: [0.0623, 0.32, 0.83, 0.08],
          quote: q1,
          decoded: q1.slice(0, 85),
          proof: { source: pick.issuer, page: "Point 1", date },
          prop: "rupee",
          caption: `Point 1: ${q1.slice(0, 110)}`,
          tts: `पहला ज़रूरी point. ${q1.slice(0, 110)}`,
          seconds: 9
        },
        {
          title: "Key Point 2",
          page: `daily/${key}/doc-2.jpg`,
          box: [0.0623, 0.14, 0.83, 0.08],
          quote: q2,
          decoded: q2.slice(0, 85),
          proof: { source: pick.issuer, page: "Point 2", date },
          prop: "chart",
          caption: `Point 2: ${q2.slice(0, 110)}`,
          tts: `दूसरा ज़रूरी point. ${q2.slice(0, 110)}`,
          seconds: 10
        },
        {
          title: "Key Point 3",
          page: `daily/${key}/doc-2.jpg`,
          box: [0.0623, 0.42, 0.83, 0.08],
          quote: q3,
          decoded: q3.slice(0, 85),
          proof: { source: pick.issuer, page: "Point 3", date },
          prop: "gavel",
          caption: `Point 3: ${q3.slice(0, 110)}`,
          tts: `तीसरा ज़रूरी point. ${q3.slice(0, 110)}`,
          seconds: 9
        }
      ],
      asar: {
        lines: [
          `Official source: ${pick.issuer}`,
          "Full verified link description mein hai",
          "Agla document kaunsa decode karein? Comment karo"
        ],
        proof: { source: pick.issuer, page: "Impact", date },
        prop: "rupee",
        caption: `Aap par asar: ${pick.issuer} ke is update ka poora source link description mein diya gaya hai.`,
        tts: `आप पर असर. ${pick.issuer} के इस update का पूरा source link description में दिया गया है.`,
        seconds: 10
      },
      outro: {
        caption: "Kaunsa document decode karein? Comment karo. Subscribe karo Unpaper. Poora breakdown YouTube par, slides Instagram par.",
        tts: "कौन सा document decode करें? Comment करो. Subscribe करो Unpaper. पूरा breakdown YouTube पर, slides Instagram पर.",
        seconds: 7
      }
    },
    cta: {
      comment: "Kaunsa document decode karein? Comment karo.",
      question: "Kaunsa document decode karein? Comment karo.",
      nextTeaser: "Next: naya official document breakdown",
      crossPost: "Poora breakdown YouTube par / slides Instagram par"
    },
    seo: {
      title: `${pick.title.slice(0, 82)} | Unpaper #shorts`.slice(0, 100),
      description: `${pick.title}\n\nOfficial Source: ${pick.link}\n\nUnpaper — Decode What Matters.\n#Unpaper #shorts`,
      tags: ["Unpaper", pick.issuer, "India news", "official update", "shorts"],
      caption: `${pick.title}\n\nOfficial Source: ${pick.link}\n#Unpaper #reels`,
      categoryId: "27",
      language: "hi"
    },
    pinnedComment: `Official Source: ${pick.link}\nAgla kaunsa document decode karein? Comment karo 👇`
  };

  const ep = await callLLM(prompt, fallbackEp);
  ep.date = date;
  ep.slot = slot;
  ep.sourceUrl = pick.link;
  ep.id = (ep.id || `ep-${key}`).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
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
