import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { DESIGN } from "../../designSystem";
import { SafeZone, useSpring } from "../shared/CADGrid";
import { KineticCaptions } from "../shared/KineticCaptions";

interface Props {
  caption: string;
}

/** Curiosity-gap beat: source credibility stamp + title slam */
export const SceneIntro: React.FC<Props> = ({ caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const title = useSpring(frame, fps, 0, "heavy");
  const titleY = (1 - title) * 70;
  const badge = useSpring(frame, fps, 20, "bouncy");

  return (
    <AbsoluteFill style={{ background: DESIGN.colors.bgDeep }}>
      <SafeZone>
        <div style={{
          fontFamily: DESIGN.fonts.display,
          fontSize: 60,
          fontWeight: 800,
          color: DESIGN.colors.textPrimary,
          textAlign: "center",
          lineHeight: 1.15,
          opacity: title,
          transform: `translateY(${titleY}px)`,
          marginBottom: 32,
        }}>
          Ye Sirf{"\n"}Shuruat Hai
        </div>

        <div style={{
          opacity: badge,
          transform: `scale(${badge})`,
          background: DESIGN.colors.bgSurface,
          border: `1px solid ${DESIGN.colors.accentGreen}`,
          borderRadius: 8,
          padding: "10px 20px",
        }}>
          <div style={{ fontFamily: DESIGN.fonts.mono, fontSize: 18, color: DESIGN.colors.accentGreen, letterSpacing: "0.1em" }}>
            ✓ STANFORD AI INDEX 2026
          </div>
        </div>
      </SafeZone>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 180 }}>
        <KineticCaptions text={caption} startFrame={0} fontSize={30} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
