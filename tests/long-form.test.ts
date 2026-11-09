import { CHANNELS, dateOfPost, isPostDay, postNumber } from "../channels/channels";
import { FPS, HIDDEN_FROM, championshipForEpisode, marathonDuration, marathonForEpisode, marathonTimeline, marathonVoiceLines } from "../engines/puzzle-marathon/src/model";
import { chakraPuzzleForDay, HARD_FROM } from "../engines/odd-orbit/src/model";
import { kaaliPeeliForDay, HARD_FROM as KPC_HARD_FROM } from "../engines/track-vehicle/src/model";

describe("weekday channels", () => {
  it("posts Mon/Wed/Fri and numbers only those days", () => {
    expect(isPostDay("chakra-marathon", "2026-11-11")).toBe(true);
    expect(isPostDay("chakra-marathon", "2026-11-12")).toBe(false);
    expect(postNumber("chakra-marathon", "2026-11-11", 0)).toBe(1);
    expect(postNumber("chakra-marathon", "2026-11-13", 0)).toBe(2);
    expect(postNumber("chakra-marathon", "2026-11-16", 0)).toBe(3);
    expect(() => postNumber("chakra-marathon", "2026-11-12", 0)).toThrow();
    for (const n of [1, 2, 3, 10, 40]) expect(postNumber("chakra-marathon", dateOfPost("chakra-marathon", n), 0)).toBe(n);
  });
  it("daily channels unchanged", () => {
    expect(dateOfPost("chakra-puzzle", 10)).toBe("2026-11-11");
    for (const n of [1, 5, 9, 30]) { const d = dateOfPost("chakra-puzzle", n); expect(postNumber("chakra-puzzle", d, (n - 1) % 3)).toBe(n); }
  });
});

describe("marathon", () => {
  const m = marathonForEpisode(2);
  it("is long enough for mid-roll ads and hides expert answers", () => {
    expect(marathonDuration(m) / FPS).toBeGreaterThan(8 * 60);
    expect(m.levels.filter((l) => l.hidden).map((l) => l.no)).toEqual([21, 22, 23, 24, 25].filter((n) => n >= HIDDEN_FROM));
    expect(m.levels.filter((l) => l.hidden).every((l) => (l.puzzle as { revealSeconds: number }).revealSeconds === 0)).toBe(true);
    expect(m.prevBonus).toMatch(/^ROW \d+ · #\d+$/);
    expect(marathonForEpisode(1).prevBonus).toBe("");
  });
  it("timeline: hook, 25 levels, 2 checkpoints, answers, result, bonus", () => {
    const kinds = marathonTimeline(m).map((s) => s.kind);
    expect(kinds.filter((k) => k === "level")).toHaveLength(25);
    expect(kinds.slice(-3)).toEqual(["answers", "result", "bonus"]);
  });
  it("voice lines: unique files, inside the video, no expert answer before the answer round", () => {
    const v = marathonVoiceLines(m);
    expect(new Set(v.map((x) => x.file)).size).toBe(v.length);
    const end = marathonDuration(m) / FPS;
    expect(v.every((x) => x.at >= 0 && x.at < end)).toBe(true);
    expect(v.some((x) => /^l2[1-5]-reveal/.test(x.file))).toBe(false);
  });
  it("channel meta has chapters and a teaser window", () => {
    const meta = CHANNELS["chakra-marathon"].meta(2);
    expect(meta.description).toContain("0:00 Start");
    expect(meta.title).not.toMatch(/#shorts/i);
    expect(meta.teaser?.length).toBeGreaterThan(20);
  });
});

describe("harder puzzles only for unrendered posts", () => {
  it("chakra puzzle", () => {
    expect(chakraPuzzleForDay(HARD_FROM - 1).oddStrength).toBe(1);
    expect(chakraPuzzleForDay(HARD_FROM).oddStrength).toBeLessThan(1);
    expect(chakraPuzzleForDay(HARD_FROM).count).toBeGreaterThan(chakraPuzzleForDay(HARD_FROM - 7).count);
  });
  it("kaali peeli", () => {
    expect(kaaliPeeliForDay(KPC_HARD_FROM).targetBias).toBe(1);
    expect(kaaliPeeliForDay(KPC_HARD_FROM - 1).targetBias).toBe(0.9);
  });
});

describe("kaali peeli championship", () => {
  const m = championshipForEpisode(2);
  it("20 rounds, last 5 answered at the end, long enough", () => {
    expect(m.levels).toHaveLength(20);
    expect(m.levels.filter((l) => l.hidden).map((l) => l.no)).toEqual([16, 17, 18, 19, 20]);
    expect(m.levels.filter((l) => l.hidden).every((l) => (l.puzzle as { answerSeconds: number }).answerSeconds === 0)).toBe(true);
    expect(marathonDuration(m) / FPS).toBeGreaterThan(8 * 60);
    expect(m.prevBonus).toMatch(/^#\d+$/);
  });
  it("voice lines unique and inside the video", () => {
    const v = marathonVoiceLines(m);
    expect(new Set(v.map((x) => x.file)).size).toBe(v.length);
    expect(v.every((x) => x.at >= 0 && x.at < marathonDuration(m) / FPS)).toBe(true);
  });
  it("channel posts Tue/Thu/Sat", () => {
    expect(postNumber("kpc-championship", "2026-11-12", 0)).toBe(1);
    expect(isPostDay("kpc-championship", "2026-11-13")).toBe(false);
    expect(CHANNELS["kpc-championship"].meta(1).description).toContain("0:00 Start");
  });
});
