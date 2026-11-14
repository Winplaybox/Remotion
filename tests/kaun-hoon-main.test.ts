import { CHANNELS, isLive } from "../channels/channels";
import { kaunHoonMainCount, kaunHoonMainForDay, kaunHoonMainOptions, kaunHoonMainCharacter, parseKhmGuess, parseKhmLetter } from "../content/kaun-hoon-main/characters";
import { storyDioramaDuration, FPS } from "../engines/story-diorama/src/model";

describe("Kaun Hoon Main?", () => {
  const n = kaunHoonMainCount();
  const all = Array.from({ length: n }, (_, i) => kaunHoonMainForDay(i + 1));
  it("two weeks written, fails closed after", () => {
    expect(n).toBeGreaterThanOrEqual(14);
    expect(() => kaunHoonMainForDay(n + 1)).toThrow(/not written/);
  });
  it("4 distinct options incl. the answer; answer slot rotates; never revealed in the same video", () => {
    const slots = new Set<number>();
    for (let k = 1; k <= n; k++) {
      const { options, answer } = kaunHoonMainOptions(k);
      expect(new Set(options).size).toBe(4);
      expect(options[answer]).toBe(kaunHoonMainCharacter(k).name);
      slots.add(answer);
      const p = all[k - 1]!;
      expect(p.ask!.options[answer]).toContain(kaunHoonMainCharacter(k).name);
      // the name is only shown as one of the 4 chips, never in a headline/card of the same post
      const shown = p.scenes.filter((s) => s.id !== "prev").flatMap((s) => [...s.headlines.flatMap((h) => h.lines.map((l) => l.text)), ...s.layers.flatMap((l) => ((l as { data?: { items?: string[] } }).data?.items ?? []))]).join(" ");
      expect(shown).not.toContain(kaunHoonMainCharacter(k).name);
    }
    expect(slots.size).toBe(4);
  });
  it("post 2+ opens with the previous answer; 3 clues; headline/card limits; 25-45 s", () => {
    expect(all[0]!.scenes[0]!.id).toBe("hook");
    expect(all[1]!.scenes[0]!.id).toBe("prev");
    expect(all[1]!.scenes[0]!.headlines[0]!.lines[1]!.text).toBe(kaunHoonMainCharacter(1).name);
    for (const p of all) {
      expect(p.scenes.filter((s) => s.id.startsWith("clue-"))).toHaveLength(3);
      for (const s of p.scenes) {
        for (const h of s.headlines) for (const l of h.lines) expect(l.text.length).toBeLessThanOrEqual(16);
        for (const l of s.layers) for (const it of ((l as { data?: { items?: string[] } }).data?.items ?? [])) expect(it.length).toBeLessThanOrEqual(18);
      }
      const sec = storyDioramaDuration(p) / FPS;
      expect(sec).toBeGreaterThanOrEqual(25);
      expect(sec).toBeLessThanOrEqual(45);
    }
  });
  it("guess parsing is conservative", () => {
    expect(parseKhmLetter("B")).toEqual([2]);
    expect(parseKhmLetter("Ans: d 🙏")).toEqual([4]);
    expect(parseKhmLetter("option c)")).toEqual([3]);
    expect(parseKhmLetter("main a gaya bhai")).toBeNull();
    expect(parseKhmLetter("nice video")).toBeNull();
    const { options } = kaunHoonMainOptions(13); // Kumbhakarna post: "karna" must not match inside "kumbhakarna"
    expect(parseKhmGuess("kumbhakarna hai", 13)).toEqual([options.indexOf("KUMBHAKARNA") + 1]);
  });
  it("channel: disabled until LIVE, answer comment + quiz key agree", () => {
    const ch = CHANNELS["kaun-hoon-main"];
    expect(isLive("kaun-hoon-main")).toBe(false);
    expect(ch.answerInNextFrom).toBe(1);
    const { answer } = kaunHoonMainOptions(1);
    expect(ch.quiz!.key(1)).toEqual([answer + 1]);
    expect(ch.answer!(1)).toContain(kaunHoonMainCharacter(1).name);
    expect(ch.meta(1).title).toMatch(/#shorts/);
  });
});
