import { ENGINE_CATALOG } from "../engines/catalog";

/** Quality gate every engine must pass (Engine Builder step "30 days of unique content"). */
describe.each(ENGINE_CATALOG.map((e) => [e.slug, e] as const))("engine %s", (_slug, e) => {
  const days = e.days();
  const props = days.map((n) => e.forDay(n));

  it("every day parses against the schema", () => {
    for (const p of props) expect(() => e.schema.parse(p)).not.toThrow();
  });

  it("length stays in the allowed range", () => {
    for (const p of props) {
      const s = e.durationFrames(p as never) / 30;
      expect(s).toBeGreaterThanOrEqual(e.seconds[0]);
      expect(s).toBeLessThanOrEqual(e.seconds[1]);
    }
  });

  it("no two posts are identical, and neighbours differ", () => {
    const json = props.map((p) => JSON.stringify(p));
    expect(new Set(json).size).toBe(json.length);
  });

  if (e.voiceLines) {
    it("voice lines are in order, inside the video, and not stacked on top of each other", () => {
      for (const p of props) {
        const lines = e.voiceLines!(p as never);
        const end = e.durationFrames(p as never) / 30;
        lines.forEach((l, i) => {
          expect(l.text.trim().length).toBeGreaterThan(0);
          expect(l.at).toBeGreaterThanOrEqual(0);
          expect(l.at).toBeLessThan(end);
          if (i > 0) expect(l.at - lines[i - 1]!.at).toBeGreaterThanOrEqual(0.6);
        });
        expect(new Set(lines.map((l) => l.file)).size).toBe(lines.length);
      }
    });
  }

  if (e.answer) {
    it("has an answer for every post", () => {
      for (const n of days) expect(e.answer!(n).length).toBeGreaterThan(0);
    });
  }
});
