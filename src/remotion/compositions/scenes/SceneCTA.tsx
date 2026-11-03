import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { DESIGN } from "../../designSystem";
import { SafeZone, useSpring } from "../shared/CADGrid";
import { KineticCaptions } from "../shared/KineticCaptions";

/** Strong CTA: explicit comment word + follow ask + animated subscribe */
export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = 1 + Math.sin(frame * 0.15) * 0.06;
  const ring = useSpring(frame, fps, 0, "bouncy");
  const commentIn = useSpring(frame, fps, 10, "snappy");
  const followIn = useSpring(frame, fps, 30, "snappy");

  return (
    <AbsoluteFill style={{ background: DESIGN.colors.bgDeep }}>
      <SafeZone>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: DESIGN.colors.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${ring * pulse})`,
            marginBottom: 32,
            boxShadow: `0 0 40px ${DESIGN.colors.accent}66`,
          }}
        >
          <div style={{ fontFamily: DESIGN.fonts.display, fontSize: 40, fontWeight: 800, color: "#07090E" }}>+</div>
        </div>

        <div
          style={{
            opacity: commentIn,
            background: DESIGN.colors.bgSurface,
            border: `2px solid ${DESIGN.colors.accentWarm}`,
            borderRadius: 12,
            padding: "16px 28px",
            marginBottom: 24,
          }}
        >
          <div style={{ fontFamily: DESIGN.fonts.display, fontSize: 32, fontWeight: 800, color: DESIGN.colors.accentWarm, textAlign: "center" }}>
            Comment "AI" 👇
          </div>
        </div>

        <div style={{ opacity: followIn, textAlign: "center" }}>
          <div style={{ fontFamily: DESIGN.fonts.display, fontSize: 30, fontWeight: 700, color: DESIGN.colors.textPrimary, lineHeight: 1.4 }}>
            Follow for Part 2:{"\n"}AI ki chhupi hui cost
          </div>
          <div style={{ fontFamily: DESIGN.fonts.mono, fontSize: 20, letterSpacing: "0.2em", color: DESIGN.colors.accent, marginTop: 20 }}>
            AI & TECH EXPLAINED
          </div>
        </div>
      </SafeZone>
    </AbsoluteFill>
  );
};
