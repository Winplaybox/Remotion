import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { DESIGN } from "../designSystem";

/**
 * Phase 1 gate: confirms Remotion renders correctly at 1080×1920 30fps.
 */
export const PhaseOneTestComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleOpacity = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 18, stiffness: 120, mass: 1 },
  });

  const titleY = spring({
    frame,
    fps,
    from: 60,
    to: 0,
    config: { damping: 18, stiffness: 120, mass: 1 },
  });

  const lineScale = spring({
    frame: frame - 12,
    fps,
    from: 0,
    to: 1,
    config: { damping: 22, stiffness: 140, mass: 0.8 },
  });

  const subtitleOpacity = spring({
    frame: frame - 18,
    fps,
    from: 0,
    to: 1,
    config: { damping: 20, stiffness: 100, mass: 1 },
  });

  const progress = frame / durationInFrames;

  return (
    <AbsoluteFill style={{ background: DESIGN.colors.bgDeep }}>
      <GridBackground />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "160px 72px",
        }}
      >
        <div
          style={{
            fontFamily: DESIGN.fonts.mono,
            fontSize: 22,
            letterSpacing: "0.24em",
            color: DESIGN.colors.accent,
            textTransform: "uppercase",
            opacity: subtitleOpacity,
            marginBottom: 24,
          }}
        >
          PDF2SHORTS STUDIO
        </div>

        <div
          style={{
            width: 64,
            height: 2,
            background: DESIGN.colors.accent,
            transformOrigin: "left center",
            transform: `scaleX(${lineScale})`,
            marginBottom: 32,
          }}
        />

        <div
          style={{
            fontFamily: DESIGN.fonts.display,
            fontSize: 72,
            fontWeight: 800,
            color: DESIGN.colors.textPrimary,
            textAlign: "center",
            lineHeight: 1.1,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          PHASE 1{"\n"}RENDER{"\n"}VERIFIED
        </div>

        <div
          style={{
            fontFamily: DESIGN.fonts.sans,
            fontSize: 28,
            color: DESIGN.colors.textSecondary,
            marginTop: 32,
            opacity: subtitleOpacity,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          1080 × 1920 · 30 fps · 9:16
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 160,
            left: 72,
            right: 72,
            height: 3,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 2,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress * 100}%`,
              background: DESIGN.colors.accent,
              borderRadius: 2,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const GridBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = 0.04 + Math.sin(frame * 0.04) * 0.01;

  return (
    <AbsoluteFill>
      <svg width="1080" height="1920" style={{ opacity }}>
        <defs>
          <pattern id="grid" width="54" height="54" patternUnits="userSpaceOnUse">
            <path d="M 54 0 L 0 0 0 54" fill="none" stroke="#4A9EFF" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#grid)" />
      </svg>
    </AbsoluteFill>
  );
};
