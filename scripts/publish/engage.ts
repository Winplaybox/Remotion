/**
 * Comment auto-reply on YouTube, Instagram and Facebook for quiz channels (channel config has `quiz`).
 * Runs hourly from publish-channels.yml (answers job). Idempotent: every answered comment is stored in
 * videobot.comment_replies, so a comment never gets two replies.
 *
 * - Viewer guessed (e.g. "row 5 #9"): replied once the answer is public (post n+1 is out) with ✅ / ❌ + the answer.
 *   Waiting until then keeps the puzzle unspoiled, and the reply notification pulls the viewer back for the new post.
 * - Half a guess ("5"): asks for the full format straight away.
 * - No guess ("nice", "😂"): friendly reply + how to answer, straight away (only for fresh comments).
 * Links / spam-looking comments are skipped. Switch off per channel in the dashboard (Social tab).
 *
 *   npx ts-node scripts/publish/engage.ts [--dry] [--channel chakra-puzzle] [--days 7]
 */
import { CHANNELS, type ChannelConfig, type ChannelId } from "../../channels/channels";
import type { Quiz } from "../../channels/quiz";
import { metaCreds } from "./social-accounts";
import { youtubeClient } from "./youtube";

export type Platform = "youtube" | "instagram" | "facebook";
export type Kind = "correct" | "wrong" | "partial" | "hello";
export interface ViewerComment { id: string; text: string; at: number }

const HOUR = 3600_000;
/** Max comment age for a reply (guesses can wait for the reveal; small talk only while fresh). */
export const MAX_AGE = { guess: 7 * 24 * HOUR, other: 48 * HOUR };
/** Per channel+platform per run; YouTube also per day for all channels (50 quota units per reply out of 10k). */
export const CAP = { perRun: 25, youtubePerDay: Number(process.env.ENGAGE_YT_DAILY_CAP ?? 60) };

const SPAM = /https?:\/\/|www\.|\.com\b|t\.me\/|whats\s?app|dm\s*(me|karo)|check\s+my|sub\s*4\s*sub|promo|follow\s+back/i;

export function decide(c: ViewerComment, quiz: Quiz, key: number[], revealed: boolean, now = Date.now()): Kind | null {
  const age = now - c.at;
  if (!c.text.trim() || SPAM.test(c.text)) return null;
  const g = quiz.parse(c.text);
  if (Array.isArray(g)) {
    if (!revealed || age > MAX_AGE.guess) return null;
    return g.length === key.length && g.every((v, i) => v === key[i]) ? "correct" : "wrong";
  }
  if (age > MAX_AGE.other) return null;
  return g === "partial" ? "partial" : "hello";
}

const TEXTS: Record<Kind, string[]> = {
  correct: [
    "✅ Ekdum sahi — {ans}! 🔥 Sharp nazar! Naya puzzle aa gaya hai, wo bhi try karo 👀",
    "🎯 Bilkul sahi pakda: {ans}! 👏 Tum top players mein ho. Agla wala aur mushkil hai 😎",
    "✅ Sahi jawab: {ans}! Respect 🙌 Naye puzzle ka jawab bhi comment karna 👇",
    "🔥 Correct — {ans}! Dimaag tez hai 🧠 Agla challenge ready hai, dekho!"
  ],
  wrong: [
    "❌ Close tha! Sahi jawab {ans} tha 😅 Naya puzzle aa gaya — is baar pakka 💪",
    "Arre! Jawab {ans} tha 👀 Naye puzzle mein revenge lo 🔥",
    "❌ Nahi, {ans} tha! Koi baat nahi — agla puzzle try karo 🎯",
    "Oops, sahi jawab {ans} tha 🙈 Agli baar dhyan se dekhna — naya puzzle live hai!"
  ],
  partial: [
    "Almost! 👀 Poora jawab likho — {how} 👇",
    "Thoda aur! Jawab aise likho: {how} ✍️",
    "Lock karne ke liye poora likho — {how} 🔒"
  ],
  hello: [
    "🙏 Thanks! Ab jawab bhi do — {how} 👇 Sahi hua to shoutout milega 😎",
    "❤️ Shukriya! Aapka jawab kya hai? {how} 👇",
    "😄 Mazaa aaya? Jawab comment karo — {how}. Roz naya puzzle aata hai!",
    "🙌 Thanks for watching! Pakda kya? {how} 👇"
  ]
};

const hash = (s: string) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };

/** Varied wording (picked by comment id, so it is stable) + platform tail. */
export function replyText(kind: Kind, commentId: string, quiz: Quiz, key: number[], platform: Platform, handle: string): string {
  const pool = TEXTS[kind];
  const base = pool[hash(commentId) % pool.length]!.replace("{ans}", quiz.label(key)).replace("{how}", quiz.how);
  const tail = platform === "youtube" ? (kind === "correct" || kind === "wrong" ? "\n🔔 Subscribe karo — roz naya challenge!" : "") : `\n▶️ Roz naya video YouTube pe: ${handle}`;
  return base + tail;
}

