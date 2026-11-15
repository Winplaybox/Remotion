import React from "react";
import { random, spring } from "remotion";
import { FONT } from "@visuals/fonts";
import type { PropCtx } from "./props";

/* Paper-cutout kit for the AllTrainReels, Indian Horror Tapes and MindNest Tales channels.
 * Same conventions as props.tsx: origin = bottom-centre unless noted, shadows via #sd-shadow, all drawn in SVG. */

const num = (v: unknown, d: number) => (typeof v === "number" ? v : d);
const str = (v: unknown, d: string) => (typeof v === "string" ? v : d);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const SHADOW = "url(#sd-shadow)";

/* ---------- trains ---------- */

export const TRAIN_KINDS = ["steam", "diesel", "electric", "bullet", "metro", "local", "freight", "maglev", "toy"] as const;

const Wheel: React.FC<{ x: number; r: number; rot: number; color?: string }> = ({ x, r, rot, color = "#2A2622" }) => (
  <g transform={`translate(${x} ${-r}) rotate(${rot})`}>
    <circle r={r} fill={color} stroke="#0E0C0A" strokeWidth={4} />
    <circle r={r * 0.35} fill="#9A948C" />
    <line x1={-r * 0.85} x2={r * 0.85} stroke="#9A948C" strokeWidth={4} />
    <line y1={-r * 0.85} y2={r * 0.85} stroke="#9A948C" strokeWidth={4} />
  </g>
);

/** One car body (or the locomotive) drawn from x0, 0 = rail level. */
const Car: React.FC<{ kind: string; x0: number; w: number; color: string; stripe: string; loco: boolean; rot: number; lf: number }> = ({ kind, x0, w, color, stripe, loco, rot, lf }) => {
  const h = kind === "toy" ? 120 : kind === "freight" && !loco ? 110 : 170;
  const wr = kind === "steam" && loco ? 34 : kind === "toy" ? 18 : 24;
  const lift = wr * 2 + 6;
  const wheels = kind === "steam" && loco ? [x0 + w * 0.2, x0 + w * 0.45, x0 + w * 0.7] : [x0 + w * 0.15, x0 + w * 0.3, x0 + w * 0.7, x0 + w * 0.85];
  const win = (k: number) => Array.from({ length: k }, (_, i) => x0 + 30 + (i * (w - 60)) / k);
  return (
    <g>
      {wheels.map((x, i) => <Wheel key={i} x={x} r={wr} rot={rot} />)}
      {kind === "steam" && loco ? (
        <g filter={SHADOW}>
          <rect x={x0 + w * 0.1} y={-lift - 120} width={w * 0.62} height={120} rx={60} fill={color} />
          <rect x={x0 + w * 0.66} y={-lift - 190} width={w * 0.32} height={190} rx={8} fill={color} />
          <rect x={x0 + w * 0.72} y={-lift - 165} width={w * 0.2} height={70} rx={6} fill="#FFE7A8" opacity={0.85} />
          <rect x={x0 + w * 0.2} y={-lift - 190} width={36} height={72} fill="#1C1A17" />
          <rect x={x0 + w * 0.18} y={-lift - 200} width={52} height={16} fill="#1C1A17" />
          <path d={`M ${x0 + w * 0.08} ${-lift} l -46 0 l 34 -48 Z`} fill="#8A2A1E" />
          <rect x={x0 + w * 0.1} y={-lift - 16} width={w * 0.62} height={10} fill={stripe} />
          {[0, 1, 2, 3].map((k) => {
            const t = (lf / 30 + k * 0.45) % 1.8;
            return <circle key={k} cx={x0 + w * 0.2 + 18 + t * 140} cy={-lift - 210 - t * 160} r={26 + t * 40} fill="#E9E4DA" opacity={clamp01(0.75 - t * 0.4)} />;
          })}
        </g>
      ) : (
        <g filter={SHADOW}>
          {kind === "bullet" || kind === "maglev"
            ? <path d={`M ${x0} ${-lift} L ${x0 + w} ${-lift} L ${x0 + w} ${-lift - h} L ${x0 + (loco ? w * 0.38 : 0)} ${-lift - h} ${loco ? `Q ${x0 - 40} ${-lift - h * 0.6} ${x0} ${-lift}` : `L ${x0} ${-lift}`} Z`} fill={color} />
            : <rect x={x0} y={-lift - h} width={w} height={h} rx={kind === "metro" || kind === "local" ? 22 : 12} fill={color} />}
          <rect x={x0 + (loco && (kind === "bullet" || kind === "maglev") ? w * 0.3 : 6)} y={-lift - h * 0.34} width={w - (loco && (kind === "bullet" || kind === "maglev") ? w * 0.3 : 12)} height={16} fill={stripe} />
          {kind === "freight" && !loco
            ? <rect x={x0 + 10} y={-lift - h - 26} width={w - 20} height={34} rx={14} fill="#5A4636" />
            : win(loco ? 2 : 5).map((x, i) => <rect key={i} x={x} y={-lift - h + 30} width={(w - 60) / (loco ? 2 : 5) - 14} height={h * 0.32} rx={8} fill="#CFE6F5" opacity={0.9} />)}
          {loco && kind !== "bullet" && kind !== "maglev" ? <rect x={x0 - 6} y={-lift - h + 28} width={22} height={h * 0.34} fill="#FFE7A8" /> : null}
          {(kind === "electric" || kind === "local") && loco ? <path d={`M ${x0 + w * 0.3} ${-lift - h} l 30 -40 l 40 0 l -30 40`} fill="none" stroke="#2A2622" strokeWidth={6} /> : null}
        </g>
      )}
      {kind === "maglev" ? <rect x={x0} y={-lift + 8} width={w} height={14} fill="#7BD3FF" opacity={0.6 + 0.3 * Math.sin(lf / 4)} /> : null}
    </g>
  );
};

