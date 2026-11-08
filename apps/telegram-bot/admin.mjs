// Web admin dashboard served by the bot (/admin). Login: Telegram Login Widget, only TG_ADMIN_ID is let in.
// Actions (approve, reject, produce, priority, cancel, retry) are run as the admin's own bot commands, so the web and
// Telegram follow exactly the same rules. Pure helpers are exported for tests.
import crypto from "node:crypto";
import fs from "node:fs";

const SESSION_HOURS = 12;

/** Telegram Login Widget check: https://core.telegram.org/widgets/login#checking-authorization */
export function verifyTelegramLogin(query, botToken, now = Date.now()) {
  const { hash, ...fields } = query;
  if (!hash || !fields.id || !fields.auth_date) return null;
  const check = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join("\n");
  const secret = crypto.createHash("sha256").update(botToken).digest();
  const hmac = crypto.createHmac("sha256", secret).update(check).digest("hex");
  if (hmac.length !== hash.length || !crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(hash))) return null;
  if (now / 1000 - Number(fields.auth_date) > 86_400) return null; // login older than a day
  return { id: String(fields.id), name: [fields.first_name, fields.last_name].filter(Boolean).join(" ") };
}

export function signSession(id, key, now = Date.now()) {
  const exp = Math.floor(now / 1000) + SESSION_HOURS * 3600;
  const body = `${id}.${exp}`;
  return `${body}.${crypto.createHmac("sha256", key).update(body).digest("hex")}`;
}

export function readSession(cookie, key, now = Date.now()) {
  const m = /(?:^|;\s*)vb_admin=([^;]+)/.exec(cookie || "");
  if (!m) return null;
  const [id, exp, sig] = decodeURIComponent(m[1]).split(".");
  if (!id || !exp || !sig) return null;
  const want = crypto.createHmac("sha256", key).update(`${id}.${exp}`).digest("hex");
  if (want.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(sig))) return null;
  if (Number(exp) < now / 1000) return null;
  return id;
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** Admin action -> the equivalent bot command text (validated, so the web cannot run anything else). */
export function actionToCommand(a) {
  const code = String(a.code || "").toUpperCase();
  const isIdea = /^IDEA-\d{5}$/.test(code), isJob = /^JOB-\d{5}$/.test(code), isPub = /^PUB-\d{5}$/.test(code);
  switch (a.action) {
    case "approve": return isIdea ? `/approve ${code}` : null;
    case "reject": return isIdea ? `/reject ${code}` : null;
    case "produce": return isIdea ? `/produce ${code}` : null;
    case "priority": return isIdea && /^[1-5]$/.test(String(a.value)) ? `/priority ${code} ${a.value}` : null;
    case "cancel": return isJob ? `/cancel ${code}` : null;
    case "retry": return isJob ? `/retry ${code}` : isPub ? `/pubretry ${code}` : null;
    case "unpublish": return isPub ? `/unpublish ${code}` : null;
    case "allow": return /^\d{3,15}$/.test(String(a.code)) ? `/allow ${a.code}` : null;
    case "disallow": return /^\d{3,15}$/.test(String(a.code)) ? `/disallow ${a.code}` : null;
    default: return null;
  }
}

const CSS = `:root{--bg:#0f1115;--card:#171a21;--line:#262b36;--ink:#e9ecf1;--mute:#97a0b0;--acc:#ffc94a;--ok:#2fbf71;--bad:#ef5350}
@media (prefers-color-scheme: light){:root{--bg:#f6f7f9;--card:#fff;--line:#e3e6ec;--ink:#14171c;--mute:#5b6473;--acc:#b07800}}
*{box-sizing:border-box}body{margin:0;font:15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--ink)}
main{max-width:1100px;margin:0 auto;padding:20px 16px 60px}h1{font-size:20px;margin:0 0 16px}h2{font-size:16px;margin:28px 0 10px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}.stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px}
.stat b{display:block;font-size:24px}.stat span{color:var(--mute);font-size:13px}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}
th,td{padding:9px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{color:var(--mute);font-weight:600;font-size:13px}
tr:last-child td{border-bottom:0}.mute{color:var(--mute);font-size:13px}.tag{display:inline-block;padding:1px 8px;border-radius:99px;border:1px solid var(--line);font-size:12px}
button{font:inherit;font-size:13px;padding:4px 10px;border-radius:8px;border:1px solid var(--line);background:transparent;color:var(--ink);cursor:pointer;margin:2px}
button.ok{border-color:var(--ok);color:var(--ok)}button.bad{border-color:var(--bad);color:var(--bad)}button.acc{border-color:var(--acc);color:var(--acc)}
.wrap{overflow-x:auto}#msg{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:var(--card);border:1px solid var(--line);padding:8px 14px;border-radius:10px;display:none}`;

export function loginPage(botUsername) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Video Bot Admin</title><style>${CSS}</style></head>
<body><main><h1>Video Bot Admin</h1><p class="mute">Telegram se login karo (sirf admin).</p>
${botUsername ? `<script async src="https://telegram.org/js/telegram-widget.js?22" data-telegram-login="${esc(botUsername)}" data-size="large" data-auth-url="/admin/auth" data-request-access="write"></script>` : `<p>Bot username set nahi hai (TG_BOT_USERNAME).</p>`}
</main></body></html>`;
}

// ---------------- dashboard v2: JSON API + single page ----------------

export const ENTITIES = ["ideas", "jobs", "publications", "users"];

/** Validates /admin/api/list query params. Returns null for anything unexpected. */
export function parseListQuery(params) {
  const entity = params.get("entity") || "";
  if (!ENTITIES.includes(entity)) return null;
  const status = params.get("status") || null;
  if (status && !/^[A-Za-z_]{2,24}$/.test(status)) return null;
  const q = (params.get("q") || "").slice(0, 100);
  const size = [10, 25, 50, 100].includes(Number(params.get("size"))) ? Number(params.get("size")) : 25;
  const page = Math.min(Math.max(Math.floor(Number(params.get("page")) || 1), 1), 10_000);
  return { entity, status, q, limit: size, offset: (page - 1) * size };
}

/** Codes accepted by the detail endpoints. */
export const detailCode = (kind, code) => (kind === "job" ? /^JOB-\d{5,}$/ : /^IDEA-\d{5,}$/).test(String(code)) ? String(code) : null;

let shell = null;
export function dashboardShell(admin) {
  shell ??= fs.readFileSync(new URL("./dashboard.html", import.meta.url), "utf8");
  return shell.replace("__ADMIN__", esc(admin));
}

export const DASHBOARD_CSP = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";
