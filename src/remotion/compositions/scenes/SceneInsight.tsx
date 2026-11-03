import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { DESIGN } from "../../designSystem";
import { SafeZone, useSpring } from "../shared/CADGrid";
import { KineticCaptions } from "../shared/KineticCaptions";

interface Props {
  caption: string;
}

export const SceneInsight: React.FC<Props> = ({ caption }) => {
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
          <div style={{ fontFamily: DESIGN.fonts.display, fontSize: 38, fontWeight: 700, color: DESIGN.colors.textPrimary, lineHeight: 1.35 }}>
            AI insaan se aage nikal chuki hai. Ab sawaal control ka hai.
          </div>
        </div>
      </SafeZone>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 190 }}>
        <KineticCaptions text={caption} startFrame={0} fontSize={28} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
