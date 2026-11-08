// Telegram webhook server (Render.com web service, zero dependencies, Node >= 20).
// Replies at once; heavy work (video renders) runs in GitHub Actions via repository_dispatch.
//
// Env: TELEGRAM_BOT_TOKEN (required) · TG_WEBHOOK_SECRET (optional, derived from the token) · TG_ADMIN_ID ·
//      TG_ALLOWLIST (comma-separated user ids; admins can also /allow) · TG_STYLE_ENABLED=true to enable /style ·
//      GH_DISPATCH_TOKEN (fine-grained PAT, Contents: read & write) · GITHUB_REPO (default Winplaybox/Remotion) ·
//      SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (ideas/jobs/users; without them an in-memory store is used) ·
//      MAX_JOBS_PER_DAY (all users, default 40; admin exempt) · TG_BOT_USERNAME (optional, else getMe) ·
//      RENDER_EXTERNAL_URL (set by Render) or PUBLIC_URL — the webhook is registered on boot.
import crypto from "node:crypto";
import http from "node:http";
import { handle } from "./commands.mjs";
import { createStore } from "./store.mjs";
import { SOCIAL_CHANNELS, looksLike, metaAuthUrl, metaCheck, metaConnect, pinterestAccount, pinterestAuthUrl, pinterestBoards, pinterestCreateBoard, pinterestToken, readState, seal, signState, tokenKey, unseal, workerSig } from "./social-connect.mjs";
import { DASHBOARD_CSP, actionToCommand, dashboardShell, detailCode, loginPage, parseListQuery, readSession, signSession, verifyTelegramLogin } from "./admin.mjs";

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
  maxJobsPerDay: Number(env.MAX_JOBS_PER_DAY || 40),
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
    body: JSON.stringify({ event_type: event, client_payload: { job: payload } }) // GitHub allows max 10 top-level client_payload keys
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
const json = (res, code, body) => res.writeHead(code, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }).end(JSON.stringify(body));
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
    return html(res, 200, dashboardShell(me), { "content-security-policy": DASHBOARD_CSP, "referrer-policy": "no-referrer" });
  }
  if (url.pathname.startsWith("/admin/connect/") || url.pathname === "/admin/api/social") {
    if (!isAdmin) return url.pathname.startsWith("/admin/api/") ? json(res, 401, { error: "login required" }) : html(res, 302, "", { location: "/admin" });
    return socialRoute(req, res, url);
  }
  if (req.method === "GET" && url.pathname.startsWith("/admin/api/")) {
    if (!isAdmin) return json(res, 401, { error: "login required" });
    const part = url.pathname.slice("/admin/api/".length).split("/");
    if (part[0] === "overview") return json(res, 200, await store.adminOverview());
    if (part[0] === "list") {
      const q = parseListQuery(url.searchParams);
      if (!q) return json(res, 400, { error: "bad query" });
      return json(res, 200, await store.adminList(q.entity, q.status, q.q, q.limit, q.offset));
    }
    if (part[0] === "job" || part[0] === "idea") {
      const code = detailCode(part[0], decodeURIComponent(part[1] || "").toUpperCase());
      if (!code) return json(res, 400, { error: "bad code" });
      const row = part[0] === "job" ? await store.adminJob(code) : await store.adminIdea(code);
      return row ? json(res, 200, row) : json(res, 404, { error: "not found" });
    }
    if (part[0] === "media") { // /admin/api/media/JOB-00001/video|thumb|short-1 -> short-lived signed link
      const code = detailCode("job", String(part[1] || "").toUpperCase());
      const what = String(part[2] || "");
      if (!code || !/^(video|thumb|short-\d{1,2})$/.test(what)) return json(res, 400, { error: "bad media" });
      const j = await store.getJob(code);
      const out = j?.output ?? {};
      if (out.file_deleted) return json(res, 410, { error: "deleted after retention period" });
      const path = what === "video" ? out.file : what === "thumb" ? out.thumb : out.shorts?.[Number(what.slice(6)) - 1]?.file;
      const link = path ? await store.signedUrl(path) : null;
      return link ? html(res, 302, "", { location: link }) : json(res, 404, { error: "file not stored" });
    }
    return json(res, 404, { error: "not found" });
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
    await handleUpdate({ update_id: `web:${Date.now()}:${Math.random()}`, message: { message_id: 0, chat: { id: Number(ctx.admin) }, from: { id: Number(ctx.admin), is_web: true }, text: cmd } });
    return html(res, 200, "ok");
  }
  return html(res, 404, "not found");
}

// ---------------- social accounts (Connect buttons in the dashboard) ----------------
const SOCIAL_KEY = tokenKey(env.SUPABASE_SERVICE_ROLE_KEY || `memory:${TOKEN}`);
const STATE_KEY = crypto.createHash("sha256").update(`oauth-state:${TOKEN}`).digest();
const baseUrl = (req) => (PUBLIC_URL || `https://${req.headers.host}`).replace(/\/$/, "");
const redirectFor = (req, platform) => `${baseUrl(req)}/admin/connect/${platform}/callback`;
// "Channel publishing" login configuration of the WinPlayBox Publisher Meta app (not a secret).
const apps = { meta: { id: env.META_APP_ID, secret: env.META_APP_SECRET, configId: env.META_LOGIN_CONFIG_ID ?? "2229571631237251" }, pinterest: { id: env.PINTEREST_APP_ID, secret: env.PINTEREST_APP_SECRET } };
const chan = (id) => SOCIAL_CHANNELS.find((c) => c.id === id);
const back = (res, msg) => html(res, 302, "", { location: `/admin#social?msg=${encodeURIComponent(msg)}` });

