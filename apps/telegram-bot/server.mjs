// Telegram webhook server (Render.com web service, zero dependencies, Node >= 20).
// Replies instantly; heavy work (video render, saving ideas) runs in GitHub Actions via repository_dispatch.
//
// Env: TELEGRAM_BOT_TOKEN, TG_WEBHOOK_SECRET, GH_DISPATCH_TOKEN (fine-grained PAT: Contents read + Actions/"repository dispatch" write
//      on the repo), GITHUB_REPO (default Winplaybox/Remotion), TG_ADMIN_ID, TG_ALLOWLIST (comma-separated Telegram user ids),
//      RENDER_EXTERNAL_URL (set by Render) or PUBLIC_URL — the webhook is registered on boot.
import http from "node:http";
import { handle } from "./commands.mjs";

const env = process.env;
const TOKEN = env.TELEGRAM_BOT_TOKEN;
// Telegram allows only A-Z a-z 0-9 _ - in secret_token (Render's generated values are base64).
const SECRET = (env.TG_WEBHOOK_SECRET || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 200);
const REPO = env.GITHUB_REPO || "Winplaybox/Remotion";
const PUBLIC_URL = env.PUBLIC_URL || env.RENDER_EXTERNAL_URL;
if (!TOKEN || !SECRET) { console.error("TELEGRAM_BOT_TOKEN and TG_WEBHOOK_SECRET are required"); process.exit(1); }

const ctx = {
  allow: new Set((env.TG_ALLOWLIST || "").split(",").map((s) => s.trim()).filter(Boolean)),
  admin: env.TG_ADMIN_ID || "",
  usage: new Map(),
  get today() { return new Date().toISOString().slice(0, 10); }
};

const tg = (method, body) => fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());
const reply = (chatId, text, replyTo) => tg("sendMessage", { chat_id: chatId, text, ...(replyTo ? { reply_parameters: { message_id: replyTo, allow_sending_without_reply: true } } : {}) });

async function dispatch(event, payload) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/dispatches`, {
    method: "POST",
    headers: { authorization: `Bearer ${env.GH_DISPATCH_TOKEN}`, accept: "application/vnd.github+json", "user-agent": "telegram-video-bot" },
    body: JSON.stringify({ event_type: event, client_payload: payload })
  });
  if (res.status !== 204) throw new Error(`GitHub dispatch ${res.status}: ${await res.text()}`);
}

async function listIdeas(chatId) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/content/ideas/inbox.jsonl?ref=bot-data`, {
    headers: { authorization: `Bearer ${env.GH_DISPATCH_TOKEN}`, accept: "application/vnd.github.raw+json", "user-agent": "telegram-video-bot" }
  });
  if (!res.ok) return reply(chatId, "Abhi koi idea nahi hai.");
  const rows = (await res.text()).trim().split("\n").filter(Boolean).slice(-10).map((l) => JSON.parse(l));
  const text = rows.map((r, i) => `${i + 1}. ${r.user?.name ?? "?"}: ${String(r.text).slice(0, 180)}${r.link ? `\n   ${r.link}` : ""}${r.video ? " 🎥" : ""}`).join("\n");
  return reply(chatId, `📥 Latest ideas:\n${text || "(none)"}`);
}

async function handleUpdate(update) {
  const out = handle(update, ctx);
  const msg = update.message;
  for (const r of out.replies) await reply(msg.chat.id, r, msg.message_id);
  if (out.listIdeas) await listIdeas(msg.chat.id);
  if (out.dispatch) {
    try { await dispatch(out.dispatch.event, out.dispatch.payload); } catch (e) {
      console.error(e);
      await reply(msg.chat.id, "⚠️ Abhi request queue nahi ho paayi, thodi der baad dobara bhejo.");
    }
  }
}

http.createServer((req, res) => {
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
  if (PUBLIC_URL) {
    const r = await tg("setWebhook", { url: `${PUBLIC_URL.replace(/\/$/, "")}/tg/${SECRET}`, secret_token: SECRET, allowed_updates: ["message"], drop_pending_updates: false });
    console.log("setWebhook:", r.ok ? "ok" : r.description);
    await tg("setMyCommands", { commands: [
      { command: "topic", description: "Topic se video: /topic dadi Holi kyun" },
      { command: "script", description: "Apni script se video" },
      { command: "idea", description: "Video idea bhejo" },
      { command: "narrators", description: "Narrators ki list" },
      { command: "myid", description: "Aapka Telegram ID" },
      { command: "help", description: "Madad" }
    ] });
  }
});
