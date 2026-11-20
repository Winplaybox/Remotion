/**
 * Narrate a MindNest V2 episode chunk by chunk, so captions are timed to the real voice (no guessing).
 *
 *   npx ts-node scripts/mindnest-v2-voice.ts --lang hi --fable 1            # Kokoro chain from channels/voices.ts
 *   npx ts-node scripts/mindnest-v2-voice.ts --lang es --fable 1 --speed 0.92
 *
 * 1. Splits every story page into the exact caption chunks the episode shows (episodeChunks).
 * 2. Runs scripts/narration/narrate.py (same engines / voice chain as the channel: Kokoro -> Gemini -> Edge) on them.
 * 3. Joins each page's chunks with a short breath into public/mindnest-v2/audio/fable-<n>/<lang>/page-<i>.mp3 and
 *    writes episode.json there: the full composition props (audio + measured lengths + caption cues).
 *
 * Render:  npx remotion render apps/studio/src/remotion/index.ts MindNestEpisodeV2 out/ep1-hi.mp4 \
 *            --props=public/mindnest-v2/audio/fable-1/hi/episode.json
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { MINDNEST_LANGS, type MindNestLang } from "../content/mindnest/fables";
import { VOICES } from "../channels/voices";
import { episodeChunks, mindNestEpisode, STORY_STYLE_IDS, type EpisodeCue, type StoryStyleId } from "../engines/story-visual-v2/src";
import { SCRIPT } from "../engines/story-visual-v2/src/content";

const args = process.argv.slice(2);
const arg = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const lang = (arg("lang") ?? "hi") as MindNestLang;
const fable = Number(arg("fable") ?? 1);
const style = (arg("style") ?? "storybook-classic") as StoryStyleId;
if (!MINDNEST_LANGS.includes(lang)) throw new Error(`--lang must be one of ${MINDNEST_LANGS.join(", ")}`);
if (!STORY_STYLE_IDS.includes(style)) throw new Error(`--style must be one of ${STORY_STYLE_IDS.join(", ")}`);
/** Breath between caption chunks inside one page (s). */
const GAP = Number(arg("gap") ?? 0.22);

const py = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
const seconds = (f: string) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

const ep = mindNestEpisode(lang, fable, style, { requireArt: true });
const script = SCRIPT[lang];
const pages = ep.scenes.map((s, i) => ({ i, chunks: s.kind === "story" ? episodeChunks(s.narration, script) : [s.narration] }));
const lines = pages.flatMap((p) => p.chunks.map((text, j) => ({ file: `s${p.i}-c${j}.wav`, text })));

const work = path.resolve("output", "mindnest-v2", `fable-${fable}-${lang}`);
fs.rmSync(work, { recursive: true, force: true });
fs.mkdirSync(work, { recursive: true });
const spec = path.join(work, "lines.json");
fs.writeFileSync(spec, JSON.stringify(lines, null, 2));

const v = VOICES[`mindnest-${lang}`];
if (!v) throw new Error(`no voice profile for mindnest-${lang} in channels/voices.ts`);
const speed = arg("speed") ?? String(v.kokoroSpeed);
execFileSync(py, ["scripts/narration/narrate.py", "--channel", `mindnest-${lang}`, "--n", String(fable), "--spec", spec, "--out-dir", work,
  "--engine", "auto", "--engines", v.engines.join(","), "--kokoro-voice", v.kokoro, "--kokoro-speed", speed,
  "--gemini-voice", v.gemini, "--gemini-style", v.geminiStyle, "--edge-voice", v.edge, `--edge-rate=${v.edgeRate}`], { stdio: "inherit" });
const engine = fs.readFileSync(path.join(work, "engine.txt"), "utf8").trim();

const rel = `mindnest-v2/audio/fable-${fable}/${lang}`;
const outDir = path.resolve("public", rel);
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

pages.forEach((p) => {
  const files = p.chunks.map((_, j) => path.join(work, `s${p.i}-c${j}.wav`));
  const durs = files.map(seconds);
  const cues: EpisodeCue[] = [];
  let at = 0;
  p.chunks.forEach((text, j) => { cues.push({ text, start: Math.round(at * 1000) / 1000, end: Math.round((at + durs[j]!) * 1000) / 1000 }); at += durs[j]! + GAP; });
  // chunk, breath, chunk, ... -> one page file (mono 48 kHz, 96 kbps MP3: small enough to commit)
  const inputs = files.flatMap((f) => ["-i", f]);
  const graph = files.map((_, j) => (j < files.length - 1 ? `[${j}:a]apad=pad_dur=${GAP}[a${j}];` : `[${j}:a]anull[a${j}];`)).join("") +
    files.map((_, j) => `[a${j}]`).join("") + `concat=n=${files.length}:v=0:a=1[out]`;
  const mp3 = path.join(outDir, `page-${p.i}.mp3`);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", graph, "-map", "[out]", "-ar", "48000", "-ac", "1", "-b:a", "96k", mp3]);
  const scene = ep.scenes[p.i]!;
  scene.audio = `${rel}/page-${p.i}.mp3`;
  scene.audioSeconds = Math.round(seconds(mp3) * 1000) / 1000;
  if (scene.kind === "story") scene.cues = cues;
  console.log(`[voice] page ${p.i} (${scene.kind}) ${scene.audioSeconds}s, ${p.chunks.length} chunk(s)`);
});

fs.writeFileSync(path.join(outDir, "episode.json"), JSON.stringify({ ...ep, voice: { engine, kokoro: v.kokoro, speed: Number(speed) } }, null, 2));
console.log(`[voice] ${engine} -> public/${rel}/episode.json`);