async function saveMetaPage(channel, page) {
  await store.socialSave(channel, "meta", { account_name: page.name, page_id: page.id, page_name: page.name, ig_user_id: page.ig_id, ig_username: page.ig_username, token_enc: seal(page.token, SOCIAL_KEY), expires_at: null, options: {} });
}

async function socialRoute(req, res, url) {
  const m = /^\/admin\/connect\/(meta|pinterest)(\/callback)?$/.exec(url.pathname);
  if (m && req.method === "GET") {
    const platform = m[1], app = apps[platform];
    if (!app.id || !app.secret) return back(res, `${platform === "meta" ? "META" : "PINTEREST"}_APP_ID / _APP_SECRET Render env mein nahi hai`);
    if (!m[2]) { // start
      const channel = chan(url.searchParams.get("channel"));
      if (!channel) return back(res, "unknown channel");
      const state = signState({ p: platform, c: channel.id, n: crypto.randomBytes(9).toString("base64url") }, STATE_KEY);
      return html(res, 302, "", { location: (platform === "meta" ? metaAuthUrl : pinterestAuthUrl)({ appId: app.id, redirect: redirectFor(req, platform), state, configId: app.configId }) });
    }
    const st = readState(url.searchParams.get("state"), STATE_KEY);
    if (!st || st.p !== platform) return back(res, "Login link expire ho gaya, dobara Connect dabao");
    if (url.searchParams.get("error")) return back(res, `${platform}: ${url.searchParams.get("error_description") || url.searchParams.get("error")}`);
    const code = url.searchParams.get("code");
    const channel = chan(st.c);
    try {
      if (platform === "meta") {
        const r = await metaConnect({ appId: app.id, appSecret: app.secret, redirect: redirectFor(req, "meta"), code });
        if (!r.pages.length) return back(res, "Is Facebook login mein koi Page nahi mila (Page admin hona chahiye)");
        await store.oauthPut(st.n, "meta", channel.id, seal(JSON.stringify(r.pages), SOCIAL_KEY));
        const options = { nonce: st.n, user: r.user, pages: r.pages.map(({ token, ...p }) => p) };
        // Auto-map every channel whose Page/Instagram matches its name (one login can cover all channels).
        const mapped = [];
        for (const c of SOCIAL_CHANNELS) {
          const cur = await store.socialGet(c.id, "meta");
          const page = r.pages.find((p) => looksLike(p.name, c.name) || looksLike(p.ig_username, c.handle));
          if (page && (c.id === channel.id || !cur?.token_enc)) { await saveMetaPage(c.id, page); mapped.push(c.name); }
        }
        if (!mapped.includes(channel.name)) await store.socialSave(channel.id, "meta", { options });
        return back(res, mapped.length ? `✓ Connected: ${mapped.join(", ")}${mapped.includes(channel.name) ? "" : ` · ${channel.name} ke liye Page chuno`}` : `${channel.name} ke liye Page chuno`);
      }
      const t = await pinterestToken({ appId: app.id, appSecret: app.secret, params: { grant_type: "authorization_code", code, redirect_uri: redirectFor(req, "pinterest") } });
      const acct = await pinterestAccount(t.access);
      const boards = await pinterestBoards(t.access);
      const board = boards.find((b) => looksLike(b.name, channel.name)) ?? (boards.length === 1 ? boards[0] : null);
      await store.socialSave(channel.id, "pinterest", { account_name: acct.username ?? "", token_enc: seal(t.access, SOCIAL_KEY), refresh_enc: seal(t.refresh, SOCIAL_KEY), expires_at: t.expiresAt,
        board_id: board?.id ?? "", board_name: board?.name ?? "", options: { boards } });
      return back(res, `✓ Pinterest @${acct.username ?? ""} connected${board ? ` · board "${board.name}"` : " · board chuno ya banao"}`);
    } catch (e) {
      console.error(`[social] ${platform} connect: ${e.message}`);
      return back(res, `${platform} connect fail: ${e.message}`);
    }
  }
  if (url.pathname === "/admin/api/social" && req.method === "GET") {
    return json(res, 200, { channels: SOCIAL_CHANNELS, accounts: await store.socialList(), apps: { meta: !!(apps.meta.id && apps.meta.secret), pinterest: !!(apps.pinterest.id && apps.pinterest.secret) },
      shared: !!env.SUPABASE_SERVICE_ROLE_KEY, redirects: { meta: redirectFor(req, "meta"), pinterest: redirectFor(req, "pinterest") } });
  }
  if (url.pathname === "/admin/api/social" && req.method === "POST") {
    const origin = req.headers.origin;
    if (origin && origin !== `https://${req.headers.host}` && origin !== `http://${req.headers.host}` && !(PUBLIC_URL && origin === new URL(PUBLIC_URL).origin)) return json(res, 403, { error: "bad origin" });
    let body = ""; for await (const c of req) { body += c; if (body.length > 10_000) return json(res, 413, { error: "too large" }); }
    let a; try { a = JSON.parse(body); } catch { return json(res, 400, { error: "bad json" }); }
    const channel = chan(a.channel);
    if (!channel) return json(res, 400, { error: "unknown channel" });
    try {
      if (a.op === "pick-page") {
        const pend = await store.oauthGet(String(a.nonce || ""));
        if (!pend) return json(res, 410, { error: "Page list expire ho gayi, dobara Connect dabao" });
        const page = JSON.parse(unseal(pend.data_enc, SOCIAL_KEY)).find((p) => p.id === String(a.page_id));
        if (!page) return json(res, 400, { error: "page not found" });
        await saveMetaPage(channel.id, page);
        return json(res, 200, { ok: true, msg: `✓ ${channel.name} → ${page.name}${page.ig_username ? ` + @${page.ig_username}` : " (Instagram linked nahi hai!)"}` });
      }
      if (a.op === "pick-board" || a.op === "create-board") {
        const row = await store.socialGet(channel.id, "pinterest");
        if (!row?.token_enc) return json(res, 400, { error: "Pehle Pinterest connect karo" });
        let board = (row.options?.boards ?? []).find((b) => b.id === String(a.board_id));
        if (a.op === "create-board") {
          const b = await pinterestCreateBoard(unseal(row.token_enc, SOCIAL_KEY), `${channel.name} — Daily`, `Roz naya video ▶ YouTube ${channel.handle}`);
          board = { id: b.id, name: b.name };
        }
        if (!board) return json(res, 400, { error: "board not found" });
        await store.socialSave(channel.id, "pinterest", { board_id: board.id, board_name: board.name });
        return json(res, 200, { ok: true, msg: `✓ Board "${board.name}"` });
      }
      if (a.op === "check") {
        const row = await store.socialGet(channel.id, a.platform === "pinterest" ? "pinterest" : "meta");
        if (!row?.token_enc) return json(res, 400, { error: "not connected" });
        if (row.platform === "meta") { const p = await metaCheck(row.page_id, unseal(row.token_enc, SOCIAL_KEY)); return json(res, 200, { ok: true, msg: `✓ Facebook "${p.name}"${p.instagram_business_account?.username ? ` + Instagram @${p.instagram_business_account.username}` : " — Instagram linked nahi"}` }); }
        const u = await pinterestAccount(unseal(row.token_enc, SOCIAL_KEY));
        return json(res, 200, { ok: true, msg: `✓ Pinterest @${u.username}` });
      }
      if (a.op === "disconnect") {
        await store.socialDelete(channel.id, a.platform === "pinterest" ? "pinterest" : "meta");
        return json(res, 200, { ok: true, msg: "Disconnected" });
      }
    } catch (e) { return json(res, 502, { error: e.message }); }
    return json(res, 400, { error: "unknown op" });
  }
  return html(res, 404, "not found");
}

