import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { DESIGN } from "../../designSystem";
import { SafeZone, useSpring } from "../shared/CADGrid";

export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const title = useSpring(frame, fps, 0, "heavy");
  const titleY = (1 - title) * 80;
  const sub = useSpring(frame, fps, 18, "smooth");
  const line = useSpring(frame, fps, 8, "snappy");

  return (
    <AbsoluteFill>
      <SafeZone>
        <div style={{ width: 56, height: 3, background: DESIGN.colors.accent, marginBottom: 28, transformOrigin: "left", transform: `scaleX(${line})` }} />

        <div style={{
          fontFamily: DESIGN.fonts.display,
          fontSize: 68,
          fontWeight: 800,
          color: DESIGN.colors.textPrimary,
          textAlign: "center",
          lineHeight: 1.1,
          opacity: title,
          transform: `translateY(${titleY}px)`,
        }}>
          Sirf 5 Saal Mein{"\n"}AI Ne Insaan Ko{"\n"}Beat Kar Diya
        </div>

        <div style={{
          fontFamily: DESIGN.fonts.sans,
          fontSize: 32,
          color: DESIGN.colors.accent,
          marginTop: 24,
          opacity: sub,
          textAlign: "center",
          fontWeight: 600,
        }}>
          aur yeh sirf shuruat hai
        </div>
      </SafeZone>
    </AbsoluteFill>
  );
};
