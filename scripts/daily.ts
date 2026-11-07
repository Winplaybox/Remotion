/**
 * Render (and narrate) the episode for a channel and date.
 *   npx ts-node scripts/daily.ts --channel chakra-puzzle [--date 2026-11-12 | --day 3] [--dry]
 * Writes output/<channel>/day-NNN.json (props), .mp4 and .txt (post caption).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { CHANNELS, dayNumber, todayIST, type ChannelId } from "../channels/channels";

const args = process.argv.slice(2);
const arg = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const channel = arg("channel") as ChannelId | undefined;
if (!channel || !(channel in CHANNELS)) throw new Error(`--channel must be one of: ${Object.keys(CHANNELS).join(", ")}`);
const cfg = CHANNELS[channel];
const day = arg("day") ? Number(arg("day")) : dayNumber(channel, arg("date") ?? todayIST());
const tag = `day-${String(day).padStart(3, "0")}`;
const outDir = path.resolve("output", channel);
fs.mkdirSync(outDir, { recursive: true });

let props: unknown = cfg.resolve(day);

if (cfg.narrated) {
  // Narration audio lives in public/audio/<channel>/<tag>/scene-N.wav (made by scripts/narration/narrate.py).
  const audioDir = path.join("public", "audio", channel, tag);
  const story = props as { scenes: { id: string; audio?: string; narration: string }[] };
  fs.writeFileSync(path.join(outDir, `${tag}.narration.json`), JSON.stringify(story.scenes.map((s, i) => ({ file: `scene-${i + 1}.wav`, text: s.narration })), null, 2));
  story.scenes.forEach((s, i) => {
    const f = path.join(audioDir, `scene-${i + 1}.wav`);
    if (fs.existsSync(f)) s.audio = `audio/${channel}/${tag}/scene-${i + 1}.wav`;
  });
  const have = story.scenes.filter((s) => s.audio).length;
  console.log(`[narration] ${have}/${story.scenes.length} scene WAVs found in ${audioDir}${have ? "" : " — rendering silent with captions"}`);
  props = story;
}

const propsFile = path.join(outDir, `${tag}.json`);
fs.writeFileSync(propsFile, JSON.stringify(props, null, 2));
fs.writeFileSync(path.join(outDir, `${tag}.txt`), cfg.caption(day) + "\n");
console.log(`[${cfg.name}] Day ${day} -> ${propsFile}`);

if (!args.includes("--dry")) {
  const out = path.join(outDir, `${tag}.mp4`);
  const extra = process.env.REMOTION_CHROME ? [`--browser-executable=${process.env.REMOTION_CHROME}`] : [];
  execFileSync("npx", ["remotion", "render", "apps/studio/src/remotion/index.ts", cfg.composition, out, `--props=${propsFile}`, ...(cfg.narrated ? [] : ["--muted"]), ...extra], { stdio: "inherit", shell: process.platform === "win32" });
  console.log(`[${cfg.name}] rendered ${out}`);
}
