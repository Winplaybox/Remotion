import { CHANNELS, dateOfPost, postNumber, type ChannelId } from "../channels/channels";
import { CHANNEL_LOOKS, LOOKS_FROM, lookFor } from "../channels/looks";
import { STYLE_BY_ID, EXTRA_STYLE_IDS } from "../packages/visuals/src/styles/recipes";

const ids = Object.keys(CHANNEL_LOOKS);

describe("channel looks", () => {
  it("every look in every rotation is a known, non-planned style and every channel exists", () => {
    for (const id of ids) {
      expect(Object.keys(CHANNELS)).toContain(id);
      const l = CHANNEL_LOOKS[id]!;
      expect(l.rotation).toContain(l.signature);
      for (const s of l.rotation) {
        expect(STYLE_BY_ID[s]).toBeDefined();
        expect(STYLE_BY_ID[s]!.status).not.toBe("planned");
      }
    }
  });

  it("colour-safe puzzle channels never get a monochrome or hue-wrecking look", () => {
    for (const id of ids.filter((i) => CHANNEL_LOOKS[i]!.colourSafe)) {
      for (const s of CHANNEL_LOOKS[id]!.rotation) {
        const r = STYLE_BY_ID[s]!.recipe;
        expect({ id, s, mono: !!(r.duotone || r.gradientMap), pixel: !!r.pixel, wobble: !!r.wobble }).toEqual({ id, s, mono: false, pixel: false, wobble: false });
      }
    }
  });

  it("posts before LOOKS_FROM keep their original props (no style key added)", () => {
    for (const id of ids) {
      const ch = id as ChannelId;
      const n = 1;
      const date = dateOfPost(ch, n);
      if (date >= LOOKS_FROM) continue;
      const props = CHANNELS[ch].resolve(n) as Record<string, unknown>;
      if (id !== "dimaag-lock") expect(props.style).toBeUndefined();
      expect(lookFor(id, n, date)).toBeUndefined();
    }
  });

  it("posts from LOOKS_FROM get a rotation style", () => {
    for (const id of ["chakra-puzzle", "kaali-peeli-chase", "epicbharatsaga"] as ChannelId[]) {
      const n = postNumber(id, "2026-11-23", 0);
      const props = CHANNELS[id].resolve(n) as Record<string, unknown>;
      expect(CHANNEL_LOOKS[id]!.rotation).toContain(props.style);
    }
  });

  it("the channel pack has 20 styles", () => {
    expect(EXTRA_STYLE_IDS).toHaveLength(20);
  });
});