/** Workers ask the server to refresh a channel's Pinterest token (only the server has the app secret). */
async function internalRoute(req, res) {
  let body = ""; for await (const c of req) { body += c; if (body.length > 2000) return json(res, 413, {}); }
  let a; try { a = JSON.parse(body); } catch { return json(res, 400, {}); }
  const sk = env.SUPABASE_SERVICE_ROLE_KEY, ts = Number(a.ts);
  if (!sk || !chan(a.channel) || !(Math.abs(Date.now() - ts) < 5 * 60_000)) return json(res, 403, { error: "denied" });
  const want = workerSig(sk, a.channel, ts);
  if (typeof a.sig !== "string" || a.sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(a.sig), Buffer.from(want))) return json(res, 403, { error: "denied" });
  const row = await store.socialGet(a.channel, "pinterest");
  if (!row?.refresh_enc || !apps.pinterest.id) return json(res, 404, { error: "not connected" });
  try {
    const t = await pinterestToken({ appId: apps.pinterest.id, appSecret: apps.pinterest.secret, params: { grant_type: "refresh_token", refresh_token: unseal(row.refresh_enc, SOCIAL_KEY) } });
    await store.socialSave(a.channel, "pinterest", { token_enc: seal(t.access, SOCIAL_KEY), expires_at: t.expiresAt, ...(t.refresh ? { refresh_enc: seal(t.refresh, SOCIAL_KEY) } : {}) });
    return json(res, 200, { ok: true, expires_at: t.expiresAt });
  } catch (e) { return json(res, 502, { error: e.message }); }
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://local");
  if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) { adminRoute(req, res, url).catch((e) => { console.error(e); html(res, 500, "error"); }); return; }
  if (req.method === "POST" && url.pathname === "/internal/pinterest-refresh") { internalRoute(req, res).catch((e) => { console.error(e); json(res, 500, {}); }); return; }
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
