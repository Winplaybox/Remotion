// Command + button handling for the Telegram bot. No network here: everything goes through ctx.store
// (apps/telegram-bot/store.mjs) and the returned effects, which server.mjs performs. Tested by commands.test.mjs.
//
// handle(update, ctx) -> {
//   replies: Msg[]            messages to the sender's chat        Msg = { text, keyboard?: [[{ text, data }]] }
//   admin?: Msg[]             messages to the admin
//   edit?: Msg                edit the message whose button was pressed
//   answer?: string           toast for a button press
//   copyToAdmin?: boolean     forward the user's media to the admin
//   dispatch?: { event, payload }   GitHub repository_dispatch (heavy work)
//   statusFor?: string        job code: the first reply becomes that job's live status message
// }
// ctx: { store, admin: string, allow: Set<string>, styleEnabled: boolean, pending: Map }

/** Keep in sync with engines/narrator-video/src/model.ts NARRATORS (test checks the ids). */
export const NARRATORS = {
  dadi: "Dadi Ki Kahani — kahaniyan, tyohaar, seekh",
  jasoos: "Jasoos Bhai — rahasya, crime, mystery",
  saga: "Epic Bharat Saga — Sanatan, itihaas, devi-devta",
  dost: "Dost Se Suno — science, tech, facts",
  teacher: "Madam Ji — padhai, GK, how-to"
};
export const DEFAULT_NARRATOR = "dost";
/** Keep in sync with engines/toon-video/src/model.ts TOON_STYLES (test checks the ids). */
export const STYLES = ["cartoon", "anime", "comic", "sketch", "watercolor"];
export const MAX_VIDEO_MB = 20; // Telegram Bot API download limit
export const DAILY_VIDEO_LIMIT = 5;
export const LANGUAGES = { hinglish: "Hinglish", hindi: "हिंदी", english: "English" };
export const IDEA_STATUSES = ["PENDING_REVIEW", "APPROVED", "REJECTED", "IN_PRODUCTION", "COMPLETED", "MERGED"];
const FINAL = new Set(["COMPLETED", "FAILED", "CANCELLED"]);
const PENDING_TTL_MS = 10 * 60_000;

const narratorList = () => Object.entries(NARRATORS).map(([id, about]) => `• ${id} — ${about}`).join("\n");

const helpText = (style) => `🙏 Namaste! Main video bot hoon. /menu se sab kuch buttons se bhi kar sakte ho.

💡 Idea bhejo — koi bhi message, link ya sample video (ya /idea <text>). Admin review karega.

🎬 Video banwao (invited users):
/topic [narrator] <topic>   e.g. /topic dadi Holi kyun manate hain
/preview [narrator] <topic> — pehle script dekho, phir ▶️ Render
/script [narrator] [enhance] + agli lines mein apni script (ya .txt file, caption /script)
${style ? `🎨 Video ke caption mein: /style cartoon  (${STYLES.join(", ")})\n` : ""}
✂️ /shorts — lambi video (caption) ya link se 3 Shorts
📊 /status — job ka haal · /history — purane projects · /cancel — job roko
⚙️ /settings — narrator, bhasha, length, 9:16/16:9
🎙️ /narrators · 🆔 /myid`;
export const HELP = helpText(false);
export const HELP_WITH_STYLE = helpText(true);
export const STYLE_OFF = "🎨 Video-to-video abhi band hai — jaldi aayega! Tab tak /topic ya /script se video banwao.";
export const SOON = "🚧 Ye feature jaldi aa raha hai!";

export const MAIN_MENU = [
  [{ text: "💡 Future Ideas", data: "menu:idea" }, { text: "🎬 Topic to Video", data: "menu:topic" }],
  [{ text: "📝 Script to Video", data: "menu:script" }, { text: "🎨 Video to Video", data: "menu:style" }],
  [{ text: "✂️ Long Video to Shorts", data: "menu:shorts" }, { text: "🖼️ Thumbnail", data: "menu:soon" }],
  [{ text: "🎙️ Narrator", data: "menu:narrator" }, { text: "🌐 Translate", data: "menu:soon" }],
  [{ text: "📂 My Projects", data: "menu:history" }, { text: "📊 Job Status", data: "menu:status" }],
  [{ text: "⚙️ Settings", data: "menu:settings" }, { text: "❓ Help", data: "menu:help" }]
];

