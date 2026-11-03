import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { DESIGN } from "../../designSystem";
import { useSpring } from "../shared/CADGrid";
import { KineticCaptions } from "../shared/KineticCaptions";

interface Props {
  caption: string;
}

/** Split-screen "today vs 2030" — the what-if escalation beat */
export const SceneWhatIf: React.FC<Props> = ({ caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const split = useSpring(frame, fps, 0, "smooth");
  const labelIn = useSpring(frame, fps, 10, "snappy");

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ flexDirection: "row", display: "flex" }}>
        <div
          style={{
            width: `${50 * split}%`,
            height: "100%",
            background: DESIGN.colors.bgSurface,
            borderRight: `1px solid ${DESIGN.colors.accent}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ opacity: labelIn, textAlign: "center" }}>
            <div style={{ fontFamily: DESIGN.fonts.mono, fontSize: 20, color: DESIGN.colors.textSecondary, letterSpacing: "0.2em" }}>TODAY</div>
            <div style={{ fontFamily: DESIGN.fonts.display, fontSize: 48, fontWeight: 800, color: DESIGN.colors.textPrimary, marginTop: 8 }}>2024</div>
          </div>
        </div>
        <div
          style={{
            width: `${50 * split}%`,
            height: "100%",
            background: "linear-gradient(135deg, #1a0a2e, #07090E)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ opacity: labelIn, textAlign: "center" }}>
            <div style={{ fontFamily: DESIGN.fonts.mono, fontSize: 20, color: DESIGN.colors.accentPurple, letterSpacing: "0.2em" }}>KYA HOGA?</div>
            <div style={{ fontFamily: DESIGN.fonts.display, fontSize: 48, fontWeight: 800, color: DESIGN.colors.accentPurple, marginTop: 8 }}>2030</div>
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 220 }}>
        <KineticCaptions text={caption} startFrame={0} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
