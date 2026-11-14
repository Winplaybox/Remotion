import React from "react";

/**
 * SHIVA — a detailed, hand-coded SVG character for the cinematic POC (no images, no AI).
 * Local space: feet at (0, 0), top of the jata ~ (0, -1120). Every part is its own group so it can act:
 * shoulder/elbow rotations per arm, head tilt, eyelids, throat colour (Neelkanth), snake, breathing, light.
 */
export interface ShivaPose {
  /** frame, for breathing / snake / hair sway */
  f: number;
  /** head tilt in degrees (negative = head back) */
  headTilt?: number;
  /** 0 open … 1 closed */
  eyes?: number;
  /** 0 normal … 1 fully blue throat */
  throat?: number;
  /** right / left arm: shoulder and elbow angles in degrees (0 = hanging down) */
  armR?: { sh: number; el: number; cup?: number };
  armL?: { sh: number; el: number };
  /** 0 = black silhouette (backlit) … 1 = fully lit */
  lit?: number;
  /** calm smile 0..1 */
  smile?: number;
  /** show legs (false for close-ups to save work) */
  legs?: boolean;
  /** glowing orb (halahal) held in the right palm: 0..1 size */
  orb?: number;
  /** draw the right arm in front of the face (palm to lips) */
  armFront?: boolean;
}

const SKIN = "#5E8ED0", SKIN_LIT = "#8CB6EC", SKIN_DARK = "#3C64A4";
const OUT = "#1B2238";
const GOLD = "#E2B23A", GOLD_DARK = "#9C7414";

/** Forward kinematics: hand position for an arm (used to place the poison orb, palm-to-lips etc.). */
export function handPos(side: 1 | -1, arm: { sh: number; el: number }) {
  const sx = side * 118, sy = -742;
  const a1 = ((arm.sh * side) * Math.PI) / 180;
  const ex = sx + Math.sin(a1) * 195, ey = sy + Math.cos(a1) * 195;
  const a2 = (((arm.sh + arm.el) * side) * Math.PI) / 180;
  return { x: ex + Math.sin(a2) * 175, y: ey + Math.cos(a2) * 175, ex, ey, sx, sy };
}

const Arm: React.FC<{ side: 1 | -1; sh: number; el: number; cup: number; orb: number; f: number }> = ({ side, sh, el, cup, orb, f }) => (
  <g transform={`translate(${side * 118} -742) rotate(${-sh * side})`}>
    {/* upper arm */}
    <path d="M -34 0 C -40 70 -34 140 -26 195 L 26 195 C 34 140 40 70 34 0 Z" fill={`url(#sh-skin-${side})`} stroke={OUT} strokeWidth={4} />
    <rect x={-33} y={52} width={66} height={18} rx={8} fill={GOLD} stroke={GOLD_DARK} strokeWidth={3} />
    <circle cx={0} cy={61} r={7} fill="#B3121F" />
    <g transform={`translate(0 195) rotate(${-el * side})`}>
      {/* forearm */}
      <path d="M -27 0 C -30 60 -24 120 -19 172 L 19 172 C 24 120 30 60 27 0 Z" fill={`url(#sh-skin-${side})`} stroke={OUT} strokeWidth={4} />
      {[132, 146].map((y) => <g key={y}>{[-16, -8, 0, 8, 16].map((x) => <circle key={x} cx={x} cy={y} r={5} fill="#6B3A22" stroke="#3A1E10" strokeWidth={1.5} />)}</g>)}
      {/* hand: open palm, cupping when cup -> 1 */}
      <g transform="translate(0 172)">
        <path d={`M -22 0 C -30 ${24 - cup * 8} -26 ${52 - cup * 14} -10 ${62 - cup * 18} L 14 ${60 - cup * 18} C 28 ${48 - cup * 12} 30 ${22 - cup * 6} 22 0 Z`} fill={`url(#sh-skin-${side})`} stroke={OUT} strokeWidth={4} />
        <path d={`M ${side * 20} 8 q ${side * 22} 6 ${side * 18} ${26 - cup * 10}`} fill="none" stroke={OUT} strokeWidth={4} strokeLinecap="round" />
        {orb > 0 ? (
          <g transform={`translate(0 ${40 - cup * 22})`}>
            <circle r={60 * orb} fill="url(#sh-orb)" />
            <circle r={26 * orb} fill="#C9FFB8" opacity={0.8 + 0.2 * Math.sin(f / 3)} />
          </g>
        ) : null}
      </g>
    </g>
  </g>
);

