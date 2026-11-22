/**
 * Unpaper comment engagement loop (YouTube @Unpaper, Instagram @unpaper.ai, Facebook Page "Unpaper").
 * Runs every 30 min from .github/workflows/unpaper-engage.yml (only when repo variable UNPAPER_ENGAGE_ENABLED == 'true').
 *
 * - Lists viewer comments from the last 7 days on Unpaper's recent videos / posts.
 * - Acts only on comments that are >= 30 min old and that Unpaper has not replied to yet. "Already replied" is read
 *   from the platform itself (a reply by our own channel / account / Page under the comment), so no state file is needed.
 * - Facebook: likes the comment (POST /{comment}/likes), then replies.
 *   YouTube + Instagram: reply only — the YouTube Data API has no comment like / creator heart and the Instagram Graph API
 *   cannot like a comment.
 * - Reply: short, warm Hinglish (1-2 lines) from GitHub Models (openai/gpt-4o-mini via GITHUB_TOKEN, `models: read`),
 *   checked by guardrails (no links except our own handles, no money / legal talk, no promises, no repeats); anything
 *   that fails falls back to a rotating set of templates.
 * - Spam, links, abuse, hate, political fights and negative rants are NOT replied to; they are logged for the owner.
 * - At most 25 replies per platform per run, with small random gaps between replies.
 *
 *   npx ts-node scripts/publish/unpaper-engage.ts [--dry] [--days 7]
 */
import { BLOCKED_PHRASES, blocked, tone } from "../../channels/moderation";
import { UNPAPER_HANDLES } from "../../engines/unpaper-short/src/brand";
import { youtubeClient } from "./youtube";

export type Platform = "youtube" | "instagram" | "facebook";
export const PLATFORMS: Platform[] = ["youtube", "instagram", "facebook"];

export interface EngageComment {
  platform: Platform;
  id: string;
  text: string;
  author: string;
  /** Comment time, ms since epoch. */
  at: number;
  postId: string;
  /** Video / post title or caption (used to keep the reply on topic). */
  topic: string;
  /** True when our own channel / account / Page already replied under this comment. */
  repliedByUs: boolean;
}

export type SkipReason = "abuse" | "hate" | "spam" | "link" | "politics" | "negative" | "empty";
export interface Skipped { comment: EngageComment; reason: SkipReason; match?: string | undefined }

export const MIN_AGE_MIN = Number(process.env.UNPAPER_ENGAGE_MIN_AGE_MIN ?? 30);
export const WINDOW_DAYS = 7;
export const CAP_PER_RUN = 25;
/** YouTube comments.insert costs 50 quota units; keep room for uploads (10k units/day for the project). */
export const YT_DAILY_CAP = Number(process.env.UNPAPER_ENGAGE_YT_DAILY_CAP ?? 80);
export const MODEL = process.env.UNPAPER_ENGAGE_MODEL ?? "openai/gpt-4o-mini";
export const MODELS_URL = "https://models.github.ai/inference/chat/completions";
export const OUR_CHANNEL_ID = "UCkrJQ_LWZNAeT3TRDp30SMw";
export const OUR_PAGE_ID = "61596651637282";
const ALLOWED_HANDLES = [UNPAPER_HANDLES.youtube.handle, UNPAPER_HANDLES.instagram.handle].map((h) => h.toLowerCase());

// ---------- filters ----------

export const isOldEnough = (c: Pick<EngageComment, "at">, now = Date.now(), minAgeMin = MIN_AGE_MIN) => Number.isFinite(c.at) && now - c.at >= minAgeMin * 60_000;
export const inWindow = (c: Pick<EngageComment, "at">, now = Date.now(), days = WINDOW_DAYS) => Number.isFinite(c.at) && now - c.at <= days * 86_400_000;

