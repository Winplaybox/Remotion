/**
 * MOTION LIBRARY — the 16 facial expressions and the 20 actions every character supports.
 * Pure data + math (no React): expressions describe the face, poses describe where the hands go (solved with
 * 2-bone IK so arms never stretch), actions bundle pose + expression + gait + body motion.
 */
export const EXPRESSION_IDS = ["neutral", "happy", "smiling", "laughing", "angry", "sad", "crying", "afraid", "nervous", "stressed", "shocked", "surprised", "suspicious", "confused", "thinking", "evilSmile"] as const;
export type ExpressionId = (typeof EXPRESSION_IDS)[number];
/** Older names still accepted by existing engines. */
export type LegacyExpression = "worried" | "smug";

export type MouthKind = "smile" | "smileBig" | "flat" | "frown" | "openSmall" | "openWide" | "o" | "laugh" | "wavy" | "smirk" | "grit" | "sadOpen";

export interface Expr {
  /** + = inner ends down (angry), − = inner ends up (worried/sad) */
  browTilt: number;
  browLift: number;
  /** extra lift on the right brow only (suspicious / confused) */
  browAsym?: number;
  eyeOpen: number;
  /** draw white eyeballs (wide-eyed / looking sideways) */
  eyeWhite?: boolean;
  /** pupil size multiplier */
  pupil?: number;
  mouth: MouthKind;
  tears?: boolean;
  sweat?: boolean;
  blush?: boolean;
  vein?: boolean;
  /** tiny lid line so the eyes read as narrowed */
  squint?: boolean;
}

export const EXPRESSIONS: Record<ExpressionId | LegacyExpression, Expr> = {
  neutral: { browTilt: 0, browLift: 0, eyeOpen: 1, mouth: "flat" },
  happy: { browTilt: -2, browLift: -3, eyeOpen: 1, mouth: "smileBig", blush: true },
  smiling: { browTilt: -1, browLift: -1, eyeOpen: 0.95, mouth: "smile" },
  laughing: { browTilt: -3, browLift: -5, eyeOpen: 0.35, mouth: "laugh", blush: true, squint: true },
  angry: { browTilt: 13, browLift: 2, eyeOpen: 0.8, mouth: "grit", vein: true },
  sad: { browTilt: -11, browLift: -2, eyeOpen: 0.85, mouth: "frown" },
  crying: { browTilt: -12, browLift: -2, eyeOpen: 0.45, mouth: "sadOpen", tears: true, squint: true },
  afraid: { browTilt: -10, browLift: -9, eyeOpen: 1.35, eyeWhite: true, pupil: 0.55, mouth: "openWide", sweat: true },
  nervous: { browTilt: -8, browLift: -3, eyeOpen: 1.05, eyeWhite: true, pupil: 0.8, mouth: "wavy", sweat: true },
  stressed: { browTilt: -9, browLift: 1, eyeOpen: 0.9, mouth: "wavy", sweat: true },
  shocked: { browTilt: 0, browLift: -12, eyeOpen: 1.5, eyeWhite: true, pupil: 0.45, mouth: "o" },
  surprised: { browTilt: 2, browLift: -9, eyeOpen: 1.3, eyeWhite: true, pupil: 0.7, mouth: "openSmall" },
  suspicious: { browTilt: 6, browLift: 0, browAsym: -7, eyeOpen: 0.55, eyeWhite: true, pupil: 0.95, mouth: "flat", squint: true },
  confused: { browTilt: -5, browLift: -2, browAsym: -8, eyeOpen: 1, mouth: "wavy" },
  thinking: { browTilt: 3, browLift: -1, browAsym: -3, eyeOpen: 0.85, mouth: "flat" },
  evilSmile: { browTilt: 10, browLift: 1, eyeOpen: 0.6, mouth: "smirk", squint: true },
  // legacy aliases (kept so existing engines look the same)
  worried: { browTilt: -9, browLift: 0, eyeOpen: 1, mouth: "flat", sweat: true },
  smug: { browTilt: 5, browLift: 2, eyeOpen: 0.85, mouth: "smirk" }
};

