import { CHANNELS, postNumber, type ChannelId } from "../channels/channels";
import { VOICES, VOICE_SWITCH_DATE, narrateArgs, voiceProfileFor } from "../channels/voices";

describe("narrator per channel", () => {
  it("posts before the switch keep the Edge voice (render buffer untouched)", () => {
    const n = postNumber("chakra-puzzle", "2026-11-14", 2);
    expect(voiceProfileFor("chakra-puzzle", n)).toBeNull();
    expect(narrateArgs("chakra-puzzle", n)).toEqual(["--engine", "edge", "--edge-voice", "hi-IN-MadhurNeural"]);
  });
  it("from the switch date: Kokoro -> Gemini -> Edge with the channel's voices", () => {
    const n = postNumber("chakra-puzzle", VOICE_SWITCH_DATE, 0);
    const a = narrateArgs("chakra-puzzle", n);
    expect(a.slice(0, 4)).toEqual(["--engine", "auto", "--engines", "kokoro,gemini,edge"]);
    expect(a[a.indexOf("--kokoro-voice") + 1]).toMatch(/^h[fm]_/);
  });
  it("every voiced channel has a narrator; English channel uses English voices", () => {
    for (const id of Object.keys(CHANNELS) as ChannelId[]) {
      const c = CHANNELS[id] as { voice?: unknown; narrated: boolean };
      if (c.voice || c.narrated) expect(VOICES[id]).toBeDefined();
    }
    expect(VOICES["dimaag-lock"]!.kokoro.startsWith("a")).toBe(true);
    expect(VOICES["dimaag-lock"]!.edge.startsWith("en-")).toBe(true);
  });
  it("long videos share their Shorts channel's narrator", () => {
    expect(VOICES["chakra-marathon"]).toBe(VOICES["chakra-puzzle"]);
    expect(VOICES["kpc-championship"]).toBe(VOICES["kaali-peeli-chase"]);
  });
});
