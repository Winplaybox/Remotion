import React from "react";
import { random } from "remotion";
import { OUTLINE, type FullLook, type Look } from "./presets";
import { lookOf, type CastId } from "./cast";
import { ACTIONS, EXPRESSIONS, POSES, solveArm, UPPER, FORE, type ActionId, type Arm, type ExpressionId, type Hand, type LegacyExpression, type PoseId } from "./motion";
import {
  BackHair, BackpackBehind, BackpackStraps, BodyAccessories, FaceAccessories, FacialHairArt, FrontHair, HeadShape, Headwear, NoseArt, OnHead, PropArt, SLEEVE, Torso, headMetrics
} from "./parts";

/**
 * CHARACTER RIG v2 — flat-vector Indian cartoon characters built from parts (no images, no external service).
 *
 * <Character look="seth" action="walk" frame={frame} />               // one of the 20 actions (loops cleanly)
 * <Character look="seth" action="talk" expression="angry" talking />   // action + expression override
 * <Character look="seth" pose="talk" expression="smug" talking />      // legacy pose API (still works)
 *
 * Origin = point between the feet; the body is ~560 px tall at height 1 (scale with an outer <g transform>).
 * Identity is stable: the head, torso and limb anchor points never change between actions, arms are 2-bone IK with fixed
 * bone lengths (no stretching) and every periodic motion divides the action's `loop` length, so a sprite sheet of `loop`
 * frames repeats without a jump. Set `exportMode` for sprite export (no random blink, no seed-based phase offset).
 */
export type Pose = PoseId;
export type Expression = ExpressionId | LegacyExpression;

export interface CharacterProps {
  look: CastId | Look | FullLook;
  /** one of the 20 actions (pose + expression + gait + motion). Explicit `pose` / `expression` / `talking` override it. */
  action?: ActionId;
  pose?: Pose;
  expression?: Expression;
  /** Lip-sync on: mouth moves in a speech-like pattern. */
  talking?: boolean;
  /** Optional explicit mouth opening 0..1 (e.g. from voice loudness); overrides `talking`. */
  mouth?: number;
  frame: number;
  seed?: string;
  /** 1 = faces viewer slightly right (default), -1 = mirrored */
  facing?: 1 | -1;
  /** deterministic sprite-export mode: no blink, no seed offset */
  exportMode?: boolean;
  /** extra frames in the loop override (default: the action's own loop length) */
  loop?: number;
}

