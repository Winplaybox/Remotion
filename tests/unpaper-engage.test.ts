import {
  CAP_PER_RUN, cleanReply, generateReply, isOldEnough, runPlatform, screen, selectComments, summary, templateReply, topicOf,
  type EngageComment, type PlatformClient
} from "../scripts/publish/unpaper-engage";
import { unpaperOwnLoop } from "../scripts/publish/engage";

const NOW = Date.parse("2026-11-23T06:00:00Z");
const MIN = 60_000;
let seq = 0;
const mk = (over: Partial<EngageComment> = {}): EngageComment => ({
  platform: "youtube", id: `c${++seq}`, text: "Bahut accha explain kiya 🔥", author: "viewer", at: NOW - 45 * MIN,
  postId: "v1", topic: "Budget 2026 ka sach | Unpaper #shorts", repliedByUs: false, ...over
});

describe("age filter", () => {
  it("acts only on comments at least 30 min old", () => {
    expect(isOldEnough({ at: NOW - 29 * MIN }, NOW)).toBe(false);
    expect(isOldEnough({ at: NOW - 30 * MIN }, NOW)).toBe(true);
    expect(isOldEnough({ at: NaN }, NOW)).toBe(false);
    const sel = selectComments([mk({ at: NOW - 10 * MIN }), mk({ at: NOW - 31 * MIN })], NOW);
    expect(sel.waiting).toBe(1);
    expect(sel.toReply).toHaveLength(1);
  });
  it("ignores comments older than 7 days", () => {
    const sel = selectComments([mk({ at: NOW - 8 * 86_400_000 })], NOW);
    expect(sel.toReply).toHaveLength(0);
    expect(sel.tooOld).toBe(1);
  });
});

describe("already-replied filter", () => {
  it("skips comments Unpaper already answered and duplicate ids", () => {
    const a = mk({ repliedByUs: true }), b = mk();
    const sel = selectComments([a, b, { ...b }], NOW);
    expect(sel.alreadyReplied).toBe(1);
    expect(sel.toReply.map((c) => c.id)).toEqual([b.id]);
  });
});

describe("spam / abuse / politics screen", () => {
  it.each([
    ["check my channel for free followers", "spam"],
    ["sub4sub bro", "spam"],
    ["visit https://scam.example now", "link"],
    ["paise kamao ghar baithe, DM karo", "spam"],
    ["bitcoin investment 10x guaranteed", "spam"],
    ["chutiya video", "abuse"],
    ["teri maa ki", "abuse"],
    ["Modi ne sab barbaad kar diya, bhakt log samjho", "politics"],
    ["Congress waale andhbhakt", "politics"],
    ["you are a retard", "hate"],
    ["bakwas clickbait", "negative"],
    ["   ", "empty"]
  ])("%s -> %s", (text, reason) => expect(screen(text)?.reason).toBe(reason));
  it("lets normal comments and questions through", () => {
    for (const t of ["Bahut accha explain kiya 🔥", "Ye data kahan se liya?", "❤️❤️", "Next video kab aayega?", "Nice work @Unpaper"]) expect(screen(t)).toBeNull();
  });
  it("logs skipped comments instead of replying", () => {
    const sel = selectComments([mk({ text: "follow back pls" }), mk({ text: "madarchod" }), mk()], NOW);
    expect(sel.toReply).toHaveLength(1);
    expect(sel.skipped.map((s) => s.reason).sort()).toEqual(["abuse", "spam"]);
    const md = summary([{ platform: "youtube", status: "ok", scanned: 3, replied: 1, liked: 0, modelReplies: 0, templateReplies: 1, waiting: 0, alreadyReplied: 0, overCap: 0, failed: 0, skipped: sel.skipped }], false);
    expect(md).toContain("follow back pls");
    expect(md).not.toContain("madarchod");
    expect(md).toContain("[hidden: abusive]");
  });
});

describe("reply cap", () => {
  it("replies to at most 25 per platform per run, oldest first", () => {
    const many = Array.from({ length: 40 }, (_, i) => mk({ at: NOW - (40 + i) * MIN }));
    const sel = selectComments(many, NOW);
    expect(CAP_PER_RUN).toBe(25);
    expect(sel.toReply).toHaveLength(25);
    expect(sel.overCap).toBe(15);
    expect(sel.toReply[0]!.at).toBe(Math.min(...many.map((c) => c.at)));
    expect(selectComments(many, NOW, 3).toReply).toHaveLength(3);
  });
  it("runPlatform stops at the cap and likes only where the platform allows it", async () => {
    const list = Array.from({ length: 30 }, () => mk({ platform: "facebook" }));
    const liked: string[] = [], replied: string[] = [];
    const fb: PlatformClient = { platform: "facebook", list: async () => list, like: async (id) => { liked.push(id); }, reply: async (id) => { replied.push(id); } };
    const rep = await runPlatform(fb, { dry: false, days: 7, now: NOW, used: new Set(), wait: async () => undefined });
    expect(rep.replied).toBe(25);
    expect(rep.liked).toBe(25);
    expect(rep.overCap).toBe(5);
    expect(new Set(replied).size).toBe(25);
    const ig: PlatformClient = { platform: "instagram", list: async () => [mk({ platform: "instagram" })], reply: async () => undefined };
    const r2 = await runPlatform(ig, { dry: false, days: 7, now: NOW, used: new Set(), wait: async () => undefined });
    expect(r2.liked).toBe(0);
    expect(r2.replied).toBe(1);
  });
  it("respects the YouTube daily budget", async () => {
    const yt: PlatformClient = { platform: "youtube", list: async () => Array.from({ length: 10 }, () => mk()), reply: async () => undefined, budget: () => 2 };
    const rep = await runPlatform(yt, { dry: false, days: 7, now: NOW, used: new Set(), wait: async () => undefined });
    expect(rep.replied).toBe(2);
  });
  it("dry run posts nothing", async () => {
    const reply = jest.fn();
    const rep = await runPlatform({ platform: "facebook", list: async () => [mk()], like: reply, reply }, { dry: true, days: 7, now: NOW, used: new Set() });
    expect(reply).not.toHaveBeenCalled();
    expect(rep.replied).toBe(1);
  });
});

