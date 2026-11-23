import { execFileSync, spawnSync } from "node:child_process";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { CHANNELS, isLive, postNumber, type ChannelConfig } from "../channels/channels";
import { unpaperLookup, unpaperSlotOfPost } from "../channels/unpaper-daily";
import { narrateArgs } from "../channels/voices";
import { candidates } from "../scripts/due";
import { DEVANAGARI, DailyEpisodeSchema, dailyImages, dailyKeys, dailyMeta, dailyProps, lookupDaily, sourceGate, type UnpaperDailyEpisode } from "../engines/unpaper-short/src/daily";
import { UnpaperShortSchema, unpaperShortDuration, unpaperClayProps } from "../engines/unpaper-short/src/model";
import { UNPAPER_DAILY } from "../content/unpaper/daily/index";

const ID = "unpaper-short" as const;
const cfg = CHANNELS[ID] as ChannelConfig;
const raw = (key: string) => JSON.parse(fs.readFileSync(path.join("content/unpaper/daily", `${key}.json`), "utf8")) as UnpaperDailyEpisode;
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

const ENV_KEYS = ["START_UNPAPER_SHORT", "LIVE_UNPAPER_SHORT", "PAUSE_UNPAPER_SHORT_UNTIL", "REPO_VARS"];
let saved: Record<string, string | undefined> = {};
beforeEach(() => { saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]])); for (const k of ENV_KEYS) delete process.env[k]; });
afterEach(() => { for (const k of ENV_KEYS) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } });

describe("Unpaper daily episodes (content/unpaper/daily)", () => {
  const keys = dailyKeys();

  it("the committed index lists exactly the episode files on disk", () => {
    const files = fs.readdirSync("content/unpaper/daily").filter((f) => /^\d{4}-\d{2}-\d{2}-(am|pm)\.json$/.test(f)).map((f) => f.replace(/\.json$/, "")).sort();
    expect(keys).toEqual(files);
  });

  it("every episode passes schema, source gate, Devanagari narration and has its page images", () => {
    expect(keys).toEqual(expect.arrayContaining(["2026-11-23-pm", "2026-11-24-am"]));
    for (const key of keys) {
      const [date, slot] = [key.slice(0, 10), key.slice(11) as "am" | "pm"];
      const r = lookupDaily(date, slot);
      if (!r.ok) throw new Error(`${key}: ${r.reason}`);
      for (const img of dailyImages(r.episode)) expect(fs.existsSync(path.join("public/unpaper", img))).toBe(true);
      const props = dailyProps(r.episode);
      expect(() => UnpaperShortSchema.parse(props)).not.toThrow();
      const secs = unpaperShortDuration(props) / 30;
      expect(secs).toBeGreaterThanOrEqual(30);
      expect(secs).toBeLessThanOrEqual(90);
      expect(unpaperClayProps(props.episode).length).toBeLessThanOrEqual(3);
      // every claim scene shows a proof chip; only the outro (CTA) has none
      for (const sc of props.episode.scenes) if (sc.type !== "outro") expect(sc.proof).toBeDefined();
      for (const sc of props.episode.scenes) expect(DEVANAGARI.test(sc.tts)).toBe(true);
      const m = dailyMeta(r.episode);
      expect(m.title.length).toBeLessThanOrEqual(100);
      expect(m.title).toMatch(/#shorts/i);
      expect(m.description).toContain(r.episode.sourceUrl);
      expect(m.caption.length).toBeLessThanOrEqual(2200);
      expect(m.tags.join("").length).toBeLessThanOrEqual(480);
    }
  });

  it("missing file -> skip (no fallback)", () => {
    const r = lookupDaily("2026-11-23", "am");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/no episode file content\/unpaper\/daily\/2026-11-23-am\.json/);
  });

  it("invalid JSON shape -> skip", () => {
    const bad = clone(raw("2026-11-23-pm")) as unknown as Record<string, unknown>;
    delete bad.seo;
    const r = lookupDaily("2026-11-23", "pm", { "2026-11-23-pm": bad });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/invalid episode: seo/);
  });

  it("source gate: a scene without proof, or no sourceUrl -> skip", () => {
    const noProof = clone(raw("2026-11-23-pm"));
    delete (noProof.script.points[1] as { proof?: unknown }).proof;
    const r1 = lookupDaily("2026-11-23", "pm", { "2026-11-23-pm": noProof });
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.reason).toMatch(/invalid episode|source gate/);

    const emptyProof = clone(raw("2026-11-23-pm"));
    emptyProof.script.points[2]!.proof = { source: "PIB", page: " ", date: "19 Nov 2026" };
    expect(sourceGate(DailyEpisodeSchema.parse(emptyProof))).toEqual(["point 3 has no proof"]);

    const noHook = clone(raw("2026-11-23-pm"));
    delete noHook.script.hook.proof;
    const r2 = lookupDaily("2026-11-23", "pm", { "2026-11-23-pm": noHook });
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.reason).toMatch(/source gate: hook has no proof/);

    const noAsar = clone(raw("2026-11-23-pm"));
    delete noAsar.script.asar.proof;
    const r3 = lookupDaily("2026-11-23", "pm", { "2026-11-23-pm": noAsar });
    expect(!r3.ok && r3.reason).toMatch(/asar has no proof/);

    const noUrl = clone(raw("2026-11-23-pm")) as unknown as Record<string, unknown>;
    delete noUrl.sourceUrl;
    expect(lookupDaily("2026-11-23", "pm", { "2026-11-23-pm": noUrl }).ok).toBe(false);
  });

  it("file for another date/slot, or Roman-only narration -> skip", () => {
    expect(lookupDaily("2026-11-25", "pm", { "2026-11-25-pm": raw("2026-11-23-pm") }).ok).toBe(false);
    const roman = clone(raw("2026-11-23-pm"));
    roman.script.outro.tts = "Subscribe karo Unpaper";
    const r = lookupDaily("2026-11-23", "pm", { "2026-11-23-pm": roman });
    expect(!r.ok && r.reason).toMatch(/outro: tts must be Devanagari/);
  });
});