/** "/topic@MyBot dadi rest" -> { cmd: "topic", args: "dadi rest" } */
export function parseCommand(text) {
  const m = /^\/([a-z_]+)(?:@\w+)?(?:\s+([\s\S]*))?$/i.exec((text || "").trim());
  return m ? { cmd: m[1].toLowerCase(), args: (m[2] || "").trim() } : null;
}

/** First word is a narrator id? -> { narrator, rest } else the user's default narrator. */
export function splitNarrator(args, fallback = DEFAULT_NARRATOR) {
  const m = /^(\S+)\s*([\s\S]*)$/.exec(args || "");
  if (m && Object.hasOwn(NARRATORS, m[1].toLowerCase())) return { narrator: m[1].toLowerCase(), rest: m[2].trim() };
  return { narrator: fallback, rest: (args || "").trim() };
}

const bar = (p) => `${"▓".repeat(Math.round(p / 10))}${"░".repeat(10 - Math.round(p / 10))} ${p}%`;
const STATUS_HI = {
  QUEUED: "⏳ Queue mein", VALIDATING: "🔎 Check ho raha", SCRIPT_GENERATION: "✍️ Script ban rahi", NARRATION: "🎙️ Awaaz ban rahi",
  VISUAL_GENERATION: "🖼️ Visuals", AI_TRANSFORMATION: "🤖 AI badlav", AUDIO_PROCESSING: "🔊 Audio", RENDERING: "🎬 Render ho raha",
  UPLOADING: "📤 Bhej rahe", COMPLETED: "✅ Ho gaya", FAILED: "❌ Fail", CANCELLED: "🛑 Cancel"
};
export const jobLine = (j) => `${j.code} · ${j.kind} · ${STATUS_HI[j.status] ?? j.status}${FINAL.has(j.status) ? "" : `\n${bar(j.progress ?? 0)}`}${j.error && j.status === "FAILED" ? `\n${j.error}` : ""}`;
const ideaLine = (i) => `${i.code} [${i.status}] P${i.priority}${i.channel ? ` · ${i.channel}` : ""} — ${i.title}${i.duplicate_of ? ` (≈ ${i.duplicate_of})` : ""}`;

export const ideaReceived = (i) => `💡 Idea received!

Your idea has been added to our Future Ideas Pipeline.

Idea ID: ${i.code}
Status: Pending Admin Review${i.duplicate_of ? `\n(Milta-julta idea pehle se hai: ${i.duplicate_of})` : ""}

Our admin will review this idea.
Thank you for contributing! 🙏`;

const adminIdeaKeyboard = (i) => [
  [{ text: "✅ Approve", data: `idea:approve:${i.code}` }, { text: "❌ Reject", data: `idea:reject:${i.code}` }],
  [1, 2, 3, 4, 5].map((p) => ({ text: `P${p}`, data: `idea:p${p}:${i.code}` })),
  ...(i.duplicate_of ? [[{ text: `🔗 Merge into ${i.duplicate_of}`, data: `idea:merge:${i.code}:${i.duplicate_of}` }]] : []),
  [{ text: "🎬 Produce (topic video)", data: `idea:produce:${i.code}` }]
];
const adminIdeaText = (i) => `💡 ${i.code} — ${i.user?.name || "?"}${i.user?.username ? ` (@${i.user.username})` : ""}
${i.title}${i.description && i.description !== i.title ? `\n${i.description}` : ""}${i.link ? `\n${i.link}` : ""}
Status: ${i.status} · P${i.priority}${i.duplicate_of ? ` · ≈ ${i.duplicate_of}` : ""}`;

const narratorKeyboard = (current) => Object.keys(NARRATORS).map((id) => [{ text: `${id === current ? "✅ " : ""}${id}`, data: `pref:narrator:${id}` }]);
const settingsKeyboard = (p) => [
  Object.entries(LANGUAGES).map(([id, label]) => ({ text: `${p.language === id ? "✅ " : ""}${label}`, data: `pref:language:${id}` })),
  ["9:16", "16:9"].map((a) => ({ text: `${p.aspect === a ? "✅ " : ""}${a}`, data: `pref:aspect:${a}` })),
  [30, 50, 90].map((s) => ({ text: `${p.seconds === s ? "✅ " : ""}${s}s`, data: `pref:seconds:${s}` })),
  [{ text: `🎙️ Narrator: ${p.narrator}`, data: "menu:narrator" }]
];
const settingsText = (p) => `⚙️ Settings\nNarrator: ${p.narrator} · Bhasha: ${LANGUAGES[p.language] ?? p.language} · ${p.aspect} · ~${p.seconds}s`;

