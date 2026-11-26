import fs from "node:fs";
import path from "node:path";
import { MINDNEST_LANGS, mindNestCount } from "../content/mindnest/fables";
import { episodeArtFor, fablesWithArt } from "../engines/story-visual-v2/src/episode/art";
import { episodeDuration, episodeTimeline, mindNestEpisode, voiceSpans, type MindNestEpisodeProps } from "../engines/story-visual-v2/src/episode/model";
import { episodeChunks, EPISODE_CAPTION, ADVANCE } from "../engines/story-visual-v2/src/captions";
import { SCRIPT } from "../engines/story-visual-v2/src/content";
import { STORY_STYLES } from "../engines/story-visual-v2/src/presets";
import { FRAME } from "../engines/story-visual-v2/src/types";

const pub = (f: string) => path.join(__dirname, "..", "public", f);
const committed = (lang: string): MindNestEpisodeProps => JSON.parse(fs.readFileSync(pub(`mindnest-v2/audio/fable-1/${lang}/episode.json`), "utf8"));

describe("StoryVisualEngine V2 — MindNest episode", () => {
  it("every language: hook, four story pages, moral, goodbye; only words change", () => {
    for (let n = 1; n <= mindNestCount(); n++) {
      const base = mindNestEpisode("hi", n);
      for (const lang of MINDNEST_LANGS) {
        const e = mindNestEpisode(lang, n);
        expect(e.scenes.map((s) => s.kind)).toEqual(["title", "story", "story", "story", "story", "moral", "goodbye"]);
        expect(e.scenes.map((s) => s.kind)).toEqual(base.scenes.map((s) => s.kind));
        for (const s of e.scenes) expect(s.narration.length).toBeGreaterThan(3);
        // made for kids: no subscribe ask in the spoken text
        expect(e.scenes.map((s) => s.narration).join(" ")).not.toMatch(/subscri|सब्सक्राइब|Suscr|Abonnier|登録|구독|اشترك/i);
      }
    }
  });

  it("fails closed for fables without art (only fable 1 / storybook-classic is drawn)", () => {
    expect(fablesWithArt("storybook-classic")).toEqual([1]);
    expect(() => mindNestEpisode("hi", 1, "storybook-classic", { requireArt: true })).not.toThrow();
    for (let n = 2; n <= mindNestCount(); n++) expect(() => mindNestEpisode("hi", n, "storybook-classic", { requireArt: true })).toThrow(/no episode art/);
    expect(() => mindNestEpisode("hi", 1, "night-story", { requireArt: true })).toThrow(/no episode art/);
  });

  it("fable 1 art: every file exists, one page of art per non-title page, characters stay in frame", () => {
    const art = episodeArtFor("storybook-classic", 1)!;
    expect(art.pages).toHaveLength(6);
    const files = [art.title.bg, art.title.emblem, ...art.pages.flatMap((p) => [p.bg, ...p.actors.map((a) => a.src), ...(p.butterfly ? [p.butterfly.src] : [])])];
    for (const f of files) expect(fs.existsSync(pub(`${art.dir}/${f}`))).toBe(true);
    for (const p of art.pages) for (const a of p.actors) {
      const xs = a.path ? a.path.map((k) => k.x) : [a.x];
      for (const x of xs) { expect(x - a.w / 2).toBeGreaterThanOrEqual(-a.w * 0.2); expect(x + a.w / 2).toBeLessThanOrEqual(FRAME.width + a.w * 0.2); }
      // feet above the caption block, inside the frame
      expect(a.y).toBeLessThanOrEqual(1620);
    }
  });

  it("timeline: pages never overlap their voices, the voice is never cut, 35-60 s with the committed narration", () => {
    for (const lang of ["hi", "es"]) {
      const e = committed(lang);
      const { slots, total } = episodeTimeline(e);
      const spans = voiceSpans(e);
      for (let i = 1; i < spans.length; i++) expect(spans[i]![0]).toBeGreaterThan(spans[i - 1]![1]);
      for (const sl of slots) expect(sl.voiceAt + sl.voiceFrames).toBeLessThanOrEqual(sl.frames);
      expect(spans[spans.length - 1]![1]).toBeLessThanOrEqual(total);
      expect(total / 30).toBeGreaterThanOrEqual(35);
      expect(total / 30).toBeLessThanOrEqual(60);
      expect(episodeDuration(e)).toBe(total);
      // hook is short
      expect(slots[1]!.from / 30).toBeLessThanOrEqual(2.5);
      for (const s of e.scenes) expect(fs.existsSync(pub(s.audio!))).toBe(true);
    }
  });

  it("captions: committed cues are exactly the chunks the UI would show, each fits two lines, timed in order", () => {
    for (const lang of ["hi", "es"] as const) {
      const e = committed(lang);
      const script = SCRIPT[lang];
      const perLine = Math.floor(EPISODE_CAPTION.width / (EPISODE_CAPTION.size(script) * ADVANCE[script]));
      for (const s of e.scenes.filter((x) => x.kind === "story")) {
        expect(s.cues!.map((c) => c.text)).toEqual(episodeChunks(s.narration, script));
        for (const c of s.cues!) {
          expect(c.text.length).toBeLessThanOrEqual(Math.floor(perLine * 1.75));
          expect(c.end).toBeGreaterThan(c.start);
          expect(c.end).toBeLessThanOrEqual(s.audioSeconds! + 0.05);
        }
        for (let i = 1; i < s.cues!.length; i++) expect(s.cues![i]!.start).toBeGreaterThanOrEqual(s.cues![i - 1]!.end);
      }
    }
  });

  it("caption box stays inside the Shorts safe zones (bottom 190 px, right rail 130 px)", () => {
    for (const st of Object.values(STORY_STYLES)) expect(st.composition.storyPosition).toBeGreaterThanOrEqual(FRAME.safeBottom);
    expect(FRAME.safeSide + EPISODE_CAPTION.width).toBeLessThanOrEqual(FRAME.width - FRAME.railRight);
  });

  it("CJK fonts are bundled with their OFL licences", () => {
    for (const f of ["m-plus-rounded-1c-jp-500.woff2", "m-plus-rounded-1c-jp-800.woff2", "noto-sans-kr-500.woff2", "noto-sans-kr-800.woff2", "OFL-m-plus-rounded-1c.txt", "OFL-noto-sans-kr.txt"]) {
      expect(fs.existsSync(pub(`mindnest-v2/fonts/${f}`))).toBe(true);
    }
  });
});