const HATE = /\b(nigg\w*|retard\w*|faggot|kafir|katua|katwa|mulla|jihadi|chamar|bhangi|terrorist (?:hai|ho|log)|go back to pakistan|pakistan chale jao|anti[- ]?national)\b/i;
const POLITICS = /\b(modi|bjp|congress|rahul gandhi|pappu|kejriwal|aap party|yogi|owaisi|rss|sanghi|andh ?bhakt|bhakt(?:s|on)?|librandu|chamcha|godi media|feku|election|chunav|vote (?:do|karo|for)|left ?wing|right ?wing|hindu[- ]muslim|khalistan|urban naxal|tukde tukde|presstitute)\b/i;
const LINK = /(https?:\/\/|www\.|\b[\w-]+\.(?:com|in|net|org|io|ly|me|xyz|link|site|shop|app)\b|t\.me\/|wa\.me|bit\.ly)/i;
const SPAM = /(sub4sub|sub ?4 ?sub|follow ?back|check (?:out )?my (?:channel|page|profile)|visit my|promot(?:e|ion)|dm (?:me|karo)|inbox|earn (?:money|\$|₹)|paise kamao|work from home|investment|crypto|bitcoin|forex|trading|betting|satta|casino|giveaway|whatsapp|telegram|link in bio|(.)\2{9,})/i;

/** The spam half of channels/moderation BLOCKED_PHRASES (everything from "free followers" on); the rest is abuse. */
const SPAM_PHRASES = new Set(BLOCKED_PHRASES.slice(Math.max(0, BLOCKED_PHRASES.indexOf("free followers"))));

/** Why a comment must not get a reply (logged for the owner instead), or null when it is fine to engage. */
export function screen(text: string): { reason: SkipReason; match?: string | undefined } | null {
  const t = text.trim();
  if (!t) return { reason: "empty" };
  if (HATE.test(t)) return { reason: "hate" };
  if (LINK.test(t)) return { reason: "link", match: LINK.exec(t)?.[0] };
  if (SPAM.test(t)) return { reason: "spam", match: SPAM.exec(t)?.[0] };
  const bad = blocked(t);
  if (bad) {
    // channels/moderation also lists spam phrases ("whatsapp", "loan"...): those are spam, not abuse.
    return { reason: SPAM_PHRASES.has(bad) ? "spam" : "abuse", match: bad };
  }
  if (POLITICS.test(t)) return { reason: "politics", match: POLITICS.exec(t)?.[0] };
  if (tone(t) === "negative") return { reason: "negative" };
  return null;
}

export interface Selection {
  toReply: EngageComment[];
  skipped: Skipped[];
  /** Younger than MIN_AGE_MIN: picked up by a later run. */
  waiting: number;
  alreadyReplied: number;
  /** Eligible but over the per-run cap: picked up by a later run. */
  overCap: number;
  tooOld: number;
}

/** Pure selection: window, age >= 30 min, not already replied by us, screened, capped (oldest first). */
export function selectComments(comments: EngageComment[], now = Date.now(), cap = CAP_PER_RUN): Selection {
  const out: Selection = { toReply: [], skipped: [], waiting: 0, alreadyReplied: 0, overCap: 0, tooOld: 0 };
  const seen = new Set<string>();
  const eligible: EngageComment[] = [];
  for (const c of comments) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    if (!inWindow(c, now)) { out.tooOld++; continue; }
    if (c.repliedByUs) { out.alreadyReplied++; continue; }
    if (!isOldEnough(c, now)) { out.waiting++; continue; }
    const s = screen(c.text);
    if (s) { out.skipped.push({ comment: c, reason: s.reason, match: s.match }); continue; }
    eligible.push(c);
  }
  eligible.sort((a, b) => a.at - b.at);
  const n = Math.max(0, cap);
  out.toReply = eligible.slice(0, n);
  out.overCap = eligible.length - out.toReply.length;
  return out;
}

// ---------- reply text ----------

