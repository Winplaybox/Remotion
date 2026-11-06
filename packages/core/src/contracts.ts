export const MASTER_VIDEO = { width: 1080, height: 1920, fps: 30, aspectRatio: "9:16", pixelAspectRatio: 1 } as const;
export type EngineId = "orbit-puzzle" | "traffic-puzzle" | "sanatan-story";
export type SceneKind = "hook" | "setup" | "challenge" | "story" | "reveal" | "cta";
export interface TimelineScene { id: string; kind: SceneKind; durationFrames: number; transitionFrames?: number; }
export interface EngineManifest { id: EngineId; title: string; description: string; defaultDurationFrames: number; scenes: readonly TimelineScene[]; }
export interface RenderProfile { width: number; height: number; fps: number; codec: "h264"; pixelFormat: "yuv420p"; audioCodec: "aac"; }
