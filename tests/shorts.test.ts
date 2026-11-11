import { ClipsSchema, cleanClips, clipWords, fallbackClips, highlightsPrompt, rankClips, reelPlan, snapToSentences, viralScore, type Segment } from "../scripts/telegram/shorts";

const segs: Segment[] = Array.from({ length: 40 }, (_, i) => ({
  start: i * 6, end: i * 6 + 5.5, text: i % 7 === 3 ? `Kya aapko pata hai ye sach ${i}?` : `Ye vaakya number ${i} hai aur isme kuch shabd hain`,
  words: [{ start: i * 6, end: i * 6 + 2, word: "Ye" }, { start: i * 6 + 2, end: i * 6 + 5.5, word: `shabd${i}` }]
}));

describe("long video -> shorts selection", () => {
  it("snaps clip edges to sentence boundaries (never mid-sentence)", () => {
    expect(snapToSentences(segs, 13, 40)).toEqual([12, 41.5]);
    expect(snapToSentences(segs, 16.5, 44)).toEqual([18, 41.5]);
    const [s, e] = snapToSentences(segs, 0, 1000);
    expect([s, e]).toEqual([0, 239.5]);
  });

  it("cleans AI clips: snapping, overlap removal, max 90 s, count", () => {
    const raw = ClipsSchema.parse({ clips: [
      { start: 13, end: 50, title: "A", hashtags: ["shorts"] },
      { start: 30, end: 70, title: "overlaps A" },
      { start: 100, end: 230, title: "too long" },
      { start: 300, end: 320, title: "after end" },
      { start: 200, end: 202, title: "too short" }
    ] });
    const c = cleanClips(raw.clips, segs, 240, 5);
    expect(c.map((x) => x.title).sort()).toEqual(["A", "too long"]);
    const a = c.find((x) => x.title === "A")!, long = c.find((x) => x.title === "too long")!;
    expect(a).toMatchObject({ start: 12, end: 47.5, hashtags: ["#shorts"] });
    expect(long.end - long.start).toBeLessThanOrEqual(90);
    for (const x of c) {
      expect(segs.some((s) => s.start === x.start)).toBe(true);
      expect(segs.some((s) => s.end === x.end)).toBe(true);
    }
  });

  it("fallback picks non-overlapping whole-sentence windows near the target length", () => {
    const c = fallbackClips(segs, 3, 45);
    expect(c).toHaveLength(3);
    const byTime = [...c].sort((a, b) => a.start - b.start);
    for (let i = 1; i < byTime.length; i++) expect(byTime[i]!.start).toBeGreaterThanOrEqual(byTime[i - 1]!.end);
    for (const x of c) {
      expect(x.end - x.start).toBeGreaterThanOrEqual(27);
      expect(x.end - x.start).toBeLessThanOrEqual(60);
    }
  });

  it("re-times words from the clip start", () => {
    const w = clipWords(segs, { start: 12, end: 23.5 });
    expect(w[0]).toEqual({ start: 0, end: 2, word: "Ye" });
    expect(w[w.length - 1]!.end).toBeLessThanOrEqual(11.5);
  });

  it("prompt carries timestamps, count and the no-mid-sentence rule", () => {
    const p = highlightsPrompt(segs, 3, 45, "hinglish");
    expect(p).toMatch(/MOST VIRAL/);
    expect(p).toMatch(/score/);
    expect(p).toMatch(/\[12\.0-17\.5\]/);
    expect(p).toMatch(/Never cut in the middle of a sentence/);
  });
});

describe("viral ranking + highlight reel", () => {
  it("scores hooky, dense, question/number-rich speech above flat speech", () => {
    const flat = viralScore("ye ek normal baat hai jo main bata raha hun", 10);
    const hooky = viralScore("Kya aapko pata hai? Ye 3 crore ka sach shocking hai!", 6);
    expect(hooky).toBeGreaterThan(flat);
    expect(viralScore("", 5)).toBeLessThanOrEqual(30);
    expect(hooky).toBeLessThanOrEqual(100);
  });

  it("keeps the highest-scoring clips and ranks best first", () => {
    const raw = ClipsSchema.parse({ clips: [
      { start: 0, end: 30, title: "low", score: 40 },
      { start: 12, end: 40, title: "overlaps but higher", score: 95 },
      { start: 120, end: 150, title: "mid", score: 70 }
    ] });
    const c = cleanClips(raw.clips, segs, 240, 2);
    expect(c.map((x) => x.title)).toEqual(["overlaps but higher", "mid"]);
    expect(rankClips([...c].reverse()).map((x) => x.score)).toEqual([95, 70]);
  });

  it("reel plan: countdown order, per-clip cap on a sentence end, total under 3 minutes", () => {
    const ranked = Array.from({ length: 10 }, (_, i) => ({ start: i * 24, end: i * 24 + 23.5, title: `c${i}`, hook: "", hashtags: [], score: 100 - i, reason: "", intro: "" }));
    const plan = reelPlan(ranked, segs, { maxClip: 15, maxTotal: 165 });
    expect(plan[plan.length - 1]!.rank).toBe(1);
    expect(plan[0]!.rank).toBeGreaterThan(plan[1]!.rank);
    for (const e of plan) {
      expect(e.end - e.start).toBeLessThanOrEqual(15);
      expect(e.end).toBeLessThanOrEqual(e.clip.end);
    }
    expect(plan.reduce((t, e) => t + (e.end - e.start), 0)).toBeLessThanOrEqual(165);
    const tight = reelPlan(ranked, segs, { maxClip: 15, maxTotal: 40 });
    expect(tight.every((e) => e.rank <= 3)).toBe(true); // weakest dropped first
  });
});
