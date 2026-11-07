// Telegram webhook server (Render.com web service, zero dependencies, Node >= 20).
// Replies at once; heavy work (video renders) runs in GitHub Actions via repository_dispatch.
//
// Env: TELEGRAM_BOT_TOKEN (required) · TG_WEBHOOK_SECRET (optional, derived from the token) · TG_ADMIN_ID ·
//      TG_ALLOWLIST (comma-separated user ids; admins can also /allow) · TG_STYLE_ENABLED=true to enable /style ·
//      GH_DISPATCH_TOKEN (fine-grained PAT, Contents: read & write) · GITHUB_REPO (default Winplaybox/Remotion) ·
//      SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (ideas/jobs/users; without them an in-memory store is used) ·
//      RENDER_EXTERNAL_URL (set by Render) or PUBLIC_URL — the webhook is registered on boot.
import crypto from "node:crypto";
import http from "node:http";
import { handle } from "./commands.mjs";
import { createStore } from "./store.mjs";
import { actionToCommand, dashboardPage, loginPage, readSession, signSession, verifyTelegramLogin } from "./admin.mjs";

const env = process.env;
const TOKEN = env.TELEGRAM_BOT_TOKEN;
// Telegram allows only A-Z a-z 0-9 _ - in secret_token (Render's generated values are base64).
const SECRET = (env.TG_WEBHOOK_SECRET || (TOKEN ? crypto.createHash("sha256").update(`webhook:${TOKEN}`).digest("hex").slice(0, 48) : "")).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 200);
const REPO = env.GITHUB_REPO || "Winplaybox/Remotion";
const PUBLIC_URL = env.PUBLIC_URL || env.RENDER_EXTERNAL_URL;
if (!TOKEN) { console.error("TELEGRAM_BOT_TOKEN is required"); process.exit(1); }
if (!env.GH_DISPATCH_TOKEN) console.warn("GH_DISPATCH_TOKEN missing: videos cannot be queued until it is set");

const store = createStore(env);
console.log(`store: ${store.kind}`);
const ctx = {
  store,
  allow: new Set((env.TG_ALLOWLIST || "").split(",").map((s) => s.trim()).filter(Boolean)),
  admin: env.TG_ADMIN_ID || "",
  styleEnabled: env.TG_STYLE_ENABLED === "true",
  publicUrl: env.PUBLIC_URL || env.RENDER_EXTERNAL_URL || "",
  pending: new Map()
};

// Each Telegram call is independent: one failed send never stops the remaining effects.
const tg = async (method, body) => {
  try {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!j.ok) console.warn(`telegram ${method}: ${j.description}`);
    return j;
  } catch (e) {
    console.warn(`telegram ${method}: ${e.message}`);
    return { ok: false, description: e.message };
  }
};
const markup = (keyboard) => (keyboard ? { reply_markup: { inline_keyboard: keyboard.map((row) => row.map((b) => ({ text: b.text, callback_data: b.data }))) } } : {});
const send = (chatId, m, replyTo) => tg("sendMessage", { chat_id: chatId, text: m.text.slice(0, 4096), ...markup(m.keyboard), ...(replyTo ? { reply_parameters: { message_id: replyTo, allow_sending_without_reply: true } } : {}) });

async function dispatch(event, payload) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/dispatches`, {
    method: "POST",
    headers: { authorization: `Bearer ${env.GH_DISPATCH_TOKEN}`, accept: "application/vnd.github+json", "user-agent": "telegram-video-bot" },
    body: JSON.stringify({ event_type: event, client_payload: payload })
  });
  if (res.status !== 204) throw new Error(`GitHub dispatch ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

async function handleUpdate(update) {
  if (typeof update.update_id === "number") {
    const first = await store.claimUpdate(update.update_id).catch((e) => { console.warn(`claimUpdate: ${e.message}`); return true; });
    if (!first) return; // Telegram retry of an update we already handled
  }
  const q = update.callback_query;
  const chatId = update.message?.chat.id ?? q?.message?.chat.id ?? q?.from.id;
  let out;
  try { out = await handle(update, ctx); } catch (e) {
    console.error("handle failed", e);
    if (chatId) await send(chatId, { text: "⚠️ Abhi kuch gadbad hai, thodi der baad dobara try karo." });
    if (q) await tg("answerCallbackQuery", { callback_query_id: q.id });
    return;
  }
  const replyTo = update.message?.message_id;
  if (q) await tg("answerCallbackQuery", { callback_query_id: q.id, ...(out.answer ? { text: out.answer.slice(0, 190) } : {}) });
  if (q && out.edit && q.message) await tg("editMessageText", { chat_id: q.message.chat.id, message_id: q.message.message_id, text: out.edit.text.slice(0, 4096), ...markup(out.edit.keyboard) });

  let statusMessageId = null;
  for (const [i, m] of (out.replies ?? []).entries()) {
    const r = await send(chatId, m, replyTo);
    if (i === 0 && out.statusFor && r.ok) statusMessageId = r.result.message_id;
  }
  for (const m of out.notify ?? []) await send(m.chatId, m);
  if (ctx.admin) {
    if (out.copyToAdmin && update.message) await tg("copyMessage", { chat_id: ctx.admin, from_chat_id: chatId, message_id: update.message.message_id });
    for (const m of out.admin ?? []) await send(ctx.admin, m);
  }
  if (out.statusFor && statusMessageId) await store.updateJob(out.statusFor, { status_message_id: statusMessageId }).catch((e) => console.warn(e.message));
  if (out.dispatch) {
    try {
      await dispatch(out.dispatch.event, { ...out.dispatch.payload, ...(statusMessageId ? { statusMessageId } : {}) });
    } catch (e) {
      console.error(e);
      if (out.statusFor) await store.updateJob(out.statusFor, { status: "FAILED", error: "queue failed", message: e.message }).catch(() => undefined);
      await send(chatId, { text: "⚠️ Abhi request queue nahi ho paayi, thodi der baad dobara bhejo." });
    }
  }
}