/**
 * Side-view train, locomotive in front (left), rolling in from the right and braking to rest. Origin = centre at rail level.
 * data: kind (TRAIN_KINDS), color, stripe, cars (0-6), speed (0 = parked, >0 = rolls in), label,
 * dir (1 = faces left / comes from the right, -1 = mirrored; labels stay readable).
 */
const Train: React.FC<PropCtx> = ({ lf, data }) => {
  const kind = str(data.kind, "electric");
  const cars = Math.max(0, Math.min(6, Math.round(num(data.cars, 2))));
  const color = str(data.color, "#2F6FD8");
  const stripe = str(data.stripe, "#F6B93B");
  const dir = num(data.dir, 1) < 0 ? -1 : 1;
  const lw = kind === "steam" ? 360 : kind === "toy" ? 200 : 320;
  const cw = kind === "toy" ? 160 : 300;
  const total = lw + cars * (cw + 16);
  const speed = num(data.speed, 0);
  const settle = speed > 0 ? Math.max(0, 1 - clamp01(lf / 45)) : 0;
  const dx = settle * settle * 1400;
  const rot = (-(lf * (speed > 0 ? Math.max(0.6, settle * 9) : 0.6))) % 360;
  const x0 = -total / 2;
  const label = str(data.label, "");
  return (
    <g>
      <g transform={`scale(${dir} 1) translate(${dx} 0)`}>
        <Car kind={kind} x0={x0} w={lw} color={color} stripe={stripe} loco rot={rot} lf={lf} />
        {Array.from({ length: cars }, (_, i) => (
          <Car key={i} kind={kind} x0={x0 + lw + 16 + i * (cw + 16)} w={cw} color={color} stripe={stripe} loco={false} rot={rot} lf={lf} />
        ))}
      </g>
      {label ? <text x={dir * (x0 + lw / 2 + dx)} y={kind === "toy" ? -190 : -290} textAnchor="middle" fontFamily={FONT.display} fontSize={46} fill="#FFFFFF" stroke="#12151C" strokeWidth={8} paintOrder="stroke">{label}</text> : null}
    </g>
  );
};

/** Railway track across the frame. Origin = rail level at the centre. data.speed scrolls the sleepers (px/frame). */
const Rails: React.FC<PropCtx> = ({ lf, data }) => {
  const speed = num(data.speed, 0);
  const off = (lf * speed) % 80;
  return (
    <g>
      <rect x={-700} y={6} width={1400} height={60} fill={str(data.ballast, "#6E6258")} />
      {Array.from({ length: 20 }, (_, i) => <rect key={i} x={-720 + i * 80 - off} y={4} width={40} height={22} fill="#4A3A2E" />)}
      <rect x={-700} y={-2} width={1400} height={9} fill="#B8B2AA" />
      <rect x={-700} y={18} width={1400} height={7} fill="#8F8A84" opacity={0.7} />
    </g>
  );
};

