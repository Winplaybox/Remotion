import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { DESIGN } from "../../designSystem";

interface Props {
  text: string;
  startFrame?: number;
  fontSize?: number;
  highlightColor?: string;
}

/**
 * Word-by-word kinetic captions synced to the current Sequence's frame.
 * Distributes words evenly across the sequence duration — good enough
 * approximation without forced-alignment; replace with real alignment
 * data in Phase 5 if needed.
 */
export const KineticCaptions: React.FC<Props> = ({
  text,
  startFrame = 0,
  fontSize = 34,
  highlightColor = DESIGN.colors.accent,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const words = text.split(" ");

  const activeFrame = frame - startFrame;
  const perWord = Math.max(1, (durationInFrames - startFrame) / words.length);
  const activeIndex = Math.floor(activeFrame / perWord);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 10px",
        maxWidth: 880,
        fontFamily: DESIGN.fonts.sans,
        fontSize,
        fontWeight: 700,
        lineHeight: 1.4,
      }}
    >
      {words.map((word, i) => {
        const wordStart = startFrame + i * perWord;
        const opacity = interpolate(frame, [wordStart, wordStart + 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const isActive = i === activeIndex;
        return (
          <span
            key={i}
            style={{
              opacity,
              color: isActive ? highlightColor : DESIGN.colors.textPrimary,
              transition: "none",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
