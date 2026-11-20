import { VersusSplitSchema, versusSplitForDay, versusSplitDuration, versusSplitVoiceLines } from "../engines/versus-split/src/model";

describe("Versus Split Engine", () => {
  it("validates matchups and produces valid schema payloads", () => {
    for (let day = 1; day <= 10; day++) {
      const match = versusSplitForDay(day);
      expect(() => VersusSplitSchema.parse(match)).not.toThrow();
      expect(match.fighterA.name.length).toBeGreaterThan(0);
      expect(match.fighterB.name.length).toBeGreaterThan(0);
      expect(match.rounds).toHaveLength(3);
      expect(versusSplitDuration(match)).toBeGreaterThan(0);
    }
  });

  it("configures Cat vs Dog benchmark for Day 1", () => {
    const match1 = versusSplitForDay(1);
    expect(match1.fighterA.name).toBe("CAT");
    expect(match1.fighterB.name).toBe("DOG");
    expect(match1.winner).toBe("b");
  });

  it("produces properly sequenced voice cues", () => {
    const match = versusSplitForDay(1);
    const lines = versusSplitVoiceLines(match);
    expect(lines.length).toBeGreaterThan(0);
    lines.forEach((l) => {
      expect(l.at).toBeGreaterThanOrEqual(0);
    });
  });
});
