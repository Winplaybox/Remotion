import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface FloatingCardProps {
  headline: string;
  body: string;
  badge?: string;
  metrics?: { label: string; value: string }[];
  accentColor?: string;
  delay?: number;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  headline,
  body,
  badge,
  metrics,
  accentColor = "#00F5FF",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 90, mass: 1 },
  });

  // Continuous subtle 2.5D oscillation
  const time = (frame - delay) / 30;
  const floatY = Math.sin(time * 2) * 10;
  const floatTiltX = Math.cos(time * 1.5) * 4;
  const floatTiltY = Math.sin(time * 1.8) * 5;

  const introScale = interpolate(progress, [0, 1], [0.8, 1]);
  const introOpacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        perspective: "1200px",
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "880px",
          padding: "48px 40px",
          background: "linear-gradient(135deg, rgba(16, 24, 40, 0.75) 0%, rgba(9, 14, 26, 0.88) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: "32px",
          border: `1.5px solid ${accentColor}44`,
          boxShadow: `0 24px 60px rgba(0, 0, 0, 0.6), 0 0 30px ${accentColor}22, inset 0 1px 2px rgba(255, 255, 255, 0.15)`,
          transform: `scale(${introScale}) translateY(${floatY}px) rotateX(${floatTiltX}deg) rotateY(${floatTiltY}deg)`,
          opacity: introOpacity,
          transformStyle: "preserve-3d",
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        {badge && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "999px",
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}66`,
              color: accentColor,
              fontSize: "18px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: accentColor,
                boxShadow: `0 0 10px ${accentColor}`,
              }}
            />
            {badge}
          </div>
        )}

        <h3
          style={{
            fontSize: "44px",
            fontWeight: 800,
            color: "#FFFFFF",
            margin: "0 0 16px 0",
            letterSpacing: "-0.5px",
            lineHeight: "1.2",
          }}
        >
          {headline}
        </h3>

        <p
          style={{
            fontSize: "26px",
            lineHeight: "1.5",
            color: "#94A3B8",
            margin: "0 0 28px 0",
          }}
        >
          {body}
        </p>

        {metrics && metrics.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${metrics.length}, 1fr)`,
              gap: "16px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: "24px",
            }}
          >
            {metrics.map((m, idx) => (
              <div key={idx} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 900,
                    color: accentColor,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {m.value}
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginTop: "4px",
                  }}
                >
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
