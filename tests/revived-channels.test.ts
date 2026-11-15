import { CHANNELS, isLive, repoVar, type ChannelId } from "../channels/channels";
import { VOICES, narrateArgs } from "../channels/voices";
import { trainBattleCount, trainBattleForDay, trainBattleMeta, TRAIN_CTA_VOICE } from "../content/alltrainreels/battles";
import { horrorTapeCount, horrorTapeForDay, horrorTapeMeta } from "../content/indian-horror-tapes/tapes";
import { LANGS, MINDNEST_LANGS, mindNestCount, mindNestForDay, mindNestMeta } from "../content/mindnest/fables";
import { FPS, StoryDioramaSchema, storyDioramaDuration, type StoryDiorama } from "../engines/story-diorama/src/model";

const secs = (p: StoryDiorama) => storyDioramaDuration(p) / FPS;
const isCjk = (s: string) => /[぀-ヿ一-鿿가-힯]/.test(s);

/** Headline lines must fit the 956 px band at 124 px: ~16 Latin/Devanagari chars, ~7 CJK chars. */
function headlinesFit(p: StoryDiorama) {
  for (const s of p.scenes) for (const h of s.headlines) {
    expect(h.lines.length).toBeLessThanOrEqual(2);
    for (const l of h.lines) expect(l.text.length).toBeLessThanOrEqual(isCjk(l.text) ? 7 : 16);
  }
}

describe("AllTrainReels — Train Battle", () => {
  const all = Array.from({ length: trainBattleCount() }, (_, i) => trainBattleForDay(i + 1));
  it("two weeks written, then fails closed", () => {
    expect(all.length).toBeGreaterThanOrEqual(14);
    expect(() => trainBattleForDay(trainBattleCount() + 1)).toThrow(/not written/);
  });
  it("hook -> rounds -> twist -> ask, A/B outro, rail finish, 30-50 s", () => {
    for (const p of all) {
      expect(() => StoryDioramaSchema.parse(p)).not.toThrow();
      expect(p.scenes.map((s) => s.id)).toEqual(["hook", "rounds", "twist", "ask"]);
      expect(p.finish).toBe("rail");
      expect(p.ask!.options).toHaveLength(2);
      expect(p.scenes.at(-1)!.narration.endsWith(TRAIN_CTA_VOICE)).toBe(true);
      for (const s of p.scenes) expect(/[ऀ-ॿ]/.test(s.narration)).toBe(true);
      headlinesFit(p);
      expect(secs(p)).toBeGreaterThanOrEqual(30);
      expect(secs(p)).toBeLessThanOrEqual(50);
    }
  });
  it("every round names a valid winner and every post cites sources", () => {
    for (let n = 1; n <= trainBattleCount(); n++) {
      const bars = trainBattleForDay(n).scenes[1]!.layers[0] as unknown as { data: { rows: { win: string; a: number; b: number }[] } };
      for (const r of bars.data.rows) {
        expect(["a", "b", "none"]).toContain(r.win);
        expect(r.a).toBeGreaterThan(0); expect(r.b).toBeGreaterThan(0);
      }
      const m = trainBattleMeta(n);
      expect(m.description).toContain("Source:");
      expect(m.title.length).toBeLessThanOrEqual(100);
    }
  });
});

describe("Indian Horror Tapes", () => {
  const all = Array.from({ length: horrorTapeCount() }, (_, i) => horrorTapeForDay(i + 1));
  it("two weeks written, then fails closed", () => {
    expect(all.length).toBeGreaterThanOrEqual(14);
    expect(() => horrorTapeForDay(horrorTapeCount() + 1)).toThrow(/not written/);
  });
  it("VHS tape: cold open -> place -> legend -> today -> ask, 35-55 s", () => {
    for (const p of all) {
      expect(() => StoryDioramaSchema.parse(p)).not.toThrow();
      expect(p.finish).toBe("vhs");
      expect(p.stamp).toMatch(/^TAPE \d\d · /);
      expect(p.scenes.map((s) => s.id)).toEqual(["cold-open", "place", "legend", "today", "ask"]);
      expect(p.ask!.options).toEqual(["A: SACH", "B: AFWAAH"]);
      headlinesFit(p);
      expect(secs(p)).toBeGreaterThanOrEqual(35);
      expect(secs(p)).toBeLessThanOrEqual(55);
    }
  });
  it("legends are framed as legends; titles are whole (the old pipeline cut them mid-word) and unique", () => {
    const titles = new Set<string>();
    for (let n = 1; n <= horrorTapeCount(); n++) {
      const legend = horrorTapeForDay(n).scenes[2]!.narration;
      expect(legend).toMatch(/कहते|कथा|कहानी|कहा जाता/);
      const m = horrorTapeMeta(n);
      expect(m.title.length).toBeLessThanOrEqual(100);
      expect(m.title.endsWith("#shorts")).toBe(true);
      expect(m.description).toContain("entertainment");
      titles.add(m.title);
    }
    expect(titles.size).toBe(horrorTapeCount());
  });
});

