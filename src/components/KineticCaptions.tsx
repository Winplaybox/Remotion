import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface KineticCaptionsProps {
  text: string;
  activeWordIndex?: number;
}

export const KineticCaptions: React.FC<KineticCaptionsProps> = ({
  text,
  activeWordIndex,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(" ");
  const activeIdx =
    activeWordIndex !== undefined
      ? activeWordIndex
      : Math.min(Math.floor((frame % 90) / (90 / words.length)), words.length - 1);

  const bounce = spring({
    frame: frame % 15,
    fps,
    config: { damping: 10, stiffness: 120 },
  });
  const popScale = interpolate(bounce, [0, 1], [1, 1.08]);

  return (
    <div
      style={{
        width: "960px",
        padding: "20px 24px",
        background: "rgba(3, 7, 18, 0.75)",
        backdropFilter: "blur(16px)",
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.7)",
      }}
    >
      {words.map((word, i) => {
        const isActive = i === activeIdx;
        return (
          <span
            key={i}
            style={{
              fontFamily: "'Segoe UI', Roboto, sans-serif",
              fontSize: "44px",
              fontWeight: isActive ? 900 : 700,
              color: isActive ? "#FFD700" : "#E2E8F0",
              textTransform: "uppercase",
              transform: isActive ? `scale(${popScale})` : "scale(1)",
              textShadow: isActive
                ? "0 0 25px rgba(255, 215, 0, 0.9), 0 0 40px rgba(255, 215, 0, 0.5)"
                : "none",
              padding: "2px 6px",
              borderRadius: "8px",
              background: isActive ? "rgba(255, 215, 0, 0.15)" : "transparent",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
