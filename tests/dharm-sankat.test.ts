import { CHANNELS, isLive } from "../channels/channels";
import { dharmSankatCount, dharmSankatForDay, DHARM_SANKAT_CTA_VOICE } from "../content/dharm-sankat/questions";
import { storyDioramaDuration, FPS } from "../engines/story-diorama/src/model";

describe("Dharm Sankat", () => {
  const all = Array.from({ length: dharmSankatCount() }, (_, i) => dharmSankatForDay(i + 1));
  it("has at least two weeks written, then fails closed", () => {
    expect(all.length).toBeGreaterThanOrEqual(14);
    expect(() => dharmSankatForDay(dharmSankatCount() + 1)).toThrow(/not written/);
  });
  it("every post: hook, context, side A, side B, ask; AskOutro with A/B chips", () => {
    for (const p of all) {
      expect(p.scenes.map((s) => s.id)).toEqual(["hook", "context", "side-a", "side-b", "ask"]);
      expect(p.ask?.options).toHaveLength(2);
      expect(p.ask!.options[0]).toMatch(/^A: /);
      expect(p.scenes.at(-1)!.narration.endsWith(DHARM_SANKAT_CTA_VOICE)).toBe(true);
      expect(p.scenes.every((s) => s.narration.length > 10 && /[ऀ-ॿ]/.test(s.narration))).toBe(true);
    }
  });
  it("headlines fit (max 2 lines, 16 chars) and Shorts length stays 30-50 s", () => {
    for (const p of all) {
      for (const s of p.scenes) for (const h of s.headlines) {
        expect(h.lines.length).toBeLessThanOrEqual(2);
        for (const l of h.lines) expect(l.text.length).toBeLessThanOrEqual(16);
      }
      for (const s of p.scenes) for (const l of s.layers) {
        const items = (l as { data?: { items?: string[] } }).data?.items ?? [];
        for (const it of items) expect(it.length).toBeLessThanOrEqual(18);
      }
      const sec = storyDioramaDuration(p) / FPS;
      expect(sec).toBeGreaterThanOrEqual(30);
      expect(sec).toBeLessThanOrEqual(50);
    }
  });
  it("unique questions; channel is disabled until LIVE_DHARM_SANKAT is set; meta is a Short", () => {
    expect(new Set(all.map((p) => p.ask!.question)).size).toBe(all.length);
    expect(CHANNELS["dharm-sankat"].autoPublish).toBe(false);
    expect(isLive("dharm-sankat")).toBe(false);
    const m = CHANNELS["dharm-sankat"].meta(1);
    expect(m.title).toMatch(/#shorts/);
    expect(m.description).toContain("Source:");
  });
});
