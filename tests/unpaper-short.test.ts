import { CHANNELS } from "../channels/channels";
import { UNPAPER_HANDLES, unpaperCaption, unpaperDescription } from "../engines/unpaper-short/src/brand";
import { UnpaperShortSchema, unpaperCta, unpaperEpisodes, unpaperShortDuration, unpaperShortForDay } from "../engines/unpaper-short/src/model";

describe("Unpaper Short engagement + cross-platform links", () => {
  const days = unpaperEpisodes();

  it("every episode parses, with or without a cta block", () => {
    for (const n of days) expect(() => UnpaperShortSchema.parse(unpaperShortForDay(n))).not.toThrow();
    const ep = unpaperShortForDay(1).episode;
    const { cta: _cta, ...bare } = ep;
    expect(() => UnpaperShortSchema.parse({ episode: bare })).not.toThrow();
  });

  it("hook, mid-video comment pill and end card fit inside the video without overlapping", () => {
    for (const n of days) {
      const p = unpaperShortForDay(n);
      const total = unpaperShortDuration(p);
      const c = unpaperCta(p.episode);
      expect(c.hook.length).toBeGreaterThan(0);
      expect(c.hookFrames).toBeLessThanOrEqual(4 * 30);
      expect(c.commentFrames).toBe(45); // ~1.5 s
      expect(c.commentFrom).toBeGreaterThan(c.hookFrames);
      expect(c.commentFrom + c.commentFrames).toBeLessThan(total - c.endFrames);
      expect(c.endFrames).toBeGreaterThanOrEqual(3 * 30);
      // the end card sits inside the last scene, so it never covers a scene's content mid-explanation
      const last = p.episode.scenes[p.episode.scenes.length - 1]!;
      expect(c.endFrames).toBeLessThanOrEqual(Math.round(last.seconds * 30));
    }
  });

  it("CTA copy is configurable per episode, with defaults when absent", () => {
    const ep = unpaperShortForDay(1).episode;
    expect(unpaperCta(ep).comment).toBe(ep.cta?.comment);
    const { cta: _cta, ...bare } = ep;
    const d = unpaperCta(bare);
    expect(d.hook.endsWith("?")).toBe(true);
    expect(d.comment).toBe("kaunsa point pata tha?");
    expect(d.question).toBe("Kaunsa document decode karein? Comment karo.");
    expect(d.crossPost).toBe("Poora breakdown YouTube par / slides Instagram par");
  });

  it("YouTube description links Instagram + the Facebook Page; IG caption points to YouTube; all from one config", () => {
    const meta = CHANNELS["unpaper-short"].meta(1);
    const ep = unpaperShortForDay(1).episode;
    expect(meta.description).toBe(unpaperDescription(ep));
    expect(meta.caption).toBe(unpaperCaption(ep));
    expect(meta.description).toContain(UNPAPER_HANDLES.instagram.handle);
    expect(meta.description).toContain("https://www.facebook.com/profile.php?id=61596651637282");
    expect(meta.caption).toContain(`Full video YouTube pe: ${UNPAPER_HANDLES.youtube.handle}`);
    expect(CHANNELS["unpaper-short"].youtubeHandle).toBe(UNPAPER_HANDLES.youtube.handle);
    expect(meta.description.length).toBeLessThanOrEqual(5000);
    expect(meta.caption.length).toBeLessThanOrEqual(2200);
  });
});
