import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { DESIGN } from "../../designSystem";
import { SafeZone, useSpring } from "../shared/CADGrid";
import { KineticCaptions } from "../shared/KineticCaptions";

interface Props {
  caption: string;
}

/** Opening "what if" hook — question mark builds tension before the reveal */
export const SceneHook: React.FC<Props> = ({ caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const qMark = useSpring(frame, fps, 0, "bouncy");
  const qScale = 0.7 + qMark * 0.3;
  const glow = 0.4 + Math.sin(frame * 0.1) * 0.2;

  return (
    <AbsoluteFill style={{ background: "#000000" }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: DESIGN.fonts.display,
            fontSize: 220,
            fontWeight: 800,
            color: DESIGN.colors.accent,
            opacity: qMark,
            transform: `scale(${qScale})`,
            textShadow: `0 0 ${60 * glow}px ${DESIGN.colors.accent}`,
          }}
        >
          ?
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 220 }}>
        <KineticCaptions text={caption} startFrame={20} fontSize={36} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
