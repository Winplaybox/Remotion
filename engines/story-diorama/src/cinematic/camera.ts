import { Easing, interpolate } from "remotion";

/**
 * CINEMATIC 2.5D CAMERA (proof of concept, isolated — not used by any channel yet).
 * A shot is a set of depth planes. The camera has x/y (px, screen space at depth 1), zoom z and a focus depth.
 * A plane at depth d moves by camera offset * d and scales by z^d, so near planes move more than far ones (parallax).
 * Blur grows with |d - focus| (depth of field). Everything is a pure function of the frame: render-safe and deterministic.
 */
export interface Cam { x: number; y: number; z: number; focus: number; dof: number; shake: number }
export interface CamKey extends Partial<Cam> { at: number }

const BASE: Cam = { x: 0, y: 0, z: 1, focus: 1, dof: 0, shake: 0 };
const EASE = Easing.bezier(0.45, 0, 0.2, 1);

/** Camera at frame f (relative to the shot) from keyframes (frames, relative). Missing values hold the previous key. */
export function camAt(keys: CamKey[], f: number): Cam {
  const filled: (Cam & { at: number })[] = [];
  let prev: Cam = BASE;
  for (const k of keys) { prev = { ...prev, ...k }; filled.push({ ...prev, at: k.at }); }
  if (f <= filled[0]!.at) return filled[0]!;
  for (let i = 1; i < filled.length; i++) {
    const a = filled[i - 1]!, b = filled[i]!;
    if (f <= b.at) {
      const t = interpolate(f, [a.at, b.at], [0, 1], { easing: EASE, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const mix = (p: number, q: number) => p + (q - p) * t;
      return { x: mix(a.x, b.x), y: mix(a.y, b.y), z: mix(a.z, b.z), focus: mix(a.focus, b.focus), dof: mix(a.dof, b.dof), shake: mix(a.shake, b.shake) };
    }
  }
  return filled.at(-1)!;
}

/** CSS transform + filter for a plane at depth d. */
export function planeStyle(cam: Cam, d: number, f: number): { transform: string; filter: string } {
  const sx = cam.shake ? Math.sin(f * 1.7) * cam.shake * d + Math.sin(f * 3.1) * cam.shake * 0.5 * d : 0;
  const sy = cam.shake ? Math.cos(f * 2.3) * cam.shake * d : 0;
  const s = Math.pow(cam.z, d);
  const blur = Math.min(14, Math.abs(d - cam.focus) * cam.dof);
  return {
    transform: `translate(540px, 960px) scale(${s}) translate(${-cam.x * d + sx}px, ${-cam.y * d + sy}px) translate(-540px, -960px)`,
    filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "none"
  };
}
