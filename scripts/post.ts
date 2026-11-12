/**
 * Build one post for a channel: props -> (narration check) -> MP4 -> metadata, then optionally publish.
 *
 *   npx ts-node scripts/post.ts --channel chakra-puzzle --date 2026-11-10 --slot 0
 *   npx ts-node scripts/post.ts --channel chakra-puzzle --n 5            # explicit post number
 *   ... --youtube        upload to YouTube, scheduled for the slot time
 *   ... --meta           publish to Instagram + Facebook now (needs a public video URL host)
 *   ... --dry            write props/metadata only, no render
 *   ... --auto-narrate   fill missing narration WAVs with Edge TTS before rendering
 *   ... --no-queue       ignore pre-rendered videos on the render-queue branch (always render here)
 *
 * Files: output/<channel>/post-NNN.{json,mp4,meta.json}
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { CHANNELS, postNumber, slotTimeISO, todayIST, type ChannelId, type VoiceLine } from "../channels/channels";
import { uploadYouTube } from "./publish/youtube";
import { fanout } from "./publish/social";
import { narrateArgs } from "../channels/voices";
import { spaceCues } from "./voice-timing";
import { ledgerEnabled, ledgerRecord, ledgerSocial, ledgerStatus } from "./ledger";

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

  // Videos rendered by Claude wait on the render-queue branch; use them instead of rendering here.
  const video = path.join(outDir, `${tag}.mp4`);
  let prerendered = false;
  if (!flag("dry") && !flag("no-queue") && !flag("refresh-narration")) {
    try {
      execFileSync("git", ["fetch", "--quiet", "--depth", "1", "origin", "render-queue"], { stdio: "ignore" });
      const buf = execFileSync("git", ["show", `FETCH_HEAD:video/${channel}/${tag}.mp4`], { maxBuffer: 512 * 1024 * 1024 });
      fs.writeFileSync(video, buf);
      prerendered = true;
      console.log(`[queue] using Claude-rendered video/${channel}/${tag}.mp4 (${(buf.length / 1e6).toFixed(1)} MB)`);
    } catch {
      if (process.env.CI_RENDER_FALLBACK === "false") throw new Error(`[queue] video/${channel}/${tag}.mp4 not on render-queue and CI_RENDER_FALLBACK=false`);
      console.warn(`[queue] no pre-rendered video for ${channel} ${tag}; rendering here as fallback`);
    }
  }

  const props = cfg.resolve(n) as Record<string, unknown>;
  if (cfg.narrated && !prerendered) {
    const story = props as { scenes: { audio?: string; narration: string }[] };
    const audioDir = path.join("public", "audio", channel, tag);
    fs.writeFileSync(path.join(outDir, `${tag}.narration.json`), JSON.stringify(story.scenes.map((s, i) => ({ file: `scene-${i + 1}.wav`, text: s.narration })), null, 2));
    const missing = () => story.scenes.filter((_, i) => !fs.existsSync(path.join(audioDir, `scene-${i + 1}.wav`))).length;
    // --auto-narrate: generate missing scene WAVs with Edge TTS (same approach as daily-devotional-shorts).
    // WAVs committed to public/audio (e.g. IndicF5 in your own voice) always win; only gaps are filled.
    if (flag("auto-narrate") && missing() > 0) {
      const py = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
      console.log(`[narration] generating ${missing()} missing scene(s) (${narrateArgs(channel, n)[1]})`);
      try {
        execFileSync(py, ["scripts/narration/narrate.py", "--channel", channel, "--n", String(n), ...narrateArgs(channel, n), ...(flag("refresh-narration") ? [] : ["--missing-only"])], { stdio: "inherit" });
      } catch (e) {
        console.warn(`[narration] TTS failed: ${(e as Error).message}`);
      }
    }
    story.scenes.forEach((s, i) => { if (fs.existsSync(path.join(audioDir, `scene-${i + 1}.wav`))) s.audio = `audio/${channel}/${tag}/scene-${i + 1}.wav`; });
    const have = story.scenes.filter((s) => s.audio).length;
    console.log(`[narration] ${have}/${story.scenes.length} WAVs in ${audioDir}`);
    if (flag("require-narration") && have < story.scenes.length) throw new Error(`Narration missing for ${tag}; run scripts/narration/narrate.py first`);
  }
  let voiced = cfg.narrated;
  const voiceOf = (cfg as { voice?: (n: number) => VoiceLine[] }).voice;
  if (voiceOf && !prerendered) {
    const lines = voiceOf(n);
    const audioDir = path.join("public", "audio", channel, tag);
    fs.writeFileSync(path.join(outDir, `${tag}.narration.json`), JSON.stringify(lines.map(({ file, text }) => ({ file, text })), null, 2));
    if (flag("auto-narrate")) {
      const py = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
      try {
        execFileSync(py, ["scripts/narration/narrate.py", "--channel", channel, "--n", String(n), ...narrateArgs(channel, n), "--missing-only"], { stdio: "inherit" });
      } catch (e) {
        console.warn(`[voice] TTS failed, posting without voice: ${(e as Error).message}`);
      }
    }
    const seconds = (f: string) => { try { return Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim()) || 0; } catch { return 0; } };
    const timed = lines.filter((l) => fs.existsSync(path.join(audioDir, l.file)))
      .map((l) => ({ src: `audio/${channel}/${tag}/${l.file}`, at: l.at, dur: seconds(path.join(audioDir, l.file)) }));
    // Never two voice clips at once: a clip that would start before the previous one ends is moved after it.
    const spaced = spaceCues(timed);
    const moved = spaced.filter((c) => c.at - (timed.find((t) => t.src === c.src)?.at ?? c.at) > 0.05);
    if (moved.length) console.log(`[voice] moved ${moved.length} clip(s) so voices never overlap: ${moved.map((c) => `${path.basename(c.src)}→${c.at}s`).join(", ")}`);
    const cues = spaced.map(({ src, at }) => ({ src, at }));
    (props as { voice?: unknown }).voice = cues;
    voiced = cues.length > 0;
    console.log(`[voice] ${cues.length}/${lines.length} clips`);
  }
  const meta = cfg.meta(n);
  const propsFile = path.join(outDir, `${tag}.json`);
  fs.writeFileSync(propsFile, JSON.stringify(props, null, 2));
  fs.writeFileSync(path.join(outDir, `${tag}.meta.json`), JSON.stringify({ ...meta, publishAt, channel, n }, null, 2));
  console.log(`[${cfg.name}] post #${n} (${date} slot ${slot} → ${publishAt})`);
  if (flag("dry")) return;

  if (!prerendered && (!fs.existsSync(video) || flag("force"))) {
    const extra = process.env.REMOTION_CHROME ? [`--browser-executable=${process.env.REMOTION_CHROME}`] : [];
    execFileSync("npx", ["remotion", "render", "apps/studio/src/remotion/index.ts", cfg.composition, video, `--props=${propsFile}`, ...(voiced ? [] : ["--muted"]), `--crf=${process.env.REMOTION_CRF || "23"}`, ...extra], { stdio: "inherit", shell: process.platform === "win32" });
  }
  console.log(`[${cfg.name}] video ${video}`);

  // Ledger (catch-up after skipped cron runs): only for real slot publishes, i.e. an explicit --date and --youtube.
  const slotKey = arg("date") && flag("youtube") && ledgerEnabled() ? { channel, date, slot, n } : null;
  const prev = slotKey ? (await ledgerStatus([slotKey]).catch(() => []))[0] : undefined;
  let youtubeId = prev?.youtube_id ?? "";
  if (flag("youtube")) {
    youtubeId = await uploadYouTube({ video, meta, publishAt, tokenJson: process.env[cfg.youtubeTokenSecret] ?? process.env.YT_TOKEN_JSON, clientSecretJson: process.env[`${cfg.youtubeTokenSecret}_CLIENT`] || process.env.YT_CLIENT_SECRET_JSON });
    console.log(`[YouTube] https://youtube.com/shorts/${youtubeId} scheduled for ${publishAt}`);
    if (slotKey) await ledgerRecord({ ...slotKey, status: "DONE", youtubeId, meta: flag("meta") ? "social" : "off" }).then(() => console.log(`[ledger] ${channel} ${date} slot ${slot} recorded`), (x: Error) => console.error(`[ledger] ${x.message}`));
  }
  // --meta: social fan-out after YouTube is public — Instagram +5 min, Facebook teaser +10, Pinterest pin +15.
  if (flag("meta")) {
    if (!youtubeId) throw new Error("social posts need the YouTube video (run with --youtube)");
    const failed = await fanout({ cfg, meta, video, youtubeId, publishAt, key: `${channel}/${tag}`, done: (prev?.social ?? {}) as Parameters<typeof fanout>[0]["done"],
      record: async (platform, result) => { if (slotKey) await ledgerSocial(slotKey, platform, result); } });
    if (failed) throw new Error(`${failed} social platform(s) failed — check them before posting again (they are not retried automatically)`);
  }
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exitCode = 1; });
