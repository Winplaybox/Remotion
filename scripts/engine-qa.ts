/**
 * Engine QA — rendered previews + audio check (the "production approval" step).
 *
 *   npx ts-node scripts/engine-qa.ts --engine odd-orbit [--days 1,7,15,30] [--no-video]
 *   npx ts-node scripts/engine-qa.ts --all
 *
 * Writes qa/<slug>/: contact sheet of 4 moments x N days, one full MP4 (day 1, music+SFX, no voice) and report.md.
 * Exits non-zero if a still fails to render, the MP4 has no audio, or loudness is outside the safe range.
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { ENGINE_CATALOG, engineBySlug, type EngineEntry } from "../engines/catalog";

const args = process.argv.slice(2);
const arg = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const root = process.cwd();
const chrome = process.env.REMOTION_CHROME || undefined;
const MOMENTS = [0.06, 0.4, 0.72, 0.93];

async function qa(e: EngineEntry, serveUrl: string): Promise<string[]> {
  const out = path.join(root, "qa", e.slug);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const all = e.days();
  const wanted = (arg("days") ?? "1,7,15,30").split(",").map(Number).filter((d) => all.includes(d));
  const days = wanted.length ? wanted : all.slice(0, 4);
  const problems: string[] = [];
  const stills: string[] = [];
  for (const d of days) {
    const props = e.forDay(d) as Record<string, unknown>;
    const composition = await selectComposition({ serveUrl, id: e.compositionId, inputProps: props, ...(chrome ? { browserExecutable: chrome } : {}) });
    for (const m of MOMENTS) {
      const frame = Math.min(composition.durationInFrames - 1, Math.round(composition.durationInFrames * m));
      const file = path.join(out, `day${String(d).padStart(2, "0")}-${Math.round(m * 100)}.png`);
      try {
        await renderStill({ composition, serveUrl, inputProps: props, output: file, frame, scale: 0.35, ...(chrome ? { browserExecutable: chrome } : {}) });
        stills.push(file);
      } catch (err) { problems.push(`still day ${d} @${m}: ${(err as Error).message.split("\n")[0]}`); }
    }
  }
  if (stills.length) {
    const pos = (n: number, unit: string) => (n === 0 ? "0" : Array.from({ length: n }, () => unit).join("+"));
    const layout = stills.map((_, i) => `${pos(i % MOMENTS.length, "w0")}_${pos(Math.floor(i / MOMENTS.length), "h0")}`).join("|");
    const inputs = stills.flatMap((f) => ["-i", f]);
    const filter = stills.length === 1 ? "[0:v]copy" : `${stills.map((_, i) => `[${i}:v]`).join("")}xstack=inputs=${stills.length}:layout=${layout}`;
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...inputs, "-filter_complex", filter, path.join(out, "contact-sheet.png")]);
  }
  let audio = "skipped";
  if (!args.includes("--no-video")) {
    const props = e.forDay(days[0] ?? 1) as Record<string, unknown>;
    const composition = await selectComposition({ serveUrl, id: e.compositionId, inputProps: props, ...(chrome ? { browserExecutable: chrome } : {}) });
    const mp4 = path.join(out, `day${String(days[0] ?? 1).padStart(2, "0")}.mp4`);
    await renderMedia({ composition, serveUrl, codec: "h264", inputProps: props, outputLocation: mp4, crf: 26, ...(chrome ? { browserExecutable: chrome } : {}) });
    const probe = execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type", "-of", "csv=p=0", mp4]).toString();
    if (!probe.includes("audio")) problems.push("MP4 has no audio stream");
    else {
      const log = spawnSync("ffmpeg", ["-hide_banner", "-i", mp4, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" }).stderr ?? "";
      const mean = Number(/mean_volume: (-?[\d.]+)/.exec(log)?.[1] ?? NaN), peak = Number(/max_volume: (-?[\d.]+)/.exec(log)?.[1] ?? NaN);
      audio = `mean ${mean} dB, peak ${peak} dB`;
      if (!(mean > -40 && mean < -10)) problems.push(`loudness mean ${mean} dB outside -40..-10`);
      if (!(peak <= -0.3)) problems.push(`peak ${peak} dB clips (> -0.3)`);
    }
  }
  const report = [`# QA: ${e.slug} (${e.compositionId})`, "", `Days: ${days.join(", ")}`, `Stills: ${stills.length}/${days.length * MOMENTS.length}`, `Audio (music+SFX, no voice): ${audio}`, "", problems.length ? `## FAIL\n${problems.map((p) => `- ${p}`).join("\n")}` : "## PASS", "", "Look at contact-sheet.png before approving: text fits, nothing under the YouTube UI (bottom ~200 px), answer/voice match."].join("\n");
  fs.writeFileSync(path.join(out, "report.md"), report + "\n");
  console.log(report);
  return problems;
}

(async () => {
  const engines = args.includes("--all") ? ENGINE_CATALOG : [engineBySlug(arg("engine") ?? "")];
  const alias = Object.fromEntries(["core", "motion", "audio", "visuals", "camera"].map((k) => [`@${k}`, path.join(root, "packages", k, "src")]));
  const serveUrl = await bundle({
    entryPoint: path.join(root, "apps/studio/src/remotion/index.ts"),
    publicDir: path.join(root, "public"),
    webpackOverride: (c) => ({ ...c, resolve: { ...c.resolve, alias: { ...(c.resolve?.alias ?? {}), ...alias, "@runtime": path.join(root, "packages/scene-runtime/src") } } })
  });
  let failed = 0;
  for (const e of engines) failed += (await qa(e, serveUrl)).length;
  process.exit(failed ? 1 : 0);
})();
