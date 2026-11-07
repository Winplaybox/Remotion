import { parseDraft, splitScript, topicPrompt, scriptPrompt } from "../scripts/telegram/script";
import { NARRATORS, NARRATOR_DEMO, NARRATOR_IDS, NarratorVideoSchema, narratorVideoSeconds } from "../engines/narrator-video/src/model";

describe("telegram script pipeline", () => {
  it("parses Gemini JSON, even inside ```json fences", () => {
    const d = parseDraft('```json\n{"title":"holi kyun?","beats":[{"caption":"a","voice":"ए","icon":"🎨"},{"caption":"b","voice":"बी","icon":"🔥"}]}\n```');
    expect(d.title).toBe("HOLI KYUN?");
    expect(d.beats).toHaveLength(2);
  });

  it("rejects broken AI output with a readable error", () => {
    expect(() => parseDraft("not json")).toThrow(/JSON/);
    expect(() => parseDraft('{"title":"x","beats":[]}')).toThrow();
  });

  it("splits a user script into beats without changing the words", () => {
    const script = "Ek gaon tha\nUs gaon mein ek kisaan rehta tha. Wo roz subah khet jaata tha! Ek din usne ek sone ka anda dekha. Phir kya hua? Comment mein batao.";
    const d = splitScript(script);
    expect(d.title).toBe("EK GAON THA");
    expect(d.beats.length).toBeGreaterThanOrEqual(2);
    expect(d.beats.map((b) => b.caption).join(" ")).toBe(script.split("\n")[1]);
  });

  it("prompts carry the narrator persona and the safety rules", () => {
    for (const id of NARRATOR_IDS) {
      expect(topicPrompt(id, "Holi")).toContain(NARRATORS[id].persona);
      expect(scriptPrompt(id, "abc")).toContain("KEEP THE USER'S WORDS");
    }
  });

  it("demo props are valid for every narrator and 15-90s long", () => {
    for (const id of NARRATOR_IDS) {
      const p = NarratorVideoSchema.parse({ ...NARRATOR_DEMO, narrator: id });
      const s = narratorVideoSeconds(p);
      expect(s).toBeGreaterThanOrEqual(15);
      expect(s).toBeLessThanOrEqual(90);
    }
  });
});
