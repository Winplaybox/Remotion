/**
 * Export the cast as transparent PNG frames + sprite sheets + atlas.json.
 *   npx ts-node scripts/export-cast.ts [id,id,...|all] [outDir=output/characters]
 * Layout (per character): <id>/{idle,walk,run,talk,expressions,emotions,actions}/…png, <id>/atlas.json,
 * <id>/<folder>.sheet.png (built by scripts/make-sheets.py).
 * Every frame is 640x700, feet anchor at (320,650); loop actions export `loop/step` frames that repeat without a jump.
 */
import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { CAST_IDS, type CastId } from "../packages/visuals/src/rig/cast";
import { ACTIONS, EXPRESSION_IDS, type ActionId } from "../packages/visuals/src/rig/motion";
import { ANCHOR, SPRITE } from "../packages/visuals/src/rig/SpriteFrame";

const LOOPS: Record<string, { action: ActionId; step: number }> = {
  idle: { action: "idle", step: 12 }, walk: { action: "walk", step: 2 }, run: { action: "run", step: 2 }, talk: { action: "talk", step: 4 }
};
const EMOTIONS: ActionId[] = ["smile", "laugh", "surprised", "afraid", "nervous", "stressed", "angry", "cry", "confused", "suspicious"];
const ACTIONS_OTHER: ActionId[] = ["think", "point", "sneak", "lookLeft", "lookRight", "celebrate"];

async function main() {
  const arg = process.argv[2] ?? "all";
  const out = path.resolve(process.argv[3] ?? "output/characters");
  const ids = (arg === "all" ? CAST_IDS : arg.split(",")) as CastId[];
  const root = process.cwd();
  const alias = Object.fromEntries(["core", "motion", "audio", "visuals", "camera"].map((k) => [`@${k}`, path.join(root, "packages", k, "src")]));
  const serveUrl = await bundle({
    entryPoint: path.join(root, "apps/studio/src/remotion/index.ts"),
    publicDir: path.join(root, "public"),
    webpackOverride: (c) => ({ ...c, resolve: { ...c.resolve, alias: { ...(c.resolve?.alias ?? {}), ...alias, "@runtime": path.join(root, "packages/scene-runtime/src") } } })
  });
  const browser = await openBrowser("chrome", { browserExecutable: process.env.CHROME ?? "/usr/bin/google-chrome", chromiumOptions: { gl: "angle" } });
  const comp = await selectComposition({ serveUrl, id: "SpriteFrame", puppeteerInstance: browser, inputProps: { id: ids[0], action: "idle", frame: 0 } });

  for (const id of ids) {
    const atlas: Record<string, unknown> = { id, frame: SPRITE, anchor: ANCHOR, fps: 30, folders: {} };
    const jobs: { folder: string; name: string; action: ActionId; frame: number; expression?: string }[] = [];
    for (const [folder, { action, step }] of Object.entries(LOOPS)) {
      const loop = ACTIONS[action].loop;
      for (let f = 0, n = 0; f < loop; f += step, n++) jobs.push({ folder, name: `${folder}_${String(n).padStart(2, "0")}`, action, frame: f });
    }
    for (const e of EXPRESSION_IDS) jobs.push({ folder: "expressions", name: e, action: "idle", frame: 0, expression: e });
    for (const a of EMOTIONS) for (let n = 0; n < 2; n++) jobs.push({ folder: "emotions", name: `${a}_${n}`, action: a, frame: Math.round(ACTIONS[a].loop * (0.2 + 0.4 * n)) });
    for (const a of ACTIONS_OTHER) for (let n = 0; n < 2; n++) jobs.push({ folder: "actions", name: `${a}_${n}`, action: a, frame: Math.round(ACTIONS[a].loop * (0.2 + 0.4 * n)) });
    for (const j of jobs) {
      const dir = path.join(out, id, j.folder);
      fs.mkdirSync(dir, { recursive: true });
      await renderStill({ composition: comp, serveUrl, output: path.join(dir, `${j.name}.png`), puppeteerInstance: browser, imageFormat: "png", inputProps: { id, action: j.action, frame: j.frame, expression: j.expression } });
      const folders = atlas.folders as Record<string, { name: string; action: string; frame: number; loop?: number }[]>;
      (folders[j.folder] ??= []).push({ name: j.name, action: j.action, frame: j.frame, loop: ACTIONS[j.action].loop });
    }
    fs.writeFileSync(path.join(out, id, "atlas.json"), JSON.stringify(atlas, null, 1));
    console.log("exported", id, jobs.length, "frames");
  }
  await browser.close({ silent: true }).catch(() => undefined);
}
main().catch((e) => { console.error(e); process.exit(1); });
