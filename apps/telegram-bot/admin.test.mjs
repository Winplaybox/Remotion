import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { actionToCommand, dashboardShell, detailCode, parseListQuery, readSession, signSession, verifyTelegramLogin } from "./admin.mjs";
import { memoryStore } from "./store.mjs";

const TOKEN = "123:ABC";
const signLogin = (fields) => {
  const check = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join("\n");
  const hash = crypto.createHmac("sha256", crypto.createHash("sha256").update(TOKEN).digest()).update(check).digest("hex");
  return { ...fields, hash };
};

test("Telegram login: valid hash accepted, tampered / stale rejected", () => {
  const now = Date.now();
  const q = signLogin({ id: "1", first_name: "Sagar", auth_date: String(Math.floor(now / 1000)) });
  assert.deepEqual(verifyTelegramLogin(q, TOKEN, now), { id: "1", name: "Sagar" });
  assert.equal(verifyTelegramLogin({ ...q, id: "2" }, TOKEN, now), null);
  assert.equal(verifyTelegramLogin(q, "other-token", now), null);
  assert.equal(verifyTelegramLogin(q, TOKEN, now + 2 * 86_400_000), null);
  assert.equal(verifyTelegramLogin({ id: "1" }, TOKEN, now), null);
});

test("session cookie: signed, tamper-proof, expires", () => {
  const key = crypto.randomBytes(32), now = Date.now();
  const c = `vb_admin=${encodeURIComponent(signSession("1", key, now))}`;
  assert.equal(readSession(c, key, now), "1");
  assert.equal(readSession(c.replace("vb_admin=1", "vb_admin=2"), key, now), null);
  assert.equal(readSession(c, crypto.randomBytes(32), now), null);
  assert.equal(readSession(c, key, now + 13 * 3600_000), null);
  assert.equal(readSession("", key, now), null);
});

test("web actions map only to known, validated bot commands", () => {
  assert.equal(actionToCommand({ action: "approve", code: "idea-00001" }), "/approve IDEA-00001");
  assert.equal(actionToCommand({ action: "priority", code: "IDEA-00002", value: "1" }), "/priority IDEA-00002 1");
  assert.equal(actionToCommand({ action: "retry", code: "JOB-00003" }), "/retry JOB-00003");
  assert.equal(actionToCommand({ action: "approve", code: "IDEA-00001 /allow 5" }), null);
  assert.equal(actionToCommand({ action: "cancel", code: "IDEA-00001" }), null);
  assert.equal(actionToCommand({ action: "priority", code: "IDEA-00001", value: "9" }), null);
  assert.equal(actionToCommand({ action: "allow", code: "5" }), null);
  assert.equal(actionToCommand({ action: "retry", code: "PUB-00001" }), "/pubretry PUB-00001");
  assert.equal(actionToCommand({ action: "unpublish", code: "PUB-00001" }), "/unpublish PUB-00001");
  assert.equal(actionToCommand({ action: "unpublish", code: "JOB-00001" }), null);
});

test("dashboard shell escapes the admin id and has no inline data", () => {
  const html = dashboardShell("<b>1</b>");
  assert.match(html, /&lt;b&gt;1&lt;\/b&gt;/);
  assert.doesNotMatch(html, /<b>1<\/b>/);
  assert.match(html, /\/admin\/api\/list/);
});

test("list query is validated", () => {
  const q = (s) => parseListQuery(new URLSearchParams(s));
  assert.deepEqual(q("entity=jobs&status=FAILED&q=diwali&page=3&size=50"), { entity: "jobs", status: "FAILED", q: "diwali", limit: 50, offset: 100 });
  assert.equal(q("entity=secrets"), null);
  assert.equal(q("entity=jobs&status=FAILED;drop"), null);
  assert.deepEqual(q("entity=ideas&size=999&page=-4"), { entity: "ideas", status: null, q: "", limit: 25, offset: 0 });
  assert.equal(q(`entity=users&q=${"x".repeat(300)}`).q.length, 100);
  assert.equal(detailCode("job", "JOB-00001"), "JOB-00001");
  assert.equal(detailCode("job", "IDEA-00001"), null);
  assert.equal(detailCode("idea", "IDEA-00001/../x"), null);
});

test("user actions only take numeric Telegram ids", () => {
  assert.equal(actionToCommand({ action: "allow", code: "816898456" }), "/allow 816898456");
  assert.equal(actionToCommand({ action: "disallow", code: "816898456" }), "/disallow 816898456");
  assert.equal(actionToCommand({ action: "allow", code: "1; /reject" }), null);
});

test("admin list pages, filters, searches and counts every status", async () => {
  const s = memoryStore();
  await s.touchUser({ id: 7, name: "Asha", username: "asha" }, false);
  for (let i = 0; i < 30; i++) await s.createJob(7, 7, "topic", { text: i % 3 ? `holi ${i}` : `diwali ${i}` }, `k${i}`, 0);
  await s.updateJob("JOB-00001", { status: "FAILED", error: "boom" });
  const p1 = await s.adminList("jobs", null, "", 10, 0);
  assert.equal(p1.total, 30); assert.equal(p1.rows.length, 10); assert.equal(p1.rows[0].code, "JOB-00030");
  assert.deepEqual(p1.counts, { QUEUED: 29, FAILED: 1 });
  const p3 = await s.adminList("jobs", null, "", 10, 20);
  assert.equal(p3.rows.at(-1).code, "JOB-00001");
  const f = await s.adminList("jobs", "FAILED", "", 25, 0);
  assert.equal(f.total, 1); assert.equal(f.counts.QUEUED, 29);
  assert.equal((await s.adminList("jobs", null, "diwali", 25, 0)).total, 10);
  assert.equal((await s.adminList("jobs", null, "@nobody", 25, 0)).total, 0);
  const u = await s.adminList("users", null, "asha", 25, 0);
  assert.equal(u.rows[0].jobs, 30);
  assert.equal((await s.adminJob("JOB-00001")).user.name, "Asha");
});

test("web dashboard actions keep the stored Telegram name", async () => {
  const s = memoryStore();
  await s.touchUser({ id: 9, name: "Sagar", username: "sagar" }, true);
  await s.touchUser({ id: 9, name: "", username: "" }, true);
  assert.equal((await s.adminList("users", null, "", 10, 0)).rows[0].name, "Sagar");
});
