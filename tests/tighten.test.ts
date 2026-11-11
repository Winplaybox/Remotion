import { cutFilter, falseStarts, planTighten, type TWord } from "../scripts/telegram/tighten";
import { clipWords, estimateWords, type Segment } from "../scripts/telegram/shorts";

const W = (s: string, start: number, end: number): TWord => ({ word: s, start, end });
const talk = (): TWord[] => [W("aaj", 0.2, 0.5), W("ka", 0.5, 0.7), W("sach", 0.7, 1.1), W("ye", 1.1, 1.3), W("hai", 1.3, 1.6),
  // 2.5 s of silence
  W("suno", 4.1, 4.5), W("dhyaan", 4.5, 5.0), W("se", 5.0, 5.2), W("yaar", 5.2, 5.6)];

describe("tighten: silence + false starts", () => {
  it("shortens a long pause and keeps words in order on the new timeline", () => {
    const p = planTighten(talk(), 6);
    expect(p.changed).toBe(true);
    expect(p.keep.length).toBe(2);
    expect(p.duration).toBeLessThan(6 - 1.5);
    expect(p.words.map((w) => w.word)).toEqual(talk().map((w) => w.word));
    for (let i = 1; i < p.words.length; i++) expect(p.words[i]!.start).toBeGreaterThanOrEqual(p.words[i - 1]!.start);
    expect(p.words[p.words.length - 1]!.end).toBeLessThanOrEqual(p.duration + 0.01);
  });
  it("leaves a clip with no long pauses untouched", () => {
    const tight = [W("ek", 0, 0.3), W("do", 0.35, 0.6), W("teen", 0.65, 0.95), W("chaar", 1, 1.4), W("paanch", 1.45, 1.9)];
    expect(planTighten(tight, 2.2).changed).toBe(false);
  });
  it("drops the first copy of an immediate repeat (stutter / false start)", () => {
    const w = [W("main", 0, 0.3), W("kehna", 0.3, 0.7), W("main", 1.2, 1.5), W("kehna", 1.5, 1.9), W("chahta", 1.9, 2.3), W("hun", 2.3, 2.6), W("ki", 2.6, 2.8), W("aap", 2.8, 3.1)];
    expect([...falseStarts(w)]).toEqual([0, 1]);
    const p = planTighten(w, 4.2);
    expect(p.changed).toBe(true);
    expect(p.words.map((x) => x.word)).toEqual(["main", "kehna", "chahta", "hun", "ki", "aap"]);
  });
  it("does not treat short fillers or distant repeats as stumbles", () => {
    expect(falseStarts([W("na", 0, 0.2), W("na", 0.25, 0.5), W("theek", 0.6, 1), W("hai", 1, 1.3)]).size).toBe(0);
    expect(falseStarts([W("sach", 0, 0.4), W("hai", 0.4, 0.7), W("sach", 3, 3.4), W("hai", 3.4, 3.7)]).size).toBe(0);
  });
  it("refuses to cut a clip down to almost nothing (suspect transcript)", () => {
    const w = [W("a1", 0, 0.2), W("b1", 0.2, 0.4), W("c1", 0.4, 0.6), W("d1", 0.6, 0.8), W("e1", 0.8, 1.0)];
    expect(planTighten(w, 30).changed).toBe(false);
  });
  it("builds a valid concat filter (with and without audio)", () => {
    const f = cutFilter([[0, 1.5], [3, 5]], true);
    expect(f).toContain("concat=n=2:v=1:a=1[v][a]");
    expect(f).toContain("[0:a]atrim=start=3:end=5");
    expect(cutFilter([[0, 2]], false)).toBe("[0:v]trim=start=0:end=2,setpts=PTS-STARTPTS[v0];[v0]concat=n=1:v=1:a=0[v]");
  });
});

describe("word timing fallback", () => {
  it("estimates per-word times inside a segment, in order, within bounds", () => {
    const w = estimateWords("Ye bahut shocking baat hai, suno", 10, 14);
    expect(w).toHaveLength(6);
    expect(w[0]!.start).toBe(10);
    expect(w[w.length - 1]!.end).toBeLessThanOrEqual(14);
    for (let i = 1; i < w.length; i++) expect(w[i]!.start).toBeGreaterThanOrEqual(w[i - 1]!.start);
  });
  it("clipWords never returns a whole sentence as one caption word", () => {
    const segs: Segment[] = [{ start: 0, end: 4, text: "kya aapko pata hai ye sach" }];
    const w = clipWords(segs, { start: 0, end: 4 });
    expect(w.length).toBe(6);
    expect(w.every((x) => !x.word.includes(" "))).toBe(true);
  });
});
