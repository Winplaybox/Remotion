import { CHANNELS, dateOfPost, isPostDay, postNumber } from "../channels/channels";
import { SEASON_LONG_DATES, seasonLongForPost } from "../content/epicbharatsaga/season-long";
import { sagaLongDuration, sagaSegments } from "../engines/story-diorama/src/saga-long-model";
import { FPS } from "../engines/story-diorama/src/model";

describe("EpicBharatSaga season long video", () => {
  const p = seasonLongForPost(1);
  it("Vishnu season: intro + 10 chapters + outro, no 'kal dekhiye' scenes, unique ids", () => {
    expect(p.chapters.map((c) => c.title)).toEqual(["MATSYA", "KURMA", "VARAHA", "NARASIMHA", "VAMANA", "PARASHURAMA", "RAMA", "KRISHNA", "BUDDHA", "KALKI"]);
    expect(p.scenes[0]!.id).toBe("intro");
    expect(p.scenes[p.outroScene]!.id).toBe("outro");
    expect(p.scenes.some((s) => s.id.endsWith("-next"))).toBe(false);
    expect(new Set(p.scenes.map((s) => s.id)).size).toBe(p.scenes.length);
    expect(p.chapters[2]!.tagAccent).toBe("03/10");
  });
  it("is long enough for mid-roll ads before narration stretching", () => {
    expect(sagaLongDuration(p) / FPS).toBeGreaterThan(6 * 60);
  });
  it("segments cover every scene exactly once", () => {
    const segs = sagaSegments(p);
    expect(segs[0]!.from).toBe(0);
    expect(segs.at(-1)!.to).toBe(p.scenes.length);
    segs.slice(1).forEach((g, i) => expect(g.from).toBe(segs[i]!.to));
  });
  it("posts on Sundays after each season: Vishnu 15 Nov, Shiv after EP20", () => {
    expect(SEASON_LONG_DATES[0]).toBe("2026-11-15");
    expect(SEASON_LONG_DATES[1]).toBe("2026-11-29");
    for (const d of SEASON_LONG_DATES) expect(new Date(`${d}T00:00:00Z`).getUTCDay()).toBe(0);
    expect(isPostDay("ebs-season-long", "2026-11-15")).toBe(true);
    expect(isPostDay("ebs-season-long", "2026-11-22")).toBe(false);
    expect(postNumber("ebs-season-long", "2026-11-29", 0)).toBe(2);
    expect(dateOfPost("ebs-season-long", 2)).toBe("2026-11-29");
  });
  it("meta: long title without #shorts, teaser crops the centre column", () => {
    const m = CHANNELS["ebs-season-long"].meta(1);
    expect(m.title).toContain("10 Avatar");
    expect(m.title).not.toMatch(/#shorts/i);
    expect(m.description).toContain("01. Matsya");
    expect(m.teaser?.crop).toEqual({ w: 608, x: 656 });
    expect(m.teaser!.length).toBeGreaterThan(20);
  });
  it("fails closed when a season is not fully written", () => {
    expect(() => seasonLongForPost(3)).toThrow(/not written/);
  });
});
