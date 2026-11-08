#!/usr/bin/env node
/**
 * Engine Builder scaffold — creates a new engine AND wires it everywhere it needs to be.
 *   node scripts/new-engine.mjs bubble-pop BubblePop [--channel "Bubble Pop" --handle @BubblePop --slots 07:30,18:30]
 *
 * Does:
 *  1. engines/<slug>/src/{model.ts, <Pascal>Composition.tsx} from engines/_template (working puzzle to replace)
 *  2. registers the composition in apps/studio/src/remotion/Root.tsx (folder <Pascal>)
 *  3. adds the engine to engines/catalog.ts  -> covered by tests/engine-catalog.test.ts + scripts/engine-qa.ts
 *  4. adds a DISABLED channel to channels/channels.ts (autoPublish:false, start 2099-01-01) so nothing publishes
 *     until a human sets START_<ID>/LIVE_<ID> after approving the PR.
 * Does NOT write the game: the agent must replace the template's puzzle logic (docs/NEW_ENGINE.md).
 */
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const [slug, Pascal] = argv;
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : d; };
if (!slug || !Pascal || !/^[a-z][a-z0-9-]+$/.test(slug) || !/^[A-Z][A-Za-z0-9]+$/.test(Pascal)) {
  console.error("usage: node scripts/new-engine.mjs <kebab-slug> <PascalName> [--channel \"Name\" --handle @Handle --slots HH:MM,HH:MM]");
  process.exit(1);
}
const camel = Pascal.charAt(0).toLowerCase() + Pascal.slice(1);
const UPPER = slug.toUpperCase().replace(/-/g, "_");
const channelName = opt("channel", Pascal.replace(/([a-z])([A-Z])/g, "$1 $2"));
const handle = opt("handle", `@${Pascal}`);
const slots = opt("slots", "07:30,18:30").split(",").map((s) => JSON.stringify(s.trim())).join(", ");
const dest = path.join("engines", slug, "src");
if (fs.existsSync(dest)) { console.error(`${dest} already exists`); process.exit(1); }

const swap = (s) => s.replace(/TemplateComposition/g, `${Pascal}Composition`).replace(/TemplateSchema/g, `${Pascal}Schema`)
  .replace(/\bTemplate\b/g, Pascal).replace(/template(?=[A-Z])/g, camel).replace(/`template-/g, `\`${slug}-`).replace(/TEMPLATE/g, UPPER)
  .replace(/"MY CHANNEL"/g, JSON.stringify(channelName.toUpperCase())).replace(/"@MyChannel"/g, JSON.stringify(handle));
fs.mkdirSync(dest, { recursive: true });
fs.writeFileSync(path.join(dest, "model.ts"), swap(fs.readFileSync("engines/_template/src/model.ts", "utf8")));
fs.writeFileSync(path.join(dest, `${Pascal}Composition.tsx`), swap(fs.readFileSync("engines/_template/src/TemplateComposition.tsx", "utf8")));

const insert = (file, marker, text) => {
  const s = fs.readFileSync(file, "utf8");
  if (!s.includes(marker)) throw new Error(`${file}: marker ${marker} not found`);
  fs.writeFileSync(file, s.replace(marker, `${text}\n${marker}`));
};
const mod = `../../../../engines/${slug}/src`;
insert("apps/studio/src/remotion/Root.tsx", "// @engine-builder:imports",
  `import { ${Pascal}Schema, ${camel}Duration, ${camel}ForDay, type ${Pascal} } from "${mod}/model";\nimport { ${Pascal}Composition } from "${mod}/${Pascal}Composition";`);
insert("apps/studio/src/remotion/Root.tsx", "{/* @engine-builder:compositions */}",
  `    <Folder name="${Pascal}">\n      <Composition id="${Pascal}" component={${Pascal}Composition} schema={${Pascal}Schema} {...video} durationInFrames={${camel}Duration(${camel}ForDay(1))} defaultProps={${camel}ForDay(1)}\n        calculateMetadata={({ props }: { props: ${Pascal} }) => ({ durationInFrames: ${camel}Duration(props) })} />\n    </Folder>`);
insert("engines/catalog.ts", "// @engine-builder:imports",
  `import { ${Pascal}Schema, ${camel}ForDay, ${camel}Duration, ${camel}VoiceLines, ${camel}AnswerComment } from "./${slug}/src/model";`);
insert("engines/catalog.ts", "  // @engine-builder:catalog",
  `  {\n    slug: "${slug}", compositionId: "${Pascal}", schema: ${Pascal}Schema, forDay: ${camel}ForDay,\n    durationFrames: ${camel}Duration as (p: never) => number, voiceLines: ${camel}VoiceLines as (p: never) => VoiceLine[],\n    answer: (n) => ${camel}AnswerComment(${camel}ForDay(n)), seconds: [15, 30], days: () => range(30), askFrom: 1\n  },`);
insert("channels/channels.ts", "  // @engine-builder:channels",
  `  "${slug}": {\n    name: ${JSON.stringify(channelName)},\n    composition: "${Pascal}",\n    // Disabled until approved: set repo variables START_${UPPER}=<date> and LIVE_${UPPER}=true.\n    startDate: "2099-01-01",\n    slots: [${slots}],\n    narrated: false,\n    autoPublish: false,\n    youtubeTokenSecret: "YT_TOKEN_${UPPER}",\n    metaSecretPrefix: "META_${UPPER}",\n    youtubeHandle: "${handle}",\n    pinterestSecretPrefix: "PINTEREST_${UPPER}",\n    resolve: (n) => ${camel}ForDay(n),\n    voice: (n) => ${camel}VoiceLines(${camel}ForDay(n)),\n    answer: (n) => ${camel}AnswerComment(${camel}ForDay(n)),\n    answerInNextFrom: 1,\n    meta: (n) => ({\n      title: \`${channelName}: \${${camel}ForDay(n).title} 👀 #\${n} #shorts\`,\n      description: \`\${${camel}ForDay(n).subtitle}\\n\${ASK_META.description}\\n\\nSubscribe ${handle}\\n#puzzle #shorts\`,\n      tags: ["puzzle", "brain teaser", "shorts"],\n      caption: \`#\${n} — \${${camel}ForDay(n).subtitle}\\n\${ASK_META.caption}\\n#puzzle #reels\`,\n      language: "hi",\n      categoryId: "20"\n    })\n  },`);
insert("channels/channels.ts", "// @engine-builder:imports", `import { ${camel}ForDay, ${camel}VoiceLines, ${camel}AnswerComment } from "../engines/${slug}/src/model";`);

console.log(`Engine ${Pascal} scaffolded and wired:
  engines/${slug}/src/model.ts, ${Pascal}Composition.tsx   <- REPLACE the template puzzle with the real game
  Root.tsx (Studio folder ${Pascal}), engines/catalog.ts, channels/channels.ts (disabled channel "${slug}")
Next (docs/NEW_ENGINE.md):
  npx tsc --noEmit && npm run lint && npm test
  npx ts-node scripts/engine-qa.ts --engine ${slug}      # previews + audio check in qa/${slug}/
  open a PR; after approval set START_${UPPER} / LIVE_${UPPER} and add the YT_TOKEN_${UPPER} secret`);
