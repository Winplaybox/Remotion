import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

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

  // Strip any speaker name prefixes like "Aria:" or "Dev:" if present
  const cleanText = text.replace(/^(Aria|Dev):\s*/i, "");
  const words = cleanText.split(" ");

  const activeIdx =
    activeWordIndex !== undefined
      ? activeWordIndex
      : Math.min(Math.floor((frame % 90) / (90 / words.length)), words.length - 1);

  const bounce = spring({
    frame: frame % 15,
    fps,
    config: { damping: 10, stiffness: 120 },
  });
  const popScale = 1 + bounce * 0.08;

  return (
    <div
      style={{
        width: "920px",
        padding: "16px 24px",
        background: "rgba(3, 7, 18, 0.85)",
        backdropFilter: "blur(20px)",
        borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.14)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.8)",
      }}
    >
      {words.map((word, i) => {
        const isActive = i === activeIdx;
        return (
          <span
            key={i}
            style={{
              fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              fontSize: "42px",
              fontWeight: isActive ? 900 : 700,
              color: isActive ? "#FFD700" : "#F8FAFC",
              textTransform: "uppercase",
              transform: isActive ? `scale(${popScale})` : "scale(1)",
              textShadow: isActive
                ? "0 0 25px rgba(255, 215, 0, 0.95), 0 0 45px rgba(255, 215, 0, 0.6)"
                : "0 2px 10px rgba(0, 0, 0, 0.8)",
              padding: "4px 8px",
              borderRadius: "8px",
              background: isActive ? "rgba(255, 215, 0, 0.18)" : "transparent",
              letterSpacing: "-0.5px",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
