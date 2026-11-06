import { SANATAN_EPISODE_DEMO, SanatanEpisodeSchema } from "../engines/sanatan-story/src/model";
describe("Sanatan episode schema", () => {
  it("accepts the sample episode with positive frame durations", () => {
    expect(SanatanEpisodeSchema.parse(SANATAN_EPISODE_DEMO).scenes).toHaveLength(5);
  });
  it("rejects scenes without narration", () => {
    const invalid = { ...SANATAN_EPISODE_DEMO, scenes: [{ ...SANATAN_EPISODE_DEMO.scenes[0], narration: "" }] };
    expect(() => SanatanEpisodeSchema.parse(invalid)).toThrow();
  });
});
