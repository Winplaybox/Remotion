import { liarLineupForDay, liarLineupDuration, liarLineupAnswer, liarLineupAnswerComment, liarLineupVoiceLines, LiarLineupSchema, FPS } from "../engines/liar-lineup/src/model";
import { CAST_100, CAST_BY_ID, getCharacterById, getCharactersByCategory } from "../packages/visuals/src/rig/cast";
import { ALL_ANIMATION_STYLES, getStyleById, getStylesByCategory } from "../packages/visuals/src/styles/registry";
import type { CharacterCategory } from "../packages/visuals/src/rig/types";

describe("100-Character Cast Universe", () => {
  it("contains exactly 100 unique characters", () => {
    expect(CAST_100).toHaveLength(100);
    const uniqueIds = new Set(CAST_100.map((c) => c.id));
    expect(uniqueIds.size).toBe(100);
  });

  const categories: CharacterCategory[] = [
    "main-detective-family",
    "rich-family",
    "household-staff",
    "business-people",
    "village-characters",
    "city-characters",
    "suspicious-characters",
    "female-characters",
    "young-characters",
    "special-characters"
  ];

  it("contains exactly 10 characters in every single one of the 10 categories", () => {
    for (const cat of categories) {
      const chars = getCharactersByCategory(cat);
      expect(chars).toHaveLength(10);
    }
  });

  it("ensures all characters have complete appearance and persona definitions", () => {
    for (const char of CAST_100) {
      expect(char.id).toBeTruthy();
      expect(char.name).toBeTruthy();
      expect(char.profession).toBeTruthy();
      expect(char.persona).toBeTruthy();
      expect(char.look.skin).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(char.look.hair).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(char.look.outfitColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(char.look.hairStyle).toBeTruthy();
      expect(char.look.outfitStyle).toBeTruthy();
    }
  });

  it("retrieves Jasoos Bhai by ID", () => {
    const jasoos = getCharacterById("jasoos-bhai");
    expect(jasoos.name).toBe("Jasoos Bhai");
    expect(jasoos.category).toBe("main-detective-family");
    expect(jasoos.look.accessory).toBe("detective-hat");
  });
});

describe("49 Code-Only Animation Styles Catalogue", () => {
  it("registers all 49 styles", () => {
    expect(ALL_ANIMATION_STYLES).toHaveLength(49);
  });

  it("finds key requested styles by ID", () => {
    const pixelArt = getStyleById("pixel-art");
    expect(pixelArt).toBeDefined();
    expect(pixelArt?.name).toBe("Pixel Art");

    const filmNoir = getStyleById("film-noir");
    expect(filmNoir).toBeDefined();

    const sharpInk = getStyleById("sharp-ink-outlines");
    expect(sharpInk).toBeDefined();
  });

  it("filters styles by category", () => {
    const animeStyles = getStylesByCategory("anime");
    expect(animeStyles.length).toBeGreaterThanOrEqual(4);
  });
});

describe("Liar Lineup ('Jhooth Kaun?') Engine", () => {
  it("generates valid deterministic cases for days 1 to 30", () => {
    for (let day = 1; day <= 30; day++) {
      const p = liarLineupForDay(day);
      expect(() => LiarLineupSchema.parse(p)).not.toThrow();
      expect(p.postNo).toBe(day);
      expect(p.clues).toHaveLength(3);
      expect(p.suspects).toHaveLength(3);

      // Exactly one liar
      const liars = p.suspects.filter((s) => s.isLiar);
      expect(liars).toHaveLength(1);
      expect(p.suspects[p.liarIndex]?.isLiar).toBe(true);

      // Contradiction and answer
      expect(p.contradiction).toBeTruthy();
      const ans = liarLineupAnswer(p);
      expect(ans).toContain(p.suspects[p.liarIndex]?.name);

      const comment = liarLineupAnswerComment(p);
      expect(comment).toContain(p.suspects[p.liarIndex]?.name);
      expect(comment).toContain(p.contradiction);

      // Duration within 20s to 35s
      const dur = liarLineupDuration(p);
      const seconds = dur / FPS;
      expect(seconds).toBeGreaterThanOrEqual(20);
      expect(seconds).toBeLessThanOrEqual(35);

      // Voice lines
      const voice = liarLineupVoiceLines(p);
      expect(voice.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("cycles contradictions and suspects across multiple days", () => {
    const day1 = liarLineupForDay(1);
    const day2 = liarLineupForDay(2);
    expect(day1.caseTitle).not.toBe(day2.caseTitle);
    expect(day1.clues[0]?.title).not.toBe(day2.clues[0]?.title);
  });
});
