export type AudioRole = "narration" | "music" | "sfx";
export interface AudioCue { id: string; src: string; from: number; durationFrames: number; role: AudioRole; volume?: number | undefined; }
