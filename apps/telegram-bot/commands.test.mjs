import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { handle, parseCommand, splitNarrator, NARRATORS, STYLES, DAILY_VIDEO_LIMIT, HELP, STYLE_OFF, MAIN_MENU } from "./commands.mjs";
import { memoryStore } from "./store.mjs";

const ADMIN = 1, CREATOR = 42, STRANGER = 99;
const ctx = (over = {}) => ({ store: memoryStore(), allow: new Set([String(CREATOR)]), admin: String(ADMIN), styleEnabled: true, pending: new Map(), ...over });
let uid = 1000;
const msg = (text, from = CREATOR, extra = {}) => ({ update_id: ++uid, message: { message_id: uid, chat: { id: from }, from: { id: from, first_name: "Ravi", username: "ravi" }, text, ...extra } });
const press = (data, from = ADMIN) => ({ update_id: ++uid, callback_query: { id: `q${uid}`, data, from: { id: from, first_name: "A" }, message: { message_id: 5, chat: { id: from } } } });

test("parses commands with bot suffix and multi-line args", () => {
  assert.deepEqual(parseCommand("/topic@MyBot dadi Holi"), { cmd: "topic", args: "dadi Holi" });
  assert.deepEqual(parseCommand("/script jasoos\nline 1\nline 2"), { cmd: "script", args: "jasoos\nline 1\nline 2" });
  assert.equal(parseCommand("hello"), null);
});

test("narrator is optional and falls back to the user's default", () => {
  assert.deepEqual(splitNarrator("Dadi Holi kyun"), { narrator: "dadi", rest: "Holi kyun" });
  assert.deepEqual(splitNarrator("Holi kyun", "teacher"), { narrator: "teacher", rest: "Holi kyun" });
});

test("narrator and style ids match the Remotion engines", () => {
  const n = fs.readFileSync(new URL("../../engines/narrator-video/src/model.ts", import.meta.url), "utf8");
  for (const id of Object.keys(NARRATORS)) assert.match(n, new RegExp(`\\n  ${id}: \\{`), `engine is missing narrator ${id}`);
  const t = fs.readFileSync(new URL("../../engines/toon-video/src/model.ts", import.meta.url), "utf8");
  for (const id of STYLES) assert.match(t, new RegExp(`\\n  ${id}: \\{`), `engine is missing style ${id}`);
});

test("idea: ID + pending status reply, admin gets buttons, never starts a job", async () => {
  const c = ctx();
  const r = await handle(msg("/idea How will AI change jobs in the next 10 years?", STRANGER), c);
  assert.match(r.replies[0].text, /Idea ID: IDEA-00001/);
  assert.match(r.replies[0].text, /Pending Admin Review/);
  assert.equal(r.admin.length, 1);
  assert.ok(r.admin[0].keyboard.flat().some((b) => b.data === "idea:approve:IDEA-00001"));
  assert.notEqual(r.dispatch?.event, "tg-video");
  assert.equal((await c.store.listJobs(null, null, 10)).length, 0);
});

test("plain message, link or sample video becomes an idea; duplicates are flagged", async () => {
  const c = ctx();
  await handle(msg("AI jobs ka future agle 10 saal mein kya hoga", STRANGER), c);
  const d = await handle(msg("AI jobs ka future agle 10 saal mein kya hoga?? https://youtu.be/x", 77), c);
  assert.match(d.replies[0].text, /IDEA-00002/);
  assert.match(d.replies[0].text, /pehle se hai: IDEA-00001/);
  const v = await handle({ update_id: ++uid, message: { message_id: 1, chat: { id: 5 }, from: { id: 5 }, video: { file_id: "VID" } } }, c);
  assert.equal(v.copyToAdmin, true);
  assert.equal((await c.store.getIdea("IDEA-00003")).media_file_id, "VID");
});

test("admin approves, reprioritises and merges via buttons; owner is notified; non-admin cannot", async () => {
  const c = ctx();
  await handle(msg("Holi ke rang ka itihaas", STRANGER), c);
  const denied = await handle(press("idea:approve:IDEA-00001", CREATOR), c);
  assert.equal(denied.answer, "Sirf admin");
  const ok = await handle(press("idea:approve:IDEA-00001"), c);
  assert.equal((await c.store.getIdea("IDEA-00001")).status, "APPROVED");
  assert.equal(ok.notify[0].chatId, STRANGER);
  await handle(press("idea:p1:IDEA-00001"), c);
  assert.equal((await c.store.getIdea("IDEA-00001")).priority, 1);
  await handle(msg("Holi ke rang ka itihaas kya hai", 55), c);
  await handle(press("idea:merge:IDEA-00002:IDEA-00001"), c);
  assert.equal((await c.store.getIdea("IDEA-00002")).status, "MERGED");
});

