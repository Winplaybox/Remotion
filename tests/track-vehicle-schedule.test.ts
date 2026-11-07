import { TRACK_VEHICLE_DEMO, TRACK_VEHICLE_VARIANTS } from "../engines/track-vehicle/src/model";
import { buildSchedule, carPose } from "../engines/track-vehicle/src/schedule";

describe("track-vehicle schedule", () => {
  const all = [TRACK_VEHICLE_DEMO, ...Object.values(TRACK_VEHICLE_VARIANTS).map((v) => ({ ...TRACK_VEHICLE_DEMO, ...v }))];
  it.each(all.map((p) => [p.vehicle, p] as const))("%s: answer slot matches where the target ends", (_k, p) => {
    const s = buildSchedule(p);
    const end = p.shuffleSeconds * 30;
    expect(carPose(s, s.targetCar, end).slotFrom).toBe(s.answerSlot);
    const finalSlots = Array.from({ length: s.slots }, (_, c) => carPose(s, c, end).slotFrom);
    expect(new Set(finalSlots).size).toBe(s.slots);
    expect(s.events.filter((e) => e.a === s.targetCar || e.b === s.targetCar).length).toBeGreaterThan(5);
  });
  it("never moves one car in two overlapping swaps", () => {
    const s = buildSchedule(TRACK_VEHICLE_DEMO);
    for (const list of s.byCar) for (let i = 1; i < list.length; i++) expect(list[i]!.start).toBeGreaterThanOrEqual(list[i - 1]!.end);
  });
});
