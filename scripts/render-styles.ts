/** Render a StyleShowcase still for every catalogue style:  npx ts-node scripts/render-styles.ts [outDir=output/styles] [id,id] */
import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { STYLE_IDS } from "../packages/visuals/src/styles/recipes";

(async () => {
  const out = path.resolve(process.argv[2] ?? "output/styles");
  const ids = process.argv[3] ? process.argv[3].split(",") : STYLE_IDS;
  fs.mkdirSync(out, { recursive: true });
  const root = process.cwd();
  const alias = Object.fromEntries(["core", "motion", "audio", "visuals", "camera"].map((k) => [`@${k}`, path.join(root, "packages", k, "src")]));
  const serveUrl = await bundle({
    entryPoint: path.join(root, "apps/studio/src/remotion/index.ts"),
    publicDir: path.join(root, "public"),
    webpackOverride: (c) => ({ ...c, resolve: { ...c.resolve, alias: { ...(c.resolve?.alias ?? {}), ...alias, "@runtime": path.join(root, "packages/scene-runtime/src") } } })
  });
  const browser = await openBrowser("chrome", { browserExecutable: process.env.CHROME ?? "/usr/bin/google-chrome" });
  const composition = await selectComposition({ serveUrl, id: "StyleShowcase", puppeteerInstance: browser, inputProps: { styleId: ids[0] } });
  for (const styleId of ids) {
    await renderStill({ composition: { ...composition, props: { styleId } }, serveUrl, output: path.join(out, `${styleId}.png`), puppeteerInstance: browser, imageFormat: "png", frame: 0, scale: 0.5, inputProps: { styleId } });
    console.log("rendered", styleId);
  }
  await browser.close({ silent: true }).catch(() => undefined);
})().catch((e) => { console.error(e); process.exit(1); });