/** "Budget ka sach | Unpaper #shorts" -> "Budget ka sach" */
export function topicOf(title: string): string {
  return title.split("\n")[0]!.replace(/\|.*$/, "").replace(/#\w+/g, "").replace(/\s+/g, " ").trim().slice(0, 80);
}

export const isQuestion = (t: string) => /\?|\b(kya|kaise|kyu|kyun|kyon|kab|kaun|kahan|kitna|kitne|how|what|why|when|which|where|can|kar sakte|batao|bataiye|explain)\b/i.test(t);

const TEMPLATES = {
  general: [
    "Shukriya dekhne ke liye! 🙏 {topic} jaise aur documents hum simple bhasha mein laate rahenge. Agla document kaunsa decode karein?",
    "Bahut badhiya laga aapka comment ❤️ Aapko {topic} mein sabse interesting kya laga? Bataiye 👇",
    "Thank you! 😊 Aise hi saath bane rahiye — agla paper aur bhi mast hai. Aap kaunsa topic dekhna chahenge?",
    "Dil se shukriya 🙌 {topic} pe aapki raay sunke accha laga. Koi aur document jo samajhna ho? Comment karo!",
    "Aapka support hi Unpaper ki taakat hai 💪 Agla kaunsa sarkari ya research document decode karein?",
    "Wah, thanks! ✨ Hum har claim source se check karke laate hain. Aapka next topic suggestion kya hai?",
    "Shukriya 🙏 Aise comments se energy milti hai! Kaunsa topic aapke liye agla Unpaper hona chahiye?",
    "Thanks for watching ❤️ {topic} ka aur kaunsa hissa detail mein chahiye? Bataiye, agle video mein dekhte hain!",
    "Accha laga ki aapko pasand aaya 😊 Agla document aap chuniye — comment mein naam likho 👇",
    "Bahut shukriya! 🙌 Roz naye documents simple Hinglish mein — kal phir milte hain. Koi request?"
  ],
  question: [
    "Achha sawaal! 🤔 Iska short jawab source document mein hai — hum ise agle video mein aur clear karenge. Aur kya jaanna hai?",
    "Badhiya question 👏 Note kar liya! {topic} pe follow-up mein ise cover karne ki koshish karenge. Aap aur kya decode karwana chahenge?",
    "Sahi point uthaya 🙌 Ispe detail mein ek video banana banta hai. Tab tak batao, agla document kaunsa decode karein?",
    "Thanks for asking! 😊 Simple jawab ke liye video ka source dekh sakte ho — aur agar chahiye to hum ispe alag explainer laayenge. Kya kehte ho?",
    "Interesting sawaal 🤓 Hum ise list mein daal rahe hain. Aise hi poochte rahiye — agla topic aap hi chuniye!",
    "Great question ❤️ {topic} mein ye hissa thoda tricky hai — agle video mein simple karke samjhayenge. Aur koi doubt?"
  ]
} as const;

const CLOSERS = ["Milte hain agle video mein!", "Saath bane rahiye 🙌", "Kal phir aana!", "Stay curious ✨", "Aapka din accha ho 😊", "Jud ke rahiye 🔔"];

const fnv = (s: string) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };

/** Rotating template, picked by comment id (stable) and never the same text twice in one run. */
export function templateReply(c: Pick<EngageComment, "id" | "text" | "topic">, used: Set<string> = new Set()): string {
  const pool = isQuestion(c.text) ? TEMPLATES.question : TEMPLATES.general;
  const topic = topicOf(c.topic) || "is document";
  const start = fnv(c.id) % pool.length;
  let text = "";
  for (let i = 0; i < pool.length; i++) {
    text = pool[(start + i) % pool.length]!.replace("{topic}", topic);
    if (!used.has(text)) break;
  }
  // Every template already used this run (more replies than templates): add a varied closer so the text stays unique.
  const base = text;
  for (let i = 0; used.has(text); i++) text = `${base} ${CLOSERS[(start + i) % CLOSERS.length]}${i >= CLOSERS.length ? ` ${Math.floor(i / CLOSERS.length) + 1}` : ""}`;
  used.add(text);
  return text;
}

const FORBIDDEN = /(₹|\brs\.?\s?\d|\$\d|invest|stock|share market|mutual fund|loan|tax bach|legal advice|lawyer|vakil|court mein|guarantee|guaranteed|promise|pakka (?:milega|hoga)|100 ?%|free gift|giveaway|paisa|paise|money)/i;

