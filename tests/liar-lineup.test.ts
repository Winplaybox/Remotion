import { HONEST, RULES, SETS, fill } from "../engines/liar-lineup/src/content";
import { liarAnswer, liarBeats, liarLineupAnswerComment, liarLineupDuration, liarLineupForDay, outroStart } from "../engines/liar-lineup/src/model";

const days = Array.from({ length: 120 }, (_, i) => i + 1);

describe("liar-lineup (Jhooth Kaun?)", () => {
  it("every case has exactly one alibi that breaks the key clue", () => {
    for (const d of days) {
      const p = liarLineupForDay(d);
      const rule = RULES.find((r) => r.id === p.ruleId)!;
      expect(rule.sets).toContain(p.set);
      expect(p.clues.filter((c) => c.key)).toHaveLength(1);
      const victim = SETS[p.set].victim;
      p.suspects.forEach((s, i) => {
        const lies = rule.liars.some((l) => fill(l, s.gender, victim).r === s.alibi.r);
        expect(lies).toBe(i === p.liar);
        if (i !== p.liar) {
          const h = HONEST.find((x) => fill(x, s.gender, victim).r === s.alibi.r)!;
          expect(h).toBeDefined();
          expect(h.breaks).not.toContain(rule.id);
          expect(h.when === "any" || h.when === rule.when).toBe(true);
        }
      });
    }
  });

  it("suspects are three different people with different alibis", () => {
    for (const d of days) {
      const p = liarLineupForDay(d);
      expect(new Set(p.suspects.map((s) => s.preset)).size).toBe(3);
      expect(new Set(p.suspects.map((s) => s.name.r)).size).toBe(3);
      expect(new Set(p.suspects.map((s) => s.alibi.r)).size).toBe(3);
      for (const s of p.suspects) expect(s.alibi.r).not.toMatch(/\{[RTGAV]\}/);
    }
  });

  it("each block of posts uses every rule once and the liar position varies", () => {
    const first = days.slice(0, RULES.length).map((d) => liarLineupForDay(d).ruleId);
    expect(new Set(first).size).toBe(RULES.length);
    const pos = new Set(days.slice(0, 30).map((d) => liarLineupForDay(d).liar));
    expect(pos.size).toBe(3);
  });

  it("the next post opens with this post's answer", () => {
    for (const d of days.slice(0, 30)) {
      const a = liarAnswer(liarLineupForDay(d));
      expect(liarLineupForDay(d + 1).prevAnswer).toBe(a.label);
      expect(liarLineupAnswerComment(liarLineupForDay(d))).toContain(a.label);
    }
  });

  it("timeline fits a Short and lines never overlap", () => {
    for (const d of days.slice(0, 30)) {
      const p = liarLineupForDay(d);
      const s = liarLineupDuration(p) / 30;
      expect(s).toBeGreaterThan(35);
      expect(s).toBeLessThanOrEqual(55);
      const b = liarBeats(p);
      for (let i = 1; i < b.length; i++) expect(b[i]!.start).toBeGreaterThanOrEqual(b[i - 1]!.start + b[i - 1]!.dur);
      expect(outroStart(p)).toBeLessThan(s);
    }
  });
});