// ---------------- web admin (/admin) ----------------
const SESSION_KEY = crypto.createHash("sha256").update(`session:${TOKEN}`).digest();
let botUsername = env.TG_BOT_USERNAME || "";
const html = (res, code, body, headers = {}) => res.writeHead(code, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-frame-options": "DENY", ...headers }).end(body);

async function adminRoute(req, res, url) {
  const me = readSession(req.headers.cookie, SESSION_KEY);
  const isAdmin = !!me && !!ctx.admin && me === String(ctx.admin);
  if (req.method === "GET" && url.pathname === "/admin/auth") {
    const who = verifyTelegramLogin(Object.fromEntries(url.searchParams), TOKEN);
    if (!who || who.id !== String(ctx.admin)) return html(res, 403, "Sirf admin login kar sakta hai.");
    return html(res, 302, "", { location: "/admin", "set-cookie": `vb_admin=${encodeURIComponent(signSession(who.id, SESSION_KEY))}; Path=/admin; HttpOnly; Secure; SameSite=Lax; Max-Age=43200` });
  }
  if (req.method === "GET" && url.pathname === "/admin/logout") return html(res, 302, "", { location: "/admin", "set-cookie": "vb_admin=; Path=/admin; Max-Age=0" });
  if (req.method === "GET" && url.pathname === "/admin") {
    if (!isAdmin) return html(res, 200, loginPage(botUsername));
    const [stats, ideas, jobs] = await Promise.all([store.stats(), store.listIdeas(null, null, 50), store.listJobs(null, null, 30)]);
    return html(res, 200, dashboardPage({ stats, ideas, jobs, admin: me }));
  }
  if (req.method === "POST" && url.pathname === "/admin/api/action") {
    if (!isAdmin) return html(res, 401, "login required");
    // CSRF: browsers send Origin on POST; it must be this server.
    const origin = req.headers.origin;
    const allowed = new Set([`https://${req.headers.host}`, `http://${req.headers.host}`, ...(PUBLIC_URL ? [new URL(PUBLIC_URL).origin] : [])]);
    if (origin && !allowed.has(origin)) return html(res, 403, "bad origin");
    let body = "";
    for await (const c of req) { body += c; if (body.length > 10_000) return html(res, 413, "too large"); }
    let a; try { a = JSON.parse(body); } catch { return html(res, 400, "bad json"); }
    const cmd = actionToCommand(a);
    if (!cmd) return html(res, 400, "unknown action");
    // Same pipeline as a Telegram message from the admin; replies land in the admin's chat as a log.
    await handleUpdate({ update_id: `web:${Date.now()}:${Math.random()}`, message: { message_id: 0, chat: { id: Number(ctx.admin) }, from: { id: Number(ctx.admin), first_name: "Admin (web)" }, text: cmd } });
    return html(res, 200, "ok");
  }
  return html(res, 404, "not found");
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://local");
  if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) { adminRoute(req, res, url).catch((e) => { console.error(e); html(res, 500, "error"); }); return; }
  if (req.method === "GET") { res.writeHead(200).end("ok"); return; }
  if (req.method !== "POST" || req.url !== `/tg/${SECRET}` || req.headers["x-telegram-bot-api-secret-token"] !== SECRET) { res.writeHead(404).end(); return; }
  let body = "";
  req.on("data", (c) => { body += c; if (body.length > 1e6) req.destroy(); });
  req.on("end", () => {
    res.writeHead(200).end("ok"); // answer Telegram at once; work continues below
    let update; try { update = JSON.parse(body); } catch { return; }
    handleUpdate(update).catch((e) => console.error("update failed", e));
  });
}).listen(Number(env.PORT || 10000), async () => {
  console.log(`telegram bot listening on ${env.PORT || 10000}`);
  if (!botUsername) { const me = await tg("getMe", {}); if (me.ok) botUsername = me.result.username; }
  if (PUBLIC_URL) {
    const r = await tg("setWebhook", { url: `${PUBLIC_URL.replace(/\/$/, "")}/tg/${SECRET}`, secret_token: SECRET, allowed_updates: ["message", "callback_query"], drop_pending_updates: false });
    console.log("setWebhook:", r.ok ? "ok" : r.description);
    await tg("setMyCommands", { commands: [
      { command: "menu", description: "Main menu" },
      { command: "topic", description: "Topic se video: /topic dadi Holi kyun" },
      { command: "preview", description: "Pehle script dekho, phir render" },
      { command: "script", description: "Apni script se video (text ya .txt)" },
      ...(ctx.styleEnabled ? [{ command: "style", description: "Video ke caption mein: /style cartoon" }] : []),
      { command: "shorts", description: "Lambi video/link se Shorts" },
      { command: "idea", description: "Video idea bhejo" },
      { command: "status", description: "Job ka haal" },
      { command: "history", description: "Mere projects" },
      { command: "cancel", description: "Chalti job roko" },
      { command: "settings", description: "Narrator, bhasha, length" },
      { command: "narrators", description: "Narrators" },
      { command: "myid", description: "Aapka Telegram ID" },
      { command: "dashboard", description: "Admin: web dashboard link" },
      { command: "help", description: "Madad" }
    ] });
  }
});