describe("unpaper-short channel: date + slot resolution", () => {
  it("is off until START_UNPAPER_SHORT is set (2099 start), and the vars switch it on", () => {
    expect(cfg.startDate).toBe("2099-01-01");
    expect(cfg.narrated).toBe(true);
    expect(cfg.requireNarration).toBe(true);
    expect(cfg.renderQueue).toBe(false);
    const from = Date.parse("2026-11-23T13:00:00Z"); // 18:30 IST, the 19:00 slot is due
    expect(candidates(from, 1, ID, false)).toEqual([]);
    process.env.START_UNPAPER_SHORT = "2026-11-23";
    process.env.LIVE_UNPAPER_SHORT = "true";
    expect(isLive(ID)).toBe(true);
    expect(candidates(from, 1, ID, false)).toEqual([{ channel: ID, date: "2026-11-23", slot: 1, late: false }]);
    process.env.LIVE_UNPAPER_SHORT = "false";
    expect(isLive(ID)).toBe(false);
    expect(candidates(from, 1, ID, false)).toEqual([]);
  });

  it("post n -> that date's am/pm file; missing slots are skipped by the planner, never filled", () => {
    process.env.START_UNPAPER_SHORT = "2026-11-23";
    expect(unpaperSlotOfPost(1)).toEqual({ date: "2026-11-23", slot: "am" });
    expect(unpaperSlotOfPost(2)).toEqual({ date: "2026-11-23", slot: "pm" });
    expect(unpaperSlotOfPost(3)).toEqual({ date: "2026-11-24", slot: "am" });
    expect(postNumber(ID, "2026-11-24", 0)).toBe(3);

    expect(cfg.skip!(1)).toMatch(/2026-11-23-am: no episode file/);
    expect(cfg.skip!(2)).toBeUndefined();
    expect(cfg.skip!(3)).toBeUndefined();
    expect(cfg.skip!(4)).toMatch(/2026-11-24-pm/);
    expect(() => cfg.resolve(1)).toThrow(/skipped, nothing is published/);
    expect(() => cfg.meta(1)).toThrow(/skipped/);

    const p2 = cfg.resolve(2) as { episode: { id: string; source: { url?: string } } };
    expect(p2.episode.id).toBe("ep003-epf-withdrawal");
    expect(p2.episode.source.url).toBe("https://www.pib.gov.in/PressReleasePage.aspx?PRID=2338667");
    expect(cfg.meta(2).title).toBe((UNPAPER_DAILY["2026-11-23-pm"] as UnpaperDailyEpisode).seo.title);
    expect((cfg.resolve(3) as { episode: { id: string } }).episode.id).toBe("ep004-sc-homebuyer-emi");
    // never the authored ep001 / ep002 draft
    for (const n of [2, 3]) expect(JSON.stringify(cfg.resolve(n))).not.toMatch(/ep001|ep002/);

    // the hourly planner leaves out slots with no episode: 09:00 on the 23rd is not planned
    process.env.LIVE_UNPAPER_SHORT = "true";
    expect(candidates(Date.parse("2026-11-23T03:00:00Z"), 1, ID, false)).toEqual([]);
    // catch-up of a missing slot is never planned either
    expect(candidates(Date.parse("2026-11-23T05:00:00Z"), 1, ID, true)).toEqual([]);
    // 09:00 on the 24th has an episode
    expect(candidates(Date.parse("2026-11-24T03:00:00Z"), 1, ID, false)).toEqual([{ channel: ID, date: "2026-11-24", slot: 0, late: false }]);
  });

  it("missing page image -> skip", () => {
    process.env.START_UNPAPER_SHORT = "2026-11-23";
    const r = unpaperLookup(2, "/nonexistent-public");
    expect(!r.ok && r.reason).toMatch(/page image\(s\) missing/);
  });

  it("narration: every scene's Devanagari tts, Edge hi-IN-MadhurNeural +6%", () => {
    process.env.START_UNPAPER_SHORT = "2026-11-23";
    const scenes = cfg.narrationScenes!(cfg.resolve(2));
    expect(scenes.length).toBe(7);
    for (const s of scenes) expect(DEVANAGARI.test(s.tts ?? "")).toBe(true);
    const a = narrateArgs(ID, 2);
    expect(a).toEqual(expect.arrayContaining(["--engines", "edge", "--edge-voice", "hi-IN-MadhurNeural", "--edge-rate=+6%"]));
  });

  it("post.ts skips a slot without an episode and writes nothing", () => {
    const out = execFileSync("npx", ["ts-node", "scripts/post.ts", "--channel", ID, "--date", "2026-11-23", "--slot", "0", "--dry"], {
      env: { ...process.env, START_UNPAPER_SHORT: "2026-11-23", SUPABASE_URL: "", SUPABASE_SERVICE_ROLE_KEY: "" }, encoding: "utf8"
    });
    expect(out).toMatch(/skipped, nothing published: 2026-11-23-am: no episode file/);
    expect(fs.existsSync("output/unpaper-short/post-001.json")).toBe(false);
  }, 120_000);
});

describe("npm run unpaper:index", () => {
  it("lists am/pm files, ignores other names, leaves out invalid JSON", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "unpaper-index-"));
    const files: Record<string, string> = { "2026-12-01-pm.json": "{}", "2026-12-01-am.json": "{}", "2026-12-02-am.json": "{oops", "notes.json": "{}" };
    for (const [f, t] of Object.entries(files)) fs.writeFileSync(path.join(dir, f), t);
    const r = spawnSync("node", ["scripts/unpaper/index-daily.mjs", "--dir", dir], { encoding: "utf8" });
    expect(r.status).toBe(0);
    const text = fs.readFileSync(path.join(dir, "index.ts"), "utf8");
    expect(text).toContain('"2026-12-01-am": e0');
    expect(text).toContain('"2026-12-01-pm": e1');
    expect(text).not.toContain("2026-12-02-am");
    expect(r.stderr).toMatch(/2026-12-02-am\.json: not valid JSON/);
    expect(r.stderr).toMatch(/notes\.json: name must be/);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("the committed index is what the generator writes", () => {
    expect(() => execFileSync("node", ["scripts/unpaper/index-daily.mjs", "--check"], { encoding: "utf8" })).not.toThrow();
  });
});
