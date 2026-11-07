import React from "react";
import { Audio, Sequence, staticFile, useVideoConfig } from "remotion";

/** Narration clips placed at fixed times (seconds). src is relative to /public. */
export type VoiceCue = { src: string; at: number };

export const VoiceCues: React.FC<{ cues?: readonly VoiceCue[] }> = ({ cues }) => {
  const { fps } = useVideoConfig();
  if (!cues?.length) return null;
  return (
    <>
      {cues.map((c, i) => (
        <Sequence key={i} from={Math.round(c.at * fps)} layout="none">
          <Audio src={staticFile(c.src)} />
        </Sequence>
      ))}
    </>
  );
};
