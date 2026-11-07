/** Bundle the studio once and render one composition to MP4 (shared by the Telegram jobs). */
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

/** scale < 1 renders smaller (e.g. 2/3 -> 720x1280): much faster for filter-heavy compositions. */
export async function renderComposition(id: string, inputProps: Record<string, unknown>, out: string, crf = 24, scale = 1): Promise<string> {
  const root = process.cwd();
  const alias = Object.fromEntries(["core", "motion", "audio", "visuals", "camera"].map((k) => [`@${k}`, path.join(root, "packages", k, "src")]));
  const serveUrl = await bundle({
    entryPoint: path.join(root, "apps/studio/src/remotion/index.ts"),
    publicDir: path.join(root, "public"),
    webpackOverride: (c) => ({ ...c, resolve: { ...c.resolve, alias: { ...(c.resolve?.alias ?? {}), ...alias, "@runtime": path.join(root, "packages/scene-runtime/src") } } })
  });
  const chrome = process.env.REMOTION_CHROME || undefined;
  const composition = await selectComposition({ serveUrl, id, inputProps, ...(chrome ? { browserExecutable: chrome } : {}) });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await renderMedia({ composition, serveUrl, codec: "h264", inputProps, outputLocation: out, crf, scale, ...(chrome ? { browserExecutable: chrome } : {}) });
  return out;
}
