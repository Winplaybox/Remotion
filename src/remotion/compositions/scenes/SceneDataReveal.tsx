import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { DESIGN } from "../../designSystem";
import { SafeZone, useSpring, SourceTag } from "../shared/CADGrid";
import { KineticCaptions } from "../shared/KineticCaptions";

interface Props {
  label: string;
  aiValue: number;
  aiLabel: string;
  unit: string;
  source: string;
  caption: string;
  humanValue?: number;
  prefix?: string;
  accentColor?: string;
}

export const SceneDataReveal: React.FC<Props> = ({
  label, aiValue, aiLabel, unit, source, caption, humanValue, prefix = "", accentColor = DESIGN.colors.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelIn = useSpring(frame, fps, 0, "smooth");
  const numIn = useSpring(frame, fps, 15, "snappy");
  const humanIn = useSpring(frame, fps, 40, "smooth");

  const animated = interpolate(frame, [15, 70], [0, aiValue], { extrapolateRight: "clamp" });
  const displayVal = aiValue % 1 === 0 ? Math.round(animated).toString() : animated.toFixed(1);

  return (
    <AbsoluteFill>
      <SafeZone>
        <div style={{ fontFamily: DESIGN.fonts.mono, fontSize: 24, color: DESIGN.colors.textSecondary, letterSpacing: "0.08em", opacity: labelIn, textAlign: "center", marginBottom: 16 }}>
          {label}
        </div>

        <div style={{ fontFamily: DESIGN.fonts.display, fontSize: 112, fontWeight: 800, color: accentColor, opacity: numIn, lineHeight: 1, letterSpacing: "-0.02em" }}>
          {prefix}{displayVal}{unit}
        </div>

        {aiLabel ? (
          <div style={{ fontFamily: DESIGN.fonts.sans, fontSize: 26, color: DESIGN.colors.textSecondary, opacity: numIn * 0.8, marginTop: 8 }}>{aiLabel}</div>
        ) : null}

        {humanValue !== undefined ? (
          <div style={{ marginTop: 32, opacity: humanIn, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 3, background: DESIGN.colors.accentWarm }} />
            <div style={{ fontFamily: DESIGN.fonts.sans, fontSize: 28, color: DESIGN.colors.accentWarm }}>
              Human baseline: {humanValue}{unit}
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 24 }}>
          <SourceTag text={source} />
        </div>
      </SafeZone>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 190 }}>
        <KineticCaptions text={caption} startFrame={0} fontSize={28} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