const TAU = Math.PI * 2;
const lum = (hex: string) => {
  const h = hex.replace("#", "");
  if (h.length < 6) return 0;
  const n = parseInt(h.slice(0, 6), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};
const HELD_UP = ["magnifier", "clipboard", "mic", "phone", "ledger", "ladle"];
const BUSY_POSES: PoseId[] = ["think", "shock", "handsUp", "wave", "handsHead", "handsFace", "clasp", "fold", "cheer", "wipe", "scratch"];

export const Character: React.FC<CharacterProps> = ({ look: lk, action, pose: poseProp, expression: exprProp, talking: talkProp, mouth, frame, seed = "c", facing = 1, exportMode = false, loop: loopProp }) => {
  const L = lookOf(lk);
  const spec = action ? ACTIONS[action] : undefined;
  const pose: PoseId = poseProp ?? spec?.pose ?? "idle";
  const X = EXPRESSIONS[exprProp ?? spec?.expression ?? "neutral"];
  const talking = talkProp ?? spec?.talking ?? false;
  const loop = loopProp ?? spec?.loop ?? 96;
  const has = (a: FullLook["accessories"][number]) => L.accessories.includes(a);

  const off = exportMode ? 0 : Math.floor(random(`${seed}-off`) * loop);
  const ph = (TAU * (frame + off)) / loop;
  const W = (n: number, o = 0) => Math.sin(n * ph + o);

  // ---- blink (live only) ------------------------------------------------------------------------------------
  const blinkOff = Math.floor(random(`${seed}-blink`) * 90);
  const period = 96 + Math.floor(random(`${seed}-period`) * 50);
  const bp = (frame + blinkOff) % period;
  const blink = exportMode ? 1 : bp < 3 ? 0.12 : bp < 5 ? 0.5 : 1;

  // ---- lip-sync -----------------------------------------------------------------------------------------------
  let open = 0;
  if (mouth !== undefined) open = mouth;
  else if (talking) {
    const n = Math.max(1, Math.round(loop / 9.6));
    const s = Math.abs(W(n)) * 0.75 + Math.abs(W(Math.max(1, Math.round(n / 3)), 1)) * 0.35;
    const phrase = exportMode ? 1 : Math.sin(frame * 0.09 + blinkOff) > -0.75 ? 1 : 0.15;
    open = Math.min(1, s * phrase);
  }

  // ---- body motion --------------------------------------------------------------------------------------------
  const gait = spec?.gait;
  const motion = spec?.motion ?? "none";
  let dx = 0, lean = 0, headRot = W(1) * 1.2, crouch = 0, bobUp = 0, jump = 0, sway = W(1) * 0.7, shadow = 1;
  const breathe = W(1) * 1.6;
  if (talking) headRot = W(Math.max(1, Math.round(loop / 14))) * 3;
  if (gait === "walk") { bobUp = -Math.abs(W(1)) * 7; lean = W(1) * 1.2; sway = W(1) * 1.4; }
  if (gait === "run") { bobUp = -Math.abs(W(1)) * 20; lean = 4; sway = W(1) * 1.5; }
  if (gait === "sneak") { crouch = 22; bobUp = -Math.abs(W(1)) * 3; lean = -2; sway = W(1) * 1; }
  if (motion === "laugh") { bobUp -= Math.abs(W(2)) * 8; headRot = -6 + W(2) * 3; }
  if (motion === "tremble") { dx = W(6) * 3; sway = W(6) * 1.4; }
  if (motion === "sway") { dx = W(1) * 4; sway = W(1) * 1.8; headRot = W(1, 1) * 2.5; }
  if (motion === "jump") { jump = -Math.abs(W(1)) * 44; shadow = 1 + jump / 160; }
  if (motion === "hop") { const p = Math.max(0, W(1)); jump = -p * p * 26; shadow = 1 + jump / 160; }
  if (motion === "sob") { bobUp -= Math.abs(W(3)) * 5; headRot = 7 + W(3) * 2; crouch = 6; }
  if (motion === "headShake") { headRot = W(4) * 7; dx = W(4) * 2; }
  if (motion === "fidget") { sway = W(2) * 0.8; headRot = W(1) * 3; }

  // ---- looking ------------------------------------------------------------------------------------------------
  const lookV = spec?.look === "scan" ? W(1) * 0.95 : typeof spec?.look === "number" ? spec.look : 0;

  // ---- arms (2-bone IK) ---------------------------------------------------------------------------------------
  const prop = L.prop !== "none" && (spec ? spec.prop : !BUSY_POSES.includes(pose)) ? L.prop : "none";
  const base = POSES[pose];
  let rH: Hand = base.r;
  let lH: Hand = base.l;
  if (gait === "run") { rH = [98, -232, 1]; lH = [98, -232, 1]; }
  if (prop !== "none" && HELD_UP.includes(prop) && pose === "idle") rH = [116, -258, 1];
  let rdx = 0, rdy = W(1) * 2, ldx = 0, ldy = W(1, 1) * 2;
  const gestN = Math.max(1, Math.round(loop / 16));
  if (talking && pose === "talk") { rdy += W(gestN) * 10; rdx += W(gestN, 1) * 5; ldy += W(gestN, 2) * 2; }
  if (pose === "wave") rdx += W(Math.max(2, Math.round(loop / 12))) * 22;
  if (gait) {
    const amp = gait === "run" ? 34 : gait === "walk" ? 12 : 3;
    rdy += W(1, Math.PI) * amp * 0.9;
    ldy += W(1) * amp * 0.9;
    if (gait === "run") { rdx += 6; ldx += 6; }
  }
  if (motion === "fidget") { rdx += W(4) * 6; ldx -= W(4) * 6; rdy += W(4, 1) * 3; ldy += W(4, 2) * 3; }
  if (pose === "wipe") { rdx += W(3) * 9; rdy += W(6) * 3; }
  if (pose === "scratch") { rdx += W(6) * 8; rdy += W(3) * 3; }
  if (motion === "laugh" || motion === "sob") { rdy += W(motion === "laugh" ? 2 : 3) * 4; ldy += W(motion === "laugh" ? 2 : 3) * 4; }
  if (pose === "cheer") { rdy += W(2) * 12; ldy += W(2, Math.PI) * 12; }
  if (pose === "handsUp" || pose === "shock") { rdy += W(2) * 4; ldy += W(2) * 4; }
  const rA = solveArm(1, rH, rdx, rdy);
  const lA = solveArm(-1, lH, ldx, ldy);

  // ---- legs ---------------------------------------------------------------------------------------------------
  const liftAmt = gait === "run" ? 46 : gait === "walk" ? 22 : gait === "sneak" ? 12 : 0;
  const jumpBend = jump ? Math.min(34, -jump * 0.55) : 0;
  const liftR = liftAmt * Math.max(0, W(1)) + jumpBend;
  const liftL = liftAmt * Math.max(0, W(1, Math.PI)) + jumpBend;
  const hipY = -198;
  const hipTop = hipY + crouch + bobUp;
  const stroke = { stroke: OUTLINE, strokeWidth: 5, strokeLinejoin: "round" as const };
  const legPath = (s: 1 | -1, topW: number, botW: number, ankle: number, topY: number) => {
    const cx = s * 24;
    const bx = s * 26;
    return `M ${cx - topW} ${topY} L ${cx + topW} ${topY} L ${bx + botW} ${ankle} L ${bx - botW} ${ankle} Z`;
  };
  const ankleR = -16 - liftR;
  const ankleL = -16 - liftL;
  const shoes = (
    <g>
      {([-1, 1] as const).map((s) => <ellipse key={s} cx={s * 26} cy={(s === 1 ? ankleR : ankleL) + 6} rx={27} ry={12} fill={L.shoes} stroke={OUTLINE} strokeWidth={4} />)}
    </g>
  );
  const hem = W(1) * (gait ? 3 : 0.8);
  const legs = (() => {
    switch (L.bottom) {
      case "dhoti":
        return (
          <g>
            <path d={`M -58 ${hipTop} L 58 ${hipTop} L 54 ${ankleR + 4} L 12 ${ankleR + 4} L 2 -70 L -10 ${ankleL + 4} L -54 ${ankleL + 4} Z`} fill={L.bottomColor} {...stroke} />
            <path d="M -30 -170 Q -24 -90 -34 -22 M 30 -170 Q 22 -100 32 -22 M 0 -150 L 2 -76" stroke="#0002" strokeWidth={4} fill="none" />
          </g>
        );
      case "saree":
        return (
          <g>
            <path d={`M -56 ${hipTop - 8} L 56 ${hipTop - 8} L ${74 + hem} -12 L ${-74 + hem} -12 Z`} fill={L.bottomColor} {...stroke} />
            {[-34, -12, 10, 32].map((x) => <path key={x} d={`M ${x * 0.8} -180 L ${x * 1.3 + hem} -18`} stroke="#0002" strokeWidth={4} />)}
            <path d={`M ${-73 + hem} -30 L ${73 + hem} -30 L ${74 + hem} -12 L ${-74 + hem} -12 Z`} fill={L.trim} stroke={OUTLINE} strokeWidth={4} />
          </g>
        );
      case "lungi":
        return (
          <g>
            <path d={`M -56 ${hipTop - 4} L 56 ${hipTop - 4} L ${64 + hem} -22 L ${-64 + hem} -22 Z`} fill={L.bottomColor} {...stroke} />
            {[-36, -18, 0, 18, 36].map((x) => <path key={x} d={`M ${x} ${hipTop} L ${x * 1.15 + hem} -24`} stroke={L.trim} strokeWidth={4} />)}
            {[-130, -80].map((y) => <path key={y} d={`M -58 ${y} L 58 ${y}`} stroke={L.trim} strokeWidth={4} />)}
            <path d={`M ${-64 + hem} -34 L ${64 + hem} -34`} stroke={OUTLINE} strokeWidth={4} />
          </g>
        );
      case "skirt":
        return (
          <g>
            <path d={legPath(1, 18, 14, ankleR, hipTop)} fill={L.skin} {...stroke} />
            <path d={legPath(-1, 18, 14, ankleL, hipTop)} fill={L.skin} {...stroke} />
            <path d={`M -58 ${hipTop - 4} L 58 ${hipTop - 4} L ${74 + hem} -112 Q 0 -98 ${-74 + hem} -112 Z`} fill={L.bottomColor} {...stroke} />
            <path d={`M ${-72 + hem} -120 Q 0 -106 ${72 + hem} -120`} stroke={L.trim} strokeWidth={6} fill="none" />
          </g>
        );
      case "shorts":
        return (
          <g>
            <path d={legPath(1, 18, 14, ankleR, hipTop)} fill={L.skin} {...stroke} />
            <path d={legPath(-1, 18, 14, ankleL, hipTop)} fill={L.skin} {...stroke} />
            <path d={`M -48 ${hipTop - 4} L 48 ${hipTop - 4} L 52 -118 L 4 -118 L 0 -156 L -4 -118 L -52 -118 Z`} fill={L.bottomColor} {...stroke} />
          </g>
        );
      case "salwar":
        return (
          <g>
            <path d={`M -50 ${hipTop} Q -66 -100 -38 ${ankleL + 6} L -10 ${ankleL + 6} Q -2 -120 0 -150 Q 2 -120 10 ${ankleR + 6} L 38 ${ankleR + 6} Q 66 -100 50 ${hipTop} Z`} fill={L.bottomColor} {...stroke} />
            <rect x={-40} y={ankleL - 18} width={30} height={14} rx={5} fill={L.trim} stroke={OUTLINE} strokeWidth={3.5} />
            <rect x={10} y={ankleR - 18} width={30} height={14} rx={5} fill={L.trim} stroke={OUTLINE} strokeWidth={3.5} />
          </g>
        );
      default: {
        const wTop = L.bottom === "pyjama" ? 25 : 22;
        const wBot = L.bottom === "pyjama" ? 22 : 17;
        return (
          <g>
            <path d={legPath(1, wTop, wBot, ankleR + 2, hipTop)} fill={L.bottomColor} {...stroke} />
            <path d={legPath(-1, wTop, wBot, ankleL + 2, hipTop)} fill={L.bottomColor} {...stroke} />
            <rect x={-48} y={hipTop - 6} width={96} height={32} rx={8} fill={L.bottomColor} stroke={OUTLINE} strokeWidth={4} />
            <path d={`M 0 ${hipTop + 8} L 0 ${hipTop + 38}`} stroke="#0003" strokeWidth={4} />
          </g>
        );
      }
    }
  })();

  // ---- arm drawing --------------------------------------------------------------------------------------------
  const sleeveLen = SLEEVE[L.top];
  const arm = (a: Arm, key: string, withProp: boolean) => {
    const total = UPPER + FORE;
    const sl = sleeveLen * total;
    const sleevePts = sl <= UPPER
      ? `${a.sx},${a.sy} ${a.sx + ((a.ex - a.sx) * sl) / UPPER},${a.sy + ((a.ey - a.sy) * sl) / UPPER}`
      : `${a.sx},${a.sy} ${a.ex},${a.ey} ${a.ex + ((a.hx - a.ex) * (sl - UPPER)) / FORE},${a.ey + ((a.hy - a.ey) * (sl - UPPER)) / FORE}`;
    const pts = `${a.sx},${a.sy} ${a.ex},${a.ey} ${a.hx},${a.hy}`;
    return (
      <g key={key}>
        <polyline points={pts} fill="none" stroke={OUTLINE} strokeWidth={33} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={pts} fill="none" stroke={L.skin} strokeWidth={23} strokeLinecap="round" strokeLinejoin="round" />
        {sleeveLen > 0 ? (
          <>
            <polyline points={sleevePts} fill="none" stroke={OUTLINE} strokeWidth={39} strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={sleevePts} fill="none" stroke={L.topColor} strokeWidth={29} strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : null}
        {has("bangles") ? <circle cx={a.ex + (a.hx - a.ex) * 0.78} cy={a.ey + (a.hy - a.ey) * 0.78} r={13} fill="none" stroke="#F2C14E" strokeWidth={4} /> : null}
        <circle cx={a.hx} cy={a.hy} r={16} fill={L.skin} stroke={OUTLINE} strokeWidth={4.5} />
        {withProp && prop !== "none" ? (
          <g transform={`translate(${a.hx} ${a.hy})`}>
            <PropArt prop={prop} accent={L.accent} />
            <circle cx={0} cy={0} r={16} fill={L.skin} stroke={OUTLINE} strokeWidth={4.5} />
          </g>
        ) : null}
      </g>
    );
  };

  // ---- head ---------------------------------------------------------------------------------------------------
  const M = headMetrics(L.faceShape);
  const browCol = lum(L.hairColor) > 0.62 ? "#9A9A9A" : OUTLINE;
  const browW = { thin: 3.5, normal: 5.5, thick: 8, bushy: 10 }[L.brow];
  const mouthY = L.facialHair === "mustache" || L.facialHair === "bigMustache" || L.facialHair === "handlebar" ? -403 : -408;
  const lx = lookV * 9;

  const eye = (s: 1 | -1) => {
    const ex = s * 21 + lx * 0.5;
    const ey = -446;
    const [rx0, ry0] = L.eyes === "big" ? [8.5, 11] : L.eyes === "narrow" ? [8, 6] : L.eyes === "sleepy" ? [7.5, 7] : [7, 9];
    const o = X.eyeOpen * blink;
    const px = lookV * 3.5;
    if (X.squint && X.eyeOpen <= 0.4) {
      return <path key={s} d={`M ${ex - 10} ${ey + 4} Q ${ex} ${ey - 10} ${ex + 10} ${ey + 4}`} stroke="#1A100C" strokeWidth={5} fill="none" strokeLinecap="round" />;
    }
    return (
      <g key={s}>
        {X.eyeWhite ? <ellipse cx={ex} cy={ey} rx={rx0 + 4} ry={Math.max(2, ry0 * o + 3)} fill="#fff" stroke={OUTLINE} strokeWidth={3.5} /> : null}
        <ellipse cx={ex + px} cy={ey} rx={rx0 * (X.pupil ?? 1)} ry={Math.max(1.2, ry0 * o * (X.eyeWhite ? (X.pupil ?? 1) * 1.15 : 1))} fill="#1A100C" />
        {o > 0.6 && !X.eyeWhite ? <circle cx={ex + px + 2.4} cy={ey - 3} r={2.4} fill="#fff" /> : null}
        {X.squint || L.eyes === "sleepy" ? <path d={`M ${ex - 11} ${ey - ry0 * 0.15} L ${ex + 11} ${ey - ry0 * 0.15}`} stroke={OUTLINE} strokeWidth={4.5} strokeLinecap="round" /> : null}
        {L.gender === "f" && o > 0.6 ? <path d={`M ${ex - s * 9} ${ey - 9} L ${ex + s * 9} ${ey - 10} L ${ex + s * 13} ${ey - 14}`} stroke={OUTLINE} strokeWidth={3} fill="none" /> : null}
      </g>
    );
  };

  const brow = (s: 1 | -1) => {
    const inner = s * 10 + lx * 0.5;
    const outer = s * 32 + lx * 0.5;
    const y = -468 + X.browLift + (s === 1 ? X.browAsym ?? 0 : 0);
    const t = (s === 1 && X.browAsym ? X.browTilt * 0.6 : X.browTilt) * 0.5;
    return (
      <g key={s}>
        <path d={`M ${inner} ${y + t} L ${outer} ${y - t}`} stroke={browCol} strokeWidth={browW} strokeLinecap="round" />
        {L.brow === "bushy" ? <path d={`M ${inner + s * 3} ${y + t - 5} L ${outer - s * 3} ${y - t - 5}`} stroke={browCol} strokeWidth={4} strokeLinecap="round" /> : null}
      </g>
    );
  };

  const dark = "#5A1A1A";
  const mouthEl = (() => {
    const y = mouthY;
    const m = talking || mouth !== undefined ? (open >= 0.18 ? "lipsync" : X.mouth) : X.mouth;
    const pulse = X.mouth === "laugh" ? 0.65 + 0.35 * Math.abs(W(2)) : X.mouth === "sadOpen" ? 0.8 + 0.2 * Math.abs(W(3)) : 1;
    switch (m) {
      case "lipsync": {
        const [rx, ry] = open < 0.45 ? [10, 6] : open < 0.75 ? [14, 11] : [8, 11];
        return (
          <g>
            <ellipse cx={0} cy={y + 2} rx={rx} ry={ry} fill={dark} stroke={OUTLINE} strokeWidth={4} />
            <ellipse cx={0} cy={y + 2 + ry * 0.45} rx={rx * 0.6} ry={ry * 0.35} fill="#E06A6A" />
          </g>
        );
      }
      case "smile": return <path d={`M -14 ${y} Q 0 ${y + 10} 14 ${y}`} stroke={OUTLINE} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
      case "smileBig":
        return (
          <g>
            <path d={`M -20 ${y - 2} Q 0 ${y + 26} 20 ${y - 2} Z`} fill={dark} stroke={OUTLINE} strokeWidth={4} strokeLinejoin="round" />
            <path d={`M -14 ${y + 2} Q 0 ${y + 8} 14 ${y + 2} L 12 ${y + 6} Q 0 ${y + 12} -12 ${y + 6} Z`} fill="#fff" />
          </g>
        );
      case "flat": return <path d={`M -12 ${y} L 12 ${y}`} stroke={OUTLINE} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
      case "frown": return <path d={`M -14 ${y + 6} Q 0 ${y - 6} 14 ${y + 6}`} stroke={OUTLINE} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
      case "openSmall": return <ellipse cx={0} cy={y + 2} rx={9} ry={8} fill={dark} stroke={OUTLINE} strokeWidth={4} />;
      case "openWide":
        return (
          <g>
            <ellipse cx={0} cy={y + 4} rx={13} ry={16} fill={dark} stroke={OUTLINE} strokeWidth={4} />
            <ellipse cx={0} cy={y + 12} rx={7} ry={5} fill="#E06A6A" />
          </g>
        );
      case "o": return <ellipse cx={0} cy={y + 3} rx={8} ry={11} fill={dark} stroke={OUTLINE} strokeWidth={4} />;
      case "laugh":
        return (
          <g transform={`translate(0 ${y}) scale(1 ${pulse}) translate(0 ${-y})`}>
            <path d={`M -24 ${y - 4} Q 0 ${y + 38} 24 ${y - 4} Z`} fill={dark} stroke={OUTLINE} strokeWidth={4} strokeLinejoin="round" />
            <path d={`M -16 ${y + 12} Q 0 ${y + 22} 16 ${y + 12} Q 0 ${y + 6} -16 ${y + 12} Z`} fill="#E06A6A" />
            <path d={`M -19 ${y - 1} L 19 ${y - 1}`} stroke="#fff" strokeWidth={4} />
          </g>
        );
      case "wavy": return <path d={`M -16 ${y + 1} Q -8 ${y - 6} 0 ${y + 1} T 16 ${y + 1}`} stroke={OUTLINE} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
      case "smirk": return <path d={`M -13 ${y + 3} Q 2 ${y + 6} 13 ${y - 4} M 13 ${y - 4} l 3 -3`} stroke={OUTLINE} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
      case "grit":
        return (
          <g>
            <rect x={-17} y={y - 6} width={34} height={14} rx={4} fill="#fff" stroke={OUTLINE} strokeWidth={3.5} />
            <path d={`M -6 ${y - 6} L -6 ${y + 8} M 6 ${y - 6} L 6 ${y + 8} M -17 ${y + 1} L 17 ${y + 1}`} stroke={OUTLINE} strokeWidth={2.5} />
          </g>
        );
      case "sadOpen":
        return (
          <g transform={`translate(0 ${y}) scale(1 ${pulse}) translate(0 ${-y})`}>
            <path d={`M -16 ${y + 10} Q 0 ${y - 14} 16 ${y + 10} Z`} fill={dark} stroke={OUTLINE} strokeWidth={4} strokeLinejoin="round" />
          </g>
        );
      default: return null;
    }
  })();

  const cry = X.tears ? ((frame + off) * 2 / loop) % 1 : 0;
  const faceFeatures = (
    <g transform={`translate(${lx} 0)`}>
      {L.gender === "f" || X.blush ? (
        <g opacity={X.blush ? 0.5 : 0.35}>
          <circle cx={-34} cy={-424} r={11} fill="#FF6B8A" />
          <circle cx={34} cy={-424} r={11} fill="#FF6B8A" />
        </g>
      ) : null}
      {eye(-1)}
      {eye(1)}
      {brow(-1)}
      {brow(1)}
      <NoseArt L={L} />
      {mouthEl}
      {X.tears ? (
        <g fill="#7DC6F5" stroke={OUTLINE} strokeWidth={2}>
          {([-1, 1] as const).map((s) => (
            <g key={s}>
              <path d={`M ${s * 24} -436 Q ${s * 30} ${-436 + 14 + cry * 40} ${s * 26} ${-436 + 26 + cry * 40} Q ${s * 18} ${-436 + 14 + cry * 40} ${s * 24} -436 Z`} />
              <path d={`M ${s * 22} -438 L ${s * 22} ${-420 + cry * 10}`} stroke="#7DC6F5" strokeWidth={6} />
            </g>
          ))}
        </g>
      ) : null}
      <FacialHairArt L={L} />
      <FaceAccessories L={L} />
    </g>
  );
  const sweatY = X.sweat ? -490 + W(2) * 3 : 0;
  const extras = (
    <g>
      {X.sweat ? (
        <path d={`M 52 ${sweatY} Q 66 ${sweatY + 18} 56 ${sweatY + 30} Q 44 ${sweatY + 20} 52 ${sweatY} Z`} fill="#8FD3FF" stroke={OUTLINE} strokeWidth={3} />
      ) : null}
      {X.vein ? (
        <g stroke="#D32F2F" strokeWidth={4.5} fill="none" strokeLinecap="round" transform={`translate(34 -496) scale(${1 + 0.12 * Math.abs(W(2))})`}>
          <path d="M -10 -4 Q -4 -4 -4 -10 M 10 -4 Q 4 -4 4 -10 M -10 6 Q -4 6 -4 12 M 10 6 Q 4 6 4 12" />
        </g>
      ) : null}
    </g>
  );

  const ears = ([-1, 1] as const).map((s) => <ellipse key={s} cx={s * (M.rx - 1)} cy={-440} rx={11} ry={15} fill={L.skin} stroke={OUTLINE} strokeWidth={4} />);
  const upperDy = crouch + bobUp + breathe * 0.5;

  return (
    <g transform={`scale(${facing * L.height} ${L.height}) rotate(${sway + lean})`}>
      <ellipse cx={0} cy={0} rx={70 * Math.max(0.5, shadow)} ry={10 * Math.max(0.5, shadow)} fill="#000" opacity={0.25} />
      <g transform={`translate(${dx} ${jump})`}>
        {shoes}
        {legs}
        <g transform={`translate(0 ${upperDy})`}>
          <BackpackBehind L={L} />
          <Torso L={L} />
          <BackpackStraps L={L} />
          <BodyAccessories L={L} />
          <rect x={-15} y={-386} width={30} height={40} fill={L.skin} stroke={OUTLINE} strokeWidth={4.5} />
          <g transform={`translate(0 ${breathe * 0.3}) rotate(${headRot + lookV * 3} 0 -380)`}>
            <OnHead shape={L.faceShape}><BackHair L={L} /></OnHead>
            {ears}
            <HeadShape shape={L.faceShape} fill={L.skin} />
            <OnHead shape={L.faceShape}><FrontHair L={L} /></OnHead>
            {faceFeatures}
            {extras}
            <OnHead shape={L.faceShape}><Headwear L={L} /></OnHead>
          </g>
          {arm(lA, "l", false)}
          {arm(rA, "r", true)}
        </g>
      </g>
    </g>
  );
};