function userOf(from, chatId) {
  const id = Number(from?.id ?? chatId);
  return { id, name: [from?.first_name, from?.last_name].filter(Boolean).join(" ") || from?.username || String(id), username: from?.username || "" };
}

export async function handle(update, ctx) {
  if (update.callback_query) return handleButton(update.callback_query, ctx);
  const msg = update.message;
  if (!msg || !msg.chat) return { replies: [] };
  const user = userOf(msg.from, msg.chat.id);
  const isAdmin = !!ctx.admin && String(user.id) === String(ctx.admin);
  const me = await ctx.store.touchUser(user, isAdmin);
  const allowed = isAdmin || ctx.allow.has(String(user.id)) || me.role === "creator";
  const prefs = me.prefs ?? { narrator: DEFAULT_NARRATOR, language: "hinglish", aspect: "9:16", seconds: 50 };
  const help = () => ({ replies: [{ text: ctx.styleEnabled ? HELP_WITH_STYLE : HELP, keyboard: MAIN_MENU }] });
  const base = { chatId: msg.chat.id, messageId: msg.message_id, user };
  const S = { ctx, msg, user, isAdmin, allowed, prefs, base, updateId: update.update_id };

  // ---- /style (video-to-video), as a caption or a reply to a video
  const videoOf = (m) => m?.video || (m?.document && /^video\//.test(m.document.mime_type || "") ? m.document : null);
  const capCmd = parseCommand(msg.caption || "");
  const c = parseCommand(msg.text || "");
  const styleCmd = capCmd?.cmd === "style" ? capCmd : c?.cmd === "style" ? c : null;
  if (styleCmd) {
    if (!ctx.styleEnabled) return { replies: [{ text: STYLE_OFF }] };
    const vid = videoOf(msg) || videoOf(msg.reply_to_message);
    const [first = "", ...rest] = styleCmd.args.split(/\s+/).filter(Boolean);
    const style = STYLES.includes(first.toLowerCase()) ? first.toLowerCase() : STYLES[0];
    const title = (STYLES.includes(first.toLowerCase()) ? rest : [first, ...rest]).join(" ").slice(0, 60);
    if (!vid) return { replies: [{ text: `🎨 Video bhejo aur caption mein likho: /style cartoon\nStyles: ${STYLES.join(", ")}` }] };
    if (!allowed) return addIdea(S, `[style ${style}] sample video`, "🔒 Video convert karna abhi sirf invited users ke liye hai. Aapka video idea ke roop mein save kar liya ✅");
    if ((vid.file_size || 0) > MAX_VIDEO_MB * 1024 * 1024) return { replies: [{ text: `📦 Video ${MAX_VIDEO_MB} MB se chhoti bhejo (Telegram bot limit). 90 second tak convert hota hai.` }] };
    return startJob(S, "style", { style, fileId: vid.file_id, title }, "tg-style");
  }

  // ---- /shorts: long video (caption or reply) or a link -> several Shorts
  const shortsCmd = capCmd?.cmd === "shorts" ? capCmd : c?.cmd === "shorts" ? c : null;
  if (shortsCmd) {
    const vid = videoOf(msg) || videoOf(msg.reply_to_message);
    const url = (shortsCmd.args.match(/https?:\/\/\S+/) || [""])[0];
    const nums = shortsCmd.args.replace(url, "").match(/\d+/g)?.map(Number) ?? [];
    const count = Math.max(1, Math.min(5, nums.find((n) => n <= 5) ?? 3));
    const seconds = Math.max(20, Math.min(60, nums.find((n) => n >= 15) ?? 45));
    if (!vid && !url) return { replies: [{ text: "✂️ Lambi video bhejo (caption: /shorts 3) ya link: /shorts https://… 3\n3 = kitne Shorts, 45 = har Short ke second." }] };
    if (!allowed) return addIdea(S, `[shorts] ${url || "video"}`, "🔒 Shorts banana abhi sirf invited users ke liye hai. Aapka request idea ke roop mein save ho gaya ✅");
    if (vid && (vid.file_size || 0) > MAX_VIDEO_MB * 1024 * 1024) return { replies: [{ text: `📦 Telegram bot sirf ${MAX_VIDEO_MB} MB tak ki video le sakta hai. Badi video ke liye link bhejo: /shorts https://… 3` }] };
    return startJob(S, "shorts", { ...(vid ? { fileId: vid.file_id } : { url }), count, seconds, language: prefs.language }, "tg-shorts");
  }

  // ---- script as a .txt/.md document (caption /script ... or reply /script to the document)
  const docOf = (m) => (m?.document && (/^text\//.test(m.document.mime_type || "") || /\.(txt|md)$/i.test(m.document.file_name || "")) ? m.document : null);
  const scriptDoc = capCmd?.cmd === "script" ? docOf(msg) : c?.cmd === "script" ? docOf(msg.reply_to_message) : null;
  if (scriptDoc) {
    const args = (capCmd?.cmd === "script" ? capCmd.args : c.args) || "";
    if (!allowed) return addIdea(S, "[script file]", "🔒 Video banana abhi sirf invited users ke liye hai. Aapki script idea ke roop mein save ho gayi ✅");
    if ((scriptDoc.file_size || 0) > 200_000) return { replies: [{ text: "📄 Script file 200 KB tak ki bhejo." }] };
    const { narrator, rest } = splitNarrator(args, prefs.narrator);
    const enhance = /^(enhance|improve)\b/i.test(rest);
    return startJob(S, "script", { narrator, fileId: scriptDoc.file_id, enhance, language: prefs.language, aspect: prefs.aspect, seconds: prefs.seconds }, "tg-video");
  }

  if (!c) {
    const pend = ctx.pending.get(user.id);
    if (pend && Date.now() - pend.at < PENDING_TTL_MS && msg.text) {
      ctx.pending.delete(user.id);
      if (pend.action === "topic") return topicOrScript(S, "topic", msg.text);
      if (pend.action === "script") return topicOrScript(S, "script", msg.text);
      return addIdea(S, msg.text);
    }
    if (!msg.text && !msg.video && !msg.document && !msg.photo) return help();
    // Any plain message, link, photo or sample video = an idea (never starts production).
    return addIdea(S, msg.text || msg.caption || "(sample video)");
  }

  switch (c.cmd) {
    case "start":
    case "menu":
      return { replies: [{ text: "🙏 Namaste! Kya banana hai?", keyboard: MAIN_MENU }] };
    case "help":
      return help();
    case "myid":
      return { replies: [{ text: `Aapka Telegram ID: ${user.id}` }] };
    case "narrators":
    case "voice":
      return { replies: [{ text: `🎙️ Narrator chuno (abhi: ${prefs.narrator})\n\n${narratorList()}`, keyboard: narratorKeyboard(prefs.narrator) }] };
    case "settings":
      return { replies: [{ text: settingsText(prefs), keyboard: settingsKeyboard(prefs) }] };
    case "idea":
      if (!c.args) { ctx.pending.set(user.id, { action: "idea", at: Date.now() }); return { replies: [{ text: "💡 Apna video idea likho (ek message mein):" }] }; }
      return addIdea(S, c.args);
    case "topic":
    case "script":
      if (!c.args) {
        ctx.pending.set(user.id, { action: c.cmd, at: Date.now() });
        return { replies: [{ text: c.cmd === "topic" ? `🎬 Topic likho (narrator: ${prefs.narrator}). e.g. Holi kyun manate hain` : `📝 Apni script bhejo (narrator: ${prefs.narrator}). Pehli line chhota title ho sakti hai.` }] };
      }
      return topicOrScript(S, c.cmd, c.args);
    case "preview":
      if (!c.args) return { replies: [{ text: "Use: /preview dadi Holi kyun manate hain — pehle script aayegi, phir ▶️ Render" }] };
      return topicOrScript(S, "topic", c.args, { preview: true });
    case "status":
      return status(S, c.args);
    case "history":
      return history(S);
    case "cancel":
      return cancel(S, c.args);
    case "thumbnail":
    case "translate":
    case "video":
      return { replies: [{ text: SOON }] };
    default:
      if (isAdmin) { const r = await adminCommand(S, c); if (r) return r; }
      return help();
  }
}

async function addIdea(S, text, replyOverride) {
  const { ctx, msg, user } = S;
  const body = String(text).trim();
  const title = body.split("\n")[0].slice(0, 200) || "(sample)";
  const link = (body.match(/https?:\/\/\S+/) || [""])[0];
  const media = msg.video?.file_id || msg.document?.file_id || (msg.photo ? msg.photo[msg.photo.length - 1].file_id : "") || "";
  const i = await ctx.store.addIdea(user.id, { title, description: body.slice(0, 3500), link, media, category: "general" });
  const out = {
    replies: [{ text: replyOverride ?? ideaReceived(i) }],
    admin: ctx.admin && String(ctx.admin) !== String(user.id) ? [{ text: adminIdeaText(i), keyboard: adminIdeaKeyboard(i) }] : [],
    copyToAdmin: !!media && !!ctx.admin && String(ctx.admin) !== String(user.id)
  };
  // Without a database the bot-data branch (GitHub) is the durable copy.
  if (ctx.store.kind === "memory") out.dispatch = { event: "tg-idea", payload: { ...S.base, code: i.code, text: body.slice(0, 3500), link, video: media } };
  return out;
}

async function topicOrScript(S, kind, args, extra = {}) {
  let { narrator, rest } = splitNarrator(args, S.prefs.narrator);
  let enhance = false;
  if (kind === "script" && /^(enhance|improve)\b/i.test(rest)) { enhance = true; rest = rest.replace(/^(enhance|improve)\b\s*/i, ""); }
  if (!rest) return { replies: [{ text: kind === "topic" ? "Topic likho: /topic dadi Holi kyun manate hain" : "Script likho: /script jasoos\n<apni script>" }] };
  if (!S.allowed) return addIdea(S, `[${kind}] ${rest}`, "🔒 Video banana abhi sirf invited users ke liye hai. Aapka topic idea ke roop mein save kar liya ✅ Admin review karega.");
  if (kind === "script" && rest.length < 40) return { replies: [{ text: "Script thodi lambi chahiye (kam se kam 2–3 lines)." }] };
  const { language, aspect, seconds } = S.prefs;
  return startJob(S, kind, { narrator, text: rest.slice(0, 8000), language, aspect, seconds, ...(enhance ? { enhance } : {}), ...extra }, "tg-video");
}

async function startJob(S, kind, input, event) {
  const { ctx, user, isAdmin, base } = S;
  const idem = `u:${S.updateId ?? `${base.chatId}:${base.messageId}`}`;
  const j = await ctx.store.createJob(user.id, base.chatId, kind, input, idem, isAdmin ? 0 : DAILY_VIDEO_LIMIT);
  if (j.limited) return { replies: [{ text: `⏳ Aaj ki limit (${DAILY_VIDEO_LIMIT} videos / 24 ghante) poori ho gayi. Thodi der baad bhejo!` }] };
  if (j.duplicate) return { replies: [] };
  return {
    replies: [{ text: `🎬 ${j.code} queue mein hai (${kind}${input.narrator ? ` · ${input.narrator}` : ""}${input.style ? ` · ${input.style}` : ""}).\nYahin progress dikhega, video yahin aayega (lagbhag 5–10 min).`, keyboard: [[{ text: "🛑 Cancel", data: `job:cancel:${j.code}` }]] }],
    statusFor: j.code,
    dispatch: { event, payload: { ...base, ...input, kind, jobCode: j.code } }
  };
}

async function status(S, arg) {
  const { ctx, user, isAdmin } = S;
  if (arg) {
    const j = await ctx.store.getJob(arg.toUpperCase());
    if (!j || (!isAdmin && Number(j.tg_id) !== user.id)) return { replies: [{ text: "Ye job nahi mili." }] };
    return { replies: [{ text: jobLine(j), keyboard: jobKeyboard(j) }] };
  }
  const jobs = (await ctx.store.listJobs(user.id, null, 5)).filter((j) => !FINAL.has(j.status));
  if (!jobs.length) return { replies: [{ text: "📊 Abhi koi job chal nahi rahi. /history se purane dekho." }] };
  return { replies: jobs.map((j) => ({ text: jobLine(j), keyboard: jobKeyboard(j) })) };
}

const jobKeyboard = (j) => FINAL.has(j.status) ? (j.status === "FAILED" ? [[{ text: "🔁 Retry", data: `job:retry:${j.code}` }]] : undefined) : [[{ text: "🛑 Cancel", data: `job:cancel:${j.code}` }]];

async function history(S) {
  const { ctx, user } = S;
  const [jobs, ideas] = await Promise.all([ctx.store.listJobs(user.id, null, 10), ctx.store.listIdeas(null, user.id, 10)]);
  const lines = [
    "📂 Aapke projects",
    ...(jobs.length ? ["", "🎬 Videos:", ...jobs.map((j) => `• ${j.code} · ${j.kind} · ${STATUS_HI[j.status] ?? j.status}${j.output?.title ? ` — ${j.output.title}` : ""}`)] : []),
    ...(ideas.length ? ["", "💡 Ideas:", ...ideas.map((i) => `• ${i.code} [${i.status}] ${i.title.slice(0, 60)}`)] : []),
    ...(!jobs.length && !ideas.length ? ["Abhi kuch nahi. /menu se shuru karo!"] : [])
  ];
  return { replies: [{ text: lines.join("\n") }] };
}

async function cancel(S, arg) {
  const { ctx, user, isAdmin } = S;
  let j = arg ? await ctx.store.getJob(arg.toUpperCase()) : (await ctx.store.listJobs(user.id, null, 5)).find((x) => !FINAL.has(x.status));
  if (!j || (!isAdmin && Number(j.tg_id) !== user.id)) return { replies: [{ text: "Cancel karne ke liye koi chalti job nahi mili." }] };
  if (FINAL.has(j.status)) return { replies: [{ text: `${j.code} pehle hi ${STATUS_HI[j.status]}.` }] };
  j = await ctx.store.updateJob(j.code, { status: "CANCELLED", message: `cancelled by ${user.id}` });
  return { replies: [{ text: `🛑 ${j.code} cancel kar di.` }] };
}

// ---------------- admin ----------------
const ADMIN_HELP = `👑 Admin
/stats · /ideas [STATUS] · /approve ID [note] · /reject ID [note]
/priority ID 1-5 · /channel ID name · /note ID text · /merge ID INTO_ID
/produce ID [narrator] — approved idea → topic video
/allow TG_ID · /disallow TG_ID · /jobs [STATUS] · /retry JOB`;

async function adminCommand(S, c) {
  const { ctx, user } = S;
  const [a1 = "", a2 = "", ...restArr] = c.args.split(/\s+/);
  const rest = [a2, ...restArr].join(" ").trim();
  const code = a1.toUpperCase();
  const upd = async (p) => {
    const i = await ctx.store.updateIdea(code, user.id, p);
    return { replies: [{ text: `✅ ${ideaLine(i)}` }], ...notifyIdeaOwner(i, S) };
  };
  switch (c.cmd) {
    case "admin": return { replies: [{ text: ADMIN_HELP }] };
    case "stats": {
      const s = await ctx.store.stats();
      return { replies: [{ text: `📊 Users ${s.users} (7d active ${s.active_users_7d})\n💡 Ideas ${s.ideas} · pending ${s.ideas_pending} · approved ${s.ideas_approved}\n🎬 Jobs active ${s.jobs_active} · done ${s.jobs_completed} · failed ${s.jobs_failed}` }] };
    }
    case "ideas": {
      const st = IDEA_STATUSES.includes(code) ? code : "PENDING_REVIEW";
      const list = await ctx.store.listIdeas(st, null, 10);
      if (!list.length) return { replies: [{ text: `Koi ${st} idea nahi.` }] };
      return { replies: list.slice(0, 5).map((i) => ({ text: adminIdeaText(i), keyboard: adminIdeaKeyboard(i) })).concat(list.length > 5 ? [{ text: list.slice(5).map(ideaLine).join("\n") }] : []) };
    }
    case "approve": return upd({ status: "APPROVED", ...(rest ? { note: rest } : {}) });
    case "reject": return upd({ status: "REJECTED", ...(rest ? { note: rest } : {}) });
    case "priority": return /^[1-5]$/.test(a2) ? upd({ priority: Number(a2) }) : { replies: [{ text: "Use: /priority IDEA-00001 1" }] };
    case "channel": return a2 ? upd({ channel: a2 }) : { replies: [{ text: "Use: /channel IDEA-00001 chakra-puzzle" }] };
    case "note": return rest ? upd({ note: rest }) : { replies: [{ text: "Use: /note IDEA-00001 text" }] };
    case "merge": return a2 ? upd({ merge_into: a2.toUpperCase(), note: `merged into ${a2.toUpperCase()}` }) : { replies: [{ text: "Use: /merge IDEA-00002 IDEA-00001" }] };
    case "produce": return produce(S, code, a2);
    case "allow":
    case "disallow":
      if (!/^\d+$/.test(a1)) return { replies: [{ text: `Use: /${c.cmd} 123456789` }] };
      await ctx.store.setRole(Number(a1), c.cmd === "allow" ? "creator" : "user");
      return { replies: [{ text: `${c.cmd === "allow" ? "✅ Video access diya" : "🚫 Access hataya"}: ${a1} (user ne bot kam se kam ek baar start kiya ho)` }] };
    case "jobs": {
      const list = await ctx.store.listJobs(null, code || null, 10);
      return { replies: [{ text: list.length ? list.map(jobLine).join("\n\n") : "Koi job nahi." }] };
    }
    case "retry": return retry(S, code);
    default: return null;
  }
}

function notifyIdeaOwner(i, S) {
  if (String(i.tg_id) === String(S.user.id)) return {};
  const msg = { APPROVED: "✅ Aapka idea approve ho gaya!", REJECTED: "Aapka idea abhi ke liye select nahi hua. Shukriya! 🙏", IN_PRODUCTION: "🎬 Aapke idea pe video ban raha hai!", COMPLETED: "🎉 Aapke idea ka video ban gaya!" }[i.status];
  return msg ? { notify: [{ chatId: i.tg_id, text: `${msg}\n${i.code} — ${i.title}` }] } : {};
}

async function produce(S, code, narratorArg) {
  const { ctx, user } = S;
  const i = await ctx.store.getIdea(code);
  if (!i) return { replies: [{ text: "Idea nahi mila." }] };
  if (i.status !== "APPROVED") return { replies: [{ text: `Sirf APPROVED ideas production mein jaate hain (${i.code} abhi ${i.status}).` }] };
  const narrator = Object.hasOwn(NARRATORS, (narratorArg || "").toLowerCase()) ? narratorArg.toLowerCase() : S.prefs.narrator;
  const updated = await ctx.store.updateIdea(code, user.id, { status: "IN_PRODUCTION", note: "production started" });
  const r = await startJob(S, "topic", { narrator, text: `${i.title}${i.description && i.description !== i.title ? `\n${i.description}` : ""}`.slice(0, 3500), ideaCode: i.code, language: S.prefs.language, aspect: S.prefs.aspect, seconds: S.prefs.seconds }, "tg-video");
  return { ...r, ...notifyIdeaOwner(updated, S) };
}

async function retry(S, code) {
  const { ctx, user, isAdmin } = S;
  const j = await ctx.store.getJob(code);
  if (!j || (!isAdmin && Number(j.tg_id) !== user.id)) return { replies: [{ text: "Job nahi mili." }] };
  if (j.status !== "FAILED") return { replies: [{ text: `${j.code} fail nahi hui (${j.status}).` }] };
  const event = j.kind === "style" ? "tg-style" : j.kind === "shorts" ? "tg-shorts" : "tg-video";
  return startJob({ ...S, updateId: `retry:${j.code}:${(j.retry_count ?? 0) + 1}` }, j.kind, { ...j.input, retryOf: j.code }, event);
}

/** ▶️ Render on a preview: continue the same job with the approved draft. */
async function renderPreview(S, code) {
  const { ctx, user, isAdmin } = S;
  const j = await ctx.store.getJob(code);
  if (!j || (!isAdmin && Number(j.tg_id) !== user.id)) return { replies: [{ text: "Job nahi mili." }] };
  if (FINAL.has(j.status)) return { replies: [{ text: `${j.code} ${STATUS_HI[j.status]}.` }] };
  if (!j.output?.draft || j.output.awaiting !== "approval") return { replies: [{ text: "Script abhi taiyaar nahi hai, thoda ruko." }] };
  await ctx.store.updateJob(j.code, { status: "NARRATION", progress: 30, output: { awaiting: null }, message: "preview approved" });
  return {
    replies: [{ text: `▶️ ${j.code} render ho raha hai…`, keyboard: [[{ text: "🛑 Cancel", data: `job:cancel:${j.code}` }]] }],
    dispatch: { event: "tg-video", payload: { ...j.input, kind: j.kind, chatId: j.chat_id, user: S.user, jobCode: j.code, draft: j.output.draft, sources: j.output.sources ?? [], preview: false, ...(j.status_message_id ? { statusMessageId: j.status_message_id } : {}) } }
  };
}

// ---------------- buttons ----------------
async function handleButton(q, ctx) {
  const chatId = q.message?.chat?.id ?? q.from.id;
  const user = userOf(q.from, chatId);
  const isAdmin = !!ctx.admin && String(user.id) === String(ctx.admin);
  const me = await ctx.store.touchUser(user, isAdmin);
  const prefs = me.prefs ?? { narrator: DEFAULT_NARRATOR, language: "hinglish", aspect: "9:16", seconds: 50 };
  const S = { ctx, msg: q.message ?? {}, user, isAdmin, allowed: isAdmin || ctx.allow.has(String(user.id)) || me.role === "creator", prefs, base: { chatId, messageId: q.message?.message_id, user }, updateId: `cb:${q.id}` };
  const [kind, action, ...restParts] = String(q.data || "").split(":");
  // pref values may contain ":" (e.g. 16:9); other buttons use arg / arg2
  const [arg, arg2] = kind === "pref" ? [restParts.join(":"), undefined] : restParts;

  if (kind === "menu") {
    switch (action) {
      case "idea": ctx.pending.set(user.id, { action: "idea", at: Date.now() }); return { answer: "", replies: [{ text: "💡 Apna video idea likho (ek message mein):" }] };
      case "topic": ctx.pending.set(user.id, { action: "topic", at: Date.now() }); return { answer: "", replies: [{ text: `🎬 Topic likho (narrator: ${prefs.narrator}):` }] };
      case "script": ctx.pending.set(user.id, { action: "script", at: Date.now() }); return { answer: "", replies: [{ text: `📝 Apni script bhejo (narrator: ${prefs.narrator}):` }] };
      case "shorts": return { answer: "", replies: [{ text: "✂️ Lambi video bhejo, caption mein: /shorts 3 (ya link: /shorts https://… 3)" }] };
      case "style": return { answer: "", replies: [{ text: ctx.styleEnabled ? `🎨 Video bhejo, caption mein: /style cartoon\nStyles: ${STYLES.join(", ")}` : STYLE_OFF }] };
      case "narrator": return { answer: "", replies: [{ text: `🎙️ Narrator chuno (abhi: ${prefs.narrator})`, keyboard: narratorKeyboard(prefs.narrator) }] };
      case "settings": return { answer: "", replies: [{ text: settingsText(prefs), keyboard: settingsKeyboard(prefs) }] };
      case "history": return { answer: "", ...(await history(S)) };
      case "status": return { answer: "", ...(await status(S, "")) };
      case "help": return { answer: "", replies: [{ text: ctx.styleEnabled ? HELP_WITH_STYLE : HELP }] };
      default: return { answer: SOON, replies: [] };
    }
  }
  if (kind === "pref") {
    const allowedKeys = { narrator: Object.keys(NARRATORS), language: Object.keys(LANGUAGES), aspect: ["9:16", "16:9"], seconds: ["30", "50", "90"] };
    if (!allowedKeys[action]?.includes(arg)) return { answer: "?", replies: [] };
    const next = await ctx.store.setPrefs(user.id, { [action]: action === "seconds" ? Number(arg) : arg });
    return { answer: "✅ Saved", edit: action === "narrator" ? { text: `🎙️ Narrator: ${next.narrator}`, keyboard: narratorKeyboard(next.narrator) } : { text: settingsText(next), keyboard: settingsKeyboard(next) }, replies: [] };
  }
  if (kind === "job") {
    if (action === "render") return { answer: "▶️", ...(await renderPreview(S, arg)) };
    if (action === "cancel") return { answer: "🛑", ...(await cancel(S, arg)) };
    if (action === "retry") return { answer: "🔁", ...(await retry(S, arg)) };
  }
  if (kind === "idea") {
    if (!isAdmin) return { answer: "Sirf admin", replies: [] };
    let i;
    if (action === "approve") i = await ctx.store.updateIdea(arg, user.id, { status: "APPROVED" });
    else if (action === "reject") i = await ctx.store.updateIdea(arg, user.id, { status: "REJECTED" });
    else if (/^p[1-5]$/.test(action)) i = await ctx.store.updateIdea(arg, user.id, { priority: Number(action.slice(1)) });
    else if (action === "merge") i = await ctx.store.updateIdea(arg, user.id, { merge_into: arg2, note: `merged into ${arg2}` });
    else if (action === "produce") return { answer: "🎬", ...(await produce(S, arg, "")) };
    if (!i) return { answer: "?", replies: [] };
    return { answer: `${i.code}: ${i.status}`, edit: { text: adminIdeaText(i), keyboard: adminIdeaKeyboard(i) }, replies: [], ...notifyIdeaOwner(i, S) };
  }
  return { answer: "", replies: [] };
}
