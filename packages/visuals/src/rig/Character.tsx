import React from "react";
import { random } from "remotion";
import { OUTLINE, lookOf, type Look, type PresetId } from "./presets";

/**
 * CHARACTER RIG — flat-vector Indian cartoon characters built from parts (no images, no external service).
 *
 * <Character look="seth" pose="talk" talking frame={frame} seed="seth-1" />
 *
 * Origin = point between the feet; the body is ~560 px tall at height 1 (scale with an outer <g transform>).
 * Moves: idle breathing + sway, eye blinks (seeded), mouth lip-sync while `talking` (or from `mouth` 0..1 if you
 * have voice loudness), arm poses with small secondary motion, head tilt while speaking.
 */
export type Pose = "idle" | "talk" | "point" | "think" | "shock" | "wave" | "handsUp" | "shrug" | "hipHand";
export type Expression = "neutral" | "happy" | "worried" | "angry" | "surprised" | "smug";

export interface CharacterProps {
  look: PresetId | Look;
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
}

type ArmAngles = { l: [number, number]; r: [number, number] };
const POSES: Record<Pose, ArmAngles> = {
  idle: { l: [10, -6], r: [10, -6] },
  talk: { l: [12, -8], r: [38, 78] },
  point: { l: [10, -6], r: [92, -4] },
  think: { l: [22, 70], r: [6, -168] },
  shock: { l: [130, 82], r: [130, 82] },
  wave: { l: [10, -6], r: [150, 18] },
  handsUp: { l: [162, 6], r: [162, 6] },
  shrug: { l: [46, 92], r: [46, 92] },
  hipHand: { l: [42, -95], r: [12, -8] }
};

const UPPER = 92;
const FORE = 86;
const SHOULDER_Y = -338;
const SHOULDER_X = 60;
const rad = (d: number) => (d * Math.PI) / 180;

function armPoints(side: -1 | 1, a1: number, a2: number) {
  const sx = side * SHOULDER_X;
  const sy = SHOULDER_Y;
  const ex = sx + side * UPPER * Math.sin(rad(a1));
  const ey = sy + UPPER * Math.cos(rad(a1));
  const t = a1 + a2;
  const hx = ex + side * FORE * Math.sin(rad(t));
  const hy = ey + FORE * Math.cos(rad(t));
  return { sx, sy, ex, ey, hx, hy };
}

const MOUTHS = ["closed", "small", "wide", "o"] as const;

