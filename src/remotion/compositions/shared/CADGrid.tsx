import React from "react";
import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { DESIGN } from "../../designSystem";

/** Persistent CAD-grid background — renders behind all scenes */
export const CADGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.06 + Math.sin(frame * 0.03) * 0.015;

  return (
    <AbsoluteFill style={{ zIndex: DESIGN.z.gridBg, pointerEvents: "none" }}>
      <svg width="1080" height="1920" style={{ opacity: pulse }}>
        <defs>
          <pattern id="cad" width="54" height="54" patternUnits="userSpaceOnUse">
            <path d="M 54 0 L 0 0 0 54" fill="none" stroke="#4A9EFF" strokeWidth="0.5" />
          </pattern>
          <pattern id="cad-major" width="270" height="270" patternUnits="userSpaceOnUse">
            <path d="M 270 0 L 0 0 0 270" fill="none" stroke="#4A9EFF" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#cad)" />
        <rect width="1080" height="1920" fill="url(#cad-major)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Reusable spring helper with DESIGN presets */
export function useSpring(frame: number, fps: number, delay = 0, preset: keyof typeof DESIGN.springs = "smooth") {
  return spring({
    frame: frame - delay,
    fps,
    from: 0,
    to: 1,
    config: DESIGN.springs[preset],
  });
}

/** Safe-zone wrapper — all content scenes use this */
export const SafeZone: React.FC<{ children: React.ReactNode; centerV?: boolean }> = ({ children, centerV = true }) => (
  <AbsoluteFill
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: centerV ? "center" : "flex-start",
      paddingTop: DESIGN.safeZone.top,
      paddingBottom: DESIGN.safeZone.bottom,
      paddingLeft: DESIGN.safeZone.left,
      paddingRight: DESIGN.safeZone.right,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Small source citation line */
export const SourceTag: React.FC<{ text: string; opacity?: number }> = ({ text, opacity = 0.5 }) => (
  <div
    style={{
      fontFamily: DESIGN.fonts.mono,
      fontSize: 18,
      color: DESIGN.colors.textMuted,
      letterSpacing: "0.06em",
      opacity,
      marginTop: 12,
    }}
  >
    ↑ {text}
  </div>
);
