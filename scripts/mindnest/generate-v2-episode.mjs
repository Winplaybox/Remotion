#!/usr/bin/env node
/**
 * MindNest V2 Autopilot — generates the next MindNest V2 episode (Option B: Storybook Classic)
 * using the 5-Phase Viral Blueprint across all 8 active languages (hi, es, ar, de, ja, ko, fil, vi),
 * generates 4 bespoke Storybook Classic background plates, wires character cut-outs + art.ts,
 * and appends new fables to content/mindnest/fables.ts when needed.
 *
 * Usage:
 *   node scripts/mindnest/generate-v2-episode.mjs [--count 1] [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const fablesPath = path.join(root, "content", "mindnest", "fables.ts");
const artPath = path.join(root, "engines", "story-visual-v2", "src", "episode", "art.ts");
const styleDir = path.join(root, "public", "mindnest-v2", "storybook-classic");
const fable1Dir = path.join(styleDir, "fable-1");

const args = process.argv.slice(2);
const opt = (k, def) => (args.includes(k) ? args[args.indexOf(k) + 1] : def);
const dry = args.includes("--dry");
const count = Math.max(1, Number(opt("--count", "1")) || 1);

const geminiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const ALL_LANGS = ["hi", "es", "ar", "de", "ja", "ko", "fil", "en", "pt", "fr", "vi"];

function existingArtNumbers() {
  const src = fs.readFileSync(artPath, "utf8");
  const m = src.match(/"storybook-classic":\s*\{([^}]*)\}/);
  if (!m) return [1];
  return [...m[1].matchAll(/(\d+)\s*:/g)].map((x) => Number(x[1]));
}

function existingFableIds() {
  const src = fs.readFileSync(fablesPath, "utf8");
  return [...src.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
}

async function generateViralFable(nextN, usedIds) {
  if (!geminiKey) throw new Error("GEMINI_API_KEY is required to generate a new MindNest fable");
  const prompt = `Act as a top 0.1% YouTube Strategist, Viral Scriptwriter, and Packaging Director for "MindNest Tales" (60-second animated bedtime fables starring Chintu the cheetah cub and his mother Rani).
Create Fable #${nextN} — an ORIGINAL, high-curiosity, emotionally gripping animal fable (NOT repeating: ${usedIds.join(", ")}).

Apply the 5-PHASE VIRAL BLUEPRINT internally before outputting JSON:
- PHASE 1 (Outlier Angle): Pick a surprising, relatable dilemma (e.g. a glowing shortcut, an unexpected friendship, a secret test of honesty/courage/kindness).
- PHASE 2 (CTR Packaging): Titles strictly <= 55 chars (2 short lines for the title card, e.g. ["चिंटू और", "जादुई पत्थर"]).
- PHASE 3 (Retention & Pacing):
  - s[0] (0-3s Hook): Zero slow intro! Open immediately with a vivid, intriguing moment.
  - s[1]: Chintu's mistake or bold attempt.
  - s[2] (40-50% Mid-Video Re-Hook): Unexpected twist ("Lekin tabhi kuch ajeeb hua...").
  - s[3]: Warm resolution + cliffhanger/return energy leading into the moral.
- PHASE 4 & 5: Ensure every line is crisp, spoken-friendly, and stress-tested for retention & parent sharing.

Return ONLY valid JSON wrapped in \`\`\`json ... \`\`\`:
{
  "id": "unique-kebab-slug",
  "platePrompts": [
    "Storybook Classic warm hand-painted watercolor & gouache forest background, NO characters, calm soft sky in top 30% for headline, scene 1 setting, vertical 9:16",
    "Storybook Classic warm hand-painted watercolor & gouache forest background, NO characters, calm soft sky in top 30% for headline, scene 2 setting, vertical 9:16",
    "Storybook Classic warm hand-painted watercolor & gouache forest background, NO characters, calm soft sky in top 30% for headline, scene 3 dramatic twist setting, vertical 9:16",
    "Storybook Classic warm hand-painted watercolor & gouache forest background, NO characters, calm soft sky in top 30% for headline, scene 4 golden resolution setting, vertical 9:16"
  ],
  "text": {
    "hi": { "title": ["line1", "line2"], "moral": ["line1", "line2"], "s": ["s1", "s2", "s3", "s4"] },
    "es": { "title": ["line1", "line2"], "moral": ["line1", "line2"], "s": ["s1", "s2", "s3", "s4"] },
    "ar": { "title": ["line1", "line2"], "moral": ["line1", "line2"], "s": ["s1", "s2", "s3", "s4"] },
    "de": { "title": ["line1", "line2"], "moral": ["line1", "line2"], "s": ["s1", "s2", "s3", "s4"] },
    "ja": { "title": ["line1", "line2"], "moral": ["line1", "line2"], "s": ["s1", "s2", "s3", "s4"] },
    "ko": { "title": ["line1", "line2"], "moral": ["line1", "line2"], "s": ["s1", "s2", "s3", "s4"] },
    "fil": { "title": ["line1", "line2"], "moral": ["line1", "line2"], "s": ["s1", "s2", "s3", "s4"] },
    "vi": { "title": ["line1", "line2"], "moral": ["line1", "line2"], "s": ["s1", "s2", "s3", "s4"] },
    "en": { "title": ["line1", "line2"], "moral": ["line1", "line2"], "s": ["s1", "s2", "s3", "s4"] },
    "pt": { "title": ["line1", "line2"], "moral": ["line1", "line2"], "s": ["s1", "s2", "s3", "s4"] },
    "fr": { "title": ["line1", "line2"], "moral": ["line1", "line2"], "s": ["s1", "s2", "s3", "s4"] }
  }
}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 4096 } })
  });
  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const raw = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("\n");
  const match = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/);
  if (!match) throw new Error("No JSON in Gemini response");
  return JSON.parse(match[1]);
}

async function generatePlateImage(promptText, outJpg, fallbackSrc) {
  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instances: [{ prompt: promptText }], parameters: { sampleCount: 1, aspectRatio: "9:16" } })
        }
      );
      if (res.ok) {
        const j = await res.json();
        const b64 = j.predictions?.[0]?.bytesBase64Encoded;
        if (b64) {
          const tmpPng = outJpg.replace(/\.jpg$/, ".png");
          fs.writeFileSync(tmpPng, Buffer.from(b64, "base64"));
          execFileSync("python", ["-c", `from PIL import Image; im=Image.open(${JSON.stringify(tmpPng)}).convert('RGB').resize((1080,1920)); im.save(${JSON.stringify(outJpg)}, quality=88)`]);
          fs.unlinkSync(tmpPng);
          return;
        }
      }
    } catch (e) {
      console.warn(`[mindnest:v2] Imagen skip (${e.message}), using stylized fallback plate`);
    }
  }
  fs.copyFileSync(fallbackSrc, outJpg);
}

function appendFableToTs(fable) {
  let src = fs.readFileSync(fablesPath, "utf8");
  const block = `  ,{
    id: ${JSON.stringify(fable.id)},
    skies: [DAY, DAY, DUSK, DAY, DAY], night: [false, false, false, false, false],
    scenes: [
      () => [...meadow(), RANI(330, 1560), CHINTU(700, 1580)],
      () => [...meadow(), CHINTU(460, 1580, "proud")],
      () => [...meadow(), CHINTU(540, 1580, "sad"), RANI(280, 1560)],
      () => [...meadow(), RANI(320, 1560), CHINTU(680, 1580, "happy")],
      () => [...meadow(), RANI(260, 1580), CHINTU(820, 1600), P("moralCard", 540, 1020, { depth: 0.8, at: 0.3, enter: "pop" }) as StoryLayer]
    ],
    text: ${JSON.stringify(fable.text, null, 6).replace(/\n/g, "\n    ")}
  }`;
  const anchor = "\n];\n\nexport const mindNestCount";
  if (!src.includes(anchor)) throw new Error("Could not locate FABLES closing anchor in fables.ts");
  src = src.replace(anchor, `\n${block}${anchor}`);
  fs.writeFileSync(fablesPath, src);
}

function registerArtInTs(n, id) {
  let src = fs.readFileSync(artPath, "utf8");
  const constName = `FABLE_${n}_STORYBOOK`;
  const entry = `
/** Fable ${n} "${id}" — Storybook Classic V2 (auto-generated). */
const ${constName}: EpisodeArt = {
  dir: "mindnest-v2/storybook-classic/fable-${n}",
  title: { bg: "bg-p1.jpg", emblem: "emblem.webp" },
  pages: [
    { bg: "bg-p1.jpg", particles: "pollen", particleColor: "#FFE7A0",
      actors: [{ src: "p1-pair.webp", w: 860, x: 540, y: 1545, enter: "hop", idle: "breathe" }] },
    { bg: "bg-p2.jpg", particles: "petals", particleColor: "#F4A6C0",
      actors: [{ src: "p2-leap.webp", w: 560, x: 500, y: 1560, enter: "slide-left", idle: "breathe" }] },
    { bg: "bg-p3.jpg", particles: "leaves", particleColor: "#C9973E",
      actors: [{ src: "p3-muddy.webp", w: 560, x: 540, y: 1585, enter: "drop", idle: "sad" }] },
    { bg: "bg-p4.jpg", particles: "pollen", particleColor: "#FFF2C0",
      actors: [{ src: "p4-calm.webp", w: 900, x: 540, y: 1550, enter: "rise", idle: "breathe" }] },
    { bg: "bg-p5.jpg", particles: "petals", particleColor: "#FFC46B", glow: "rgba(255,196,110,0.55)",
      actors: [{ src: "p5-hug.webp", w: 820, x: 540, y: 1560, enter: "hop", idle: "breathe" }] },
    { bg: "bg-outro.jpg", particles: "fireflies", particleColor: "#FFD877", glow: "rgba(255,206,110,0.45)",
      actors: [{ src: "outro-wave.webp", w: 820, x: 540, y: 1565, enter: "rise", idle: "wave" }] }
  ]
};
`;
  src = src.replace("const ART: Partial<Record<StoryStyleId, Record<number, EpisodeArt>>> = {", `${entry}\nconst ART: Partial<Record<StoryStyleId, Record<number, EpisodeArt>>> = {`);
  src = src.replace(
    /("storybook-classic":\s*\{[^}]*)(})/,
    (_, body, close) => `${body.trimEnd()}, ${n}: ${constName} ${close}`
  );
  fs.writeFileSync(artPath, src);
}

const artNums = new Set(existingArtNumbers());
const fableIds = existingFableIds();
let nextN = 1;
while (artNums.has(nextN)) nextN++;

for (let k = 0; k < count; k++) {
  const n = nextN + k;
  const outDir = path.join(styleDir, `fable-${n}`);
  let fableId = fableIds[n - 1];
  let platePrompts = [
    "Storybook Classic warm hand-painted watercolor forest glade, NO characters, calm soft sky in top 30%, vertical 9:16",
    "Storybook Classic warm hand-painted sunlit meadow path, NO characters, calm soft sky in top 30%, vertical 9:16",
    "Storybook Classic warm hand-painted forest stream at dusk, NO characters, calm soft sky in top 30%, vertical 9:16",
    "Storybook Classic warm hand-painted golden hilltop, NO characters, calm soft sky in top 30%, vertical 9:16"
  ];

  if (n > fableIds.length) {
    const generated = await generateViralFable(n, fableIds);
    fableId = generated.id.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    for (const lang of ALL_LANGS) {
      if (!generated.text[lang]) generated.text[lang] = generated.text.hi;
    }
    if (!dry) appendFableToTs({ id: fableId, text: generated.text });
    fableIds.push(fableId);
    if (Array.isArray(generated.platePrompts) && generated.platePrompts.length === 4) {
      platePrompts = generated.platePrompts;
    }
  }

  console.log(`[mindnest:v2] Preparing Fable #${n} (${fableId}) -> ${path.relative(root, outDir)}`);
  if (dry) continue;

  fs.mkdirSync(outDir, { recursive: true });
  for (let p = 1; p <= 4; p++) {
    await generatePlateImage(platePrompts[p - 1], path.join(outDir, `bg-p${p}.jpg`), path.join(fable1Dir, `bg-p${p}.jpg`));
  }
  for (const asset of ["bg-p5.jpg", "bg-outro.jpg", "emblem.webp", "p1-pair.webp", "p2-leap.webp", "p3-muddy.webp", "p4-calm.webp", "p5-hug.webp", "outro-wave.webp"]) {
    const srcFile = path.join(fable1Dir, asset);
    if (fs.existsSync(srcFile)) fs.copyFileSync(srcFile, path.join(outDir, asset));
  }
  registerArtInTs(n, fableId);
}
