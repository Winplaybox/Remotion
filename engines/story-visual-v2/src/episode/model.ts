import { mindNestText, type MindNestLang } from "../../../../content/mindnest/fables";
import { STORY_STYLES, type StoryStyleId } from "../presets";
import { episodeArtFor } from "./art";

/**
 * MindNest episode (StoryVisualEngine V2): hook/title -> four story pages -> moral -> goodbye, one art plate + pose
 * cut-outs per page, durations fitted to each page's narration.
 *
 * `scenes` deliberately has the same shape scripts/post.ts already fills for narrated channels (`narration`, `seconds`,
 * `audio`), so the channel pipeline narrates scene-N.wav and stretches scenes to the voice without any new code path.
 */

export type EpisodePageKind = "title" | "story" | "moral" | "goodbye";

/** One caption chunk (<= 2 lines) and when it is spoken, in seconds from the start of the page's audio. */
export interface EpisodeCue { text: string; start: number; end: number }

export interface EpisodeScene {
  kind: EpisodePageKind;
  /** Spoken text (also the caption source when no cues are given). */
  narration: string;
  /** Page length in seconds (estimate; stretched to the voice in calculateMetadata / post.ts). */
  seconds: number;
  /** Narration audio under public/. */
  audio?: string;
  /** Measured audio length (seconds); filled in by calculateMetadata when absent. */
  audioSeconds?: number;
  /** Exact caption timings when the voice was generated per chunk (scripts/mindnest-v2-voice.ts). */
  cues?: EpisodeCue[];
}

export interface MindNestEpisodeProps {
  lang: MindNestLang;
  fable: number;
  /** StoryVisualEngine V2 preset. Named `storyStyle` because channels/looks.ts writes its own `style` prop. */
  storyStyle: StoryStyleId;
  brand: string;
  title: [string, string];
  moralLabel: string;
  moral: [string, string];
  scenes: EpisodeScene[];
  /** Background music under public/ (looped, ducked under the voice). Empty = none. */
  music: string;
  [extra: string]: unknown;
}

export const EPISODE_FPS = 30;
/** Silence before / after each page's voice and the cross-dissolve overlap between pages. */
export const LEAD = 0.3;
export const TAIL = 0.45;
export const XFADE_FRAMES = 16;
/** The hook must be short: Shorts viewers decide in ~1.5 s. */
export const TITLE_MIN = 1.5;
export const TITLE_LEAD = 0.12;

export const DEFAULT_MUSIC = "mindnest-v2/audio/music-box-loop.mp3";

/** Rough speaking rate used before any audio exists (Studio preview, dry runs). */
const estimate = (text: string) => Math.max(2.5, Math.round((text.length / 13) * 10) / 10);

/** Fails closed: a fable/style without hand-made art throws instead of rendering a mismatched episode. */
export function assertEpisodeArt(style: StoryStyleId, fable: number): void {
  if (!episodeArtFor(style, fable)) {
    throw new Error(`MindNest V2: no episode art for fable ${fable} in style "${style}" (public/${STORY_STYLES[style].assetDir}/fable-${fable}/). Add art to engines/story-visual-v2/src/episode/art.ts or render this post with MINDNEST_ENGINE=legacy.`);
  }
}

export function mindNestEpisode(lang: MindNestLang, fable: number, storyStyle: StoryStyleId = "storybook-classic", opts: { requireArt?: boolean } = {}): MindNestEpisodeProps {
  if (opts.requireArt) assertEpisodeArt(storyStyle, fable);
  const t = mindNestText(lang, fable);
  const title = `${t.title[0]} ${t.title[1]}`;
  const scenes: EpisodeScene[] = [
    { kind: "title", narration: title, seconds: TITLE_MIN },
    ...t.story.map((s): EpisodeScene => ({ kind: "story", narration: s, seconds: estimate(s) })),
    { kind: "moral", narration: t.moralSpoken, seconds: estimate(t.moralSpoken) + 1 },
    { kind: "goodbye", narration: t.goodbye, seconds: estimate(t.goodbye) + 0.8 }
  ];
  return { lang, fable, storyStyle, brand: "MINDNEST TALES", title: t.title, moralLabel: t.moralLabel, moral: t.moral, scenes, music: DEFAULT_MUSIC };
}

export interface PageSlot { index: number; from: number; frames: number; voiceAt: number; voiceFrames: number }

/** Seconds a page needs: its voice plus breathing room (never shorter than the planned `seconds`). */
export function pageSeconds(s: EpisodeScene): number {
  if (s.kind === "title") return Math.max(TITLE_MIN, TITLE_LEAD + (s.audioSeconds ?? 0) + 0.35);
  const voice = s.audioSeconds ?? 0;
  const hold = s.kind === "moral" ? 0.9 : s.kind === "goodbye" ? 1.2 : 0;
  return Math.max(voice ? 0 : s.seconds, LEAD + voice + TAIL + hold);
}

/**
 * Frame layout. Cut points c0 = 0, c(i+1) = c(i) + body(i). Page i is drawn from c(i) for body(i) frames plus
 * XFADE_FRAMES more (unless last), during which page i+1 dissolves in on top of it. Page i's voice starts after its own
 * dissolve has finished, so two voices never overlap and no word is spoken over a half-faded picture.
 */
export function episodeTimeline(p: Pick<MindNestEpisodeProps, "scenes">, fps = EPISODE_FPS): { slots: PageSlot[]; total: number } {
  const slots: PageSlot[] = [];
  let cut = 0;
  p.scenes.forEach((s, i) => {
    const fade = i === 0 ? 0 : XFADE_FRAMES;
    const body = fade + Math.round(pageSeconds(s) * fps);
    const last = i === p.scenes.length - 1;
    const voiceAt = fade + Math.round((s.kind === "title" ? TITLE_LEAD : LEAD) * fps);
    slots.push({ index: i, from: cut, frames: body + (last ? 0 : XFADE_FRAMES), voiceAt, voiceFrames: Math.round((s.audioSeconds ?? 0) * fps) });
    cut += body;
  });
  return { slots, total: Math.max(1, cut) };
}

export const episodeDuration = (p: Pick<MindNestEpisodeProps, "scenes">, fps = EPISODE_FPS) => episodeTimeline(p, fps).total;

/** Spans (frames) where a voice is speaking: the music ducks under these. */
export function voiceSpans(p: Pick<MindNestEpisodeProps, "scenes">, fps = EPISODE_FPS): [number, number][] {
  return episodeTimeline(p, fps).slots.filter((s) => s.voiceFrames > 0).map((s) => [s.from + s.voiceAt, s.from + s.voiceAt + s.voiceFrames]);
}
