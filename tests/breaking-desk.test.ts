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

  it("never says 'Google News' in dialogue or headlines, uses clean 'news'", () => {
    for (let day = 1; day <= 10; day++) {
      const ep = breakingDeskForDay(day);
      expect(ep.story.headline.toLowerCase()).not.toContain("google news");
      ep.story.dialogue?.forEach((d) => {
        expect(d.text.toLowerCase()).not.toContain("google news");
      });
    }
  });

  it("configures animated typing, checklist bullets, single reactions, and full chat history for Story 1", () => {
    const ep1 = breakingDeskForDay(1);
    expect(ep1.story.contactName).toBe("Viewer");
    expect(ep1.story.contactStatus).toBe("online");
    expect(ep1.story.dialogue?.[0]?.text).toBe("did you see what news just reported?!");
    
    // Message 4 has single heart reaction
    expect(ep1.story.dialogue?.[3]?.reactionEmoji).toBe("❤️");

    // Message 6 has checklist bullets and single fire reaction
    expect(ep1.story.dialogue?.[5]?.bullets).toBeDefined();
    expect(ep1.story.dialogue?.[5]?.bullets?.length).toBe(3);
    expect(ep1.story.dialogue?.[5]?.reactionEmoji).toBe("🔥");

    // Message 7 ("That's amazing! 🚀") entered into chat history
    expect(ep1.story.dialogue?.length).toBe(7);
    expect(ep1.story.dialogue?.[6]?.text).toBe("That's amazing! 🚀");
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