describe("MindNest channels on V2", () => {
  afterEach(() => { delete process.env.MINDNEST_ENGINE; jest.resetModules(); });

  it("default: MindNestEpisodeV2 in the channel's style; fable 1 resolves, a fable without art fails closed", () => {
    jest.isolateModules(() => {
      const { CHANNELS, MINDNEST_STYLE } = require("../channels/channels") as typeof import("../channels/channels");
      for (const lang of MINDNEST_LANGS) {
        const c = CHANNELS[`mindnest-${lang}`] as { composition: string; storyStyle?: string; resolve: (n: number) => unknown };
        expect(c.composition).toBe("MindNestEpisodeV2");
        expect(c.storyStyle).toBe(MINDNEST_STYLE[lang]);
        const p = c.resolve(1) as MindNestEpisodeProps;
        expect(p.storyStyle).toBe("storybook-classic");
        expect(p.scenes).toHaveLength(7);
        expect(() => c.resolve(2)).toThrow(/no episode art/);
      }
    });
  });

  it("MINDNEST_ENGINE=legacy keeps the old story-diorama render exactly", () => {
    process.env.MINDNEST_ENGINE = "legacy";
    jest.isolateModules(() => {
      const { CHANNELS } = require("../channels/channels") as typeof import("../channels/channels");
      const { mindNestForDay } = require("../content/mindnest/fables") as typeof import("../content/mindnest/fables");
      const c = CHANNELS["mindnest-hi"] as { composition: string; resolve: (n: number) => unknown };
      expect(c.composition).toBe("EpicBharatSaga");
      expect(c.resolve(2)).toEqual(mindNestForDay("hi", 2));
    });
  });
});
