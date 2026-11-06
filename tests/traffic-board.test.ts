import { TRAFFIC_PUZZLE_DEMO, applyTrafficMove, validateBoard, validateSolution } from "../engines/traffic-puzzle/src/model";
describe("traffic puzzle model", () => {
  it("validates the demo board without overlaps or out-of-bounds vehicles", () => {
    expect(validateBoard(TRAFFIC_PUZZLE_DEMO)).toEqual([]);
  });
  it("validates a complete, collision-free solution", () => {
    expect(validateSolution(TRAFFIC_PUZZLE_DEMO)).toEqual([]);
  });
  it("rejects moves through another vehicle", () => {
    expect(() => applyTrafficMove(TRAFFIC_PUZZLE_DEMO, { vehicleId: "target", cells: 1 })).toThrow("blocked");
  });
});
