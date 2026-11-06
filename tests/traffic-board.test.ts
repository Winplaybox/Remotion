import { TRAFFIC_PUZZLE_DEMO, validateBoard } from "../engines/traffic-puzzle/src/model";
describe("traffic puzzle model", () => {
  it("validates the demo board without overlaps or out-of-bounds vehicles", () => {
    expect(validateBoard(TRAFFIC_PUZZLE_DEMO)).toEqual([]);
  });
});
