/**
 * Channel branding: renders banner / logo / watermark (channels/branding.ts) and, with --apply, sets on YouTube:
 * description, keywords, default language (country left blank), banner and watermark.
 * The profile picture cannot be set through the API — upload out/branding/<channel>/logo.png in YouTube Studio.
 *
 *   npx ts-node scripts/publish/branding.ts [--apply] [--channel dimaag-lock]
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";
import { BRANDS, type ChannelBrand } from "../../channels/branding";
import { CHANNELS, type ChannelId } from "../../channels/channels";
import { youtubeAuth } from "./youtube";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const ONLY = args.includes("--channel") ? args[args.indexOf("--channel") + 1] : undefined;
const OUT = "out/branding";
const chrome = process.env.REMOTION_CHROME ? [`--browser-executable=${process.env.REMOTION_CHROME}`] : [];

function schedule(id: string): string {
  const slots = (CHANNELS[id as ChannelId]?.slots ?? []).length;
  if (id === "dimaag-lock") return "2 new puzzles daily";
  return slots ? `Roz ${slots} naye videos` : "Roz naye videos";
}

/** keywords field: space separated, multi-word ones quoted, max 500 chars. */
export function keywordField(k: string[]): string {
  let out = "";
  for (const w of k) { const t = w.includes(" ") ? `"${w}"` : w; if ((out + " " + t).trim().length > 500) break; out = (out + " " + t).trim(); }
  return out;
}

function still(comp: string, file: string, props?: object) {
  const a = ["remotion", "still", "apps/studio/src/remotion/index.ts", comp, file, "--image-format=png", ...chrome];
  if (props) { const pf = path.join(OUT, `.props-${path.basename(path.dirname(file))}-${path.basename(file)}.json`); fs.writeFileSync(pf, JSON.stringify(props)); a.push(`--props=${pf}`); }
  execFileSync("npx", a, { stdio: "inherit" });
}

function render(id: string, b: ChannelBrand) {
  const dir = path.join(OUT, id);
  fs.mkdirSync(dir, { recursive: true });
  const props = { kind: "banner", title: b.title, tagline: b.tagline, handle: b.handle, schedule: schedule(id), colors: b.colors, icon: b.icon };
  // Jasoos Bhai has its own character art.
  if (id === "liar-lineup") { still("JasoosBanner", path.join(dir, "banner.png")); still("JasoosLogo", path.join(dir, "logo.png")); }
  else { still("ChannelBanner", path.join(dir, "banner.png"), props); still("ChannelLogo", path.join(dir, "logo.png"), { ...props, kind: "logo" }); }
  still("ChannelWatermark", path.join(dir, "watermark.png"), { ...props, kind: "watermark" });
  // Banner upload limit is 6 MB: re-encode as JPEG if needed.
  if (fs.statSync(path.join(dir, "banner.png")).size > 5.5e6) execFileSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(dir, "banner.png"), "-q:v", "3", path.join(dir, "banner.jpg")]);
  fs.writeFileSync(path.join(dir, "description.txt"), b.description);
  fs.writeFileSync(path.join(dir, "keywords.txt"), keywordField(b.keywords));
  return dir;
}

async function apply(id: string, b: ChannelBrand, dir: string) {
  const token = process.env[b.tokenSecret];
  if (!token) { console.log(`[branding] ${id}: ${b.tokenSecret} not set — skipped`); return; }
  const auth = youtubeAuth(token, process.env[`${b.tokenSecret}_CLIENT`] || process.env.YT_CLIENT_SECRET_JSON);
  const yt = google.youtube({ version: "v3", auth });
  const ch = (await yt.channels.list({ part: ["brandingSettings", "snippet"], mine: true })).data.items?.[0];
  if (!ch?.id) throw new Error(`${id}: no channel for ${b.tokenSecret}`);
  const bannerFile = fs.existsSync(path.join(dir, "banner.jpg")) ? path.join(dir, "banner.jpg") : path.join(dir, "banner.png");
  const banner = await yt.channelBanners.insert({ media: { mimeType: bannerFile.endsWith(".jpg") ? "image/jpeg" : "image/png", body: fs.createReadStream(bannerFile) } });
  const channel = { ...(ch.brandingSettings?.channel ?? {}), description: b.description, keywords: keywordField(b.keywords), defaultLanguage: b.language };
  delete (channel as { country?: string }).country; // blank on purpose
  await yt.channels.update({ part: ["brandingSettings"], requestBody: { id: ch.id, brandingSettings: { channel, image: { bannerExternalUrl: banner.data.url! } } } });
  await yt.watermarks.set({ channelId: ch.id, requestBody: { position: { type: "corner", cornerPosition: "topRight" }, timing: { type: "offsetFromStart", offsetMs: "0" } },
    media: { mimeType: "image/png", body: fs.createReadStream(path.join(dir, "watermark.png")) } });
  console.log(`[branding] ${id} (${ch.snippet?.title}): description, keywords, banner, watermark updated`);
}

(async () => {
  let failed = 0;
  for (const [id, b] of Object.entries(BRANDS)) {
    if (ONLY && id !== ONLY) continue;
    const dir = render(id, b);
    if (APPLY) { try { await apply(id, b, dir); } catch (e) { failed++; console.error(`[branding] ${id}: ${(e as Error).message}`); } }
  }
  if (failed) process.exit(1);
})();