// ---------------------------------------------------------------------------------------------------------------
// ARMS: right-arm coordinates, x positive = outward for the arm's own side. Shoulder is at (60, −338).
// ---------------------------------------------------------------------------------------------------------------
export const POSE_IDS = ["idle", "talk", "point", "think", "shock", "wave", "handsUp", "shrug", "hipHand", "clasp", "handsHead", "handsFace", "scratch", "fold", "forward", "cheer", "wipe"] as const;
export type PoseId = (typeof POSE_IDS)[number];
/** legacy name used by older engines */
export type Pose = PoseId;
export type Hand = readonly [x: number, y: number, outward: 1 | -1];
export interface PoseSpec { r: Hand; l: Hand }

export const POSES: Record<PoseId, PoseSpec> = {
  idle: { r: [86, -170, 1], l: [86, -170, 1] },
  talk: { r: [138, -318, 1], l: [88, -172, 1] },
  point: { r: [255, -372, 1], l: [64, -238, 1] },
  think: { r: [14, -390, -1], l: [30, -316, 1] },
  shock: { r: [112, -452, 1], l: [112, -452, 1] },
  wave: { r: [150, -495, 1], l: [88, -172, 1] },
  handsUp: { r: [108, -566, 1], l: [108, -566, 1] },
  shrug: { r: [140, -276, 1], l: [140, -276, 1] },
  hipHand: { r: [66, -238, 1], l: [66, -238, 1] },
  clasp: { r: [6, -262, 1], l: [6, -262, 1] },
  handsHead: { r: [44, -508, 1], l: [44, -508, 1] },
  handsFace: { r: [34, -432, 1], l: [34, -432, 1] },
  scratch: { r: [40, -526, 1], l: [92, -190, 1] },
  fold: { r: [-30, -292, -1], l: [-30, -276, -1] },
  forward: { r: [92, -268, 1], l: [92, -268, 1] },
  cheer: { r: [118, -590, 1], l: [118, -590, 1] },
  wipe: { r: [30, -440, 1], l: [88, -176, 1] }
};

export const ACTION_IDS = ["idle", "walk", "run", "talk", "smile", "laugh", "think", "point", "surprised", "afraid", "nervous", "stressed", "angry", "cry", "confused", "suspicious", "sneak", "lookLeft", "lookRight", "celebrate"] as const;
export type ActionId = (typeof ACTION_IDS)[number];

export type Gait = "walk" | "run" | "sneak";
export type BodyMotion = "none" | "laugh" | "tremble" | "sway" | "jump" | "sob" | "headShake" | "hop" | "fidget";

export interface ActionSpec {
  pose: PoseId;
  expression: ExpressionId;
  talking?: boolean;
  gait?: Gait;
  /** −1 left … +1 right, or "scan" to look around */
  look?: number | "scan";
  motion: BodyMotion;
  /** the held prop stays in the right hand */
  prop: boolean;
  /** frames in one loop (every periodic term divides it, so exports loop without a jump) */
  loop: number;
}

