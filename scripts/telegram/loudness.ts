/** Final loudness pass for bot videos: two-pass EBU R128 loudnorm to -14 LUFS / -1 dBTP (YouTube / Reels playback level). */
import { spawnSync } from "node:child_process";
import fs from "node:fs";

export interface LoudnessStats { input_i: string; input_tp: string; input_lra: string; input_thresh: string; target_offset: string }

/** Pull the JSON block ffmpeg's loudnorm prints to stderr. */
export function parseLoudnorm(stderr: string): LoudnessStats | null {
  const m = /\{\s*"input_i"[\s\S]*?\}/.exec(stderr);
  if (!m) return null;
  try { return JSON.parse(m[0]) as LoudnessStats; } catch { return null; }
}

export const TARGET = { I: -14, TP: -1, LRA: 11 };

/** Normalises the audio in place (video stream copied). Silent or failing files are left untouched. Returns measured input loudness. */
export function normalizeLoudness(file: string): LoudnessStats | null {
  const base = `loudnorm=I=${TARGET.I}:TP=${TARGET.TP}:LRA=${TARGET.LRA}`;
  const pass1 = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", `${base}:print_format=json`, "-f", "null", "-"], { encoding: "utf8" });
  const m = parseLoudnorm(pass1.stderr ?? "");
  if (!m || !Number.isFinite(Number(m.input_i)) || Number(m.input_i) < -60) return m; // no audio / silence
  const out = `${file}.norm.mp4`;
  const pass2 = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", file, "-af",
    `${base}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", out], { encoding: "utf8" });
  if (pass2.status === 0 && fs.existsSync(out)) fs.renameSync(out, file);
  else { console.warn(`[loudness] ${pass2.stderr?.slice(0, 200)}`); fs.rmSync(out, { force: true }); }
  return m;
}
