import { spaceCues } from "../scripts/voice-timing";

describe("spaceCues", () => {
  it("moves a clip that would talk over the previous one", () => {
    const out = spaceCues([{ src: "a", at: 0, dur: 3 }, { src: "b", at: 2, dur: 1 }, { src: "c", at: 10, dur: 1 }]);
    expect(out.map((c) => c.at)).toEqual([0, 3.15, 10]);
  });
  it("chains pushes and keeps order", () => {
    const out = spaceCues([{ src: "b", at: 1, dur: 2 }, { src: "a", at: 0, dur: 2 }, { src: "c", at: 2, dur: 1 }]);
    expect(out.map((c) => c.src)).toEqual(["a", "b", "c"]);
    for (let i = 1; i < out.length; i++) expect(out[i]!.at).toBeGreaterThanOrEqual(out[i - 1]!.at + out[i - 1]!.dur);
  });
});
