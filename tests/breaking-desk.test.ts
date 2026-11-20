import { BreakingDeskSchema, breakingDeskForDay, breakingDeskDuration, breakingDeskVoiceLines, breakingDeskAnswerComment } from "../engines/breaking-desk/src/model";

describe("Breaking Desk News Engine", () => {
  it("validates stories and produces valid schema payloads", () => {
    for (let day = 1; day <= 10; day++) {
      const episode = breakingDeskForDay(day);
      expect(() => BreakingDeskSchema.parse(episode)).not.toThrow();
      expect(episode.story.headline.length).toBeGreaterThan(0);
      expect(episode.askOutro.options.length).toBeGreaterThanOrEqual(2);
      expect(breakingDeskDuration(episode)).toBeGreaterThan(0);
    }
  });

  it("provides voice script cues and correct answer comments", () => {
    const ep1 = breakingDeskForDay(1);
    const lines = breakingDeskVoiceLines(ep1);
    expect(lines.length).toBeGreaterThan(0);

    const comment = breakingDeskAnswerComment(ep1);
    expect(comment).toContain("REPORT #1 INSIGHT");
  });

  it("configures Marcus Pizza story matching GravityClaw #41 benchmark for Day 2", () => {
    const ep2 = breakingDeskForDay(2);
    expect(ep2.story.category).toBe("FICTIONAL STORY");
    expect(ep2.story.headline).toBe("DID YOU EAT MY LEFTOVER PIZZA?");
    expect(ep2.story.contactName).toBe("Marcus");
    expect(ep2.story.dialogue).toBeDefined();
    expect(ep2.story.dialogue?.length).toBe(9);
    expect(ep2.story.dialogue?.[0]?.text).toBe("did you eat my leftover pizza");
    expect(ep2.story.dialogue?.[8]?.reactionEmoji).toBe("😂");
  });

  it("configures Lord Hanuman devotional chat for Day 3", () => {
    const ep3 = breakingDeskForDay(3);
    expect(ep3.story.category).toBe("BHAKTI & SANATAN");
    expect(ep3.story.contactName).toContain("हनुमान");
    expect(ep3.story.dialogue).toBeDefined();
    expect(ep3.story.dialogue?.length).toBeGreaterThan(0);
  });
});
