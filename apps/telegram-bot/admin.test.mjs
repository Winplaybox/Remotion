import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { actionToCommand, dashboardPage, readSession, signSession, verifyTelegramLogin } from "./admin.mjs";

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
});

test("dashboard escapes user content", () => {
  const html = dashboardPage({
    admin: "1",
    stats: { users: 1, active_users_7d: 1, ideas: 1, ideas_pending: 1, ideas_approved: 0, jobs_active: 0, jobs_completed: 0, jobs_failed: 0 },
    ideas: [{ code: "IDEA-00001", title: "<script>alert(1)</script>", description: "", link: "", status: "PENDING_REVIEW", priority: 3, created_at: new Date().toISOString(), user: { name: "<b>x</b>", username: "" } }],
    jobs: []
  });
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /data-a="approve" data-c="IDEA-00001"/);
});
