import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import type { AudioCue } from "./types";
export const AudioTrack: React.FC<{ cues: readonly AudioCue[] }> = ({ cues }) => (
  <>
    {cues.map((cue) => (
      <Sequence key={cue.id} from={cue.from} durationInFrames={cue.durationFrames}>
        <Audio src={staticFile(cue.src)} volume={cue.volume ?? 1} />
      </Sequence>
    ))}
  </>
);