export const ShivaFigure: React.FC<ShivaPose> = ({ f, headTilt = 0, eyes = 0, throat = 0, armR = { sh: 8, el: 6, cup: 0 }, armL = { sh: 8, el: 6 }, lit = 1, smile = 0, legs = true, orb = 0, armFront = false }) => {
  const breathe = Math.sin(f / 22) * 4;
  const sway = Math.sin(f / 31) * 3;
  const lidY = (y: number) => -18 + eyes * 18 + y; // eyelid drop
  const throatColor = throat > 0 ? `rgba(30, 70, 220, ${0.25 + throat * 0.75})` : "transparent";
  const rightArm = <Arm side={1} sh={armR.sh} el={armR.el} cup={armR.cup ?? 0} orb={orb} f={f} />;
  return (
    <g style={lit < 1 ? { filter: `brightness(${(0.06 + 0.94 * lit).toFixed(3)})` } : undefined}>
      <defs>
        {[1, -1].map((s) => (
          <linearGradient key={s} id={`sh-skin-${s}`} x1={s > 0 ? 0 : 1} y1="0" x2={s > 0 ? 1 : 0} y2="0">
            <stop offset="0" stopColor={SKIN_DARK} /><stop offset="0.55" stopColor={SKIN} /><stop offset="1" stopColor={SKIN_LIT} />
          </linearGradient>
        ))}
        <radialGradient id="sh-torso" cx="0.62" cy="0.3" r="0.8"><stop offset="0" stopColor={SKIN_LIT} /><stop offset="0.6" stopColor={SKIN} /><stop offset="1" stopColor={SKIN_DARK} /></radialGradient>
        <radialGradient id="sh-face" cx="0.6" cy="0.35" r="0.75"><stop offset="0" stopColor="#9CC2F2" /><stop offset="0.65" stopColor={SKIN} /><stop offset="1" stopColor={SKIN_DARK} /></radialGradient>
        <linearGradient id="sh-tiger" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#B86A1C" /><stop offset="0.5" stopColor="#E89A3A" /><stop offset="1" stopColor="#A65A14" /></linearGradient>
        <radialGradient id="sh-orb"><stop offset="0" stopColor="#B8FF9A" stopOpacity={1} /><stop offset="0.5" stopColor="#3FAF4A" stopOpacity={0.8} /><stop offset="1" stopColor="#0E3A12" stopOpacity={0} /></radialGradient>
        <radialGradient id="sh-throat"><stop offset="0" stopColor="#1E46E0" stopOpacity={1} /><stop offset="0.7" stopColor="#2A5AF0" stopOpacity={0.7} /><stop offset="1" stopColor="#2A5AF0" stopOpacity={0} /></radialGradient>
        <linearGradient id="sh-hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A2A1E" /><stop offset="1" stopColor="#120C08" /></linearGradient>
      </defs>

      {/* locks of hair behind the shoulders */}
      <g transform={`rotate(${sway * 0.4} 0 -900)`}>
        {[-1, 1].map((s) => [0, 1, 2].map((i) => (
          <path key={`${s}${i}`} d={`M ${s * (40 + i * 22)} -930 C ${s * (90 + i * 30)} -820 ${s * (110 + i * 25)} -720 ${s * (96 + i * 34)} ${-600 + i * 30}`} stroke="url(#sh-hair)" strokeWidth={26 - i * 4} fill="none" strokeLinecap="round" />
        )))}
      </g>

      {/* legs + tiger skin */}
      {legs ? (
        <g>
          <path d="M -70 -330 L -82 -20 L -30 -20 L -12 -320 Z" fill="url(#sh-skin-1)" stroke={OUT} strokeWidth={4} />
          <path d="M 12 -320 L 30 -20 L 82 -20 L 70 -330 Z" fill="url(#sh-skin-1)" stroke={OUT} strokeWidth={4} />
          <ellipse cx={-56} cy={-10} rx={42} ry={14} fill={SKIN_DARK} stroke={OUT} strokeWidth={4} />
          <ellipse cx={56} cy={-10} rx={42} ry={14} fill={SKIN_DARK} stroke={OUT} strokeWidth={4} />
          {[-56, 56].map((x) => <g key={x}>{[-18, -6, 6, 18].map((d) => <circle key={d} cx={x + d} cy={-48} r={5} fill={GOLD} />)}</g>)}
        </g>
      ) : null}
      <path d="M -112 -470 C -120 -400 -110 -330 -96 -280 L -20 -300 L 0 -250 L 20 -300 L 96 -280 C 110 -330 120 -400 112 -470 Z" fill="url(#sh-tiger)" stroke={OUT} strokeWidth={4} />
      {[[-80, -440], [-40, -420], [10, -445], [55, -425], [-60, -360], [0, -380], [70, -360], [-20, -320], [40, -325]].map(([x, y], i) => (
        <path key={i} d={`M ${x} ${y} q 10 -8 22 0 q -10 6 -22 0 Z`} fill="#2A1608" />
      ))}

      {/* torso (breathing) */}
      <g transform={`translate(0 ${breathe * 0.5}) scale(1 ${1 + breathe * 0.002})`}>
        <path d="M -130 -760 C -150 -680 -128 -560 -112 -470 L 112 -470 C 128 -560 150 -680 130 -760 C 80 -790 -80 -790 -130 -760 Z" fill="url(#sh-torso)" stroke={OUT} strokeWidth={4} />
        <path d="M -70 -660 q 35 22 66 0 M 4 -660 q 35 22 66 0" stroke={SKIN_DARK} strokeWidth={4} fill="none" opacity={0.7} />
        <path d="M 0 -630 L 0 -500" stroke={SKIN_DARK} strokeWidth={3} opacity={0.5} />
        {/* janeu (sacred thread) */}
        <path d="M -100 -760 C -40 -650 40 -560 104 -480" stroke="#FFF3D1" strokeWidth={5} fill="none" />
        {/* rudraksha mala */}
        {Array.from({ length: 19 }, (_, i) => {
          const t = i / 18;
          const x = -88 + t * 176;
          const y = -760 + Math.sin(t * Math.PI) * 170;
          return <circle key={i} cx={x} cy={y} r={11} fill="#7A3E1E" stroke="#3A1E10" strokeWidth={2} />;
        })}
        <circle cx={0} cy={-575} r={16} fill="#7A3E1E" stroke={GOLD} strokeWidth={4} />
      </g>

      {/* arms */}
      <Arm side={-1} sh={armL.sh} el={armL.el} cup={0} orb={0} f={f} />
      {armFront ? null : rightArm}

      {/* neck + head (tilts as one around the neck base) */}
      <g transform={`rotate(${headTilt} 0 -770)`}>
        <path d="M -40 -780 L -42 -840 L 42 -840 L 40 -780 Z" fill="url(#sh-skin-1)" stroke={OUT} strokeWidth={4} />
        {throat > 0 ? <ellipse cx={0} cy={-806} rx={30 + throat * 34} ry={20 + throat * 16} fill="url(#sh-throat)" opacity={Math.min(1, throat * 1.2)} /> : null}
        <rect x={-42} y={-840} width={84} height={64} fill={throatColor} opacity={0.6} />
        {/* Vasuki around the neck */}
        <g>
          <path d={`M -58 -790 C -30 -760 30 -760 58 -790 C 70 -810 64 -830 52 -834`} stroke="#2F7A3A" strokeWidth={22} fill="none" strokeLinecap="round" />
          <path d={`M -58 -790 C -30 -760 30 -760 58 -790`} stroke="#8FD18A" strokeWidth={6} fill="none" strokeDasharray="6 12" strokeDashoffset={-f * 0.8} />
          <g transform={`translate(${62 + Math.sin(f / 14) * 4} ${-870 + Math.sin(f / 9) * 3}) rotate(${-20 + Math.sin(f / 14) * 8})`}>
            <path d="M -10 40 C -12 10 -6 -6 8 -12 C 26 -16 34 -4 28 8 C 22 18 8 18 6 40 Z" fill="#2F7A3A" stroke="#123A18" strokeWidth={3} />
            <circle cx={18} cy={-4} r={3.5} fill="#FFE34A" />
            <path d={`M 30 2 l ${10 + Math.max(0, Math.sin(f / 5)) * 8} -3 m -6 2 l 6 4`} stroke="#D32F2F" strokeWidth={2.5} />
          </g>
        </g>
        {/* ears + kundal */}
        {[-1, 1].map((s) => (
          <g key={s}>
            <ellipse cx={s * 74} cy={-905} rx={14} ry={24} fill={SKIN} stroke={OUT} strokeWidth={4} />
            <circle cx={s * 76} cy={-868} r={13} fill="none" stroke={GOLD} strokeWidth={6} />
          </g>
        ))}
        {/* face */}
        <path d="M -70 -930 C -72 -860 -50 -820 0 -812 C 50 -820 72 -860 70 -930 C 66 -990 -66 -990 -70 -930 Z" fill="url(#sh-face)" stroke={OUT} strokeWidth={4} />
        {/* brows */}
        <path d="M -54 -948 q 22 -12 42 -2 M 12 -950 q 22 -10 42 2" stroke="#1A120C" strokeWidth={6} fill="none" strokeLinecap="round" />
        {/* eyes (almond) with eyelids */}
        {[-1, 1].map((s) => (
          <g key={s}>
            <path d={`M ${s * 14} -918 q ${s * 18} -14 ${s * 38} 0 q ${-s * 18} 10 ${-s * 38} 0 Z`} fill="#FFFFFF" stroke={OUT} strokeWidth={3} />
            <circle cx={s * 33} cy={-918} r={7} fill="#1A120C" opacity={1 - eyes} />
            <path d={`M ${s * 12} ${-922 + lidY(0) * 0.0} q ${s * 20} ${lidY(-2)} ${s * 42} 2`} stroke={OUT} strokeWidth={4} fill={eyes > 0.05 ? SKIN : "none"} />
            {eyes > 0.6 ? <path d={`M ${s * 14} -916 q ${s * 19} 8 ${s * 38} 0`} stroke={OUT} strokeWidth={4} fill="none" /> : null}
          </g>
        ))}
        {/* third eye (closed) + tripund + bindu */}
        <path d="M 0 -985 q 6 10 0 22 q -6 -12 0 -22 Z" fill="#B3121F" opacity={0.9} />
        {[-1000, -988, -976].map((y, i) => <path key={i} d={`M -46 ${y + 20} q 46 -8 92 0`} stroke="#F7F3E8" strokeWidth={5} fill="none" strokeLinecap="round" />)}
        {/* nose + mouth */}
        <path d="M 2 -900 q 8 26 -4 34 q 8 2 12 -2" stroke={SKIN_DARK} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d={`M -20 -846 q 20 ${6 + smile * 10} 40 0`} stroke="#3A1E2A" strokeWidth={4.5} fill="none" strokeLinecap="round" />
        {/* jata (matted locks piled up) */}
        <g transform={`rotate(${sway * 0.3} 0 -990)`}>
          <path d="M -72 -950 C -86 -1010 -60 -1050 0 -1052 C 60 -1050 86 -1010 72 -950 C 40 -990 -40 -990 -72 -950 Z" fill="url(#sh-hair)" stroke={OUT} strokeWidth={4} />
          {[-50, -28, -6, 16, 38].map((x, i) => (
            <path key={i} d={`M ${x} -1030 C ${x - 10} -1080 ${x + 18} -1120 ${x + 4} ${-1160 + (i % 2) * 20} C ${x + 30} -1110 ${x + 26} -1070 ${x + 20} -1030 Z`} fill="url(#sh-hair)" stroke={OUT} strokeWidth={3} />
          ))}
          <path d="M -46 -1060 C -10 -1076 22 -1074 52 -1058" stroke={GOLD} strokeWidth={8} fill="none" />
          {/* Ganga springing from the jata */}
          <path d={`M 10 -1150 C ${26 + Math.sin(f / 6) * 6} -1190 ${40 + Math.sin(f / 5) * 8} -1180 ${48 + Math.sin(f / 4) * 6} -1210`} stroke="#BFE9FF" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.85} />
          {/* crescent moon */}
          <g transform="translate(52 -1078) rotate(-20)">
            <path d="M 18 -26 A 26 26 0 1 1 -8 18 A 20 20 0 1 0 18 -26 Z" fill="#FFF6DA" stroke="#C9A24A" strokeWidth={2.5} />
          </g>
        </g>
      </g>

      {armFront ? rightArm : null}
    </g>
  );
};

