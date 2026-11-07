// Append one idea (env PAYLOAD from the Telegram bot) to content/ideas/inbox.jsonl on the `bot-data` branch,
// then tell the admin. Runs in .github/workflows/telegram-bot.yml with GITHUB_TOKEN (contents: write).
// Uses the GitHub Contents API (no git, no shell), retrying on concurrent writes.
const p = JSON.parse(process.env.PAYLOAD || "{}");
const repo = process.env.GITHUB_REPOSITORY;
const gh = (url, init = {}) => fetch(`https://api.github.com/repos/${repo}${url}`, {
  ...init,
  headers: { authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: "application/vnd.github+json", "user-agent": "telegram-bot", ...(init.headers || {}) }
});
const FILE = "content/ideas/inbox.jsonl";
const BRANCH = "bot-data";

async function ensureBranch() {
  if ((await gh(`/branches/${BRANCH}`)).ok) return;
  // Orphan branch with just the inbox file: blob -> tree -> commit (no parent) -> ref.
  const tree = await (await gh("/git/trees", { method: "POST", body: JSON.stringify({ tree: [{ path: FILE, mode: "100644", type: "blob", content: "" }] }) })).json();
  const commit = await (await gh("/git/commits", { method: "POST", body: JSON.stringify({ message: "ideas inbox", tree: tree.sha, parents: [] }) })).json();
  const ref = await gh("/git/refs", { method: "POST", body: JSON.stringify({ ref: `refs/heads/${BRANCH}`, sha: commit.sha }) });
  if (!ref.ok && ref.status !== 422) throw new Error(`create ${BRANCH}: ${ref.status}`);
}

const row = {
  at: new Date().toISOString(),
  status: "new",
  user: p.user ?? {},
  chatId: p.chatId,
  text: String(p.text ?? "").slice(0, 3500),
  link: p.link || "",
  video: p.video || ""
};

await ensureBranch();
for (let attempt = 1; ; attempt++) {
  const cur = await gh(`/contents/${FILE}?ref=${BRANCH}`);
  const j = cur.ok ? await cur.json() : null;
  const old = j ? Buffer.from(j.content, "base64").toString("utf8") : "";
  const res = await gh(`/contents/${FILE}`, {
    method: "PUT",
    body: JSON.stringify({ message: `idea from ${row.user.name ?? row.chatId}`, branch: BRANCH, content: Buffer.from(old + JSON.stringify(row) + "\n").toString("base64"), ...(j ? { sha: j.sha } : {}) })
  });
  if (res.ok) break;
  if (attempt >= 5) throw new Error(`save idea: ${res.status} ${await res.text()}`);
  await new Promise((r) => setTimeout(r, 1500 * attempt));
}
console.log("idea saved");

const token = process.env.TELEGRAM_BOT_TOKEN, admin = process.env.TG_ADMIN_ID;
if (token && admin) {
  const tg = (m, b) => fetch(`https://api.telegram.org/bot${token}/${m}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });
  const text = `💡 Naya idea — ${row.user.name ?? "?"}${row.user.username ? ` (@${row.user.username})` : ""}\n${row.text}${row.link ? `\n${row.link}` : ""}`;
  await tg("sendMessage", { chat_id: admin, text: text.slice(0, 4000) });
  if (row.video) await tg("sendVideo", { chat_id: admin, video: row.video, caption: "Sample video (idea)" });
}
