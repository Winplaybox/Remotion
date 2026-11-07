/**
 * Build one post for a channel: props -> (narration check) -> MP4 -> metadata, then optionally publish.
 *
 *   npx ts-node scripts/post.ts --channel chakra-puzzle --date 2026-11-10 --slot 0
 *   npx ts-node scripts/post.ts --channel chakra-puzzle --n 5            # explicit post number
 *   ... --youtube        upload to YouTube, scheduled for the slot time
 *   ... --meta           publish to Instagram + Facebook now (needs a public video URL host)
 *   ... --dry            write props/metadata only, no render
 *
 * Files: output/<channel>/post-NNN.{json,mp4,meta.json}
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { CHANNELS, postNumber, slotTimeISO, todayIST, type ChannelId } from "../channels/channels";
import { uploadYouTube } from "./publish/youtube";
import { publishMeta } from "./publish/meta";

const args = process.argv.slice(2);
const arg = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const flag = (k: string) => args.includes(`--${k}`);

async function main() {
  const channel = arg("channel") as ChannelId | undefined;
  if (!channel || !(channel in CHANNELS)) throw new Error(`--channel must be one of: ${Object.keys(CHANNELS).join(", ")}`);
  const cfg = CHANNELS[channel];
  const date = arg("date") ?? todayIST();
  const slot = Number(arg("slot") ?? 0);
  const n = arg("n") ? Number(arg("n")) : postNumber(channel, date, slot);
  const publishAt = arg("publish-at") ?? slotTimeISO(date, cfg.slots[slot] ?? cfg.slots[0]!);
  const tag = `post-${String(n).padStart(3, "0")}`;
  const outDir = path.resolve("output", channel);
  fs.mkdirSync(outDir, { recursive: true });

  const props = cfg.resolve(n) as Record<string, unknown>;
  if (cfg.narrated) {
    const story = props as { scenes: { audio?: string; narration: string }[] };
    const audioDir = path.join("public", "audio", channel, tag);
    fs.writeFileSync(path.join(outDir, `${tag}.narration.json`), JSON.stringify(story.scenes.map((s, i) => ({ file: `scene-${i + 1}.wav`, text: s.narration })), null, 2));
    story.scenes.forEach((s, i) => { if (fs.existsSync(path.join(audioDir, `scene-${i + 1}.wav`))) s.audio = `audio/${channel}/${tag}/scene-${i + 1}.wav`; });
    const have = story.scenes.filter((s) => s.audio).length;
    console.log(`[narration] ${have}/${story.scenes.length} WAVs in ${audioDir}`);
    if (flag("require-narration") && have < story.scenes.length) throw new Error(`Narration missing for ${tag}; run scripts/narration/narrate.py first`);
  }
  const meta = cfg.meta(n);
  const propsFile = path.join(outDir, `${tag}.json`);
  fs.writeFileSync(propsFile, JSON.stringify(props, null, 2));
  fs.writeFileSync(path.join(outDir, `${tag}.meta.json`), JSON.stringify({ ...meta, publishAt, channel, n }, null, 2));
  console.log(`[${cfg.name}] post #${n} (${date} slot ${slot} → ${publishAt})`);
  if (flag("dry")) return;

  const video = path.join(outDir, `${tag}.mp4`);
  if (!fs.existsSync(video) || flag("force")) {
    const extra = process.env.REMOTION_CHROME ? [`--browser-executable=${process.env.REMOTION_CHROME}`] : [];
    execFileSync("npx", ["remotion", "render", "apps/studio/src/remotion/index.ts", cfg.composition, video, `--props=${propsFile}`, ...(cfg.narrated ? [] : ["--muted"]), ...extra], { stdio: "inherit", shell: process.platform === "win32" });
  }
  console.log(`[${cfg.name}] video ${video}`);

  if (flag("youtube")) {
    const id = await uploadYouTube({ video, meta, publishAt, tokenJson: process.env[cfg.youtubeTokenSecret] ?? process.env.YT_TOKEN_JSON, clientSecretJson: process.env[`${cfg.youtubeTokenSecret}_CLIENT`] || process.env.YT_CLIENT_SECRET_JSON });
    console.log(`[YouTube] https://youtube.com/shorts/${id} scheduled for ${publishAt}`);
  }
  if (flag("meta")) {
    const p = cfg.metaSecretPrefix;
    await publishMeta({ video, caption: meta.caption, key: `${channel}/${tag}`, pageId: process.env[`${p}_PAGE_ID`], igUserId: process.env[`${p}_IG_USER_ID`], pageToken: process.env[`${p}_PAGE_TOKEN`] });
  }
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exitCode = 1; });