describe("template fallback", () => {
  it("falls back to a template when GitHub Models fails, is missing, or returns unsafe text", async () => {
    const c = mk();
    const fail = jest.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }));
    expect((await generateReply(c, new Set(), { token: "t", fetchImpl: fail })).source).toBe("template");
    expect(fail).toHaveBeenCalledTimes(1);
    const boom = jest.fn(async () => { throw new Error("network down"); });
    expect((await generateReply(c, new Set(), { token: "t", fetchImpl: boom })).source).toBe("template");
    expect((await generateReply(c, new Set(), { token: undefined })).source).toBe("template");
    const unsafe = async () => ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content: "Visit https://evil.example for ₹500 profit guaranteed!" } }] }) });
    expect((await generateReply(c, new Set(), { token: "t", fetchImpl: unsafe })).source).toBe("template");
  });
  it("uses a safe model reply", async () => {
    const ok = async () => ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content: "Shukriya! 🙏 Budget ka asli number paper ke page 12 pe hai. Agla document kaunsa decode karein?" } }] }) });
    const r = await generateReply(mk(), new Set(), { token: "t", fetchImpl: ok });
    expect(r.source).toBe("model");
  });
  it("rotates varied templates, never repeats in a run, stays short and link-free", () => {
    const used = new Set<string>();
    const texts = Array.from({ length: 40 }, (_, i) => templateReply(mk({ id: `x${i}`, text: i % 2 ? "Ye kaise kaam karta hai?" : "mast 🔥" }), used));
    expect(new Set(texts).size).toBe(40);
    for (const t of texts) {
      expect(t.split("\n").length).toBeLessThanOrEqual(2);
      expect(t.length).toBeLessThanOrEqual(280);
      expect(t).not.toMatch(/https?:|www\./);
      expect(t).not.toMatch(/\{topic\}/);
    }
    // Every template passes the same guardrails as a model reply.
    for (const t of texts.slice(0, 16)) expect(cleanReply(t)).toBe(t);
  });
  it("is stable per comment id and picks question templates for questions", () => {
    const c = mk({ id: "stable-1", text: "Ye data kahan se liya?" });
    expect(templateReply(c)).toBe(templateReply(c));
    expect(templateReply(c)).toMatch(/sawaal|question|asking|point/i);
  });
});

describe("reply guardrails", () => {
  it("rejects links, foreign handles, money / legal talk, long or repeated text", () => {
    expect(cleanReply("Dekho www.site.in")).toBeNull();
    expect(cleanReply("Follow @someoneelse bhi")).toBeNull();
    expect(cleanReply("Follow @unpaper.ai pe bhi 🙌")).toBe("Follow @unpaper.ai pe bhi 🙌");
    expect(cleanReply("Isme invest karo, 100% return")).toBeNull();
    expect(cleanReply("Legal advice: court mein jao")).toBeNull();
    expect(cleanReply("a\nb\nc d e f g h")).toBeNull();
    expect(cleanReply("x".repeat(300))).toBeNull();
    expect(cleanReply("Shukriya dost! Agla kaunsa?", new Set(["Shukriya dost! Agla kaunsa?"]))).toBeNull();
  });
  it("topic comes from the title without the channel suffix", () => {
    expect(topicOf("Budget 2026 ka sach | Unpaper #shorts")).toBe("Budget 2026 ka sach");
    expect(topicOf("RBI report decoded\n#AI #reels")).toBe("RBI report decoded");
  });
});

describe("no double replies with the all-channel loop", () => {
  it("engage.ts leaves Unpaper alone once UNPAPER_ENGAGE_ENABLED is true", () => {
    expect(unpaperOwnLoop({ REPO_VARS: JSON.stringify({ UNPAPER_ENGAGE_ENABLED: "true" }) })).toBe(true);
    expect(unpaperOwnLoop({ REPO_VARS: JSON.stringify({ UNPAPER_ENGAGE_ENABLED: "false" }) })).toBe(false);
    expect(unpaperOwnLoop({})).toBe(false);
    expect(unpaperOwnLoop({ REPO_VARS: "not json" })).toBe(false);
  });
});
