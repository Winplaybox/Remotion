import React from "react";
import { useCurrentFrame } from "remotion";

export const AudioWaveform: React.FC<{ barCount?: number; color?: string }> = ({
  barCount = 18,
  color = "#00F5FF",
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        height: "50px",
      }}
    >
      {Array.from({ length: barCount }).map((_, i) => {
        // Pseudo audio reactive wave heights based on frame and index
        const heightMultiplier = Math.abs(Math.sin((frame * 0.18) + (i * 0.4)));
        const height = 10 + heightMultiplier * 36;
        return (
          <div
            key={i}
            style={{
              width: "6px",
              height: `${height}px`,
              borderRadius: "4px",
              background: `linear-gradient(180deg, ${color} 0%, #7928CA 100%)`,
              boxShadow: `0 0 10px ${color}88`,
            }}
          />
        );
      })}
    </div>
  );
};
