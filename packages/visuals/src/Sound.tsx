import React from "react";
import { Audio, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";

/** One-shot or looping sound placed on the timeline. Times in seconds; src relative to /public (e.g. "sfx/ding.mp3"). */
export type Sfx = { src: string; at: number; volume?: number; until?: number; loop?: boolean };

/**
 * Background music + SFX for every engine.
 * Music loops for the whole video, fades in/out, and ducks under voice windows ([from, to] seconds).
 */
export const SoundBed: React.FC<{ music?: string | undefined; musicVolume?: number; duck?: readonly [number, number][]; sfx?: readonly Sfx[] }> = ({ music, musicVolume = 0.15, duck = [], sfx = [] }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const end = durationInFrames;
  return (
    <>
      {music ? (
        <Audio
          src={staticFile(music)}
          loop
          volume={(f) => {
            const s = f / fps;
            const fade = interpolate(f, [0, fps * 0.8, end - fps * 1.2, end], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const ducked = duck.some(([a, b]) => s >= a - 0.15 && s <= b + 0.25);
            return musicVolume * fade * (ducked ? 0.4 : 1);
          }}
        />
      ) : null}
      {sfx.map((x, i) => {
        const from = Math.max(0, Math.round(x.at * fps));
        const dur = x.until !== undefined ? Math.max(1, Math.round((x.until - x.at) * fps)) : end - from;
        if (from >= end) return null;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <Audio src={staticFile(x.src)} loop={x.loop} volume={x.volume ?? 0.5} />
          </Sequence>
        );
      })}
    </>
  );
};

/** Voice cues are short lines; treat each as ~2.6 s for ducking. */
export const duckFromCues = (cues: readonly { at: number }[], len = 2.6): [number, number][] => cues.map((c) => [c.at, c.at + len]);
