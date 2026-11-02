import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface SpatialTypographyProps {
  title: string;
  subtitle?: string;
  accentWord?: string;
  delay?: number;
}

export const SpatialTypography: React.FC<SpatialTypographyProps> = ({
  title,
  subtitle,
  accentWord,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.8 },
  });

  const titleScale = interpolate(titleProgress, [0, 1], [0.85, 1]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);

  const words = title.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        transform: `translateY(${titleY}px) scale(${titleScale})`,
        opacity: titleOpacity,
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "12px",
          maxWidth: "920px",
        }}
      >
        {words.map((w, i) => {
          const isAccent = accentWord && w.toLowerCase().includes(accentWord.toLowerCase());
          return (
            <span
              key={i}
              style={{
                fontSize: "76px",
                fontWeight: 900,
                letterSpacing: "-2px",
                lineHeight: "1.08",
                textTransform: "uppercase",
                background: isAccent
                  ? "linear-gradient(135deg, #00F5FF 0%, #7928CA 100%)"
                  : "linear-gradient(180deg, #FFFFFF 0%, #C8D1DC 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: isAccent
                  ? "0 0 35px rgba(0, 245, 255, 0.45)"
                  : "0 4px 20px rgba(0,0,0,0.6)",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>

      {subtitle && (
        <div
          style={{
            marginTop: "20px",
            fontSize: "30px",
            fontWeight: 500,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#00F5FF",
            opacity: 0.9,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ width: "24px", height: "2px", background: "#00F5FF" }} />
          {subtitle}
          <span style={{ width: "24px", height: "2px", background: "#00F5FF" }} />
        </div>
      )}
    </div>
  );
};