/** Detailed trishul with a damru tied below the prongs. */
export const Trishul: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs>
      <linearGradient id="tri-wood" x1="0" x2="1"><stop offset="0" stopColor="#5A3A1E" /><stop offset="0.5" stopColor="#8A5A2E" /><stop offset="1" stopColor="#4A2E16" /></linearGradient>
      <linearGradient id="tri-steel" x1="0" x2="1"><stop offset="0" stopColor="#8C939E" /><stop offset="0.45" stopColor="#F2F4F8" /><stop offset="1" stopColor="#6B727E" /></linearGradient>
    </defs>
    <rect x={-9} y={-1100} width={18} height={1100} rx={8} fill="url(#tri-wood)" stroke={OUT} strokeWidth={3} />
    <path d="M -80 -1100 Q -86 -1180 -56 -1230 Q -58 -1160 -14 -1140 L 0 -1260 L 14 -1140 Q 58 -1160 56 -1230 Q 86 -1180 80 -1100 Q 40 -1120 0 -1110 Q -40 -1120 -80 -1100 Z" fill="url(#tri-steel)" stroke={OUT} strokeWidth={4} />
    <g transform={`translate(0 -1050) rotate(${Math.sin(f / 10) * 10})`}>
      <path d="M -36 -24 L 36 24 M -36 24 L 36 -24" stroke="#7A3E1E" strokeWidth={4} />
      <path d="M -40 -30 Q 0 -6 40 -30 L 40 30 Q 0 6 -40 30 Z" fill="#C98A4A" stroke={OUT} strokeWidth={3} />
      <path d="M 0 30 q 10 30 -6 60" stroke="#B3121F" strokeWidth={4} fill="none" />
    </g>
  </g>
);