export const ACTIONS: Record<ActionId, ActionSpec> = {
  idle: { pose: "idle", expression: "neutral", motion: "none", prop: true, loop: 96 },
  walk: { pose: "idle", expression: "smiling", gait: "walk", motion: "none", prop: true, loop: 32 },
  run: { pose: "idle", expression: "happy", gait: "run", motion: "none", prop: true, loop: 16 },
  talk: { pose: "talk", expression: "smiling", talking: true, motion: "none", prop: true, loop: 48 },
  smile: { pose: "idle", expression: "smiling", motion: "none", prop: true, loop: 96 },
  laugh: { pose: "hipHand", expression: "laughing", talking: false, motion: "laugh", prop: false, loop: 24 },
  think: { pose: "think", expression: "thinking", motion: "sway", prop: false, loop: 96 },
  point: { pose: "point", expression: "neutral", motion: "none", prop: false, loop: 48 },
  surprised: { pose: "shock", expression: "surprised", motion: "hop", prop: false, loop: 48 },
  afraid: { pose: "handsFace", expression: "afraid", motion: "tremble", prop: false, loop: 12 },
  nervous: { pose: "clasp", expression: "nervous", motion: "fidget", prop: false, loop: 48 },
  stressed: { pose: "handsHead", expression: "stressed", motion: "sway", prop: false, loop: 48 },
  angry: { pose: "hipHand", expression: "angry", motion: "headShake", prop: false, loop: 24 },
  cry: { pose: "wipe", expression: "crying", motion: "sob", prop: false, loop: 24 },
  confused: { pose: "scratch", expression: "confused", motion: "sway", prop: false, loop: 96 },
  suspicious: { pose: "fold", expression: "suspicious", look: "scan", motion: "none", prop: false, loop: 96 },
  sneak: { pose: "forward", expression: "suspicious", gait: "sneak", look: "scan", motion: "none", prop: true, loop: 48 },
  lookLeft: { pose: "idle", expression: "neutral", look: -1, motion: "none", prop: true, loop: 48 },
  lookRight: { pose: "idle", expression: "neutral", look: 1, motion: "none", prop: true, loop: 48 },
  celebrate: { pose: "cheer", expression: "happy", motion: "jump", prop: false, loop: 24 }
};

/** The 16-expression library is shown/exported on `idle` with its own face. */
export const EMOTION_ACTIONS: ActionId[] = ["surprised", "afraid", "nervous", "stressed", "angry", "cry", "confused", "suspicious", "celebrate", "laugh", "smile", "think"];

// ---------------------------------------------------------------------------------------------------------------
// 2-bone IK (shoulder → elbow → hand), lengths fixed so arms never stretch.
// ---------------------------------------------------------------------------------------------------------------
export const UPPER = 92;
export const FORE = 86;
export const SHOULDER = { x: 60, y: -338 } as const;

export interface Arm { sx: number; sy: number; ex: number; ey: number; hx: number; hy: number }

/** side: +1 right arm, −1 left arm. `hand` is in own-side coordinates (x outward-positive). */
export function solveArm(side: 1 | -1, hand: Hand, dx = 0, dy = 0): Arm {
  const sx = side * SHOULDER.x;
  const sy = SHOULDER.y;
  let tx = side * (hand[0] + dx);
  let ty = hand[1] + dy;
  let vx = tx - sx;
  let vy = ty - sy;
  let d = Math.hypot(vx, vy);
  const maxD = UPPER + FORE - 0.6;
  const minD = Math.abs(UPPER - FORE) + 1;
  if (d > maxD) { vx *= maxD / d; vy *= maxD / d; d = maxD; }
  if (d < minD) { vx = (vx / (d || 1)) * minD; vy = (vy / (d || 1)) * minD; d = minD; }
  tx = sx + vx;
  ty = sy + vy;
  const a = (UPPER * UPPER - FORE * FORE + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, UPPER * UPPER - a * a));
  const ux = vx / d;
  const uy = vy / d;
  const px = -uy;
  const py = ux;
  const e1x = sx + a * ux + h * px;
  const e1y = sy + a * uy + h * py;
  const e2x = sx + a * ux - h * px;
  const e2y = sy + a * uy - h * py;
  const out1 = e1x * side;
  const out2 = e2x * side;
  let pick1: boolean;
  if (Math.abs(out1 - out2) < 1.5) pick1 = hand[2] > 0 ? e1y > e2y : e1y < e2y;
  else pick1 = hand[2] > 0 ? out1 > out2 : out1 < out2;
  return { sx, sy, ex: pick1 ? e1x : e2x, ey: pick1 ? e1y : e2y, hx: tx, hy: ty };
}
