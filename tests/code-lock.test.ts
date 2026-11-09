import { CodeLockSchema, codeLockForDay, codeLockVoiceLines, codeLockDuration } from "../engines/code-lock/src/model";

describe("Dimaag Lock Code Cracker", () => {
  it("generates 30 valid puzzles with exactly one solution", () => {
    for (let day = 1; day <= 30; day++) {
      const puzzle = codeLockForDay(day);
      expect(() => CodeLockSchema.parse(puzzle)).not.toThrow();
      expect(puzzle.clues).toHaveLength(5);
      expect(puzzle.code).toHaveLength(puzzle.digits);
    }
  });

  it("keeps the answer out of the puzzle and includes the English follow CTA", () => {
    const puzzle = codeLockForDay(1);
    expect(puzzle.askOutro.question).toBe("WHAT IS THE SECRET CODE?");
    expect(puzzle.askOutro.cta).toBe("COMMENT YOUR CODE BELOW!");
    expect(puzzle.askOutro.handle).toBe("@DimaagLock");
  });

  it("keeps voice cues ordered and inside the composition", () => {
    for (let day = 1; day <= 30; day++) {
      const puzzle = codeLockForDay(day);
      const lines = codeLockVoiceLines(puzzle);
      const end = codeLockDuration(puzzle) / 30;
      lines.forEach((line, i) => {
        expect(line.at).toBeGreaterThanOrEqual(0);
        expect(line.at).toBeLessThan(end);
        if (i) expect(line.at - lines[i - 1]!.at).toBeGreaterThanOrEqual(0.6);
      });
      expect(lines[lines.length - 1]!.file).toBe("ask_cta.wav");
    }
  });
});