describe("MindNest Tales — one fable, every language", () => {
  it("a week of fables in every language, then fails closed", () => {
    expect(mindNestCount()).toBeGreaterThanOrEqual(7);
    for (const lang of MINDNEST_LANGS) expect(() => mindNestForDay(lang, mindNestCount() + 1)).toThrow(/not written/);
  });
  it("same scenes in every language; only the words change", () => {
    for (let n = 1; n <= mindNestCount(); n++) {
      const base = mindNestForDay("hi", n);
      for (const lang of MINDNEST_LANGS) {
        const p = mindNestForDay(lang, n);
        expect(() => StoryDioramaSchema.parse(p)).not.toThrow();
        expect(p.finish).toBe("storybook");
        expect(p.ask).toBeUndefined();
        expect(p.scenes.map((s) => s.layers.length)).toEqual(base.scenes.map((s) => s.layers.length));
        for (const s of p.scenes) expect(s.narration.length).toBeGreaterThan(10);
        expect(p.scenes.at(-1)!.layers.some((l) => l.kind === "prop" && l.prop === "moralCard")).toBe(true);
        headlinesFit(p);
      }
    }
  });
  it("channels: one per language, made for kids, own narrator, disabled until LIVE_", () => {
    for (const lang of MINDNEST_LANGS) {
      const id = `mindnest-${lang}` as ChannelId;
      const c = CHANNELS[id] as { youtubeHandle: string; narrated: boolean; fitScenesToVoice?: boolean; autoPublish: boolean };
      expect(c.youtubeHandle).toBe(LANGS[lang].handle);
      expect(c.fitScenesToVoice).toBe(true);
      expect(c.autoPublish).toBe(false);
      expect(isLive(id)).toBe(false);
      expect(VOICES[id]).toBeDefined();
      const m = mindNestMeta(lang, 1);
      expect(m.madeForKids).toBe(true);
      expect(m.language).toBe(LANGS[lang].code);
      expect(m.title.length).toBeLessThanOrEqual(100);
    }
  });
});

describe("going live", () => {
  afterEach(() => { delete process.env.REPO_VARS; delete process.env.LIVE_ALLTRAINREELS; });
  it("new channels start disabled", () => {
    for (const id of ["alltrainreels", "indian-horror-tapes"] as ChannelId[]) {
      expect((CHANNELS[id] as { autoPublish: boolean }).autoPublish).toBe(false);
      expect(isLive(id)).toBe(false);
    }
  });
  it("a repo variable switches a channel on through REPO_VARS (no per-channel workflow edit needed)", () => {
    process.env.REPO_VARS = JSON.stringify({ LIVE_ALLTRAINREELS: "true", START_INDIAN_HORROR_TAPES: "2026-11-20" });
    expect(isLive("alltrainreels")).toBe(true);
    expect(repoVar("START_INDIAN_HORROR_TAPES")).toBe("2026-11-20");
    expect(isLive("indian-horror-tapes")).toBe(false);
  });
  it("an explicit env var still wins", () => {
    process.env.REPO_VARS = JSON.stringify({ LIVE_ALLTRAINREELS: "false" });
    process.env.LIVE_ALLTRAINREELS = "true";
    expect(isLive("alltrainreels")).toBe(true);
  });
});

describe("narrator args", () => {
  it("a negative Edge rate is passed as --edge-rate=-N% (argparse reads a bare -4% as a flag)", () => {
    const a = narrateArgs("indian-horror-tapes", 1);
    expect(a).toContain("--edge-rate=-4%");
    expect(a).not.toContain("--edge-rate");
  });
});
