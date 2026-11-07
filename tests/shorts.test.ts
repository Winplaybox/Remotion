import { ClipsSchema, cleanClips, clipWords, fallbackClips, highlightsPrompt, snapToSentences, type Segment } from "../scripts/telegram/shorts";

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
    expect(c.map((x) => x.title)).toEqual(["A", "too long"]);
    expect(c[0]).toMatchObject({ start: 12, end: 47.5, hashtags: ["#shorts"] });
    expect(c[1]!.end - c[1]!.start).toBeLessThanOrEqual(90);
    for (const x of c) {
      expect(segs.some((s) => s.start === x.start)).toBe(true);
      expect(segs.some((s) => s.end === x.end)).toBe(true);
    }
  });

  it("fallback picks non-overlapping whole-sentence windows near the target length", () => {
    const c = fallbackClips(segs, 3, 45);
    expect(c).toHaveLength(3);
    for (let i = 1; i < c.length; i++) expect(c[i]!.start).toBeGreaterThanOrEqual(c[i - 1]!.end);
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
    expect(p).toMatch(/pick the 3 best/);
    expect(p).toMatch(/\[12\.0-17\.5\]/);
    expect(p).toMatch(/Never cut in the middle of a sentence/);
  });
});
