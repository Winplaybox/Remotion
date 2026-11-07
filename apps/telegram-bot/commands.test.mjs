import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { handle, parseCommand, splitNarrator, NARRATORS, STYLES, DAILY_VIDEO_LIMIT } from "./commands.mjs";

const ctx = (over = {}) => ({ allow: new Set(["42"]), admin: "1", usage: new Map(), today: "2026-11-08", ...over });
const msg = (text, from = 42, extra = {}) => ({ message: { message_id: 7, chat: { id: from }, from: { id: from, first_name: "Ravi" }, text, ...extra } });

test("parses commands with bot suffix and multi-line args", () => {
  assert.deepEqual(parseCommand("/topic@MyBot dadi Holi"), { cmd: "topic", args: "dadi Holi" });
  assert.deepEqual(parseCommand("/script jasoos\nline 1\nline 2"), { cmd: "script", args: "jasoos\nline 1\nline 2" });
  assert.equal(parseCommand("hello"), null);
});

test("narrator is optional and defaults to dost", () => {
  assert.deepEqual(splitNarrator("Dadi Holi kyun"), { narrator: "dadi", rest: "Holi kyun" });
  assert.deepEqual(splitNarrator("Holi kyun"), { narrator: "dost", rest: "Holi kyun" });
});

test("narrator ids match the Remotion engine", () => {
  const src = fs.readFileSync(new URL("../../engines/narrator-video/src/model.ts", import.meta.url), "utf8");
  for (const id of Object.keys(NARRATORS)) assert.match(src, new RegExp(`\\n  ${id}: \\{`), `engine is missing narrator ${id}`);
});

test("plain message, link or sample video becomes an idea with a confirmation", () => {
  const r = handle(msg("Aisa video banao https://youtu.be/x"), ctx());
  assert.match(r.replies[0], /future pipeline/);
  assert.equal(r.dispatch.event, "tg-idea");
  assert.equal(r.dispatch.payload.link, "https://youtu.be/x");
  const v = handle({ message: { message_id: 1, chat: { id: 5 }, from: { id: 5 }, video: { file_id: "VID" } } }, ctx());
  assert.equal(v.dispatch.payload.video, "VID");
});

test("allowed user gets a video job; stranger's topic is saved as an idea", () => {
  const ok = handle(msg("/topic dadi Holi kyun manate hain"), ctx());
  assert.equal(ok.dispatch.event, "tg-video");
  assert.equal(ok.dispatch.payload.narrator, "dadi");
  assert.equal(ok.dispatch.payload.kind, "topic");
  const no = handle(msg("/topic dadi Holi", 99), ctx());
  assert.equal(no.dispatch.event, "tg-idea");
  assert.match(no.replies[0], /invited/);
});

test("daily limit for non-admins, none for admin", () => {
  const c = ctx();
  for (let i = 0; i < DAILY_VIDEO_LIMIT; i++) assert.equal(handle(msg("/topic Holi"), c).dispatch.event, "tg-video");
  assert.equal(handle(msg("/topic Holi"), c).dispatch, undefined);
  for (let i = 0; i < DAILY_VIDEO_LIMIT + 2; i++) assert.equal(handle(msg("/topic Holi", 1), c).dispatch.event, "tg-video");
});

test("short scripts are rejected, /ideas is admin-only", () => {
  assert.equal(handle(msg("/script dadi bas"), ctx()).dispatch, undefined);
  assert.equal(handle(msg("/ideas", 1), ctx()).listIdeas, true);
  assert.equal(handle(msg("/ideas", 42), ctx()).listIdeas, undefined);
});

test("style ids match the Remotion toon engine", () => {
  const src = fs.readFileSync(new URL("../../engines/toon-video/src/model.ts", import.meta.url), "utf8");
  for (const id of STYLES) assert.match(src, new RegExp(`\\n  ${id}: \\{`), `engine is missing style ${id}`);
});

test("/style as video caption or as a reply to a video", () => {
  const cap = handle(msg(undefined, 42, { video: { file_id: "V1", file_size: 1000 }, caption: "/style comic Mera ghar" }), ctx());
  assert.equal(cap.dispatch.event, "tg-style");
  assert.deepEqual([cap.dispatch.payload.style, cap.dispatch.payload.fileId, cap.dispatch.payload.title], ["comic", "V1", "Mera ghar"]);
  const rep = handle(msg("/style anime", 42, { reply_to_message: { video: { file_id: "V2" } } }), ctx());
  assert.equal(rep.dispatch.payload.fileId, "V2");
  assert.equal(rep.dispatch.payload.style, "anime");
  const def = handle(msg(undefined, 42, { video: { file_id: "V3" }, caption: "/style" }), ctx());
  assert.equal(def.dispatch.payload.style, "cartoon");
});

test("/style without video, too big, or by a stranger", () => {
  assert.equal(handle(msg("/style cartoon"), ctx()).dispatch, undefined);
  const big = handle(msg(undefined, 42, { video: { file_id: "V", file_size: 25 * 1024 * 1024 }, caption: "/style" }), ctx());
  assert.equal(big.dispatch, undefined);
  assert.match(big.replies[0], /20 MB/);
  const stranger = handle(msg(undefined, 99, { video: { file_id: "V" }, caption: "/style" }), ctx());
  assert.equal(stranger.dispatch.event, "tg-idea");
});
