import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { DESIGN } from "../../designSystem";
import { SafeZone, useSpring } from "../shared/CADGrid";

export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const wordmark = useSpring(frame, fps, 0, "smooth");
  const line = useSpring(frame, fps, 10, "snappy");

  return (
    <AbsoluteFill>
      <SafeZone>
        <div style={{ fontFamily: DESIGN.fonts.mono, fontSize: 22, letterSpacing: "0.28em", color: DESIGN.colors.accent, textTransform: "uppercase", opacity: wordmark }}>
          AI & TECH EXPLAINED
        </div>
        <div style={{ width: 48, height: 2, background: DESIGN.colors.accent, marginTop: 16, transformOrigin: "left", transform: `scaleX(${line})` }} />
        <div style={{ fontFamily: DESIGN.fonts.mono, fontSize: 18, color: DESIGN.colors.textSecondary, marginTop: 12, letterSpacing: "0.12em", opacity: wordmark * 0.6 }}>
          EPISODE 01
        </div>
      </SafeZone>
    </AbsoluteFill>
  );
};
