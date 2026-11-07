import { StoryDioramaSchema, storyDioramaDuration } from "../engines/story-diorama/src/model";
import { epicBharatSagaForDay, authoredEpisodes, episodeInfo, SEASONS } from "../content/epicbharatsaga/vishnu-season";
import { CHANNELS } from "../channels/channels";
import { ODD_ORBIT_VARIANTS, OddOrbitSchema, chakraPuzzleForDay } from "../engines/odd-orbit/src/model";
import { TrackVehicleSchema, kaaliPeeliForDay } from "../engines/track-vehicle/src/model";

describe("daily channel content", () => {
  it("every authored EpicBharatSaga episode parses, has narration + captions", () => {
    for (const ep of authoredEpisodes()) {
      const p = epicBharatSagaForDay(ep);
      expect(() => StoryDioramaSchema.parse(p)).not.toThrow();
      expect(storyDioramaDuration(p)).toBeGreaterThan(30 * 30);
      for (const s of p.scenes) { expect(s.narration.length).toBeGreaterThan(10); expect(s.caption.length).toBeGreaterThan(10); }
    }
  });
  it("whole Dashavatar season is written and seasons chain globally", () => {
    for (let n = 1; n <= 10; n++) expect(authoredEpisodes()).toContain(n);
    expect(episodeInfo(10)).toMatchObject({ local: 10, name: "KALKI" });
    expect(episodeInfo(11)).toMatchObject({ local: 1, season: SEASONS[1] });
    for (let n = 1; n <= 10; n++) {
      const m = CHANNELS.epicbharatsaga.meta(n);
      expect(m.title.length).toBeLessThanOrEqual(100);
      expect(m.title).toContain(`EP ${String(n).padStart(2, "0")}`);
    }
  });
  it("unwritten episodes fail closed", () => {
    expect(() => epicBharatSagaForDay(999)).toThrow(/not written yet/);
  });
  it("puzzle channels produce valid, distinct props for 60 days", () => {
    const seeds = new Set<string>();
    for (let d = 1; d <= 60; d++) {
      const o = OddOrbitSchema.parse(chakraPuzzleForDay(d));
      const v = TrackVehicleSchema.parse(kaaliPeeliForDay(d));
      expect(o.puzzleNo).toBe(d); expect(v.level).toBe(d);
      seeds.add(o.seed); seeds.add(v.seed);
    }
    expect(seeds.size).toBe(120);
    for (const v of Object.values(ODD_ORBIT_VARIANTS)) expect(() => OddOrbitSchema.parse(v)).not.toThrow();
  });
});
