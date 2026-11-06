export function clamp(value: number, min = 0, max = 1): number { return Math.min(max, Math.max(min, value)); }
export function lerp(from: number, to: number, progress: number): number { return from + (to - from) * clamp(progress); }
export function smoothstep(progress: number): number { const t = clamp(progress); return t * t * (3 - 2 * t); }
export function easeOutCubic(progress: number): number { return 1 - Math.pow(1 - clamp(progress), 3); }
