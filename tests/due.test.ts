import { candidates, CATCHUP_SINCE } from "../scripts/due";

const at = (iso: string) => Date.parse(iso);
const keys = (xs: { channel: string; date: string; slot: number; late: boolean }[]) => xs.map((x) => `${x.channel}:${x.date}:${x.slot}${x.late ? ":late" : ""}`);

describe("due slots", () => {
  it("normal window: slots 30-90 min after the top of the hour", () => {
    // 2026-11-09 00:00 UTC = 05:30 IST -> 06:30 IST chakra slot 0 (01:00 UTC) is due, 07:00 IST is not yet
    expect(keys(candidates(at("2026-11-09T00:00:00Z"), 1, undefined, false))).toEqual(["chakra-puzzle:2026-11-09:0"]);
    expect(keys(candidates(at("2026-11-09T01:00:00Z"), 1, undefined, false))).toEqual(["kaali-peeli-chase:2026-11-09:0"]);
  });

  it("catch-up adds today's missed slots (within 12 h, after ledger start)", () => {
    // 05:00 UTC = 10:30 IST: 06:30, 07:00, 08:30, 09:00 IST all passed
    const c = keys(candidates(at("2026-11-09T05:00:00Z"), 1, undefined, true));
    expect(c).toEqual(expect.arrayContaining(["chakra-puzzle:2026-11-09:0:late", "kaali-peeli-chase:2026-11-09:0:late", "chakra-puzzle:2026-11-09:1:late", "kaali-peeli-chase:2026-11-09:1:late"]));
    expect(c.filter((k) => !k.endsWith(":late"))).toEqual([]);
  });

  it("never catches up slots older than the look-back or before the ledger existed", () => {
    const c = keys(candidates(at("2026-11-09T20:00:00Z"), 1, undefined, true)); // 01:30 IST next day
    expect(c.some((k) => k.includes("2026-11-09:0"))).toBe(false); // 06:30 IST is > 12 h ago
    const before = candidates(at("2026-11-08T05:00:00Z"), 1, undefined, true);
    expect(before.every((d) => !d.late || Date.parse(`${d.date}T00:00:00Z`) >= CATCHUP_SINCE - 86_400_000)).toBe(true);
    expect(keys(before).filter((k) => k.endsWith(":late"))).toEqual([]); // 8 Nov morning slots predate the ledger
  });

  it("no catch-up without the ledger", () => {
    expect(keys(candidates(at("2026-11-09T05:00:00Z"), 1, undefined, false))).toEqual([]);
  });
});
