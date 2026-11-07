import { STORY_DIORAMA_DEMO, StoryDioramaSchema, storyDioramaDuration } from "../engines/story-diorama/src/model";
import { ODD_ORBIT_DEMO, ODD_ORBIT_VARIANTS, OddOrbitSchema } from "../engines/odd-orbit/src/model";
describe("new engine schemas", () => {
  it("story demo parses and has a sane duration", () => {
    expect(() => StoryDioramaSchema.parse(STORY_DIORAMA_DEMO)).not.toThrow();
    expect(storyDioramaDuration(STORY_DIORAMA_DEMO)).toBeGreaterThan(30 * 20);
  });
  it("all odd-orbit variants parse", () => {
    for (const v of Object.values(ODD_ORBIT_VARIANTS)) expect(() => OddOrbitSchema.parse({ ...ODD_ORBIT_DEMO, ...v })).not.toThrow();
  });
});