// ---------- data ----------
interface LedgerPost { n: number; youtube_id: string; social?: Record<string, { ok?: boolean; id?: string }> | null; created_at: string }

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const url = process.env.SUPABASE_URL!.replace(/\/$/, ""), key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, { method: "POST", headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify(args) });
  if (!res.ok) throw new Error(`${fn}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as T;
}

/** Post n's answer is public when post n+1 is out (or the answer was in the same video). */
export function revealedFn(posts: { n: number; live: boolean }[], answerInNextFrom = Infinity) {
  const live = new Set(posts.filter((p) => p.live).map((p) => p.n));
  return (n: number) => n < answerInNextFrom || live.has(n + 1);
}

const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION ?? "v25.0"}`;
async function graph(path: string, token: string, init?: { method: "POST"; body: Record<string, string> }) {
  const res = await fetch(`${GRAPH}/${path}${path.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(token)}`,
    init ? { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(init.body) } : undefined);
  const j = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: number }; [k: string]: unknown };
  if (!res.ok || j.error) throw new Error(`Meta ${res.status}: ${j.error?.message ?? "error"}${j.error?.code === 10 || j.error?.code === 200 ? " (permission missing — Meta login config mein instagram_manage_comments / pages_manage_engagement / pages_read_user_content add karke Reconnect karo)" : ""}`);
  return j;
}

interface Target { platform: Platform; n: number; comments: () => Promise<ViewerComment[]>; reply: (commentId: string, text: string) => Promise<string> }

async function metaTargets(id: ChannelId, cfg: ChannelConfig, posts: LedgerPost[]): Promise<Target[]> {
  const m = await metaCreds(id, cfg);
  if (!m.pageToken) return [];
  const token = m.pageToken, out: Target[] = [];
  const igName = m.igUserId ? String((await graph(`${m.igUserId}?fields=username`, token)).username ?? "").toLowerCase() : "";
  for (const p of posts) {
    const ig = p.social?.instagram, fb = p.social?.facebook;
    if (ig?.ok && ig.id && m.igUserId) out.push({
      platform: "instagram", n: p.n,
      comments: async () => ((await graph(`${ig.id}/comments?fields=id,text,username,timestamp&limit=50`, token)).data as { id: string; text?: string; username?: string; timestamp: string }[] ?? [])
        .filter((c) => (c.username ?? "").toLowerCase() !== igName).map((c) => ({ id: c.id, text: c.text ?? "", at: Date.parse(c.timestamp) })),
      reply: async (cid, text) => String((await graph(`${cid}/replies`, token, { method: "POST", body: { message: text } })).id ?? "")
    });
    if (fb?.ok && fb.id && m.pageId) out.push({
      platform: "facebook", n: p.n,
      comments: async () => ((await graph(`${fb.id}/comments?fields=id,message,from{id},created_time&filter=toplevel&limit=50`, token)).data as { id: string; message?: string; from?: { id?: string }; created_time: string }[] ?? [])
        .filter((c) => c.from?.id !== m.pageId).map((c) => ({ id: c.id, text: c.message ?? "", at: Date.parse(c.created_time) })),
      reply: async (cid, text) => String((await graph(`${cid}/comments`, token, { method: "POST", body: { message: text } })).id ?? "")
    });
  }
  return out;
}