const Crown: React.FC<{ x: number; y: number; p: number }> = ({ x, y, p }) => (
  <path d="M -26 14 L -30 -14 L -14 0 L 0 -20 L 14 0 L 30 -14 L 26 14 Z" transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * p})`} fill="#FFD23F" stroke="#8A5A00" strokeWidth={3} opacity={p} />
);

/**
 * Versus stat board. Origin = centre. data: aName, bName, aColor, bColor, rows [{ label, a, b, aText, bText, win }]
 * (bars proportional to a/b; win = "a" | "b" | "none" puts the crown), stepSeconds between rows.
 */
const StatBars: React.FC<PropCtx> = ({ lf, fps, data, pal }) => {
  const rows = (Array.isArray(data.rows) ? data.rows : []) as { label: string; a: number; b: number; aText: string; bText: string; win?: string }[];
  const aColor = str(data.aColor, pal.accent2), bColor = str(data.bColor, pal.accent3);
  const step = num(data.stepSeconds, 1.6) * fps;
  const rowH = 190;
  const h = 120 + rows.length * rowH;
  return (
    <g>
      <rect x={-470} y={-h / 2} width={940} height={h} rx={26} fill="rgba(16,14,22,.86)" stroke={pal.paper} strokeOpacity={0.25} strokeWidth={3} filter={SHADOW} />
      <text x={-430} y={-h / 2 + 70} fontFamily={FONT.display} fontSize={48} fill={aColor}>{str(data.aName, "A")}</text>
      <text x={430} y={-h / 2 + 70} textAnchor="end" fontFamily={FONT.display} fontSize={48} fill={bColor}>{str(data.bName, "B")}</text>
      {rows.map((r, i) => {
        const p = spring({ frame: lf - fps * 0.4 - i * step, fps, config: { damping: 16, stiffness: 90 } });
        const max = Math.max(r.a, r.b, 1e-9);
        const aWin = r.win === "a";
        const bWin = r.win === "b";
        const y = -h / 2 + 120 + i * rowH;
        const wa = 400 * (r.a / max) * p, wb = 400 * (r.b / max) * p;
        const done = clamp01((lf - fps * 0.4 - i * step - 20) / 8);
        return (
          <g key={i} opacity={clamp01(p * 3)}>
            <text x={0} y={y + 34} textAnchor="middle" fontFamily={FONT.mono} fontWeight={700} fontSize={30} fill={pal.paper} opacity={0.85}>{r.label}</text>
            <rect x={-10 - wa} y={y + 56} width={wa} height={56} rx={10} fill={aColor} />
            <rect x={10} y={y + 56} width={wb} height={56} rx={10} fill={bColor} />
            <text x={-26} y={y + 98} textAnchor="end" fontFamily={FONT.display} fontSize={40} fill="#FFFFFF" stroke="#1C1A17" strokeWidth={6} paintOrder="stroke" opacity={done}>{r.aText}</text>
            <text x={26} y={y + 98} fontFamily={FONT.display} fontSize={40} fill="#FFFFFF" stroke="#1C1A17" strokeWidth={6} paintOrder="stroke" opacity={done}>{r.bText}</text>
            {aWin ? <Crown x={-60 - wa} y={y + 84} p={done} /> : null}
            {bWin ? <Crown x={60 + wb} y={y + 84} p={done} /> : null}
          </g>
        );
      })}
    </g>
  );
};

/* ---------- horror ---------- */

/**
 * Abandoned building silhouette with one flickering window. Origin = base centre.
 * data.kind: "fort" | "haveli" | "mill" | "stepwell" | "bungalow" | "tomb", data.flicker (bool, default true).
 */
const Ruin: React.FC<PropCtx> = ({ lf, data }) => {
  const kind = str(data.kind, "haveli");
  const ink = "#0F0D12", wall = "#24202A";
  const lit = data.flicker === false ? 0 : (random(`ruin-${Math.floor(lf / 3)}`) > 0.35 ? 1 : 0.25);
  const glow = <rect x={-36} y={-330} width={72} height={96} fill="#FFB347" opacity={0.85 * lit} />;
  if (kind === "fort") return (
    <g filter={SHADOW}>
      <path d="M -520 0 L -520 -300 L -470 -300 L -470 -340 L -430 -340 L -430 -300 L -380 -300 L -380 -420 L -300 -480 L -220 -420 L -220 -300 L 220 -300 L 220 -420 L 300 -480 L 380 -420 L 380 -300 L 430 -300 L 430 -340 L 470 -340 L 470 -300 L 520 -300 L 520 0 Z" fill={wall} />
      <path d="M -80 0 L -80 -150 A 80 80 0 0 1 80 -150 L 80 0 Z" fill={ink} />
      <path d="M -260 -260 l 40 0 l 0 60 l -40 0 Z M 220 -260 l 40 0 l 0 60 l -40 0 Z" fill={ink} />
      <g transform="translate(0 40)">{glow}</g>
      <path d="M -520 -300 l 60 40 l 40 -30 l 50 60" fill="none" stroke="#3A3440" strokeWidth={6} />
    </g>
  );
  if (kind === "mill") return (
    <g filter={SHADOW}>
      <rect x={-460} y={-360} width={920} height={360} fill={wall} />
      <rect x={260} y={-640} width={70} height={300} fill={wall} />
      <path d="M -460 -360 l 230 -110 l 0 110 l 230 -110 l 0 110 l 230 -110 l 0 110 l 230 -110 l 0 110 Z" fill={wall} />
      {[-360, -220, -80, 60, 200].map((x) => <rect key={x} x={x} y={-280} width={80} height={110} fill={ink} />)}
      <g transform="translate(-10 50)">{glow}</g>
    </g>
  );
  if (kind === "stepwell") return (
    <g filter={SHADOW}>
      {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-480 + i * 40} y={-60 - i * 50} width={960 - i * 80} height={50} fill={i % 2 ? wall : "#2E2934"} />)}
      {[-300, -150, 0, 150, 300].map((x) => <path key={x} d={`M ${x - 40} -400 L ${x - 40} -470 A 40 40 0 0 1 ${x + 40} -470 L ${x + 40} -400 Z`} fill={ink} />)}
      <rect x={-160} y={-30} width={320} height={30} fill="#0A0A10" />
    </g>
  );
  if (kind === "tomb") return (
    <g filter={SHADOW}>
      <rect x={-380} y={-300} width={760} height={300} fill={wall} />
      <path d="M -260 -300 A 260 260 0 0 1 260 -300 Z" fill={wall} />
      <rect x={-12} y={-600} width={24} height={60} fill={wall} />
      {[-420, 400].map((x) => <rect key={x} x={x} y={-460} width={30} height={460} fill={wall} />)}
      <path d="M -70 0 L -70 -170 A 70 70 0 0 1 70 -170 L 70 0 Z" fill={ink} />
      <g transform="translate(0 120)">{glow}</g>
    </g>
  );
  if (kind === "bungalow") return (
    <g filter={SHADOW}>
      <rect x={-400} y={-330} width={800} height={330} fill={wall} />
      <path d="M -460 -330 L 0 -560 L 460 -330 Z" fill="#1A1720" />
      <rect x={-60} y={-200} width={120} height={200} fill={ink} />
      {[-280, 200].map((x) => <rect key={x} x={x} y={-260} width={90} height={110} fill={ink} />)}
      <g transform="translate(-235 70)">{glow}</g>
      <path d="M 200 -260 l 90 110 M 290 -260 l -90 110" stroke="#3A3440" strokeWidth={6} />
    </g>
  );
  return (
    <g filter={SHADOW}>
      <rect x={-440} y={-420} width={880} height={420} fill={wall} />
      {[-440, -220, 0, 220].map((x) => <path key={x} d={`M ${x} -420 l 110 -70 l 110 70 Z`} fill="#1A1720" />)}
      {[-330, -110, 110, 330].map((x) => <path key={x} d={`M ${x - 45} -230 L ${x - 45} -320 A 45 45 0 0 1 ${x + 45} -320 L ${x + 45} -230 Z`} fill={ink} />)}
      <path d="M -70 0 L -70 -140 A 70 70 0 0 1 70 -140 L 70 0 Z" fill={ink} />
      <g transform="translate(110 40)">{glow}</g>
    </g>
  );
};

/** Hanging lantern that sways and flickers. Origin = the hook. */
const Lantern: React.FC<PropCtx> = ({ lf }) => {
  const sw = Math.sin(lf / 18) * 6;
  const f = 0.6 + 0.4 * random(`lantern-${Math.floor(lf / 2)}`);
  return (
    <g transform={`rotate(${sw})`}>
      <line y2={120} stroke="#2A2622" strokeWidth={4} />
      <circle cy={210} r={180} fill="url(#sd-flameglow)" opacity={f} />
      <path d="M -40 130 L 40 130 L 52 250 L -52 250 Z" fill="#FFB347" opacity={0.35 + 0.5 * f} stroke="#2A2622" strokeWidth={6} />
      <rect x={-56} y={120} width={112} height={16} fill="#2A2622" />
      <rect x={-60} y={250} width={120} height={16} fill="#2A2622" />
      <ellipse cy={205} rx={12 * f} ry={26 * f} fill="#FFF3D1" />
    </g>
  );
};

/**
 * Shadow figure that fades in with a flicker. Origin = feet. data.kind: "woman" | "boy" | "man", data.eyes (bool).
 * It never fully resolves: a silhouette only, no gore.
 */
const Shadow: React.FC<PropCtx> = ({ lf, fps, data }) => {
  const p = clamp01(lf / (fps * 1.2));
  const flick = random(`shadow-${Math.floor(lf / 2)}`) > 0.15 ? 1 : 0.2;
  const kind = str(data.kind, "woman");
  const s = kind === "boy" ? 0.7 : 1;
  return (
    <g opacity={p * flick * 0.92} transform={`scale(${s})`}>
      {kind === "woman"
        ? <path d="M -30 -400 C -80 -390 -70 -320 -60 -300 L -110 0 L 110 0 L 60 -300 C 70 -320 80 -390 30 -400 Q 0 -430 -30 -400 Z M -50 -400 C -90 -300 -120 -160 -140 -40 L -100 -40 Z" fill="#050407" />
        : <path d="M -26 -420 A 34 34 0 1 1 26 -420 A 34 34 0 1 1 -26 -420 Z M -70 -360 L 70 -360 L 60 -170 L 40 0 L 10 0 L 0 -160 L -10 0 L -40 0 L -60 -170 Z" fill="#050407" />}
      {data.eyes === true ? <g fill="#FF3B2F" opacity={0.6 + 0.4 * Math.sin(lf / 5)}><circle cx={-12} cy={kind === "woman" ? -385 : -425} r={5} /><circle cx={12} cy={kind === "woman" ? -385 : -425} r={5} /></g> : null}
    </g>
  );
};

/** Night highway in perspective, lane dashes rushing at the camera, optional roadside sign. Origin = horizon centre. */
const Road: React.FC<PropCtx> = ({ lf, data }) => {
  const sign = str(data.sign, "");
  const t = (lf / 30) % 1;
  return (
    <g>
      <path d="M -40 0 L 40 0 L 620 900 L -620 900 Z" fill="#1A1A20" />
      <path d="M -40 0 L -620 900 M 40 0 L 620 900" stroke="#C8C2B4" strokeWidth={6} opacity={0.5} />
      {Array.from({ length: 6 }, (_, i) => {
        const k = ((i + t) / 6) ** 2;
        const y = k * 900, w = 4 + k * 26, l = 10 + k * 120;
        return <rect key={i} x={-w / 2} y={y} width={w} height={l} fill="#F6E7A8" opacity={0.85} />;
      })}
      <ellipse cx={0} cy={880} rx={520} ry={140} fill="#FFF3D1" opacity={0.08} />
      {sign ? (
        <g transform="translate(-380 -40)">
          <rect x={-8} y={-10} width={16} height={180} fill="#3A3440" />
          <rect x={-150} y={-120} width={300} height={110} fill="#2A2C1E" stroke="#C9B458" strokeWidth={5} />
          <text y={-50} textAnchor="middle" fontFamily={FONT.display} fontSize={44} fill={random(`sign-${Math.floor(lf / 4)}`) > 0.3 ? "#F2D16B" : "#5A5230"}>{sign}</text>
        </g>
      ) : null}
    </g>
  );
};

/* ---------- MindNest animals ---------- */

export const ANIMAL_KINDS = ["cheetah", "lion", "fox", "rabbit", "elephant", "monkey", "crow", "owl", "deer", "bear", "mouse", "turtle"] as const;

const BODY: Record<string, string> = {
  cheetah: "#E8A93A", lion: "#D9963A", fox: "#E26A2C", rabbit: "#EDE6DC", elephant: "#9AA3AE", monkey: "#9A6A44",
  crow: "#2D2B33", owl: "#8C6A4A", deer: "#B9824E", bear: "#6E4B32", mouse: "#B7ADA6", turtle: "#5E9A4E"
};

/**
 * Cute storybook animal, ~300px tall standing. Origin = feet.
 * data: kind (ANIMAL_KINDS), color (overrides), mood ("happy" | "sad" | "scared" | "proud" | "sleepy"), small (bool = cub), scarf (colour).
 */
const Animal: React.FC<PropCtx> = ({ lf, data }) => {
  const kind = str(data.kind, "rabbit");
  const c = str(data.color, BODY[kind] ?? "#C9A27A");
  const dark = "#2A221C";
  const mood = str(data.mood, "happy");
  const s = data.small === true ? 0.68 : 1;
  const blink = lf % 110 < 4;
  const bird = kind === "crow" || kind === "owl";
  const belly = kind === "rabbit" || kind === "mouse" ? "#FFF6EC" : kind === "crow" ? "#4A4752" : "#F6E3C6";
  const hy = bird ? -210 : -250;
  const eyeY = hy + (mood === "sleepy" ? 6 : 0);
  const mouth = mood === "sad" || mood === "scared"
    ? `M -16 ${hy + 46} Q 0 ${hy + 34} 16 ${hy + 46}`
    : `M -18 ${hy + 36} Q 0 ${hy + 54} 18 ${hy + 36}`;
  const scarf = str(data.scarf, "");
  return (
    <g transform={`scale(${s})`} filter={SHADOW}>
      {/* tail */}
      {kind === "cheetah" || kind === "lion" || kind === "monkey" ? <path d={`M 90 -90 Q 200 ${-140 + Math.sin(lf / 9) * 30} 170 -230`} fill="none" stroke={kind === "lion" ? "#8A5A2A" : c} strokeWidth={18} strokeLinecap="round" /> : null}
      {kind === "fox" ? <path d={`M 80 -80 Q 230 ${-90 + Math.sin(lf / 9) * 20} 190 -200 Q 150 -110 80 -110 Z`} fill={c} /> : null}
      {kind === "fox" ? <circle cx={190} cy={-195} r={20} fill="#FFF6EC" /> : null}
      {/* body */}
      {kind === "turtle"
        ? <><ellipse cy={-90} rx={170} ry={100} fill="#3E7A3A" /><path d="M -170 -90 A 170 100 0 0 1 170 -90 Z" fill="#6FAE5A" /><circle cx={-190} cy={-150} r={50} fill={c} /></>
        : <ellipse cy={bird ? -100 : -120} rx={bird ? 100 : 120} ry={bird ? 120 : 110} fill={c} />}
      {kind !== "turtle" ? <ellipse cy={bird ? -80 : -100} rx={bird ? 60 : 70} ry={bird ? 80 : 70} fill={belly} /> : null}
      {kind === "cheetah" ? [[-60, -150], [40, -170], [70, -100], [-80, -80], [0, -200]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={10} fill={dark} />) : null}
      {/* legs / feet */}
      {bird
        ? <g stroke="#E6A23A" strokeWidth={8}><path d="M -30 0 l 0 -20 M 30 0 l 0 -20" /></g>
        : kind !== "turtle" ? [-60, 60].map((x) => <ellipse key={x} cx={x} cy={-12} rx={40} ry={22} fill={kind === "cheetah" ? c : BODY[kind] ?? c} stroke={dark} strokeOpacity={0.15} strokeWidth={3} />) : null}
      {bird ? <path d={`M -100 -140 Q -150 ${-80 + Math.sin(lf / 6) * 10} -90 -40 Z M 100 -140 Q 150 ${-80 - Math.sin(lf / 6) * 10} 90 -40 Z`} fill={kind === "crow" ? "#1C1A22" : "#6E5238"} /> : null}
      {scarf ? <path d={`M -80 ${hy + 90} Q 0 ${hy + 120} 80 ${hy + 90} L 70 ${hy + 115} Q 0 ${hy + 145} -70 ${hy + 115} Z M 40 ${hy + 110} l 20 70 l 30 -10 Z`} fill={scarf} /> : null}
      {/* head */}
      {kind === "turtle" ? null : (
        <g>
          {kind === "lion" ? Array.from({ length: 14 }, (_, i) => <circle key={i} cx={Math.cos((i / 14) * Math.PI * 2) * 96} cy={hy + Math.sin((i / 14) * Math.PI * 2) * 96} r={44} fill="#9A5A22" />) : null}
          {kind === "elephant" ? <><ellipse cx={-110} cy={hy} rx={80} ry={100} fill="#8A929C" /><ellipse cx={110} cy={hy} rx={80} ry={100} fill="#8A929C" /></> : null}
          {kind === "rabbit" ? <><ellipse cx={-36} cy={hy - 140} rx={26} ry={80} fill={c} /><ellipse cx={36} cy={hy - 140} rx={26} ry={80} fill={c} /><ellipse cx={-36} cy={hy - 140} rx={12} ry={56} fill="#F2B8C0" /><ellipse cx={36} cy={hy - 140} rx={12} ry={56} fill="#F2B8C0" /></> : null}
          {kind === "fox" ? <path d={`M -80 ${hy - 40} l 20 -90 l 50 60 Z M 80 ${hy - 40} l -20 -90 l -50 60 Z`} fill={c} /> : null}
          {kind === "owl" ? <path d={`M -70 ${hy - 50} l 10 -60 l 40 40 Z M 70 ${hy - 50} l -10 -60 l -40 40 Z`} fill={c} /> : null}
          {kind === "deer" ? <path d={`M -40 ${hy - 70} l -30 -90 m 12 36 l -40 -20 M 40 ${hy - 70} l 30 -90 m -12 36 l 40 -20`} stroke="#6E4A2A" strokeWidth={10} strokeLinecap="round" fill="none" /> : null}
          {["cheetah", "lion", "bear", "monkey", "mouse", "deer"].includes(kind) ? [-62, 62].map((x) => <circle key={x} cx={x} cy={hy - 66} r={kind === "mouse" ? 44 : 26} fill={kind === "monkey" ? "#E7C29A" : c} />) : null}
          <circle cy={hy} r={bird ? 90 : 96} fill={c} />
          {kind === "monkey" ? <ellipse cy={hy + 16} rx={66} ry={60} fill="#E7C29A" /> : null}
          {kind === "owl" ? <><circle cx={-34} cy={hy - 6} r={34} fill="#F6E3C6" /><circle cx={34} cy={hy - 6} r={34} fill="#F6E3C6" /></> : null}
          {kind === "cheetah" ? <path d={`M -30 ${hy + 4} l -10 40 M 30 ${hy + 4} l 10 40`} stroke={dark} strokeWidth={5} /> : null}
          {kind === "elephant"
            ? <path d={`M -14 ${hy + 20} Q -20 ${hy + 120} ${10 + Math.sin(lf / 12) * 20} ${hy + 150}`} fill="none" stroke={c} strokeWidth={34} strokeLinecap="round" />
            : bird
              ? <path d={`M -14 ${hy + 16} L 14 ${hy + 16} L 0 ${hy + 46} Z`} fill="#E6A23A" />
              : <ellipse cy={hy + 22} rx={18} ry={12} fill={dark} />}
          {/* eyes */}
          {blink || mood === "sleepy"
            ? <path d={`M -48 ${eyeY - 10} q 14 10 28 0 M 20 ${eyeY - 10} q 14 10 28 0`} stroke={dark} strokeWidth={6} fill="none" strokeLinecap="round" />
            : <g>
              <circle cx={-34} cy={eyeY - 12} r={mood === "scared" ? 20 : 16} fill="#FFFFFF" />
              <circle cx={34} cy={eyeY - 12} r={mood === "scared" ? 20 : 16} fill="#FFFFFF" />
              <circle cx={-32} cy={eyeY - 10} r={10} fill={dark} /><circle cx={36} cy={eyeY - 10} r={10} fill={dark} />
              <circle cx={-28} cy={eyeY - 15} r={3.5} fill="#FFFFFF" /><circle cx={40} cy={eyeY - 15} r={3.5} fill="#FFFFFF" />
            </g>}
          {mood === "sad" ? <path d={`M -54 ${eyeY - 36} l 30 10 M 54 ${eyeY - 36} l -30 10`} stroke={dark} strokeWidth={5} /> : null}
          {mood === "proud" ? <path d={`M -54 ${eyeY - 32} l 30 -6 M 54 ${eyeY - 32} l -30 -6`} stroke={dark} strokeWidth={5} /> : null}
          {!bird && kind !== "elephant" ? <path d={mouth} fill="none" stroke={dark} strokeWidth={5} strokeLinecap="round" /> : null}
          {mood === "happy" || mood === "proud" ? <g fill="#F28C9A" opacity={0.45}><circle cx={-62} cy={hy + 26} r={14} /><circle cx={62} cy={hy + 26} r={14} /></g> : null}
          {mood === "scared" ? <ellipse cx={74} cy={hy - 30} rx={8} ry={14} fill="#9ED8F5" /> : null}
        </g>
      )}
    </g>
  );
};

/** Storybook text panel (watercolour card) for the moral. Origin = centre. data.title, data.text. */
const MoralCard: React.FC<PropCtx> = ({ lf, fps, data, pal }) => {
  const p = spring({ frame: lf, fps, config: { damping: 14 } });
  const lines = str(data.text, "").split("\n");
  return (
    <g transform={`scale(${0.9 + 0.1 * p})`} opacity={clamp01(p * 2)}>
      <rect x={-430} y={-80 - lines.length * 40} width={860} height={160 + lines.length * 80} rx={30} fill="#FFF8EA" stroke={pal.accent2} strokeWidth={6} filter={SHADOW} />
      <text y={-lines.length * 40 - 10} textAnchor="middle" fontFamily={FONT.mono} fontWeight={700} fontSize={30} fill={pal.accent}>{str(data.title, "")}</text>
      {lines.map((l, i) => <text key={i} y={-lines.length * 40 + 60 + i * 80} textAnchor="middle" fontFamily={FONT.display} fontSize={60} fill={pal.ink}>{l}</text>)}
    </g>
  );
};

/** Fluttering butterfly. Origin = body. data.color, data.path ("loop" flies in a slow figure-eight, "rest" sits still). */
const Butterfly: React.FC<PropCtx> = ({ lf, data }) => {
  const c = str(data.color, "#3DA5FF");
  const rest = str(data.path, "loop") === "rest";
  const flap = rest ? 0.85 + 0.15 * Math.sin(lf / 10) : 0.35 + 0.65 * Math.abs(Math.sin(lf / 3));
  const x = rest ? 0 : Math.sin(lf / 40) * 160, y = rest ? 0 : Math.sin(lf / 20) * 50;
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform={`scale(${flap} 1)`}>
        <path d="M 0 0 C -60 -70 -110 -20 -70 20 C -40 40 -10 20 0 0 Z M 0 0 C 60 -70 110 -20 70 20 C 40 40 10 20 0 0 Z" fill={c} stroke="#1C1A17" strokeWidth={3} />
        <circle cx={-55} cy={-10} r={10} fill="#FFFFFF" opacity={0.7} /><circle cx={55} cy={-10} r={10} fill="#FFFFFF" opacity={0.7} />
      </g>
      <ellipse rx={7} ry={26} fill="#1C1A17" />
      <path d="M -4 -24 q -10 -20 -20 -24 M 4 -24 q 10 -20 20 -24" stroke="#1C1A17" strokeWidth={3} fill="none" />
    </g>
  );
};

/** Ripe mango (data.half = true shows two halves). Origin = centre. */
const Mango: React.FC<PropCtx> = ({ data }) => (
  data.half === true
    ? <g filter={SHADOW}>{[-50, 50].map((x) => <g key={x} transform={`translate(${x} 0)`}><ellipse rx={44} ry={60} fill="#F6B93B" /><ellipse rx={20} ry={34} fill="#F2E3A0" /></g>)}</g>
    : <g filter={SHADOW}><path d="M 0 -70 C 70 -70 80 40 10 70 C -60 90 -80 -20 -30 -55 Z" fill="#F6A623" /><path d="M -6 -66 q 10 -30 30 -34" stroke="#3E7A3A" strokeWidth={8} fill="none" /><ellipse cx={30} cy={-80} rx={26} ry={12} fill="#3E9A5C" transform="rotate(-20 30 -80)" /></g>
);

/* ---------- stickman (original rig) ---------- */

type Pose = { sl: number; el: number; sr: number; er: number; hl: number; kl: number; hr: number; kr: number; lean: number };
/** Joint angles in degrees (0 = straight down, positive = towards the viewer's right). */
const POSES: Record<string, Pose> = {
  stand: { sl: 18, el: 8, sr: -18, er: -8, hl: 10, kl: 0, hr: -10, kr: 0, lean: 0 },
  wave: { sl: 18, el: 8, sr: -150, er: -30, hl: 10, kl: 0, hr: -10, kr: 0, lean: 0 },
  point: { sl: 18, el: 8, sr: -95, er: 0, hl: 10, kl: 0, hr: -10, kr: 0, lean: -4 },
  think: { sl: 18, el: 8, sr: -40, er: -150, hl: 8, kl: 0, hr: -8, kr: 0, lean: 0 },
  panic: { sl: 95, el: 50, sr: -95, er: -50, hl: 20, kl: -10, hr: -20, kr: 10, lean: 0 },
  cheer: { sl: 140, el: 20, sr: -140, er: -20, hl: 14, kl: 0, hr: -14, kr: 0, lean: 0 },
  reach: { sl: -70, el: -10, sr: -80, er: -10, hl: 30, kl: 60, hr: 10, kr: 70, lean: -35 },
  sit: { sl: 30, el: 40, sr: -30, er: -40, hl: 80, kl: -80, hr: 80, kr: -80, lean: 0 },
  shrug: { sl: 70, el: -100, sr: -70, er: 100, hl: 10, kl: 0, hr: -10, kr: 0, lean: 0 }
};
const rad = (d: number) => (d * Math.PI) / 180;
const limb = (x: number, y: number, a: number, len: number) => [x + Math.sin(rad(a)) * len, y + Math.cos(rad(a)) * len] as const;

/**
 * Original flat stickman (WinPlayBox design, not based on any existing character): round head, thick ink limbs,
 * mitten hands. ~520 px tall. Origin = feet.
 * data: pose (POSES or "walk"), face ("happy" | "shock" | "smug" | "sad" | "thirsty" | "think"), head (fill colour),
 * body (limb colour), sweat (bool), cap (colour), prop ("none" | "umbrella" | "bottle" | "phone").
 */
const Stickman: React.FC<PropCtx> = ({ lf, data }) => {
  const poseName = str(data.pose, "stand");
  const t = lf / 30;
  const w = Math.sin(t * 7);
  const base = POSES[poseName] ?? POSES.stand!;
  const p: Pose = poseName === "walk" ? { sl: 25 * w, el: 10, sr: -25 * w, er: -10, hl: 28 * w, kl: -Math.max(0, 30 * w), hr: -28 * w, kr: -Math.max(0, -30 * w), lean: 4 } : base;
  const ink = str(data.body, "#141414");
  const headFill = str(data.head, "#FFFFFF");
  const face = str(data.face, "happy");
  const sitting = poseName === "sit";
  const hipY = sitting ? -120 : -230;
  const bob = poseName === "walk" ? -Math.abs(w) * 8 : Math.sin(t * 2) * 3;
  const neckY = hipY - 170;
  const hx = Math.sin(rad(p.lean)) * 170, hy = hipY + bob;
  const nx = hx + 0, ny = neckY + bob;
  const headY = ny - 92;
  const arm = (s: number, e: number, side: 1 | -1) => {
    const [ex, ey] = limb(nx, ny + 20, s, 95);
    const [wx, wy] = limb(ex, ey, s + e, 90);
    return { d: `M ${nx} ${ny + 20} L ${ex} ${ey} L ${wx} ${wy}`, wx, wy, side };
  };
  const leg = (h: number, k: number) => {
    const [kx, ky] = limb(hx * 0, hy, h, 115);
    const [fx, fy] = limb(kx, ky, h + k, 115);
    return { d: `M 0 ${hy} L ${kx} ${ky} L ${fx} ${fy}`, fx, fy };
  };
  const arms = [arm(p.sl, p.el, 1), arm(p.sr, p.er, -1)];
  const legs = [leg(p.hl, p.kl), leg(p.hr, p.kr)];
  const stroke = { stroke: ink, strokeWidth: 22, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const blink = lf % 96 < 4;
  const eye = (x: number) => face === "smug"
    ? <path d={`M ${x - 18} ${headY - 4} q 18 -12 36 0`} stroke="#141414" strokeWidth={6} fill="none" strokeLinecap="round" />
    : blink ? <path d={`M ${x - 16} ${headY - 6} h 32`} stroke="#141414" strokeWidth={6} strokeLinecap="round" />
    : <g><ellipse cx={x} cy={headY - 8} rx={face === "shock" || face === "thirsty" ? 25 : 19} ry={face === "shock" || face === "thirsty" ? 30 : 23} fill="#FFFFFF" stroke="#141414" strokeWidth={5} />
      <circle cx={x + (face === "think" ? 7 : 2)} cy={headY - (face === "think" ? 16 : 6)} r={10} fill="#141414" /></g>;
  const mouth = face === "happy" ? <path d={`M ${nx - 26} ${headY + 26} q 26 26 52 0`} stroke="#141414" strokeWidth={6} fill="#7A1F1F" />
    : face === "shock" ? <ellipse cx={nx} cy={headY + 34} rx={16} ry={20} fill="#7A1F1F" stroke="#141414" strokeWidth={5} />
    : face === "thirsty" ? <g><path d={`M ${nx - 30} ${headY + 22} q 30 34 60 0 Z`} fill="#7A1F1F" stroke="#141414" strokeWidth={5} /><path d={`M ${nx - 4} ${headY + 34} q 10 ${30 + Math.sin(t * 6) * 4} 22 0`} fill="#F28C9A" stroke="#141414" strokeWidth={4} /></g>
    : face === "sad" ? <path d={`M ${nx - 22} ${headY + 36} q 22 -18 44 0`} stroke="#141414" strokeWidth={6} fill="none" strokeLinecap="round" />
    : face === "smug" ? <path d={`M ${nx - 10} ${headY + 30} q 22 10 34 -8`} stroke="#141414" strokeWidth={6} fill="none" strokeLinecap="round" />
    : <path d={`M ${nx - 18} ${headY + 30} h 36`} stroke="#141414" strokeWidth={6} strokeLinecap="round" />;
  const item = str(data.prop, "none");
  const hand = arms[1]!;
  return (
    <g filter={SHADOW}>
      {legs.map((l, i) => <g key={i}><path d={l.d} {...stroke} /><ellipse cx={l.fx + 12} cy={l.fy} rx={26} ry={12} fill={ink} /></g>)}
      <path d={`M ${hx} ${hy} L ${nx} ${ny}`} {...stroke} strokeWidth={20} />
      {arms.map((a, i) => <g key={i}><path d={a.d} {...stroke} /><circle cx={a.wx} cy={a.wy} r={17} fill={ink} /></g>)}
      {item === "umbrella" ? <g transform={`translate(${hand.wx} ${hand.wy})`}><line y2={-230} stroke="#3A3A3A" strokeWidth={8} /><path d="M -150 -220 Q 0 -330 150 -220 Q 112 -238 75 -220 Q 37 -238 0 -220 Q -37 -238 -75 -220 Q -112 -238 -150 -220 Z" fill="#2F6FD8" stroke="#141414" strokeWidth={5} /></g> : null}
      {item === "bottle" ? <g transform={`translate(${hand.wx} ${hand.wy - 40})`}><rect x={-16} y={-50} width={32} height={80} rx={10} fill="#9ED8F5" stroke="#141414" strokeWidth={5} /><rect x={-9} y={-66} width={18} height={18} fill="#2F6FD8" /></g> : null}
      {item === "phone" ? <rect x={hand.wx - 18} y={hand.wy - 70} width={36} height={64} rx={6} fill="#1C1A22" stroke="#141414" strokeWidth={4} /> : null}
      <circle cx={nx} cy={headY} r={96} fill={headFill} stroke="#141414" strokeWidth={9} />
      {str(data.cap, "") ? <path d={`M ${nx - 96} ${headY - 34} A 96 96 0 0 1 ${nx + 96} ${headY - 34} Z M ${nx + 50} ${headY - 38} h 84 v 16 h -84 Z`} fill={str(data.cap, "")} stroke="#141414" strokeWidth={5} /> : null}
      {eye(nx - 34)}{eye(nx + 34)}
      {face === "sad" || face === "thirsty" ? <path d={`M ${nx - 48} ${headY - 44} l 26 10 M ${nx + 48} ${headY - 44} l -26 10`} stroke="#141414" strokeWidth={6} /> : null}
      {face === "smug" ? <path d={`M ${nx - 46} ${headY - 34} l 28 -4 M ${nx + 46} ${headY - 30} l -28 -8`} stroke="#141414" strokeWidth={6} /> : null}
      {mouth}
      {data.sweat === true ? [0, 1].map((k) => <path key={k} d="M 0 0 q 10 16 0 24 q -10 -8 0 -24 Z" transform={`translate(${nx - 70 + k * 16} ${headY - 20 + k * 30 + ((lf * 2 + k * 20) % 30)})`} fill="#7FC8F5" stroke="#141414" strokeWidth={3} />) : null}
    </g>
  );
};

/** Three numbered doors / rooms for "which one is safe?" riddles. Origin = floor centre. data.labels (3), data.icons ("fire" | "lion" | "gun" | "water" | "skull" | "door"). */
const ThreeDoors: React.FC<PropCtx> = ({ lf, fps, data, pal }) => {
  const labels = Array.isArray(data.labels) ? (data.labels as string[]) : ["1", "2", "3"];
  const icons = Array.isArray(data.icons) ? (data.icons as string[]) : ["door", "door", "door"];
  return (
    <g>
      {[-300, 0, 300].map((x, i) => {
        const p = spring({ frame: lf - i * 8, fps, config: { damping: 14 } });
        const ic = icons[i] ?? "door";
        return (
          <g key={i} transform={`translate(${x} 0) scale(${0.6 + 0.4 * p})`} opacity={clamp01(p * 2)}>
            <rect x={-120} y={-420} width={240} height={420} rx={14} fill="#3A2A22" stroke="#141414" strokeWidth={8} filter={SHADOW} />
            <rect x={-96} y={-396} width={192} height={300} rx={8} fill={ic === "fire" ? "#3A1408" : ic === "water" ? "#0F2A3A" : ic === "gun" ? "#3A1414" : "#1C1612"} />
            {ic === "fire" ? [0, 1, 2].map((k) => <path key={k} d={`M ${-50 + k * 50} -110 q -30 -60 0 ${-110 - 20 * Math.sin(lf / 5 + k)} q 30 50 0 ${110 + 20 * Math.sin(lf / 5 + k)} Z`} fill={k === 1 ? "#FFD23F" : "#FF6A1F"} />) : null}
            {ic === "lion" ? <g transform="translate(0 -220)"><circle r={70} fill="#9A5A22" /><circle r={46} fill="#D9963A" /><circle cx={-16} cy={-8} r={6} fill="#141414" /><circle cx={16} cy={-8} r={6} fill="#141414" /><path d="M -14 16 q 14 12 28 0" stroke="#141414" strokeWidth={5} fill="none" /></g> : null}
            {ic === "gun" ? <g transform="translate(0 -230)" fill="#9A9AA8">{[-50, 0, 50].map((k) => <g key={k} transform={`translate(${k} 0)`}><circle cy={-30} r={18} /><rect x={-14} y={-12} width={28} height={70} rx={8} /></g>)}</g> : null}
            {ic === "water" ? <path d={`M -96 -160 q 24 -14 48 0 t 48 0 t 48 0 t 48 0 V -96 H -96 Z`} fill="#2F8FD8" /> : null}
            {ic === "skull" ? <g transform="translate(0 -240)"><circle r={50} fill="#ECE6D8" /><circle cx={-18} cy={-6} r={12} fill="#141414" /><circle cx={18} cy={-6} r={12} fill="#141414" /><rect x={-24} y={34} width={48} height={22} fill="#ECE6D8" /></g> : null}
            <circle cx={80} cy={-200} r={10} fill="#F6B93B" />
            <rect x={-60} y={-480} width={120} height={60} rx={12} fill={pal.accent2} stroke="#141414" strokeWidth={6} />
            <text y={-436} textAnchor="middle" fontFamily={FONT.display} fontSize={48} fill="#141414">{labels[i]}</text>
          </g>
        );
      })}
    </g>
  );
};

export const CHANNEL_PROPS = {
  stickman: Stickman, threeDoors: ThreeDoors,
  butterfly: Butterfly, mango: Mango,
  train: Train, rails: Rails, statBars: StatBars,
  ruin: Ruin, lantern: Lantern, shadow: Shadow, road: Road,
  animal: Animal, moralCard: MoralCard
} as const;