test("only APPROVED ideas enter production", async () => {
  const c = ctx();
  await handle(msg("Chandrayaan 3 ki kahani", STRANGER), c);
  const no = await handle(msg("/produce IDEA-00001", ADMIN), c);
  assert.match(no.replies[0].text, /Sirf APPROVED/);
  await handle(msg("/approve IDEA-00001 accha hai", ADMIN), c);
  const yes = await handle(msg("/produce IDEA-00001 dadi", ADMIN), c);
  assert.equal(yes.dispatch.event, "tg-video");
  assert.equal(yes.dispatch.payload.ideaCode, "IDEA-00001");
  assert.equal(yes.dispatch.payload.narrator, "dadi");
  assert.equal((await c.store.getIdea("IDEA-00001")).status, "IN_PRODUCTION");
});

test("allowed user gets a job with ID + cancel button; stranger's topic is saved as an idea", async () => {
  const c = ctx();
  const ok = await handle(msg("/topic dadi Holi kyun manate hain"), c);
  assert.equal(ok.dispatch.event, "tg-video");
  assert.equal(ok.dispatch.payload.jobCode, "JOB-00001");
  assert.equal(ok.statusFor, "JOB-00001");
  assert.equal(ok.replies[0].keyboard[0][0].data, "job:cancel:JOB-00001");
  const no = await handle(msg("/topic dadi Holi", STRANGER), c);
  assert.notEqual(no.dispatch?.event, "tg-video");
  assert.match(no.replies[0].text, /invited/);
  assert.equal((await c.store.listIdeas(null, STRANGER, 5)).length, 1);
});

test("the same Telegram update never creates two jobs", async () => {
  const c = ctx();
  const u = msg("/topic Holi kyun");
  const a = await handle(u, c);
  const b = await handle(u, c);
  assert.equal(a.dispatch.payload.jobCode, "JOB-00001");
  assert.equal(b.dispatch, undefined);
  assert.equal((await c.store.listJobs(null, null, 10)).length, 1);
});

test("daily limit is persistent per user; admin unlimited; /allow grants access", async () => {
  const c = ctx();
  for (let i = 0; i < DAILY_VIDEO_LIMIT; i++) assert.equal((await handle(msg("/topic Holi"), c)).dispatch.event, "tg-video");
  assert.match((await handle(msg("/topic Holi"), c)).replies[0].text, /limit/);
  for (let i = 0; i < DAILY_VIDEO_LIMIT + 2; i++) assert.equal((await handle(msg("/topic Holi", ADMIN), c)).dispatch.event, "tg-video");
  await handle(msg("/start", 300), c);
  assert.match((await handle(msg("/topic Holi", 300), c)).replies[0].text, /invited/);
  await handle(msg("/allow 300", ADMIN), c);
  assert.equal((await handle(msg("/topic Holi", 300), c)).dispatch.event, "tg-video");
});

test("/status, /cancel (own jobs only), /history, retry after failure", async () => {
  const c = ctx();
  await handle(msg("/topic Holi kyun"), c);
  assert.match((await handle(msg("/status"), c)).replies[0].text, /JOB-00001 · topic · ⏳/);
  assert.match((await handle(msg("/cancel JOB-00001", 77), c)).replies[0].text, /nahi mili/);
  assert.match((await handle(press("job:cancel:JOB-00001", CREATOR), c)).replies[0].text, /cancel kar di/);
  assert.equal((await c.store.getJob("JOB-00001")).status, "CANCELLED");
  await c.store.updateJob("JOB-00001", { status: "RENDERING" });
  assert.equal((await c.store.getJob("JOB-00001")).status, "CANCELLED", "cancelled jobs stay cancelled");
  await handle(msg("/topic Diwali"), c);
  await c.store.updateJob("JOB-00002", { status: "FAILED", error: "Gemini busy" });
  const r = await handle(press("job:retry:JOB-00002", CREATOR), c);
  assert.equal(r.dispatch.payload.retryOf, "JOB-00002");
  const h = await handle(msg("/history"), c);
  assert.match(h.replies[0].text, /JOB-00003/);
});

