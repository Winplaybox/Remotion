import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { useStoryFonts } from "../fonts";
import { STORY_STYLES } from "../presets";
import { SceneLayer } from "../SceneLayer";
import { episodeArtFor } from "./art";
import { EpisodePage, TitleArt } from "./EpisodeScene";
import { EpisodeUI } from "./EpisodeUI";
import { episodeDuration, episodeTimeline, voiceSpans, XFADE_FRAMES, type MindNestEpisodeProps } from "./model";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Page wrapper: soft cross-dissolve with a slight page-turn drift (no zoom). */
const Dissolve: React.FC<{ first: boolean; children: React.ReactNode }> = ({ first, children }) => {
  const f = useCurrentFrame();
  if (first) return <AbsoluteFill>{children}</AbsoluteFill>;
  const k = interpolate(f, [0, XFADE_FRAMES], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  return <AbsoluteFill style={{ opacity: k, transform: `translateX(${(1 - k) * 36}px)` }}>{children}</AbsoluteFill>;
};

/**
 * MindNest Tales full episode on StoryVisualEngine V2.
 * Art (per-page plates + pose cut-outs, language-free) -> one persistent text layer -> voice per page + ducked music.
 * Without hand-made art for (style, fable) it falls back to the preset's single plate on every page (studio preview);
 * the channel resolver refuses that case (fails closed), see content.ts / channels.ts.
 */
export const MindNestEpisodeV2: React.FC<MindNestEpisodeProps> = (p) => {
  useStoryFonts(p.lang);
  const { fps, durationInFrames } = useVideoConfig();
  const s = STORY_STYLES[p.storyStyle] ?? STORY_STYLES["storybook-classic"];
  const art = episodeArtFor(p.storyStyle, p.fable);
  const { slots } = React.useMemo(() => episodeTimeline(p, fps), [p, fps]);
  const spans = React.useMemo(() => voiceSpans(p, fps), [p, fps]);

  // Music: present from frame 0, ducked under every voice span (8-frame ramps), faded out at the end.
  const musicVolume = (f: number) => {
    let duck = 0;
    for (const [a, b] of spans) duck = Math.max(duck, interpolate(f, [a - 8, a, b, b + 10], [0, 1, 1, 0], clamp));
    const out = interpolate(f, [durationInFrames - 36, durationInFrames - 1], [1, 0], clamp);
    return (0.2 - 0.135 * duck) * out;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: s.background.palette.mid }}>
      {slots.map((slot) => {
        const scene = p.scenes[slot.index]!;
        const body = slot.frames - (slot.index === slots.length - 1 ? 0 : XFADE_FRAMES);
        const pageArt = art && scene.kind !== "title" ? art.pages[slot.index - 1] : undefined;
        return (
          <Sequence key={slot.index} from={slot.from} durationInFrames={slot.frames} layout="none">
            <Dissolve first={slot.index === 0}>
              {art && scene.kind === "title" ? <TitleArt art={art} style={s} /> : art && pageArt ? <EpisodePage art={art} page={pageArt} style={s} body={body} /> : <SceneLayer style={s} />}
            </Dissolve>
          </Sequence>
        );
      })}
      <EpisodeUI p={p} style={s} slots={slots} />

      {slots.map((slot) => {
        const a = p.scenes[slot.index]!.audio;
        return a ? (
          <Sequence key={`v${slot.index}`} from={slot.from + slot.voiceAt} layout="none">
            <Audio src={staticFile(a)} />
          </Sequence>
        ) : null;
      })}
      {slots.slice(1).map((slot) => (
        <Sequence key={`t${slot.index}`} from={Math.max(0, slot.from - 4)} durationInFrames={30} layout="none">
          <Audio src={staticFile("sfx/swoosh.mp3")} volume={0.1} />
        </Sequence>
      ))}
      <Sequence from={0} durationInFrames={60} layout="none"><Audio src={staticFile("sfx/bell.mp3")} volume={0.22} /></Sequence>
      {p.music ? <Audio src={staticFile(p.music)} loop volume={musicVolume} /> : null}
    </AbsoluteFill>
  );
};

/** calculateMetadata: measure each page's voice so pages fit it (the voice is never cut, the picture waits). */
export async function withEpisodeAudio(p: MindNestEpisodeProps): Promise<MindNestEpisodeProps> {
  const scenes = await Promise.all(
    p.scenes.map(async (sc) => (sc.audio && sc.audioSeconds === undefined ? { ...sc, audioSeconds: await getAudioDurationInSeconds(staticFile(sc.audio)) } : sc))
  );
  return { ...p, scenes };
}

export const mindNestEpisodeMetadata = async ({ props }: { props: MindNestEpisodeProps }) => {
  const timed = await withEpisodeAudio(props);
  return { durationInFrames: episodeDuration(timed), props: timed };
};
