/**
 * Publishes admin-approved bot videos (videobot.publications) to YouTube / Instagram / Facebook.
 * Runs in .github/workflows/publish-bot.yml (on approval via repository_dispatch, plus a safety schedule).
 * - claims due publications with SKIP LOCKED (two runs never take the same one)
 * - per platform: skipped if already ok (retries never duplicate), YouTube uploads are private + scheduled publishAt
 *   and idempotent by title (scripts/publish/youtube.ts), Meta posts at run time
 * - success is only recorded with the platform's returned id; requester and admin are told the result
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { uploadYouTube } from "../publish/youtube";
import { publishMeta } from "../publish/meta";
import { fetchFile } from "./storage";
import { sendMessage } from "./telegram";

interface Target { id: string; name: string; youtubeTokenSecret: string; metaSecretPrefix: string }
interface Publication {
  code: string; status: string; target: string; platforms: string[]; publish_at: string | null; title: string; description: string; hashtags: string[];
  requested_by: number; results: Record<string, { ok: boolean; id?: string; error?: string }>; job: { code: string; chat_id: number; output: Record<string, unknown> } | null;
}

const TARGETS = JSON.parse(fs.readFileSync(path.join(process.cwd(), "channels/publish-targets.json"), "utf8")) as Target[];

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, ""), key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, { method: "POST", headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify(args) });
  if (!res.ok) throw new Error(`${fn}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as T;
}

const tell = (chatId: string | number | undefined, text: string) => (chatId ? sendMessage(chatId, text).catch((e: Error) => console.warn(`[tg] ${e.message}`)) : Promise.resolve());

export async function publishOne(p: Publication): Promise<Record<string, { ok: boolean; id?: string; error?: string }>> {
  const t = TARGETS.find((x) => x.id === p.target);
  if (!t) return Object.fromEntries(p.platforms.map((pl) => [pl, { ok: false, error: `unknown target ${p.target}` }]));
  const file = String(p.job?.output?.file ?? "");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pub-"));
  const video = path.join(dir, "video.mp4");
  const results: Record<string, { ok: boolean; id?: string; error?: string }> = {};
  try {
    await fetchFile(file, video);
    const tags = p.hashtags.map((h) => h.replace(/^#/, "")).filter(Boolean);
    const description = `${p.description}\n\n${p.hashtags.join(" ")}`.trim();
    for (const platform of p.platforms) {
      if (p.results?.[platform]?.ok) { console.log(`[${p.code}] ${platform} already done (${p.results[platform]!.id})`); continue; }
      try {
        if (platform === "youtube") {
          const id = await uploadYouTube({
            video, publishAt: p.publish_at ?? new Date().toISOString(),
            meta: { title: p.title.slice(0, 100), description, tags: [...tags, "shorts"], caption: description, language: "hi", categoryId: "22" },
            tokenJson: process.env[t.youtubeTokenSecret], clientSecretJson: process.env[`${t.youtubeTokenSecret}_CLIENT`] || process.env.YT_CLIENT_SECRET_JSON
          });
          results.youtube = { ok: true, id };
        } else if (platform === "instagram" || platform === "facebook") {
          const pre = t.metaSecretPrefix;
          const token = process.env[`${pre}_PAGE_TOKEN`];
          const target = platform === "instagram" ? { igUserId: process.env[`${pre}_IG_USER_ID`] } : { pageId: process.env[`${pre}_PAGE_ID`] };
          if (!token || !Object.values(target)[0]) throw new Error(`${pre} ${platform} secrets not set`);
          await publishMeta({ video, caption: `${p.title}\n${description}`.slice(0, 2200), key: `bot/${p.code}-${platform}`, pageToken: token, ...target });
          results[platform] = { ok: true, id: "published" };
        } else results[platform] = { ok: false, error: "unknown platform" };
      } catch (e) {
        results[platform] = { ok: false, error: (e as Error).message.slice(0, 300) };
        console.error(`[${p.code}] ${platform}: ${(e as Error).message}`);
      }
    }
  } catch (e) {
    for (const pl of p.platforms) if (!p.results?.[pl]?.ok) results[pl] = { ok: false, error: (e as Error).message.slice(0, 300) };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  return results;
}

async function main() {
  const due = await rpc<Publication[]>("videobot_claim_publications", { p_limit: 5 });
  if (!due.length) { console.log("[publish-bot] nothing due"); return; }
  let failed = 0;
  for (const p of due) {
    console.log(`[publish-bot] ${p.code} -> ${p.target} (${p.platforms.join(", ")})`);
    const results = await publishOne(p);
    const done = await rpc<Publication>("videobot_finish_publication", { p_code: p.code, p_results: results });
    const lines = Object.entries(results).map(([pl, r]) => `${r.ok ? "✅" : "❌"} ${pl}${r.id && r.id !== "published" ? ` (${r.id})` : ""}${r.error ? `: ${r.error}` : ""}`);
    const msg = `📤 ${p.code} · ${p.job?.code ?? ""} → ${p.target}: ${done.status}\n${lines.join("\n")}${results.youtube?.ok ? "\nYouTube pe scheduled time pe public hoga." : ""}`;
    await tell(process.env.TG_ADMIN_ID, msg);
    if (String(p.requested_by) !== String(process.env.TG_ADMIN_ID) && done.status !== "FAILED") await tell(p.requested_by, `🎉 Aapka video ${p.job?.code} ${p.target} pe ja raha hai!`);
    if (done.status !== "PUBLISHED") failed++;
  }
  if (failed) process.exitCode = 1;
}

if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
