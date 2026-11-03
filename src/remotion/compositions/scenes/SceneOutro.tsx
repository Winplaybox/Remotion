import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { DESIGN } from "../../designSystem";
import { SafeZone, useSpring } from "../shared/CADGrid";

export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cta = useSpring(frame, fps, 0, "smooth");
  const ctaY = (1 - cta) * 50;
  const logo = useSpring(frame, fps, 20, "smooth");
  const line = useSpring(frame, fps, 10, "snappy");

  return (
    <AbsoluteFill>
      <SafeZone>
        <div style={{ fontFamily: DESIGN.fonts.display, fontSize: 44, fontWeight: 700, color: DESIGN.colors.textPrimary, textAlign: "center", lineHeight: 1.3, opacity: cta, transform: `translateY(${ctaY}px)`, marginBottom: 36 }}>
          Follow karo — next video mein{"\n"}AI ke hidden costs.
        </div>

        <div style={{ width: 48, height: 2, background: DESIGN.colors.accent, transformOrigin: "center", transform: `scaleX(${line})`, marginBottom: 20 }} />

        <div style={{ fontFamily: DESIGN.fonts.mono, fontSize: 22, letterSpacing: "0.24em", color: DESIGN.colors.accent, opacity: logo }}>
          AI & TECH EXPLAINED
        </div>
      </SafeZone>
    </AbsoluteFill>
  );
};
