import { buildTimeline, secondsToFrames } from "../packages/core/src/timeline";
describe("timeline utilities", () => {
  it("places scenes consecutively without gaps", () => {
    const entries = buildTimeline([{ id: "hook", kind: "hook", durationFrames: 30 }, { id: "story", kind: "story", durationFrames: 90 }]);
    expect(entries.map((entry) => [entry.from, entry.end])).toEqual([[0, 30], [30, 120]]);
  });
  it("rejects invalid scene durations", () => {
    expect(() => buildTimeline([{ id: "bad", kind: "story", durationFrames: 0 }])).toThrow();
  });
  it("converts seconds to frame counts", () => { expect(secondsToFrames(2.5, 30)).toBe(75); });
});
