import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { ReactNode } from "react";
export const SceneFrame: React.FC<{ children: ReactNode; duration: number; fadeFrames?: number }> = ({ children, duration, fadeFrames = 18 }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, fadeFrames], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [Math.max(0, duration - fadeFrames), duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>{children}</AbsoluteFill>;
};
