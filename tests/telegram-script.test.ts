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

import { beatsFor, voiceFor, metaText, defaultMeta, previewText } from "../scripts/telegram/script";

describe("phase 2 script options", () => {
  it("beat count follows the requested length", () => {
    expect(beatsFor(30)).toBe(5);
    expect(beatsFor(50)).toBe(9);
    expect(beatsFor(180)).toBe(16);
    expect(beatsFor(5)).toBe(4);
  });
  it("language changes prompt rules and the voice", () => {
    expect(topicPrompt("dadi", "Holi", { language: "hindi" })).toMatch(/Devanagari Hindi/);
    expect(topicPrompt("dadi", "Holi", { language: "english", seconds: 30 })).toMatch(/Exactly 5 beats/);
    expect(voiceFor("dadi", "english").voice).toBe("en-IN-NeerjaNeural");
    expect(voiceFor("jasoos", "english").voice).toBe("en-IN-PrabhatNeural");
    expect(voiceFor("dadi", "hinglish").voice).toBe("hi-IN-SwaraNeural");
  });
  it("research facts are passed and marked as the only source of claims", () => {
    expect(topicPrompt("saga", "Rama Setu", { facts: "- Valmiki Ramayana describes..." })).toMatch(/Use ONLY these researched facts/);
  });
  it("parses metadata and normalises hashtags; fallback metadata and texts", () => {
    const d = parseDraft('{"title":"x","beats":[{"caption":"a","voice":"a","icon":"🎨"},{"caption":"b","voice":"b"}],"meta":{"title":"T","description":"D","hashtags":["shorts","#holi festival"]}}');
    expect(d.meta?.hashtags).toEqual(["#shorts", "#holifestival"]);
    expect(metaText(d.meta!, [{ title: "Wiki", url: "https://w" }])).toMatch(/Sources:\n1\. Wiki — https:\/\/w/);
    expect(metaText(defaultMeta(d), [])).toMatch(/verify facts/);
    expect(previewText(d)).toMatch(/^📝 X\n\n1\. 🎨 a/);
  });
});
