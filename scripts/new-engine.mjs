#!/usr/bin/env node
/**
 * Scaffold a new engine from engines/_template.
 *   node scripts/new-engine.mjs bubble-pop BubblePop
 * Creates engines/bubble-pop/src/{model.ts, BubblePopComposition.tsx}. Then follow docs/NEW_ENGINE.md (register in Root.tsx,
 * add the channel to channels/channels.ts, test, stills).
 */
import fs from "node:fs";
import path from "node:path";

const [slug, Pascal] = process.argv.slice(2);
if (!slug || !Pascal || !/^[a-z][a-z0-9-]+$/.test(slug) || !/^[A-Z][A-Za-z0-9]+$/.test(Pascal)) {
  console.error("usage: node scripts/new-engine.mjs <kebab-slug> <PascalName>   e.g. bubble-pop BubblePop");
  process.exit(1);
}
const camel = Pascal.charAt(0).toLowerCase() + Pascal.slice(1);
const UPPER = slug.toUpperCase().replace(/-/g, "_");
const dest = path.join("engines", slug, "src");
if (fs.existsSync(dest)) { console.error(`${dest} already exists`); process.exit(1); }
fs.mkdirSync(dest, { recursive: true });
const swap = (s) => s.replace(/TemplateComposition/g, `${Pascal}Composition`).replace(/TemplateSchema/g, `${Pascal}Schema`)
  .replace(/\bTemplate\b/g, Pascal).replace(/template(?=[A-Z])/g, camel).replace(/`template-/g, `\`${slug}-`).replace(/TEMPLATE/g, UPPER);
fs.writeFileSync(path.join(dest, "model.ts"), swap(fs.readFileSync("engines/_template/src/model.ts", "utf8")));
fs.writeFileSync(path.join(dest, `${Pascal}Composition.tsx`), swap(fs.readFileSync("engines/_template/src/TemplateComposition.tsx", "utf8")));
console.log(`created ${dest}/model.ts and ${Pascal}Composition.tsx
next: docs/NEW_ENGINE.md steps 3-8 (Root.tsx, channels.ts, voice, answer comment, test, stills)`);
