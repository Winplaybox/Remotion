import { P, type StoryDioramaInput } from "../../engines/story-diorama/src/model";
import { SagaLongSchema, type SagaLong } from "../../engines/story-diorama/src/saga-long-model";
import { SEASONS, epicBharatSagaForDay } from "./vishnu-season";

/**
 * EpicBharatSaga long video (16:9): one whole season stitched into a single ~7-8 min video for watch hours.
 * Built only from already-authored episodes (minus their "kal dekhiye" teaser scene), plus an intro and an outro.
 * Long post n = season n (Vishnu, Shiv, Ganesh, Devi, Hanuman ...). Fails closed if any episode is not written.
 */

/** EP01 aired on this date (START_EPICBHARATSAGA); episode N airs on START + N - 1. */
export const EBS_EP1_DATE = "2026-11-08";

type Scene = StoryDioramaInput["scenes"][number];

const NIGHT: [string, string] = ["#1E1A3A", "#4A2A4A"];
const DAWN: [string, string] = ["#F2C98B", "#E59A6B"];

const SEASON_HI: Record<string, string> = { vishnu: "विष्णु", shiva: "महादेव शिव", ganesha: "गणेश", devi: "माँ दुर्गा", hanuman: "हनुमान" };

function intro(seasonIndex: number): Scene {
  const s = SEASONS[seasonIndex]!;
  if (s.id === "vishnu") {
    return {
      id: "intro", seconds: 8, location: "DASHAVATAR · POORI KAHANI", sky: DAWN, tone: "dark", particles: "petals", fig: "INTRO",
      narration: "जब जब धर्म की हानि हुई, भगवान विष्णु धरती पर आए। आज देखिए, उनके दसों अवतार, एक ही वीडियो में।",
      caption: "Jab jab dharm ki haani hui, Bhagwan Vishnu dharti par aaye. Aaj dekhiye unke dason avatar, ek hi video mein.",
      headlines: [
        { at: 0, lines: [{ text: "VISHNU KE" }, { text: "10 AVATAR", tone: "accent" }] },
        { at: 4, lines: [{ text: "POORI KAHANI" }, { text: "EK VIDEO MEIN", tone: "accent" }] }
      ],
      layers: [
        P("sun", 540, 950, { depth: 0.1, idle: "pulse", data: { color: "#FFF6DA" } }),
        P("lotus", 540, 1480, { depth: 0.8, at: 0.4, enter: "rise", scale: 1.3 }),
        P("water", 540, 1560, { depth: 0.5, data: { pads: true } })
      ]
    };
  }
  const hi = SEASON_HI[s.id] ?? s.short;
  return {
    id: "intro", seconds: 7, location: `${s.name} · POORI KAHANI`, sky: NIGHT, particles: "stars", fig: "INTRO",
    narration: `आज एक ही वीडियो में, पूरा ${hi} सीज़न। ${s.outline.length} कहानियाँ, शुरू से अंत तक।`,
    caption: `Aaj ek hi video mein poora ${s.short} season. ${s.outline.length} kahaniyaan, shuru se ant tak.`,
    headlines: [{ at: 0, lines: [{ text: s.name.replace(" SEASON", "") }, { text: "POORI KAHANI", tone: "accent2" }] }],
    layers: [P("moon", 540, 900, { depth: 0.1, idle: "pulse" }), P("temple", 540, 1560, { depth: 0.5, at: 0.4, enter: "rise" })]
  };
}

function outro(seasonIndex: number): Scene {
  const next = SEASONS[seasonIndex + 1];
  return {
    id: "outro", seconds: 8, location: "EPIC BHARAT SAGA", sky: NIGHT, particles: "stars", fig: "OUTRO",
    narration: "कहानी पसंद आई? कमेंट में बताइए, आपकी सबसे पसंदीदा कहानी कौन सी थी। रोज़ नया एपिसोड शॉर्ट्स पर आता है। सब्सक्राइब कीजिए, एपिक भारत सागा।",
    caption: "Kahani pasand aayi? Comment mein batayiye aapki favourite kahani kaunsi thi. Roz naya episode Shorts pe. Subscribe kijiye!",
    headlines: [
      { at: 0, lines: [{ text: "AAPKI FAVOURITE" }, { text: "KAHANI?", tone: "accent2" }] },
      { at: 4.2, lines: [{ text: "SUBSCRIBE" }, { text: "EPIC BHARAT SAGA", tone: "accent3" }] }
    ],
    layers: [P("noteCard", 540, 1120, { depth: 0.7, at: 0.4, enter: "drop", data: { title: next ? "AGLA SEASON:" : "ROZ NAYA EPISODE:", items: next ? [next.name, "ROZ SHORTS PE"] : ["SHORTS PE", "SUBSCRIBE KIJIYE"] } })]
  };
}

/** First global episode number of season i. */
export function seasonFirstEpisode(i: number): number {
  return SEASONS.slice(0, i).reduce((a, s) => a + s.outline.length, 0) + 1;
}

/** Long post n -> season n stitched together. */
export function seasonLongForPost(n: number): SagaLong {
  const si = Math.floor(n) - 1;
  const season = SEASONS[si];
  if (!season) throw new Error(`EpicBharatSaga long #${n}: no season planned`);
  const first = seasonFirstEpisode(si);
  const scenes: Scene[] = [intro(si)];
  const chapters: SagaLong["chapters"] = [];
  let base: ReturnType<typeof epicBharatSagaForDay> | null = null;
  season.outline.forEach((name, i) => {
    const d = epicBharatSagaForDay(first + i); // throws if not written: fail closed
    base ??= d;
    chapters.push({ title: name, tag: d.tag, tagAccent: d.tagAccent, startScene: scenes.length });
    for (const s of d.scenes) if (s.id !== "next") scenes.push({ ...s, id: `ep${first + i}-${s.id}` });
  });
  const outroAt = scenes.length;
  scenes.push(outro(si));
  const b = base!;
  return SagaLongSchema.parse({
    brand: b.brand, handle: b.handle, palette: b.palette, transitionFrames: b.transitionFrames, music: b.music, showCaptions: b.showCaptions,
    tag: `${season.name} · `, tagAccent: "POORI KAHANI",
    seasonTitle: season.id === "vishnu" ? "DASHAVATAR" : season.name.replace(" SEASON", ""),
    seasonSub: season.id === "vishnu" ? "VISHNU KE 10 AVATAR" : `${season.outline.length} KAHANIYAAN`,
    introScenes: 1, outroScene: outroAt,
    chapters, scenes
  });
}

/** IST date on which the season-n long video goes out: the Sunday after the season's last Short has aired (n=1: 2026-11-15). */
export function seasonLongDate(n: number): string {
  if (n === 1) return "2026-11-15";
  const last = seasonFirstEpisode(n - 1) + SEASONS[n - 1]!.outline.length - 1;
  const t = Date.parse(`${EBS_EP1_DATE}T00:00:00Z`) + (last - 1) * 86_400_000;
  let d = new Date(t + 86_400_000);
  while (d.getUTCDay() !== 0) d = new Date(d.getTime() + 86_400_000);
  return d.toISOString().slice(0, 10);
}

export const SEASON_LONG_DATES: readonly string[] = SEASONS.map((_, i) => seasonLongDate(i + 1));
