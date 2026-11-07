import { ENGINE_CATALOG } from "../engines/catalog";
import { AskOutroSchema } from "../engines/ask-outro";

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
    it("puzzle engines declare askFrom (shared AskOutro ending)", () => {
      expect(e.askFrom).toBeDefined();
    });

    it("from askFrom on: shared AskOutro, no reveal, no end card, ask voice lines", () => {
      for (const n of days.filter((d) => d >= (e.askFrom ?? Infinity))) {
        const p = e.forDay(n) as { askOutro?: unknown; endCard?: { show: boolean }; answerSeconds?: number };
        expect(() => AskOutroSchema.parse(p.askOutro)).not.toThrow();
        if (p.endCard) expect(p.endCard.show).toBe(false);
        if (p.answerSeconds !== undefined) expect(p.answerSeconds).toBe(0);
        if (e.voiceLines) {
          const files = e.voiceLines(p as never).map((l) => l.file);
          expect(files).toEqual(expect.arrayContaining(["ask_q.wav", "ask_cta.wav"]));
          expect(files).not.toContain("reveal.wav");
          expect(files).not.toContain("outro.wav");
          expect(files[files.length - 1]).toBe("ask_cta.wav");
        }
      }
    });

    it("has an answer for every post", () => {
      for (const n of days) expect(e.answer!(n).length).toBeGreaterThan(0);
    });
  }
});
