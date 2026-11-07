/**
 * Render queue: Claude renders the videos, GitHub only uploads them.
 *
 * Branch `render-queue` holds:  voice/<channel>/post-NNN/*.wav   (made by Actions with Edge TTS)
 *                               video/<channel>/post-NNN.mp4     (rendered by Claude with Remotion)
 * publish-channels.yml takes video/... from that branch at slot time. If a video is missing it falls back to
 * rendering in Actions (unless repo variable CI_RENDER_FALLBACK=false), so a post is never skipped.
 *
 *   npx ts-node scripts/queue.ts plan   --days 3
 *   npx ts-node scripts/queue.ts voice  --days 3 --queue queue     # Actions (needs edge-tts + ffmpeg)
 *   npx ts-node scripts/queue.ts render --queue queue              # Claude: renders every voiced post without a video
 *   npx ts-node scripts/queue.ts prune  --queue queue
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { CHANNELS, isLive, postNumber, startDateOf, todayIST, type ChannelId } from "../channels/channels";

const [cmd = "plan", ...args] = process.argv.slice(2);
const arg = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const days = Number(arg("days") ?? 3);
const queue = path.resolve(arg("queue") ?? "queue");
const only = arg("channel");
const force = args.includes("--force");
/** Also prepare channels that are not live yet (preview / first renders). */
const includePaused = args.includes("--include-paused");
const tagOf = (n: number) => `post-${String(n).padStart(3, "0")}`;

interface Planned { channel: ChannelId; n: number; date: string; slot: number; tag: string }

function plan(): Planned[] {
  const out: Planned[] = [];
  const now = Date.now();
  for (let d = 0; d < days; d++) {
    const date = todayIST(new Date(now + d * 86_400_000));
    for (const channel of Object.keys(CHANNELS) as ChannelId[]) {
      if (only && only !== channel) continue;
      if ((!isLive(channel) && !includePaused) || date < startDateOf(channel)) continue;
      CHANNELS[channel].slots.forEach((_, slot) => {
        const n = postNumber(channel, date, slot);
        out.push({ channel, n, date, slot, tag: tagOf(n) });
      });
    }
  }
  return out;
}

const run = (file: string, a: string[]) => execFileSync(file, a, { stdio: "inherit", shell: process.platform === "win32" });
const copyDir = (from: string, to: string) => { fs.mkdirSync(to, { recursive: true }); for (const f of fs.readdirSync(from)) fs.copyFileSync(path.join(from, f), path.join(to, f)); };
const hasFiles = (dir: string) => fs.existsSync(dir) && fs.readdirSync(dir).length > 0;

if (cmd === "plan") {
  console.log(JSON.stringify(plan(), null, 2));
} else if (cmd === "voice") {
  for (const p of plan()) {
    const dest = path.join(queue, "voice", p.channel, p.tag);
    if (hasFiles(dest) && !force) continue;
    try {
      run("npx", ["ts-node", "scripts/post.ts", "--channel", p.channel, "--n", String(p.n), "--dry", "--auto-narrate", "--no-queue"]);
      const src = path.join("public", "audio", p.channel, p.tag);
      if (hasFiles(src)) { copyDir(src, dest); console.log(`[voice] ${p.channel} ${p.tag} ✓`); }
    } catch (e) {
      console.warn(`[voice] ${p.channel} ${p.tag} failed: ${(e as Error).message}`);
    }
  }
} else if (cmd === "render") {
  // Render every post whose voice is on the queue but whose video is not. Actions decides what is due
  // (it can read the repo variables), so this needs no START_/LIVE_ variables.
  const failed: string[] = [];
  const voiceRoot = path.join(queue, "voice");
  const todo: { channel: ChannelId; n: number; tag: string }[] = [];
  if (fs.existsSync(voiceRoot)) {
    for (const ch of fs.readdirSync(voiceRoot) as ChannelId[]) {
      if (!(ch in CHANNELS) || (only && only !== ch)) continue;
      for (const tag of fs.readdirSync(path.join(voiceRoot, ch)).sort()) todo.push({ channel: ch, n: Number(tag.replace("post-", "")), tag });
    }
  }
  for (const p of todo) {
    const dest = path.join(queue, "video", p.channel, `${p.tag}.mp4`);
    if (fs.existsSync(dest) && !force) continue;
    copyDir(path.join(voiceRoot, p.channel, p.tag), path.join("public", "audio", p.channel, p.tag));
    try {
      run("npx", ["ts-node", "scripts/post.ts", "--channel", p.channel, "--n", String(p.n), "--force", "--no-queue"]);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join("output", p.channel, `${p.tag}.mp4`), dest);
      console.log(`[render] ${p.channel} ${p.tag} ✓`);
      if (args.includes("--push-each")) run("bash", ["scripts/queue-sync.sh", "commit", `video ${p.channel} ${p.tag}`]);
    } catch (e) {
      failed.push(`${p.channel} ${p.tag}`);
      console.warn(`[render] ${p.channel} ${p.tag} failed: ${(e as Error).message}`);
    }
  }
  console.log(`[render] done. ${failed.length ? `not rendered: ${failed.join(", ")}` : "all rendered"}`);
} else if (cmd === "prune") {
  const keep = new Set(plan().map((p) => `${p.channel}/${p.tag}`));
  const cutoff = todayIST(new Date(Date.now() - 2 * 86_400_000));
  for (const kind of ["voice", "video"]) {
    const root = path.join(queue, kind);
    if (!fs.existsSync(root)) continue;
    for (const ch of fs.readdirSync(root) as ChannelId[]) {
      if (!(ch in CHANNELS)) continue;
      for (const entry of fs.readdirSync(path.join(root, ch))) {
        const tag = entry.replace(/\.mp4$/, "");
        const n = Number(tag.replace("post-", ""));
        const slots = CHANNELS[ch].slots.length;
        const day = Math.floor((n - 1) / slots);
        const date = todayIST(new Date(Date.parse(`${startDateOf(ch)}T12:00:00+05:30`) + day * 86_400_000));
        if (date < cutoff && !keep.has(`${ch}/${tag}`)) { fs.rmSync(path.join(root, ch, entry), { recursive: true, force: true }); console.log(`[prune] ${kind}/${ch}/${entry}`); }
      }
    }
  }
} else {
  throw new Error(`unknown command ${cmd}`);
}
