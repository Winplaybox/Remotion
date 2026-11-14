import { P, type StoryDioramaInput } from "../../engines/story-diorama/src/model";
import { SagaLongSchema, type SagaLong } from "../../engines/story-diorama/src/saga-long-model";
import { dharmSankatCount, dharmSankatForDay, dharmSankatQuestion } from "./questions";

/**
 * #20 Dharm Sankat weekly long (16:9): the week's 7 debates in one ~5 min video for watch hours.
 * Long post n = Shorts 7n-6 … 7n, on the Sunday their last Short airs (Shorts start Mon 2026-11-16, so n=1 -> 2026-11-22).
 * Each chapter is the Short minus its AskOutro; it ends with a plain "aapki raay?" scene. Fails closed if a Short is unwritten.
 */
export const DS_WEEK = 7;
export const DS_FIRST_SHORT = "2026-11-16";

type Scene = Omit<StoryDioramaInput["scenes"][number], "fig"> & { fig?: string };
const NIGHT: [string, string] = ["#1E1A3A", "#4A2A4A"];

export function dharmSankatWeekLong(n: number): SagaLong {
  const first = (Math.floor(n) - 1) * DS_WEEK + 1;
  if (first < 1) throw new Error(`Dharm Sankat long #${n}: bad number`);
  const scenes: Scene[] = [{
    id: "intro", seconds: 7, location: "DHARM SANKAT · IS HAFTE KE SAWAAL", sky: NIGHT, particles: "stars", fig: "INTRO",
    narration: "महाभारत और रामायण के सात सबसे बड़े सवाल। हर सवाल के दोनों पक्ष, ग्रंथों से। फ़ैसला आपका।",
    caption: "Mahabharat aur Ramayan ke 7 sabse bade sawaal. Har sawaal ke dono paksh, granthon se. Faisla aapka.",
    headlines: [{ at: 0, lines: [{ text: "7 SABSE BADE" }, { text: "SAWAAL", tone: "accent2" }] }, { at: 3.6, lines: [{ text: "FAISLA" }, { text: "AAPKA", tone: "accent2" }] }],
    layers: [P("moon", 540, 880, { depth: 0.1, idle: "pulse" }), P("greatBow", 540, 1500, { depth: 0.6, at: 0.4, enter: "rise", scale: 0.8 })]
  }];
  const chapters: SagaLong["chapters"] = [];
  let base: ReturnType<typeof dharmSankatForDay> | null = null;
  for (let i = 0; i < DS_WEEK; i++) {
    const k = first + i;
    const p = dharmSankatForDay(k); // throws if unwritten: fail closed
    const q = dharmSankatQuestion(k);
    base ??= p;
    chapters.push({ title: `${q.h1} ${q.h2}`.replace(/\s+/g, " "), tag: "DHARM SANKAT · #", tagAccent: String(k).padStart(2, "0"), startScene: scenes.length });
    for (const s of p.scenes) {
      if (s.id === "ask") {
        scenes.push({
          ...s, id: `ds${k}-raay`, seconds: 5.5, caption: `${q.ask} A: ${q.a.label} ya B: ${q.b.label}?`,
          narration: q.askHi,
          headlines: [{ at: 0, lines: [{ text: "AAPKI RAAY:" }, { text: "A YA B?", tone: "accent2" }] }],
          layers: [...s.layers, P("noteCard", 540, 1080, { depth: 0.7, at: 0.3, enter: "drop", scale: 0.8, data: { title: `SAWAAL ${i + 1}:`, items: [`A: ${q.a.label}`, `B: ${q.b.label}`] } })]
        });
      } else scenes.push({ ...s, id: `ds${k}-${s.id}` });
    }
  }
  const outroAt = scenes.length;
  scenes.push({
    id: "outro", seconds: 8, location: "AAPKA FAISLA", sky: NIGHT, particles: "stars", fig: "OUTRO",
    narration: "अब आपकी बारी। कमेंट में सवाल नंबर और अपना जवाब लिखिए, जैसे एक ए, दो बी। रोज़ नया धर्म संकट शॉर्ट्स पर आता है। सब्सक्राइब कीजिए, एपिक भारत सागा।",
    caption: "Ab aapki baari: comment mein sawaal number aur jawab likhiye, jaise 1A, 2B. Roz naya Dharm Sankat Shorts pe!",
    headlines: [{ at: 0, lines: [{ text: "COMMENT KARO:" }, { text: "1A, 2B, 3A…", tone: "accent2" }] }, { at: 4.4, lines: [{ text: "SUBSCRIBE" }, { text: "EPIC BHARAT SAGA", tone: "accent3" }] }],
    layers: [P("noteCard", 540, 1120, { depth: 0.7, at: 0.4, enter: "drop", data: { title: "ROZ SUBAH:", items: ["NAYA DHARM SANKAT", "SHORTS PE"] } })]
  });
  const b = base!;
  return SagaLongSchema.parse({
    brand: b.brand, handle: b.handle, palette: b.palette, transitionFrames: b.transitionFrames, music: b.music, showCaptions: b.showCaptions,
    tag: "DHARM SANKAT · ", tagAccent: `HAFTA ${n}`,
    seasonTitle: "DHARM SANKAT", seasonSub: `HAFTA ${n} · 7 SAWAAL`,
    introScenes: 1, outroScene: outroAt, chapters,
    scenes: scenes.map((s, i) => ({ ...s, fig: s.fig ?? `SCENE ${i}` }))
  });
}

/** Sunday n (IST): the day Short 7n airs. One year of dates; unwritten weeks fail closed in dharmSankatWeekLong. */
export const DS_LONG_DATES: readonly string[] = Array.from({ length: 52 }, (_, i) =>
  new Date(Date.parse(`${DS_FIRST_SHORT}T00:00:00Z`) + ((i + 1) * DS_WEEK - 1) * 86_400_000).toISOString().slice(0, 10));

/** Weeks fully written right now. */
export const dharmSankatWeeksWritten = () => Math.floor(dharmSankatCount() / DS_WEEK);