/** Guardrails on a generated reply. Returns the cleaned text, or null when it must not be posted. */
export function cleanReply(raw: string | undefined | null, used: Set<string> = new Set()): string | null {
  if (!raw) return null;
  let t = raw.trim().replace(/^["'“”]+|["'“”]+$/g, "").replace(/\r/g, "");
  const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length || lines.length > 2) return null;
  t = lines.join("\n");
  if (t.length < 8 || t.length > 280) return null;
  if (LINK.test(t)) return null;
  const mentions = t.match(/@[\w.]+/g) ?? [];
  if (mentions.some((m) => !ALLOWED_HANDLES.includes(m.toLowerCase().replace(/\.$/, "")))) return null;
  if (FORBIDDEN.test(t) || blocked(t) || POLITICS.test(t)) return null;
  if (used.has(t)) return null;
  return t;
}

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

export const SYSTEM_PROMPT = [
  "You reply to viewer comments for Unpaper, a Hinglish channel that decodes research papers and government documents in simple words.",
  "Write ONE reply in short, warm Hinglish (Roman script), 1-2 lines, max 200 characters, at most one emoji.",
  "Fit the video's topic. If the comment asks a simple factual question you are sure about from the topic, answer it briefly; otherwise say we'll cover it.",
  "End by inviting them back, e.g. 'Agla document kaunsa decode karein?'.",
  "Never include links, never mention other accounts (only @Unpaper or @unpaper.ai if needed), never promise anything, never give money, investment, tax or legal advice, never discuss politics.",
  "Output only the reply text."
].join(" ");

/** GitHub Models reply, guarded; falls back to a template on any failure. */
export async function generateReply(c: EngageComment, used: Set<string>, opts: { token?: string | undefined; fetchImpl?: FetchLike | undefined } = {}): Promise<{ text: string; source: "model" | "template" }> {
  const token = opts.token, f = opts.fetchImpl ?? (globalThis.fetch as unknown as FetchLike | undefined);
  if (token && f) {
    try {
      const res = await f(MODELS_URL, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          model: MODEL, temperature: 0.8, max_tokens: 120,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Platform: ${c.platform}\nVideo/post topic: ${topicOf(c.topic) || "AI / documents explained"}\nViewer comment: ${c.text.slice(0, 500)}` }
          ]
        }),
        signal: AbortSignal.timeout(20_000)
      });
      if (res.ok) {
        const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const text = cleanReply(j.choices?.[0]?.message?.content, used);
        if (text) { used.add(text); return { text, source: "model" }; }
      } else console.warn(`[unpaper-engage] GitHub Models ${res.status} — using a template`);
    } catch (e) { console.warn(`[unpaper-engage] GitHub Models failed (${(e as Error).message}) — using a template`); }
  }
  return { text: templateReply(c, used), source: "template" };
}

// ---------- platforms ----------

export interface PlatformClient {
  platform: Platform;
  list: (sinceMs: number) => Promise<EngageComment[]>;
  /** Facebook only. */
  like?: (commentId: string) => Promise<void>;
  reply: (commentId: string, text: string) => Promise<void>;
  /** Replies we may still send today (YouTube quota); undefined = no daily limit. */
  budget?: () => number;
}

async function youtubePlatform(tokenJson: string): Promise<PlatformClient> {
  const yt = youtubeClient(tokenJson, process.env.YT_TOKEN_UNPAPER_SHORT_CLIENT || process.env.YT_CLIENT_SECRET_JSON);
  const me = (await yt.channels.list({ part: ["id"], mine: true })).data.items?.[0]?.id ?? OUR_CHANNEL_ID;
  if (me !== OUR_CHANNEL_ID) console.warn(`[youtube] token is for channel ${me}, expected ${OUR_CHANNEL_ID} (@Unpaper) — using the token's channel`);
  let ourRepliesToday = 0;
  return {
    platform: "youtube",
    list: async (since) => {
      const out: EngageComment[] = [];
      const titles = new Map<string, string>();
      let pageToken: string | undefined;
      ourRepliesToday = 0;
      for (let page = 0; page < 5; page++) {
        const r = await yt.commentThreads.list({ part: ["snippet", "replies"], allThreadsRelatedToChannelId: me, maxResults: 100, order: "time", textFormat: "plainText", ...(pageToken ? { pageToken } : {}) });
        const items = r.data.items ?? [];
        for (const t of items) {
          const top = t.snippet?.topLevelComment, s = top?.snippet;
          if (!top?.id || !s) continue;
          const at = Date.parse(s.publishedAt ?? "");
          let replies = t.replies?.comments ?? [];
          // The thread embeds only a few replies; fetch all when there are more.
          if ((t.snippet?.totalReplyCount ?? 0) > replies.length) replies = (await yt.comments.list({ part: ["snippet"], parentId: top.id, maxResults: 100 })).data.items ?? replies;
          for (const rp of replies) if (rp.snippet?.authorChannelId?.value === me && Date.now() - Date.parse(rp.snippet.publishedAt ?? "") < 86_400_000) ourRepliesToday++;
          if (s.authorChannelId?.value === me) continue;
          out.push({
            platform: "youtube", id: top.id, text: s.textOriginal ?? s.textDisplay ?? "", author: s.authorDisplayName ?? "", at,
            postId: s.videoId ?? t.snippet?.videoId ?? "", topic: "", repliedByUs: replies.some((rp) => rp.snippet?.authorChannelId?.value === me)
          });
        }
        const last = items[items.length - 1]?.snippet?.topLevelComment?.snippet?.publishedAt;
        pageToken = r.data.nextPageToken ?? undefined;
        if (!pageToken || !last || Date.parse(last) < since) break;
      }
      const ids = [...new Set(out.map((c) => c.postId).filter(Boolean))];
      for (let i = 0; i < ids.length; i += 50) {
        for (const v of (await yt.videos.list({ part: ["snippet"], id: ids.slice(i, i + 50) })).data.items ?? []) if (v.id) titles.set(v.id, v.snippet?.title ?? "");
      }
      return out.map((c) => ({ ...c, topic: titles.get(c.postId) ?? "" }));
    },
    reply: async (cid, text) => { await yt.comments.insert({ part: ["snippet"], requestBody: { snippet: { parentId: cid, textOriginal: text } } }); ourRepliesToday++; },
    budget: () => Math.max(0, YT_DAILY_CAP - ourRepliesToday)
  };
}

const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION ?? "v25.0"}`;
async function graph<T = Record<string, unknown>>(path: string, token: string, body?: Record<string, string>): Promise<T> {
  const res = await fetch(`${GRAPH}/${path}${path.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(token)}`,
    body ? { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(body) } : undefined);
  const j = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: number } };
  if (!res.ok || j.error) throw new Error(`Meta ${res.status}: ${j.error?.message ?? "error"}${j.error?.code === 10 || j.error?.code === 200 ? " (permission missing: pages_manage_engagement / pages_read_engagement / pages_read_user_content / instagram_manage_comments)" : ""}`);
  return j as T;
}

interface IgComment { id: string; text?: string; username?: string; timestamp: string; replies?: { data?: { username?: string }[] } }
function instagramPlatform(igUserId: string, token: string): PlatformClient {
  return {
    platform: "instagram",
    list: async (since) => {
      const me = String((await graph<{ username?: string }>(`${igUserId}?fields=username`, token)).username ?? "").toLowerCase();
      const media = (await graph<{ data?: { id: string; caption?: string; timestamp?: string }[] }>(`${igUserId}/media?fields=id,caption,timestamp&limit=25`, token)).data ?? [];
      const out: EngageComment[] = [];
      for (const m of media) {
        const comments = (await graph<{ data?: IgComment[] }>(`${m.id}/comments?fields=id,text,username,timestamp,replies{username}&limit=50`, token)).data ?? [];
        for (const c of comments) {
          if ((c.username ?? "").toLowerCase() === me) continue;
          const at = Date.parse(c.timestamp);
          if (at < since) continue;
          out.push({ platform: "instagram", id: c.id, text: c.text ?? "", author: c.username ?? "", at, postId: m.id, topic: m.caption ?? "", repliedByUs: (c.replies?.data ?? []).some((r) => (r.username ?? "").toLowerCase() === me) });
        }
      }
      return out;
    },
    // Instagram Graph API cannot like a comment: reply only.
    reply: async (cid, text) => { await graph(`${cid}/replies`, token, { message: text }); }
  };
}

interface FbComment { id: string; message?: string; from?: { id?: string; name?: string }; created_time: string; comments?: { data?: { from?: { id?: string } }[] } }
function facebookPlatform(pageId: string, token: string): PlatformClient {
  return {
    platform: "facebook",
    list: async (since) => {
      const posts = (await graph<{ data?: { id: string; message?: string }[] }>(`${pageId}/posts?fields=id,message,created_time&limit=25`, token)).data ?? [];
      const out: EngageComment[] = [];
      for (const p of posts) {
        const comments = (await graph<{ data?: FbComment[] }>(`${p.id}/comments?fields=id,message,from{id,name},created_time,comments.limit(25){from{id}}&filter=toplevel&order=reverse_chronological&limit=50`, token)).data ?? [];
        for (const c of comments) {
          if (c.from?.id === pageId) continue;
          const at = Date.parse(c.created_time);
          if (at < since) continue;
          out.push({ platform: "facebook", id: c.id, text: c.message ?? "", author: c.from?.name ?? "", at, postId: p.id, topic: p.message ?? "", repliedByUs: (c.comments?.data ?? []).some((r) => r.from?.id === pageId) });
        }
      }
      return out;
    },
    like: async (cid) => { await graph(`${cid}/likes`, token, {}); },
    reply: async (cid, text) => { await graph(`${cid}/comments`, token, { message: text }); }
  };
}

// ---------- run ----------

export interface PlatformReport { platform: Platform; status: "ok" | "skipped" | "error"; note?: string; scanned: number; replied: number; liked: number; modelReplies: number; templateReplies: number; waiting: number; alreadyReplied: number; overCap: number; failed: number; skipped: Skipped[] }

const emptyReport = (platform: Platform, status: PlatformReport["status"], note?: string): PlatformReport =>
  ({ platform, status, ...(note ? { note } : {}), scanned: 0, replied: 0, liked: 0, modelReplies: 0, templateReplies: 0, waiting: 0, alreadyReplied: 0, overCap: 0, failed: 0, skipped: [] });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Small random human-like gap between replies (default 8-25 s; UNPAPER_ENGAGE_GAP_MS="min,max" to change). */
export function gapMs(rand = Math.random): number {
  const [lo, hi] = (process.env.UNPAPER_ENGAGE_GAP_MS ?? "8000,25000").split(",").map(Number);
  const a = Number.isFinite(lo) ? lo! : 8000, b = Number.isFinite(hi) ? hi! : 25000;
  return Math.round(a + rand() * Math.max(0, b - a));
}

export async function runPlatform(client: PlatformClient, opts: { dry: boolean; days: number; now?: number; modelToken?: string | undefined; used: Set<string>; wait?: (ms: number) => Promise<void>; fetchImpl?: FetchLike }): Promise<PlatformReport> {
  const now = opts.now ?? Date.now();
  const rep = emptyReport(client.platform, "ok");
  const comments = await client.list(now - opts.days * 86_400_000);
  rep.scanned = comments.length;
  const cap = Math.min(CAP_PER_RUN, client.budget ? client.budget() : CAP_PER_RUN);
  const sel = selectComments(comments, now, cap);
  Object.assign(rep, { waiting: sel.waiting, alreadyReplied: sel.alreadyReplied, overCap: sel.overCap, skipped: sel.skipped });
  const wait = opts.wait ?? sleep;
  for (const [i, c] of sel.toReply.entries()) {
    if (i > 0 && !opts.dry) await wait(gapMs());
    const { text, source } = await generateReply(c, opts.used, { token: opts.modelToken, fetchImpl: opts.fetchImpl });
    console.log(`[${c.platform}] ${opts.dry ? "(dry) " : ""}reply to ${c.author || c.id} — "${c.text.slice(0, 60).replace(/\s+/g, " ")}" -> "${text.replace(/\n/g, " / ")}" [${source}]`);
    if (opts.dry) { rep.replied++; continue; }
    try {
      if (client.like) {
        await client.like(c.id).then(() => { rep.liked++; }, (e: Error) => console.warn(`[${c.platform}] like failed: ${e.message}`));
      }
      await client.reply(c.id, text);
      rep.replied++;
      if (source === "model") rep.modelReplies++; else rep.templateReplies++;
    } catch (e) {
      rep.failed++;
      const msg = (e as Error).message;
      console.warn(`[${c.platform}] reply failed: ${msg}`);
      if (/quota|permission|insufficient|forbidden|\b403\b/i.test(msg)) { rep.note = `stopped: ${msg.slice(0, 160)}`; break; }
    }
  }
  return rep;
}

const MASKED: SkipReason[] = ["abuse", "hate"];
export function summary(reports: PlatformReport[], dry: boolean): string {
  const lines = [`## Unpaper comment engagement${dry ? " (dry run)" : ""}`, "", "| Platform | Status | Scanned | Replied | Liked | Model / template | Waiting (<30m) | Already replied | Over cap | Skipped | Failed |", "|---|---|---|---|---|---|---|---|---|---|---|"];
  for (const r of reports) lines.push(`| ${r.platform} | ${r.status}${r.note ? ` — ${r.note}` : ""} | ${r.scanned} | ${r.replied} | ${r.platform === "facebook" ? r.liked : "n/a"} | ${r.modelReplies} / ${r.templateReplies} | ${r.waiting} | ${r.alreadyReplied} | ${r.overCap} | ${r.skipped.length} | ${r.failed} |`);
  const skipped = reports.flatMap((r) => r.skipped).filter((s) => s.reason !== "empty");
  if (skipped.length) {
    lines.push("", "### Skipped comments (not replied — check these yourself)", "");
    for (const s of skipped) {
      const text = MASKED.includes(s.reason) ? "[hidden: abusive]" : `"${s.comment.text.slice(0, 120).replace(/\s+/g, " ")}"`;
      lines.push(`- **${s.comment.platform}** · ${s.reason}${s.match && !MASKED.includes(s.reason) ? ` (${s.match})` : ""} · ${s.comment.author || "?"} · comment ${s.comment.id} on ${s.comment.postId}: ${text}`);
    }
  }
  return lines.join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const days = Number(args[args.indexOf("--days") + 1]) || WINDOW_DAYS;
  const modelToken = process.env.GITHUB_MODELS_TOKEN || process.env.GITHUB_TOKEN;
  const used = new Set<string>();
  const reports: PlatformReport[] = [];
  const notice = (p: Platform, msg: string) => { console.log(`::notice title=unpaper-engage ${p}::${msg}`); reports.push(emptyReport(p, "skipped", msg)); };

  const clients: (() => Promise<PlatformClient | null>)[] = [
    async () => {
      const t = process.env.YT_TOKEN_UNPAPER_SHORT;
      if (!t) { notice("youtube", "YT_TOKEN_UNPAPER_SHORT not set — YouTube skipped"); return null; }
      return youtubePlatform(t);
    },
    async () => {
      const ig = process.env.META_UNPAPER_SHORT_IG_USER_ID, tok = process.env.META_UNPAPER_SHORT_PAGE_TOKEN;
      if (!ig || !tok) { notice("instagram", "META_UNPAPER_SHORT_IG_USER_ID / _PAGE_TOKEN not set — Instagram skipped"); return null; }
      return instagramPlatform(ig, tok);
    },
    async () => {
      const page = process.env.META_UNPAPER_SHORT_PAGE_ID, tok = process.env.META_UNPAPER_SHORT_PAGE_TOKEN;
      if (!page || !tok) { notice("facebook", "META_UNPAPER_SHORT_PAGE_ID / _PAGE_TOKEN not set — Facebook skipped"); return null; }
      if (page !== OUR_PAGE_ID) console.warn(`[facebook] META_UNPAPER_SHORT_PAGE_ID is ${page}, expected ${OUR_PAGE_ID} (Unpaper)`);
      return facebookPlatform(page, tok);
    }
  ];
  for (const [i, make] of clients.entries()) {
    const p = PLATFORMS[i]!;
    try {
      const c = await make();
      if (c) reports.push(await runPlatform(c, { dry, days, modelToken, used }));
    } catch (e) {
      const msg = (e as Error).message;
      console.log(`::warning title=unpaper-engage ${p}::${msg.slice(0, 300)}`);
      reports.push(emptyReport(p, "error", msg.slice(0, 160)));
    }
  }
  const md = summary(reports, dry);
  console.log(md);
  if (process.env.GITHUB_STEP_SUMMARY) (await import("node:fs")).appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md}\n`);
}

if (require.main === module) main().catch((e) => { console.error(e); process.exitCode = 1; });
