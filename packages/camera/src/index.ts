import { interpolate } from "remotion";
import type { CSSProperties } from "react";
export interface CameraMove { fromFrame: number; toFrame: number; fromScale?: number; toScale?: number; fromX?: number; toX?: number; fromY?: number; toY?: number; }
export function cameraStyle(frame: number, move: CameraMove): CSSProperties {
  const scale = interpolate(frame, [move.fromFrame, move.toFrame], [move.fromScale ?? 1, move.toScale ?? 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(frame, [move.fromFrame, move.toFrame], [move.fromX ?? 0, move.toX ?? 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(frame, [move.fromFrame, move.toFrame], [move.fromY ?? 0, move.toY ?? 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`, transformOrigin: "50% 50%" };
}