export const Character: React.FC<CharacterProps> = ({ look: lk, pose = "idle", expression = "neutral", talking = false, mouth, frame, seed = "c", facing = 1 }) => {
  const L = lookOf(lk);
  const has = (a: Look["accessories"][number]) => L.accessories.includes(a);
  const off = Math.floor(random(`${seed}-blink`) * 90);
  const period = 96 + Math.floor(random(`${seed}-period`) * 50);
  const blinkPhase = (frame + off) % period;
  const blink = blinkPhase < 3 ? 0.12 : blinkPhase < 5 ? 0.5 : 1;
  const breathe = Math.sin((frame + off) / 18) * 1.6;
  const sway = Math.sin((frame + off) / 41) * 0.8;

  // lip-sync: deterministic speech-like envelope (syllables ~6/s with phrase dips)
  let open = 0;
  if (mouth !== undefined) open = mouth;
  else if (talking) {
    const s = Math.abs(Math.sin(frame * 0.62 + off)) * 0.75 + Math.abs(Math.sin(frame * 0.23 + off * 0.3)) * 0.35;
    const phrase = Math.sin(frame * 0.09 + off) > -0.75 ? 1 : 0.15;
    open = Math.min(1, s * phrase);
  }
  const mouthShape = open < 0.18 ? MOUTHS[0] : open < 0.45 ? MOUTHS[1] : open < 0.75 ? MOUTHS[2] : MOUTHS[3];

  const base = POSES[pose];
  const wob = (k: number) => Math.sin((frame + off) / k);
  const talkArm = talking && pose === "talk" ? wob(5) * 12 : 0;
  const waveArm = pose === "wave" ? wob(3) * 22 : 0;
  const lA = armPoints(-1, base.l[0] + wob(29) * 2, base.l[1]);
  const rA = armPoints(1, base.r[0] + wob(31) * 2 + talkArm * 0.4, base.r[1] + talkArm + waveArm);
  const headTilt = talking ? wob(11) * 3 : wob(53) * 1.2;

  const longSleeve = ["kurta", "shirt", "coat", "uniform"].includes(L.top);
  const sleeveLen = longSleeve ? 0.9 : L.top === "tshirt" ? 0.55 : L.top === "blouse" ? 0.3 : 0;

  const arm = (a: ReturnType<typeof armPoints>, key: string, front: boolean) => {
    // sleeve end point along the arm (fraction of total length)
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
        {has("bangles") ? (
          <circle cx={a.ex + (a.hx - a.ex) * 0.78} cy={a.ey + (a.hy - a.ey) * 0.78} r={13} fill="none" stroke="#F2C14E" strokeWidth={4} />
        ) : null}
        <circle cx={a.hx} cy={a.hy} r={16} fill={L.skin} stroke={OUTLINE} strokeWidth={4.5} />
        {front && has("magnifier") ? (
          <g transform={`translate(${a.hx} ${a.hy}) rotate(${-30})`}>
            <rect x={-6} y={-6} width={12} height={46} rx={5} fill="#5A3A22" stroke={OUTLINE} strokeWidth={3.5} />
            <circle cx={0} cy={-34} r={28} fill="#BFE6FF" fillOpacity={0.55} stroke="#D9A441" strokeWidth={8} />
            <circle cx={0} cy={-34} r={28} fill="none" stroke={OUTLINE} strokeWidth={2.5} />
            <path d="M -12 -46 Q -6 -52 2 -50" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />
          </g>
        ) : null}
      </g>
    );
  };

  // ---------- body parts ----------
  const stroke = { stroke: OUTLINE, strokeWidth: 5, strokeLinejoin: "round" as const };
  const torsoBottom = L.top === "kurta" ? -118 : L.top === "coat" ? -106 : -190;
  const hipY = -198;

  const legs = (() => {
    switch (L.bottom) {
      case "dhoti":
        return (
          <g>
            <path d={`M -58 ${hipY} L 58 ${hipY} L 54 -16 L 12 -16 L 2 -70 L -10 -16 L -54 -16 Z`} fill={L.bottomColor} {...stroke} />
            <path d="M -30 -170 Q -24 -90 -34 -22 M 30 -170 Q 22 -100 32 -22 M 0 -150 L 2 -76" stroke="#0002" strokeWidth={4} fill="none" />
          </g>
        );
      case "saree":
        return (
          <g>
            <path d={`M -56 ${hipY - 8} L 56 ${hipY - 8} L 74 -12 L -74 -12 Z`} fill={L.bottomColor} {...stroke} />
            {[-34, -12, 10, 32].map((x) => <path key={x} d={`M ${x * 0.8} -180 L ${x * 1.3} -18`} stroke="#0002" strokeWidth={4} />)}
            <path d="M -73 -30 L 73 -30 L 74 -12 L -74 -12 Z" fill={L.trim} stroke={OUTLINE} strokeWidth={4} />
          </g>
        );
      case "salwar":
        return (
          <g>
            <path d={`M -50 ${hipY} Q -66 -100 -38 -26 L -10 -26 Q -2 -120 0 -150 Q 2 -120 10 -26 L 38 -26 Q 66 -100 50 ${hipY} Z`} fill={L.bottomColor} {...stroke} />
            <rect x={-40} y={-34} width={30} height={14} rx={5} fill={L.trim} stroke={OUTLINE} strokeWidth={3.5} />
            <rect x={10} y={-34} width={30} height={14} rx={5} fill={L.trim} stroke={OUTLINE} strokeWidth={3.5} />
          </g>
        );
      default: {
        const w = L.bottom === "pyjama" ? 42 : 38;
        return (
          <g>
            <path d={`M ${-w - 6} ${hipY} L ${w + 6} ${hipY} L ${w + 4} -16 L 6 -16 L 2 -150 L -2 -150 L -6 -16 L ${-w - 4} -16 Z`} fill={L.bottomColor} {...stroke} />
            <path d="M 0 -196 L 0 -152" stroke="#0003" strokeWidth={4} />
          </g>
        );
      }
    }
  })();

  const torso = (() => {
    const shoulders = `M -64 -330 Q -64 -352 -44 -354 L 44 -354 Q 64 -352 64 -330`;
    const bellyW = has("belly") ? 78 : 60;
    const body = `${shoulders} L ${bellyW} ${(-330 + torsoBottom) / 2 + 30} Q ${bellyW + 4} ${torsoBottom + 10} ${bellyW - 6} ${torsoBottom} L ${-bellyW + 6} ${torsoBottom} Q ${-bellyW - 4} ${torsoBottom + 10} ${-bellyW} ${(-330 + torsoBottom) / 2 + 30} Z`;
    if (L.top === "blouse") {
      // saree look: blouse, bare midriff, pallu drape over the left shoulder
      return (
        <g>
          <path d={`M -58 -300 L 58 -300 L 56 -200 L -56 -200 Z`} fill={L.skin} {...stroke} />
          <path d={`${shoulders} L 62 -292 L -62 -292 Z`} fill={L.topColor} {...stroke} />
          <path d="M -66 -352 L -22 -354 L 62 -214 L 56 -190 L 14 -190 L -66 -300 Z" fill={L.bottomColor} {...stroke} />
          <path d="M -22 -354 L 62 -214" stroke={L.trim} strokeWidth={9} />
          <path d="M -66 -300 L 14 -190" stroke={L.trim} strokeWidth={9} />
        </g>
      );
    }
    return (
      <g>
        <path d={body} fill={L.top === "vest" ? L.topColor : L.topColor} {...stroke} />
        {L.top === "vest" ? <path d="M -30 -354 Q 0 -300 30 -354 Z" fill={L.skin} stroke={OUTLINE} strokeWidth={4} /> : null}
        {L.top === "kurta" ? (
          <g>
            <path d="M -16 -354 L 0 -320 L 16 -354" fill="none" stroke={L.trim} strokeWidth={6} />
            <path d="M 0 -320 L 0 -250" stroke={L.trim} strokeWidth={6} />
            {[-305, -285, -265].map((y) => <circle key={y} cx={0} cy={y} r={3.5} fill={L.trim} />)}
            <path d={`M ${-bellyW + 10} ${torsoBottom + 2} L ${bellyW - 10} ${torsoBottom + 2}`} stroke={L.trim} strokeWidth={7} />
          </g>
        ) : null}
        {L.top === "shirt" || L.top === "uniform" ? (
          <g>
            <path d="M -26 -354 L 0 -326 L 26 -354 L 14 -360 L 0 -340 L -14 -360 Z" fill={L.trim} stroke={OUTLINE} strokeWidth={4} />
            <path d="M 0 -326 L 0 -196" stroke="#0003" strokeWidth={4} />
            {[-300, -270, -240, -210].map((y) => <circle key={y} cx={0} cy={y} r={3.5} fill={L.trim} stroke={OUTLINE} strokeWidth={1.5} />)}
            <rect x={-62} y={-208} width={124} height={16} fill={L.top === "uniform" ? L.trim : "#3A2A20"} stroke={OUTLINE} strokeWidth={3.5} />
            <rect x={-8} y={-210} width={16} height={20} rx={3} fill="#D9A441" stroke={OUTLINE} strokeWidth={3} />
            {L.top === "uniform" ? (
              <g>
                <rect x={-50} y={-310} width={34} height={30} rx={4} fill={L.trim} stroke={OUTLINE} strokeWidth={3} />
                <rect x={16} y={-310} width={34} height={30} rx={4} fill={L.trim} stroke={OUTLINE} strokeWidth={3} />
              </g>
            ) : null}
          </g>
        ) : null}
        {L.top === "tshirt" ? (
          <g>
            <path d="M -22 -354 Q 0 -332 22 -354" fill="none" stroke={OUTLINE} strokeWidth={4} />
            <path d="M 0 -296 l 9 18 20 3 -14 14 3 20 -18 -9 -18 9 3 -20 -14 -14 20 -3 Z" fill={L.trim} stroke={OUTLINE} strokeWidth={3} />
          </g>
        ) : null}
        {L.top === "coat" ? (
          <g>
            <path d="M -30 -354 L -6 -250 L -18 -150 M 30 -354 L 6 -250 L 18 -150" fill="none" stroke={L.trim} strokeWidth={8} />
            <path d="M -30 -354 L 0 -300 L 30 -354" fill="#E8E2D0" stroke={OUTLINE} strokeWidth={4} />
            <path d="M -6 -310 L 0 -300 L 6 -310 L 4 -250 L 0 -240 L -4 -250 Z" fill="#7A2E2E" stroke={OUTLINE} strokeWidth={2.5} />
            <rect x={-62} y={-205} width={124} height={15} fill={L.trim} stroke={OUTLINE} strokeWidth={3.5} />
            {[-280, -240, -170].map((y) => <circle key={y} cx={-12} cy={y} r={4} fill="#3B2A1C" />)}
          </g>
        ) : null}
      </g>
    );
  })();

  const backHair = (() => {
    switch (L.hair) {
      case "bun":
      case "greyBun":
        return <circle cx={34} cy={-506} r={27} fill={L.hairColor} {...stroke} />;
      case "ponytail":
        return <path d="M 40 -494 Q 96 -470 78 -380 Q 70 -420 46 -456 Z" fill={L.hairColor} {...stroke} />;
      case "braid":
        return (
          <g>
            {[0, 1, 2, 3, 4, 5].map((i) => <ellipse key={i} cx={56 + i * 2} cy={-420 + i * 24} rx={14} ry={15} fill={L.hairColor} stroke={OUTLINE} strokeWidth={4} />)}
            <path d="M 64 -290 l -8 20 M 66 -290 l 8 20" stroke="#E2483D" strokeWidth={5} />
          </g>
        );
      default:
        return null;
    }
  })();

  const frontHair = (() => {
    const c = L.hairColor;
    switch (L.hair) {
      case "short":
        return <path d="M -58 -446 Q -62 -516 0 -514 Q 62 -516 58 -446 Q 52 -482 4 -484 Q -42 -486 -58 -446 Z" fill={c} {...stroke} />;
      case "sidePart":
        return <path d="M -58 -444 Q -64 -518 0 -516 Q 62 -514 58 -446 Q 44 -490 -10 -488 Q -18 -470 -40 -470 Q -54 -462 -58 -444 Z" fill={c} {...stroke} />;
      case "spiky":
        return <path d="M -58 -446 L -62 -492 L -40 -488 L -34 -526 L -12 -500 L 2 -534 L 16 -502 L 38 -526 L 42 -488 L 62 -494 L 58 -446 Q 40 -480 0 -482 Q -40 -480 -58 -446 Z" fill={c} {...stroke} />;
      case "bald":
        return (
          <g>
            <ellipse cx={-52} cy={-456} rx={9} ry={20} fill={c} stroke={OUTLINE} strokeWidth={3.5} />
            <ellipse cx={52} cy={-456} rx={9} ry={20} fill={c} stroke={OUTLINE} strokeWidth={3.5} />
            <path d="M -24 -496 Q -10 -504 6 -500" stroke="#fff6" strokeWidth={6} fill="none" strokeLinecap="round" />
          </g>
        );
      case "bun":
      case "greyBun":
      case "ponytail":
      case "braid":
        return <path d="M -60 -420 Q -70 -518 0 -516 Q 70 -518 60 -420 Q 54 -470 22 -484 Q 4 -476 0 -490 Q -4 -476 -22 -484 Q -54 -470 -60 -420 Z" fill={c} {...stroke} />;
      default:
        return null;
    }
  })();

  const headwear = (() => {
    const c = L.headwearColor;
    switch (L.headwear) {
      case "pagdi":
        return (
          <g>
            <path d="M -66 -452 Q -76 -548 0 -556 Q 76 -548 66 -452 Q 0 -486 -66 -452 Z" fill={c} {...stroke} />
            <path d="M -62 -480 Q 0 -520 64 -470 M -58 -508 Q 0 -540 60 -500" stroke="#0003" strokeWidth={6} fill="none" />
            <path d="M 0 -488 l 10 -18 -10 -22 -10 22 Z" fill={L.trim} stroke={OUTLINE} strokeWidth={3} />
            <circle cx={0} cy={-500} r={6} fill="#3FD0C9" stroke={OUTLINE} strokeWidth={2} />
          </g>
        );
      case "gandhiTopi":
        return <path d="M -52 -476 L 54 -476 L 44 -516 Q 0 -524 -42 -512 Z" fill={c} {...stroke} />;
      case "cap":
        return (
          <g>
            <path d="M -58 -470 Q -58 -528 0 -528 Q 58 -528 58 -470 Z" fill={c} {...stroke} />
            <path d="M -6 -472 Q 50 -480 86 -466 Q 50 -458 -6 -462 Z" fill={c} {...stroke} />
          </g>
        );
      case "policeCap":
        return (
          <g>
            <path d="M -62 -472 L -70 -524 Q 0 -540 70 -524 L 62 -472 Z" fill={c} {...stroke} />
            <rect x={-62} y={-486} width={124} height={16} fill="#3A3226" stroke={OUTLINE} strokeWidth={3.5} />
            <path d="M -60 -470 Q 0 -446 60 -470 L 56 -462 Q 0 -440 -56 -462 Z" fill="#1E1A14" stroke={OUTLINE} strokeWidth={3} />
            <circle cx={0} cy={-506} r={9} fill="#E6C04A" stroke={OUTLINE} strokeWidth={2.5} />
          </g>
        );
      case "fedora":
        return (
          <g>
            <ellipse cx={0} cy={-478} rx={92} ry={17} fill={c} {...stroke} />
            <path d="M -54 -480 Q -60 -548 -14 -544 Q 0 -530 14 -544 Q 60 -548 54 -480 Z" fill={c} {...stroke} />
            <path d="M -55 -490 Q 0 -500 55 -490 L 54 -478 Q 0 -488 -54 -478 Z" fill={L.trim} stroke={OUTLINE} strokeWidth={3} />
          </g>
        );
      default:
        return null;
    }
  })();

  const browTilt = { neutral: 0, happy: -2, worried: 9, angry: -11, surprised: 4, smug: -5 }[expression];
  const browLift = expression === "surprised" ? -8 : 0;
  const mouthY = L.facialHair === "mustache" || L.facialHair === "bigMustache" ? -403 : -408;
  const mouthEl = (() => {
    if (mouthShape === "closed") {
      const curve = expression === "worried" || expression === "angry" ? -5 : expression === "smug" ? 6 : 8;
      return <path d={`M -14 ${mouthY} Q 0 ${mouthY + curve} 14 ${mouthY}`} stroke={OUTLINE} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
    }
    const [rx, ry] = mouthShape === "small" ? [10, 6] : mouthShape === "wide" ? [14, 11] : [8, 11];
    return (
      <g>
        <ellipse cx={0} cy={mouthY + 2} rx={rx} ry={ry} fill="#5A1A1A" stroke={OUTLINE} strokeWidth={4} />
        <ellipse cx={0} cy={mouthY + 2 + ry * 0.45} rx={rx * 0.6} ry={ry * 0.35} fill="#E06A6A" />
      </g>
    );
  })();

  const face = (
    <g>
      {L.gender === "f" ? (
        <g opacity={0.35}>
          <circle cx={-34} cy={-424} r={11} fill="#FF6B8A" />
          <circle cx={34} cy={-424} r={11} fill="#FF6B8A" />
        </g>
      ) : null}
      {[-1, 1].map((s) => (
        <g key={s}>
          <ellipse cx={s * 21} cy={-446} rx={7} ry={9 * blink} fill="#1A100C" />
          {blink > 0.6 ? <circle cx={s * 21 + 2.4} cy={-449} r={2.4} fill="#fff" /> : null}
          <path
            d={`M ${s * 10} ${-468 + browLift + browTilt * 0.5} L ${s * 32} ${-468 + browLift - browTilt * 0.5}`}
            stroke={L.hair === "greyBun" || L.hairColor === "#D8D8D8" ? "#9A9A9A" : OUTLINE}
            strokeWidth={5.5}
            strokeLinecap="round"
          />
          {L.gender === "f" && blink > 0.6 ? <path d={`M ${s * 12} -455 L ${s * 30} -456 L ${s * 34} -460`} stroke={OUTLINE} strokeWidth={3} fill="none" /> : null}
        </g>
      ))}
      <path d="M -2 -440 Q 9 -424 -5 -420" stroke={OUTLINE} strokeWidth={4} fill="none" strokeLinecap="round" />
      {mouthEl}
      {L.facialHair === "mustache" ? (
        <path d="M -22 -414 Q -10 -428 0 -419 Q 10 -428 22 -414 Q 10 -411 0 -414 Q -10 -411 -22 -414 Z" fill={L.hairColor} stroke={OUTLINE} strokeWidth={3} />
      ) : null}
      {L.facialHair === "bigMustache" ? (
        <path d="M -40 -428 Q -36 -414 -24 -414 Q -10 -432 0 -420 Q 10 -432 24 -414 Q 36 -414 40 -428 Q 44 -406 24 -406 Q 10 -410 0 -413 Q -10 -410 -24 -406 Q -44 -406 -40 -428 Z" fill={L.hairColor === "#3A2A22" ? "#2A1C16" : L.hairColor} stroke={OUTLINE} strokeWidth={3} />
      ) : null}
      {L.facialHair === "stubble" ? <path d="M -44 -420 Q 0 -360 44 -420 Q 30 -390 0 -386 Q -30 -390 -44 -420 Z" fill="#2A1C1633" /> : null}
      {L.facialHair === "beard" ? <path d="M -52 -430 Q -48 -360 0 -360 Q 48 -360 52 -430 Q 30 -396 0 -396 Q -30 -396 -52 -430 Z" fill={L.hairColor} stroke={OUTLINE} strokeWidth={3.5} /> : null}
      {has("glasses") ? (
        <g fill="none" stroke="#3A2A1A" strokeWidth={4}>
          <circle cx={-21} cy={-446} r={16} />
          <circle cx={21} cy={-446} r={16} />
          <path d="M -5 -448 Q 0 -452 5 -448 M -37 -448 L -54 -454 M 37 -448 L 54 -454" />
        </g>
      ) : null}
      {has("bindi") ? <circle cx={0} cy={-472} r={5} fill="#D81B3A" /> : null}
      {has("tilak") ? (
        <g>
          <path d="M -6 -470 L -4 -492 M 6 -470 L 4 -492" stroke="#F2F2F2" strokeWidth={3.5} />
          <path d="M 0 -468 L 0 -490" stroke="#D81B3A" strokeWidth={4} />
        </g>
      ) : null}
    </g>
  );

  const ears = [-1, 1].map((s) => <ellipse key={s} cx={s * 55} cy={-440} rx={11} ry={15} fill={L.skin} stroke={OUTLINE} strokeWidth={4} />);
  const earrings = has("earrings") ? [-1, 1].map((s) => <circle key={s} cx={s * 56} cy={-422} r={6} fill="#F2C14E" stroke={OUTLINE} strokeWidth={2} />) : null;

  // which arm is drawn in front of the body: arms crossing the torso go in front, else both in front (flat style)
  return (
    <g transform={`scale(${facing * L.height} ${L.height}) rotate(${sway})`}>
      <g>
        <ellipse cx={0} cy={0} rx={70} ry={10} fill="#000" opacity={0.25} />
        {[-1, 1].map((s) => <ellipse key={s} cx={s * 24} cy={-10} rx={27} ry={12} fill={L.shoes} stroke={OUTLINE} strokeWidth={4} />)}
        {legs}
        <g transform={`translate(0 ${breathe * 0.5})`}>
          {torso}
          {has("dupatta") ? <path d="M -66 -346 Q 0 -300 66 -346 L 70 -330 Q 0 -280 -70 -330 Z" fill={L.trim} stroke={OUTLINE} strokeWidth={4} /> : null}
          {has("gamcha") ? (
            <g>
              <path d="M -60 -356 L -30 -356 L -40 -250 L -66 -258 Z" fill="#E2483D" stroke={OUTLINE} strokeWidth={4} />
              <path d="M -54 -340 L -36 -338 M -58 -310 L -40 -306 M -62 -280 L -44 -276" stroke="#fff" strokeWidth={4} />
            </g>
          ) : null}
          {has("goldChain") ? <path d="M -30 -350 Q 0 -290 30 -350" stroke="#F2C14E" strokeWidth={6} fill="none" /> : null}
          {has("badge") ? <path d="M 34 -300 l 6 12 13 2 -9 9 2 13 -12 -6 -12 6 2 -13 -9 -9 13 -2 Z" fill="#E6C04A" stroke={OUTLINE} strokeWidth={2.5} /> : null}
          <rect x={-15} y={-386} width={30} height={40} fill={L.skin} stroke={OUTLINE} strokeWidth={4.5} />
          <g transform={`translate(0 ${breathe * 0.3}) rotate(${headTilt} 0 -380)`}>
            {backHair}
            {ears}
            <ellipse cx={0} cy={-442} rx={56} ry={64} fill={L.skin} {...stroke} />
            {earrings}
            {frontHair}
            {face}
            {headwear}
          </g>
          {arm(lA, "l", false)}
          {arm(rA, "r", true)}
        </g>
      </g>
    </g>
  );
};
