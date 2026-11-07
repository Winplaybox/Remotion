// Web admin dashboard served by the bot (/admin). Login: Telegram Login Widget, only TG_ADMIN_ID is let in.
// Actions (approve, reject, produce, priority, cancel, retry) are run as the admin's own bot commands, so the web and
// Telegram follow exactly the same rules. Pure helpers are exported for tests.
import crypto from "node:crypto";

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
  const isIdea = /^IDEA-\d{5}$/.test(code), isJob = /^JOB-\d{5}$/.test(code);
  switch (a.action) {
    case "approve": return isIdea ? `/approve ${code}` : null;
    case "reject": return isIdea ? `/reject ${code}` : null;
    case "produce": return isIdea ? `/produce ${code}` : null;
    case "priority": return isIdea && /^[1-5]$/.test(String(a.value)) ? `/priority ${code} ${a.value}` : null;
    case "cancel": return isJob ? `/cancel ${code}` : null;
    case "retry": return isJob ? `/retry ${code}` : null;
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

export function dashboardPage({ stats, ideas, jobs, admin }) {
  const ideaRows = ideas.map((i) => `<tr><td><b>${esc(i.code)}</b><div class="mute">${esc(new Date(i.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))}</div></td>
<td>${esc(i.title)}${i.description && i.description !== i.title ? `<div class="mute">${esc(i.description.slice(0, 240))}</div>` : ""}${i.link ? `<div><a href="${esc(i.link)}" target="_blank" rel="noopener">${esc(i.link.slice(0, 60))}</a></div>` : ""}${i.duplicate_of ? `<div class="mute">≈ ${esc(i.duplicate_of)}</div>` : ""}</td>
<td>${esc(i.user?.name || "")}<div class="mute">${i.user?.username ? "@" + esc(i.user.username) : ""}</div></td><td><span class="tag">${esc(i.status)}</span> <span class="tag">P${esc(i.priority)}</span></td>
<td>${i.status === "PENDING_REVIEW" ? `<button class="ok" data-a="approve" data-c="${esc(i.code)}">Approve</button><button class="bad" data-a="reject" data-c="${esc(i.code)}">Reject</button>` : ""}${i.status === "APPROVED" ? `<button class="acc" data-a="produce" data-c="${esc(i.code)}">Produce</button>` : ""}
${[1, 2, 3, 4, 5].map((p) => `<button data-a="priority" data-v="${p}" data-c="${esc(i.code)}">P${p}</button>`).join("")}</td></tr>`).join("");
  const jobRows = jobs.map((j) => `<tr><td><b>${esc(j.code)}</b><div class="mute">${esc(new Date(j.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))}</div></td><td>${esc(j.kind)}</td>
<td><span class="tag">${esc(j.status)}</span> ${esc(j.progress)}%${j.error ? `<div class="mute">${esc(j.error.slice(0, 200))}</div>` : ""}</td><td>${esc(j.output?.title || j.input?.text?.slice(0, 80) || "")}</td>
<td>${["COMPLETED", "FAILED", "CANCELLED"].includes(j.status) ? "" : `<button class="bad" data-a="cancel" data-c="${esc(j.code)}">Cancel</button>`}${j.status === "FAILED" ? `<button class="acc" data-a="retry" data-c="${esc(j.code)}">Retry</button>` : ""}</td></tr>`).join("");
  const stat = (n, l) => `<div class="stat"><b>${esc(n)}</b><span>${l}</span></div>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Video Bot Admin</title><style>${CSS}</style></head>
<body><main><h1>Video Bot Admin <span class="mute">· ${esc(admin)}</span></h1>
<div class="stats">${stat(stats.users, "Users")}${stat(stats.active_users_7d, "Active 7 days")}${stat(stats.ideas_pending, "Ideas pending")}${stat(stats.ideas_approved, "Ideas approved")}${stat(stats.ideas, "Ideas total")}${stat(stats.jobs_active, "Jobs active")}${stat(stats.jobs_completed, "Videos made")}${stat(stats.jobs_failed, "Jobs failed")}</div>
<h2>Ideas</h2><div class="wrap"><table><tr><th>ID</th><th>Idea</th><th>From</th><th>Status</th><th>Actions</th></tr>${ideaRows || `<tr><td colspan="5" class="mute">Koi idea nahi</td></tr>`}</table></div>
<h2>Jobs</h2><div class="wrap"><table><tr><th>ID</th><th>Type</th><th>Status</th><th>Title / input</th><th>Actions</th></tr>${jobRows || `<tr><td colspan="5" class="mute">Koi job nahi</td></tr>`}</table></div>
<p class="mute">Har action aapke Telegram chat mein bhi log hota hai.</p><div id="msg"></div></main>
<script>
document.addEventListener("click", async (e) => {
  const b = e.target.closest("button[data-a]"); if (!b) return;
  b.disabled = true;
  const r = await fetch("/admin/api/action", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: b.dataset.a, code: b.dataset.c, value: b.dataset.v }) });
  const m = document.getElementById("msg"); m.textContent = r.ok ? "✓ Done" : "✗ " + (await r.text()); m.style.display = "block";
  setTimeout(() => location.reload(), 900);
});
</script></body></html>`;
}
