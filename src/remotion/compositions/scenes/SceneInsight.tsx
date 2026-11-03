import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { DESIGN } from "../../designSystem";
import { SafeZone, useSpring } from "../shared/CADGrid";

export const SceneInsight: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const card = useSpring(frame, fps, 0, "smooth");
  const scale = 0.96 + 0.04 * card;

  return (
    <AbsoluteFill style={{ background: DESIGN.colors.bgSurface }}>
      <SafeZone>
        <div style={{
          opacity: card,
          transform: `scale(${scale})`,
          background: `linear-gradient(135deg, ${DESIGN.colors.bgElevated}, ${DESIGN.colors.bgSurface})`,
          border: `1px solid ${DESIGN.colors.accent}44`,
          borderRadius: 16,
          padding: "48px 40px",
          textAlign: "center",
        }}>
          <div style={{ fontFamily: DESIGN.fonts.mono, fontSize: 18, color: DESIGN.colors.accent, letterSpacing: "0.2em", marginBottom: 20 }}>KEY INSIGHT</div>
          <div style={{ fontFamily: DESIGN.fonts.display, fontSize: 42, fontWeight: 700, color: DESIGN.colors.textPrimary, lineHeight: 1.35 }}>
            Benchmarks saturate hote hain — isliye hume AI ke liye naaye, harder tests chahiye.
          </div>
        </div>
      </SafeZone>
    </AbsoluteFill>
  );
};