test("menu buttons + pending input; settings are saved and used for the next job", async () => {
  const c = ctx();
  const m = await handle(msg("/menu"), c);
  assert.deepEqual(m.replies[0].keyboard, MAIN_MENU);
  await handle(press("pref:narrator:jasoos", CREATOR), c);
  await handle(press("pref:seconds:30", CREATOR), c);
  await handle(press("menu:topic", CREATOR), c);
  const j = await handle(msg("Kohinoor heera kahan hai"), c);
  assert.equal(j.dispatch.payload.narrator, "jasoos");
  assert.equal(j.dispatch.payload.seconds, 30);
  assert.equal(j.dispatch.payload.text, "Kohinoor heera kahan hai");
  assert.equal((await handle(press("pref:narrator:hacker", CREATOR), c)).answer, "?");
});

test("/style: off by default, on with flag; caption or reply; size limit", async () => {
  const off = await handle(msg(undefined, ADMIN, { video: { file_id: "V" }, caption: "/style cartoon" }), ctx({ styleEnabled: false }));
  assert.equal(off.dispatch, undefined);
  assert.equal(off.replies[0].text, STYLE_OFF);
  assert.doesNotMatch(HELP, /\/style/);
  const c = ctx();
  const cap = await handle(msg(undefined, CREATOR, { video: { file_id: "V1", file_size: 1000 }, caption: "/style comic Mera ghar" }), c);
  assert.equal(cap.dispatch.event, "tg-style");
  assert.deepEqual([cap.dispatch.payload.style, cap.dispatch.payload.fileId, cap.dispatch.payload.title], ["comic", "V1", "Mera ghar"]);
  const rep = await handle(msg("/style anime", CREATOR, { reply_to_message: { video: { file_id: "V2" } } }), c);
  assert.equal(rep.dispatch.payload.fileId, "V2");
  const big = await handle(msg(undefined, CREATOR, { video: { file_id: "V", file_size: 25 * 1024 * 1024 }, caption: "/style" }), c);
  assert.match(big.replies[0].text, /20 MB/);
});

test("admin-only commands are hidden from users; /stats works for admin", async () => {
  const c = ctx();
  assert.match((await handle(msg("/stats", CREATOR), c)).replies[0].text, /Namaste/);
  assert.match((await handle(msg("/stats", ADMIN), c)).replies[0].text, /Users/);
});

test("/preview stops at the script; ▶️ Render continues the same job with the approved draft", async () => {
  const c = ctx();
  const r = await handle(msg("/preview dadi Diwali pe diye kyun"), c);
  assert.equal(r.dispatch.payload.preview, true);
  const code = r.dispatch.payload.jobCode;
  assert.match((await handle(press(`job:render:${code}`, CREATOR), c)).replies[0].text, /taiyaar nahi/);
  await c.store.updateJob(code, { output: { draft: { title: "T", beats: [] }, awaiting: "approval" } });
  assert.match((await handle(press(`job:render:${code}`, 77), c)).replies[0].text, /nahi mili/);
  const go = await handle(press(`job:render:${code}`, CREATOR), c);
  assert.equal(go.dispatch.payload.jobCode, code);
  assert.equal(go.dispatch.payload.preview, false);
  assert.deepEqual(go.dispatch.payload.draft, { title: "T", beats: [] });
  assert.equal((await c.store.getJob(code)).status, "NARRATION");
});

test("script as .txt document (caption or reply), enhance flag, size limit", async () => {
  const c = ctx();
  const doc = { file_id: "D1", file_name: "story.txt", mime_type: "text/plain", file_size: 3000 };
  const cap = await handle(msg(undefined, CREATOR, { document: doc, caption: "/script jasoos enhance" }), c);
  assert.equal(cap.dispatch.payload.fileId, "D1");
  assert.equal(cap.dispatch.payload.narrator, "jasoos");
  assert.equal(cap.dispatch.payload.enhance, true);
  const rep = await handle(msg("/script", CREATOR, { reply_to_message: { document: doc } }), c);
  assert.equal(rep.dispatch.payload.fileId, "D1");
  const big = await handle(msg(undefined, CREATOR, { document: { ...doc, file_size: 500_000 }, caption: "/script" }), c);
  assert.match(big.replies[0].text, /200 KB/);
  const inline = await handle(msg("/script dadi improve\nEk gaon mein ek kisaan rehta tha. Wo roz khet jaata tha. Ek din usne kuch ajeeb dekha."), c);
  assert.equal(inline.dispatch.payload.enhance, true);
  assert.match(inline.dispatch.payload.text, /^Ek gaon/);
});

test("settings language/aspect/length flow into the job", async () => {
  const c = ctx();
  await handle(press("pref:language:english", CREATOR), c);
  await handle(press("pref:aspect:16:9", CREATOR), c);
  const j = await handle(msg("/topic How rainbows form"), c);
  assert.equal(j.dispatch.payload.language, "english");
  assert.equal(j.dispatch.payload.aspect, "16:9");
});

