import { CHANNELS, dateOfPost, isLive, isPostDay } from "../channels/channels";
import { dharmSankatWeekLong, DS_LONG_DATES } from "../content/dharm-sankat/weekly-long";
import { sagaLongDuration, sagaSegments } from "../engines/story-diorama/src/saga-long-model";
import { FPS } from "../engines/story-diorama/src/model";

describe("Dharm Sankat weekly long", () => {
  const p = dharmSankatWeekLong(1);
  it("week 1 = Shorts 1-7 as chapters, no AskOutro, ends each chapter with 'aapki raay'", () => {
    expect(p.chapters).toHaveLength(7);
    expect(p.chapters[0]!.title).toBe("KARNA YA ARJUN?");
    expect(p.ask).toBeUndefined();
    expect(p.scenes.filter((s) => s.id.endsWith("-raay"))).toHaveLength(7);
    expect(new Set(p.scenes.map((s) => s.id)).size).toBe(p.scenes.length);
    const segs = sagaSegments(p);
    expect(segs.at(-1)!.to).toBe(p.scenes.length);
  });
  it("is a real long video (>4 min before narration stretch)", () => {
    expect(sagaLongDuration(p) / FPS).toBeGreaterThan(4 * 60);
  });
  it("posts Sundays from 22 Nov, the day the week's 7th Short airs; week 3 not written yet fails closed", () => {
    expect(DS_LONG_DATES.slice(0, 2)).toEqual(["2026-11-22", "2026-11-29"]);
    for (const d of DS_LONG_DATES) expect(new Date(`${d}T00:00:00Z`).getUTCDay()).toBe(0);
    expect(isPostDay("dharm-sankat-long", "2026-11-22")).toBe(true);
    expect(dateOfPost("dharm-sankat-long", 2)).toBe("2026-11-29");
    expect(() => dharmSankatWeekLong(3)).toThrow(/not written/);
  });
  it("disabled by default; meta lists all 7 questions with sources", () => {
    expect(isLive("dharm-sankat-long")).toBe(false);
    const m = CHANNELS["dharm-sankat-long"].meta(1);
    expect(m.title).not.toMatch(/#shorts/i);
    expect(m.description).toContain("7. ");
    expect(m.description).toContain("Sources:");
    expect(m.teaser?.crop).toEqual({ w: 608, x: 656 });
  });
});
