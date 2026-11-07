/** Bundle the studio once per process and render compositions / stills (shared by the Telegram jobs). */
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";

let served: Promise<string> | null = null;
function serveUrl(): Promise<string> {
  if (served) return served;
  const root = process.cwd();
  const alias = Object.fromEntries(["core", "motion", "audio", "visuals", "camera"].map((k) => [`@${k}`, path.join(root, "packages", k, "src")]));
  served = bundle({
    entryPoint: path.join(root, "apps/studio/src/remotion/index.ts"),
    publicDir: path.join(root, "public"),
    webpackOverride: (c) => ({ ...c, resolve: { ...c.resolve, alias: { ...(c.resolve?.alias ?? {}), ...alias, "@runtime": path.join(root, "packages/scene-runtime/src") } } })
  });
  return served;
}
// GitHub runners have no GPU: "swangle" keeps WebGL (Three.js) working; "angle" for a GPU machine. Override with REMOTION_GL.
const gl = () => ({ chromiumOptions: { gl: (process.env.REMOTION_GL || "swangle") as "swangle" | "angle" | "egl" | "swiftshader" } });
const chrome = () => ({ ...(process.env.REMOTION_CHROME ? { browserExecutable: process.env.REMOTION_CHROME } : {}), ...gl() });

/** scale < 1 renders smaller (e.g. 2/3 -> 720x1280): much faster for filter-heavy compositions. */
export async function renderComposition(id: string, inputProps: Record<string, unknown>, out: string, crf = 24, scale = 1, onProgress?: (p: number) => void): Promise<string> {
  const url = await serveUrl();
  const composition = await selectComposition({ serveUrl: url, id, inputProps, ...chrome() });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await renderMedia({ composition, serveUrl: url, codec: "h264", inputProps, outputLocation: out, crf, scale, ...(onProgress ? { onProgress: ({ progress }: { progress: number }) => onProgress(progress) } : {}), ...chrome() });
  return out;
}

export async function renderStillComposition(id: string, inputProps: Record<string, unknown>, out: string, frame = 0): Promise<string> {
  const url = await serveUrl();
  const composition = await selectComposition({ serveUrl: url, id, inputProps, ...chrome() });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await renderStill({ composition, serveUrl: url, inputProps, output: out, frame, imageFormat: "jpeg", jpegQuality: 90, ...chrome() });
  return out;
}
