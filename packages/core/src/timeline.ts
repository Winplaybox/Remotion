import type { TimelineScene } from "./contracts";
export interface TimelineEntry { scene: TimelineScene; from: number; duration: number; end: number; }
export function buildTimeline(scenes: readonly TimelineScene[]): TimelineEntry[] {
  let cursor = 0;
  return scenes.map((scene) => {
    if (!scene.id.trim()) throw new Error("Scene id cannot be empty");
    if (!Number.isInteger(scene.durationFrames) || scene.durationFrames <= 0) throw new Error(`Scene ${scene.id} must have a positive integer duration`);
    const from = cursor;
    const end = from + scene.durationFrames;
    cursor = end;
    return { scene, from, duration: scene.durationFrames, end };
  });
}
export function secondsToFrames(seconds: number, fps: number): number {
  if (!Number.isFinite(seconds) || seconds < 0) throw new Error("Seconds must be finite and non-negative");
  if (!Number.isInteger(fps) || fps <= 0) throw new Error("FPS must be a positive integer");
  return Math.round(seconds * fps);
}