const postNo = (title: string) => Number(/(?:#|Level |EP )(\d+)/.exec(title)?.[1] ?? NaN);

async function youtubeTargets(cfg: ChannelConfig, days: number): Promise<{ targets: Target[]; publicNs: number[] }> {
  const token = process.env[cfg.youtubeTokenSecret];
  if (!token) return { targets: [], publicNs: [] };
  const yt = youtubeClient(token, process.env[`${cfg.youtubeTokenSecret}_CLIENT`] || process.env.YT_CLIENT_SECRET_JSON);
  const ch = await yt.channels.list({ part: ["id", "contentDetails"], mine: true });
  const me = ch.data.items?.[0], uploads = me?.contentDetails?.relatedPlaylists?.uploads;
  if (!me?.id || !uploads) return { targets: [], publicNs: [] };
  const items = await yt.playlistItems.list({ part: ["contentDetails"], playlistId: uploads, maxResults: 25 });
  const ids = (items.data.items ?? []).map((i) => i.contentDetails?.videoId).filter((v): v is string => !!v);
  if (!ids.length) return { targets: [], publicNs: [] };
  const vids = (await yt.videos.list({ part: ["snippet", "status"], id: ids })).data.items ?? [];
  const pub = vids.filter((v) => v.status?.privacyStatus === "public" && Number.isFinite(postNo(v.snippet?.title ?? "")));
  const since = Date.now() - days * 24 * HOUR;
  const targets = pub.filter((v) => Date.parse(v.status?.publishAt ?? v.snippet?.publishedAt ?? "") >= since).map((v): Target => ({
    platform: "youtube", n: postNo(v.snippet!.title!),
    comments: async () => ((await yt.commentThreads.list({ part: ["snippet"], videoId: v.id!, maxResults: 100, order: "time", textFormat: "plainText" })).data.items ?? [])
      .map((t) => t.snippet?.topLevelComment).filter((c) => c?.id && c.snippet?.authorChannelId?.value !== me.id)
      .map((c) => ({ id: c!.id!, text: c!.snippet?.textOriginal ?? c!.snippet?.textDisplay ?? "", at: Date.parse(c!.snippet?.publishedAt ?? "") })),
    reply: async (cid, text) => String((await yt.comments.insert({ part: ["snippet"], requestBody: { snippet: { parentId: cid, textOriginal: text } } })).data.id ?? "")
  }));
  return { targets, publicNs: pub.map((v) => postNo(v.snippet!.title!)) };
}

async function run(id: ChannelId, opts: { dry: boolean; days: number }, budget: { youtube: number }) {
  const cfg = CHANNELS[id] as ChannelConfig;
  if (!cfg.quiz) return;
  const settings = (await rpc<{ channel: string; settings: { auto_reply?: boolean } }[]>("videobot_channel_settings_list", {})).find((s) => s.channel === id)?.settings ?? {};
  if (settings.auto_reply === false) { console.log(`[${cfg.name}] auto-reply off (dashboard)`); return; }
  const posts = await rpc<LedgerPost[]>("videobot_channel_posts_recent", { p_channel: id, p_days: opts.days + 1 });
  const yt = await youtubeTargets(cfg, opts.days).catch((e: Error) => { console.warn(`[${cfg.name}] youtube: ${e.message}`); return { targets: [], publicNs: [] as number[] }; });
  const meta = await metaTargets(id, cfg, posts).catch((e: Error) => { console.warn(`[${cfg.name}] meta: ${e.message}`); return [] as Target[]; });
  const revealed = revealedFn([...posts.map((p) => ({ n: p.n, live: !!(p.social?.instagram?.ok || p.social?.facebook?.ok) })), ...yt.publicNs.map((n) => ({ n, live: true }))], cfg.answerInNextFrom);
  const sent: Record<string, number> = {};
  for (const t of [...yt.targets, ...meta]) {
    const key = cfg.quiz.key(t.n);
    let comments: ViewerComment[];
    try { comments = await t.comments(); } catch (e) { console.warn(`[${cfg.name}] ${t.platform} #${t.n}: ${(e as Error).message}`); continue; }
    if (!comments.length) continue;
    const done = new Set(await rpc<string[]>("videobot_comment_replied", { p_platform: t.platform, p_ids: comments.map((c) => c.id) }));
    for (const c of comments) {
      if (done.has(c.id)) continue;
      const kind = decide(c, cfg.quiz, key, revealed(t.n));
      if (!kind) continue;
      if ((sent[t.platform] ?? 0) >= CAP.perRun) break;
      if (t.platform === "youtube" && budget.youtube <= 0) break;
      const text = replyText(kind, c.id, cfg.quiz, key, t.platform, cfg.youtubeHandle);
      console.log(`[${cfg.name}] ${t.platform} #${t.n} ${kind}: "${c.text.slice(0, 60).replace(/\s+/g, " ")}"${opts.dry ? " (dry)" : ""}`);
      if (opts.dry) continue;
      try {
        const rid = await t.reply(c.id, text);
        await rpc("videobot_comment_reply_record", { p_platform: t.platform, p_comment_id: c.id, p_channel: id, p_n: t.n, p_kind: kind, p_reply_id: rid });
        sent[t.platform] = (sent[t.platform] ?? 0) + 1;
        if (t.platform === "youtube") budget.youtube--;
      } catch (e) {
        const msg = (e as Error).message;
        console.warn(`[${cfg.name}] ${t.platform} reply failed: ${msg}`);
        if (/quota/i.test(msg)) budget.youtube = 0;
        if (/permission/i.test(msg)) break;
      }
    }
  }
  console.log(`[${cfg.name}] replies: ${JSON.stringify(sent)}`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const opt = (k: string) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
  const dry = args.includes("--dry"), days = Number(opt("--days") ?? 7) || 7, only = opt("--channel");
  (async () => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) { console.log("[engage] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — skipped"); return; }
    // Pacific midnight is when the YouTube quota resets; a rolling 24h window is close enough and simpler.
    const used = await rpc<number>("videobot_comment_reply_count", { p_platform: "youtube", p_since: new Date(Date.now() - 24 * HOUR).toISOString() });
    const budget = { youtube: Math.max(0, CAP.youtubePerDay - used) };
    for (const id of Object.keys(CHANNELS) as ChannelId[]) {
      if (only && id !== only) continue;
      try { await run(id, { dry, days }, budget); } catch (e) { console.warn(`[engage] ${id}: ${(e as Error).message}`); }
    }
  })();
}