test("/shorts from a video caption, a reply, or a link; limits and defaults", async () => {
  const c = ctx();
  const cap = await handle(msg(undefined, CREATOR, { video: { file_id: "L1", file_size: 10_000_000 }, caption: "/shorts 2 30" }), c);
  assert.equal(cap.dispatch.event, "tg-shorts");
  assert.deepEqual([cap.dispatch.payload.fileId, cap.dispatch.payload.count, cap.dispatch.payload.seconds], ["L1", 2, 30]);
  const link = await handle(msg("/shorts https://example.com/talk.mp4", CREATOR), c);
  assert.deepEqual([link.dispatch.payload.url, link.dispatch.payload.count, link.dispatch.payload.seconds], ["https://example.com/talk.mp4", 3, 45]);
  const big = await handle(msg(undefined, CREATOR, { video: { file_id: "L", file_size: 80_000_000 }, caption: "/shorts" }), c);
  assert.match(big.replies[0].text, /link bhejo/);
  assert.match((await handle(msg("/shorts", CREATOR), c)).replies[0].text, /Lambi video/);
  assert.notEqual((await handle(msg("/shorts https://x.y/v.mp4", STRANGER), c)).dispatch?.event, "tg-shorts");
});

import { whenToIso, PUBLISH_TARGETS } from "./commands.mjs";

test("schedule times are IST and never in the past", () => {
  const now = Date.parse("2026-11-08T10:00:00Z"); // 15:30 IST
  assert.equal(whenToIso("now", now), "2026-11-08T10:00:00.000Z");
  assert.equal(whenToIso("t1930", now), "2026-11-08T14:00:00.000Z");
  assert.equal(whenToIso("k0900", now), "2026-11-09T03:30:00.000Z");
  const late = Date.parse("2026-11-08T15:00:00Z"); // 20:30 IST -> today 7:30 PM has passed
  assert.equal(whenToIso("t1930", late), "2026-11-09T14:00:00.000Z");
  assert.equal(whenToIso("bogus", now), null);
});

test("publishing: owner submits, admin picks channel -> platforms -> time, owner notified; strangers blocked", async () => {
  const c = ctx();
  const j = await handle(msg("/topic Holi kyun"), c);
  const code = j.dispatch.payload.jobCode;
  assert.match((await handle(press(`pub:submit:${code}`, CREATOR), c)).replies[0].text, /file save nahi/);
  await c.store.updateJob(code, { status: "COMPLETED", output: { file: `jobs/${code}/video.mp4`, title: "Holi kyun?", hashtags: ["#shorts"] } });
  assert.match((await handle(press(`pub:submit:${code}`, 77), c)).replies[0].text, /aapka video nahi/);
  const sub = await handle(press(`pub:submit:${code}`, CREATOR), c);
  assert.match(sub.replies[0].text, /PUB-00001 admin ko bheja/);
  assert.equal(sub.admin[0].keyboard[0][0].data, `pub:t:PUB-00001:${PUBLISH_TARGETS[0].id}`);
  assert.match((await handle(press(`pub:submit:${code}`, CREATOR), c)).replies[0].text, /pehle se PENDING_APPROVAL/);
  assert.equal((await handle(press("pub:t:PUB-00001:chakra-puzzle", CREATOR), c)).answer, "Sirf admin");
  const t = await handle(press("pub:t:PUB-00001:chakra-puzzle"), c);
  assert.equal(t.edit.keyboard[0][1].data, "pub:p:PUB-00001:chakra-puzzle:yif");
  const p = await handle(press("pub:p:PUB-00001:chakra-puzzle:yif"), c);
  assert.equal(p.edit.keyboard[0][0].data, "pub:a:PUB-00001:chakra-puzzle:yif:now");
  const a = await handle(press("pub:a:PUB-00001:chakra-puzzle:yif:now"), c);
  assert.equal(a.dispatch.event, "tg-publish");
  assert.equal(a.notify[0].chatId, CREATOR);
  const pub = await c.store.getPublication("PUB-00001");
  assert.deepEqual([pub.status, pub.target, pub.platforms], ["SCHEDULED", "chakra-puzzle", ["youtube", "instagram", "facebook"]]);
  assert.equal((await handle(press("pub:a:PUB-00001:hacked:yif:now"), c)).answer, "?");
  const x = await handle(press("pub:x:PUB-00001"), c);
  assert.equal((await c.store.getPublication("PUB-00001")).status, "CANCELLED");
  assert.match(x.edit.text, /CANCELLED/);
});
