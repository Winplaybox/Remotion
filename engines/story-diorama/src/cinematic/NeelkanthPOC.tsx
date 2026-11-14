import React from "react";
import { AbsoluteFill, Audio, interpolate, interpolateColors, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Character } from "@visuals/rig/Character";
import type { Look } from "@visuals/rig/presets";
import { PROPS, PropDefs } from "../props";
import { camAt, planeStyle, type Cam, type CamKey } from "./camera";

/**
 * PROOF OF CONCEPT — Cinematic 2.5D, EP11 Neelkanth (halahal -> Shiva drinks the poison), 10 s, 1080x1920, 30 fps.
 * Isolated: registered only as the Studio composition "NeelkanthCinematicPOC"; no channel, no publishing.
 * Built only from the existing rig (Character), existing story-diorama paper props and SVG/CSS. No AI images, no 3D.
 */
export const POC_FPS = 30;
export const POC_FRAMES = 300;
const W = 1080, H = 1920;

const PAL = { paper: "#F5EEDF", ink: "#1C1A17", accent: "#F0533F", accent2: "#F6B93B", accent3: "#5BD17A" };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lin = (f: number, a: number, b: number, v0: number, v1: number) => interpolate(f, [a, b], [v0, v1], clamp);

// ---------- cast (existing rig, custom looks) ----------
const SHIVA: Look = { label: "Shiva", gender: "m", skin: "#6E9BD1", hair: "jata", hairColor: "#2A1E14", headwear: "none", headwearColor: "#000000", facialHair: "none",
  top: "vest", topColor: "#C9822E", trim: "#6B3A12", bottom: "dhoti", bottomColor: "#B9772A", shoes: "#6E9BD1", accessories: ["tripund", "rudraksha"], height: 1.05, build: "normal", eyes: "narrow", brow: "thick" };
const DEVA: Look = { label: "Deva", gender: "m", skin: "#E8B98A", hair: "topknot", hairColor: "#2A1E14", headwear: "none", headwearColor: "#000000", facialHair: "mustache",
  top: "sherwani", topColor: "#F6B93B", trim: "#C9861A", bottom: "dhoti", bottomColor: "#FFF3D1", shoes: "#8A5A2E", accessories: ["tilak"], height: 1, build: "normal" };
const DEVA2: Look = { ...DEVA, label: "Deva 2", topColor: "#F28C28", facialHair: "none", hair: "long" };
const ASURA: Look = { label: "Asura", gender: "m", skin: "#6A4E7A", hair: "messy", hairColor: "#1C1420", headwear: "none", headwearColor: "#000000", facialHair: "bigMustache",
  top: "vest", topColor: "#7A1F2A", trim: "#3A0E14", bottom: "dhoti", bottomColor: "#3A2A4A", shoes: "#2A1E14", accessories: ["scar"], height: 1.08, build: "stout", brow: "bushy" };

/** A rig character placed with its feet at (x, y), scale s. */
const Actor: React.FC<{ look: Look; x: number; y: number; s: number; f: number; action?: React.ComponentProps<typeof Character>["action"]; pose?: React.ComponentProps<typeof Character>["pose"];
  expression?: React.ComponentProps<typeof Character>["expression"]; facing?: 1 | -1; lean?: number; seed: string }> = ({ look, x, y, s, f, action, pose, expression, facing = 1, lean = 0, seed }) => (
  <g transform={`translate(${x} ${y}) rotate(${lean}) scale(${s})`}>
    <Character look={look} frame={f} facing={facing} seed={seed} {...(action ? { action } : {})} {...(pose ? { pose } : {})} {...(expression ? { expression } : {})} />
  </g>
);

/** Shiva extras drawn over the rig: crescent moon in the jata. (sx, sy) = feet, s = scale. */
const ShivaMoon: React.FC<{ sx: number; sy: number; s: number }> = ({ sx, sy, s }) => (
  <g transform={`translate(${sx + 34 * s} ${sy - 548 * s}) scale(${s})`}>
    <path d="M 18 -26 A 26 26 0 1 1 -8 18 A 20 20 0 1 0 18 -26 Z" fill="#FFF3D1" stroke="#C9A24A" strokeWidth={2} />
  </g>
);

// ---------- atmosphere ----------
const Sky: React.FC<{ top: string; bottom: string; sun?: { x: number; y: number; r: number; color: string } }> = ({ top, bottom, sun }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient>
      <radialGradient id="sunglow"><stop offset="0" stopColor={sun?.color ?? "#FFF"} stopOpacity={0.9} /><stop offset="1" stopColor={sun?.color ?? "#FFF"} stopOpacity={0} /></radialGradient></defs>
    <rect x={-400} y={-900} width={W + 800} height={H + 1800} fill="url(#sky)" />
    {sun ? <><circle cx={sun.x} cy={sun.y} r={sun.r * 3.2} fill="url(#sunglow)" /><circle cx={sun.x} cy={sun.y} r={sun.r} fill={sun.color} /></> : null}
  </svg>
);

const Ridges: React.FC<{ y: number; color: string; seed: string; amp?: number }> = ({ y, color, seed, amp = 160 }) => {
  const pts: string[] = [`-200,${H}`];
  for (let i = 0; i <= 14; i++) pts.push(`${-200 + i * 110},${y - random(`${seed}${i}`) * amp - (i % 3 === 1 ? amp * 0.6 : 0)}`);
  pts.push(`1400,${H}`);
  return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}><polygon points={pts.join(" ")} fill={color} /></svg>;
};

const Fog: React.FC<{ f: number; y: number; color: string; opacity: number; seed: string }> = ({ f, y, color, opacity, seed }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
    <defs><filter id={`fog-${seed}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter></defs>
    <g filter={`url(#fog-${seed})`} opacity={opacity}>
      {[0, 1, 2, 3, 4].map((i) => {
        const x = ((i * 300 + f * (1.2 + i * 0.3) + random(`${seed}${i}`) * 400) % 1700) - 300;
        return <ellipse key={i} cx={x} cy={y + Math.sin(f / 30 + i) * 30 + i * 40} rx={360} ry={90} fill={color} />;
      })}
    </g>
  </svg>
);

const GodRays: React.FC<{ f: number; x: number; y: number; color: string; opacity: number }> = ({ f, x, y, color, opacity }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", mixBlendMode: "screen" }}>
    <defs><linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity={0.75} /><stop offset="1" stopColor={color} stopOpacity={0} /></linearGradient></defs>
    <g opacity={opacity} transform={`rotate(${Math.sin(f / 50) * 3} ${x} ${y})`}>
      {[-46, -30, -16, -4, 8, 21, 36, 50].map((a, i) => (
        <polygon key={i} points={`${x},${y} ${x + Math.sin(((a - 3) * Math.PI) / 180) * 2200},${y + Math.cos(((a - 3) * Math.PI) / 180) * 2200} ${x + Math.sin(((a + 3 + (i % 2) * 2) * Math.PI) / 180) * 2200},${y + Math.cos(((a + 3 + (i % 2) * 2) * Math.PI) / 180) * 2200}`}
          fill="url(#ray)" opacity={0.35 + 0.25 * Math.sin(f / 18 + i * 1.7)} />
      ))}
    </g>
  </svg>
);

/** Deterministic particles: snow drifts down, embers rise, spray bursts. */
const Particles: React.FC<{ f: number; n: number; kind: "snow" | "embers" | "spray"; color: string; seed: string; area?: [number, number, number, number] }> = ({ f, n, kind, color, seed, area = [0, 0, W, H] }) => {
  const [ax, ay, aw, ah] = area;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {Array.from({ length: n }, (_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const speed = 0.6 + r("s") * 1.6;
        let x = ax + r("x") * aw, y = ay + r("y") * ah;
        if (kind === "snow") { y = ay + ((r("y") * ah + f * speed * 3) % ah); x += Math.sin(f / 20 + i) * 14; }
        if (kind === "embers") { y = ay + ah - ((r("y") * ah + f * speed * 4) % ah); x += Math.sin(f / 12 + i) * 10; }
        if (kind === "spray") { const ph = ((f * speed * 2 + r("p") * 60) % 60) / 60; y = ay + ah - Math.sin(ph * Math.PI) * ah * 0.9; x += (ph - 0.5) * 60 * (r("d") > 0.5 ? 1 : -1); }
        const size = (kind === "spray" ? 5 : 3) + r("r") * (kind === "snow" ? 6 : 5);
        return <circle key={i} cx={x} cy={y} r={size} fill={color} opacity={0.35 + r("o") * 0.55} />;
      })}
    </svg>
  );
};

/** Halahal: rising, turbulent poison smoke (SVG turbulence displacement, animated by frame -> deterministic). */
const Poison: React.FC<{ f: number; x: number; y: number; scale: number; opacity: number; id: string }> = ({ f, x, y, scale, opacity, id }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
    <defs>
      <filter id={`tox-${id}`} x="-60%" y="-60%" width="220%" height="220%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={3} seed={7} result="n" />
        <feOffset in="n" dx={0} dy={-f * 2.2} result="m" />
        <feDisplacementMap in="SourceGraphic" in2="m" scale={90} xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="6" />
      </filter>
      <radialGradient id={`toxg-${id}`}><stop offset="0" stopColor="#7DFF6A" stopOpacity={0.95} /><stop offset="0.45" stopColor="#2E7D32" stopOpacity={0.85} /><stop offset="1" stopColor="#0E2A12" stopOpacity={0} /></radialGradient>
    </defs>
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} filter={`url(#tox-${id})`}>
      {Array.from({ length: 9 }, (_, i) => {
        const t = (f * 0.012 + i / 9) % 1;
        return <circle key={i} cx={Math.sin(i * 2.1 + f / 25) * 90 * t} cy={-t * 900} r={110 + t * 260} fill={`url(#toxg-${id})`} opacity={1 - t * 0.6} />;
      })}
    </g>
  </svg>
);

const Grade: React.FC<{ color: string; opacity: number; mode?: React.CSSProperties["mixBlendMode"] }> = ({ color, opacity, mode = "soft-light" }) =>
  <AbsoluteFill style={{ background: color, opacity, mixBlendMode: mode }} />;
const Vignette: React.FC<{ strength: number }> = ({ strength }) =>
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,${strength}) 100%)` }} />;
const Letterbox: React.FC = () => <AbsoluteFill style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,.4)" }} />;

/** One depth plane: everything inside is laid out in 1080x1920 screen space and moved by the camera. */
const Plane: React.FC<{ cam: Cam; d: number; f: number; children: React.ReactNode; opacity?: number }> = ({ cam, d, f, children, opacity = 1 }) => {
  const st = planeStyle(cam, d, f);
  return <AbsoluteFill style={{ transform: st.transform, filter: st.filter, opacity, transformOrigin: "0 0" }}>{children}</AbsoluteFill>;
};
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}><PropDefs />{children}</svg>;
const prop = (name: keyof typeof PROPS, f: number, data: Record<string, unknown> = {}) => {
  const C = PROPS[name];
  return <C lf={f} fps={POC_FPS} data={data} pal={PAL} />;
};

// ---------- shots ----------
interface Shot { id: string; from: number; len: number; cam: CamKey[]; render: (f: number, cam: Cam) => React.ReactNode }

const SHOTS: Shot[] = [
  { // 1 — extreme wide, crane down onto the churning ocean
    id: "manthan-wide", from: 0, len: 60,
    cam: [{ at: 0, y: -520, z: 1.0, focus: 0.7, dof: 4 }, { at: 56, y: 0, z: 1.1 }],
    render: (f, cam) => {
      const pull = Math.sin((f / POC_FPS) * 2.2);
      return <>
        <Plane cam={cam} d={0.1} f={f}><Sky top="#F2A65A" bottom="#FCE3B0" sun={{ x: 720, y: 760, r: 70, color: "#FFF1C9" }} /></Plane>
        <Plane cam={cam} d={0.25} f={f}><Ridges y={1150} color="#C98A6A" seed="far" amp={120} /></Plane>
        <Plane cam={cam} d={0.4} f={f}><Ridges y={1260} color="#9A5E4E" seed="mid" amp={90} /></Plane>
        <Plane cam={cam} d={0.55} f={f}><Svg><g transform="translate(540 1330) scale(1.6 1.2)">{prop("water", f, { amp: 3, pads: false })}</g></Svg></Plane>
        <Plane cam={cam} d={0.7} f={f}><Svg><g transform="translate(540 1460) scale(1.05)">{prop("churning", f, { figures: false })}</g></Svg></Plane>
        <Plane cam={cam} d={0.85} f={f}><Svg>
          {[0, 1, 2].map((i) => <Actor key={`d${i}`} look={i % 2 ? DEVA2 : DEVA} x={110 + i * 105 - pull * 22} y={1640 + i * 14} s={0.44} f={f + i * 7} action="walk" facing={-1} lean={-8 - pull * 4} seed={`dv${i}`} />)}
          {[0, 1, 2].map((i) => <Actor key={`a${i}`} look={ASURA} x={970 - i * 105 - pull * 22} y={1640 + i * 14} s={0.46} f={f + i * 5} action="walk" facing={1} lean={8 - pull * 4} seed={`as${i}`} />)}
        </Svg></Plane>
        <Plane cam={cam} d={1.15} f={f}><Particles f={f} n={70} kind="spray" color="#E8F6FF" seed="spray1" area={[120, 1500, 840, 260]} /></Plane>
        <Plane cam={cam} d={1.3} f={f}><Fog f={f} y={1780} color="#FFF6E6" opacity={0.55} seed="f1" /></Plane>
      </>;
    }
  },
  { // 2 — low-angle medium, dolly-in, focus pull from the rope to the rising halahal
    id: "halahal-rises", from: 60, len: 45,
    cam: [{ at: 0, y: 120, z: 1.05, focus: 1.3, dof: 16 }, { at: 40, y: 40, z: 1.32, focus: 0.7, dof: 16 }],
    render: (f, cam) => <>
      <Plane cam={cam} d={0.1} f={f}><Sky top={interpolateColors(f, [0, 40], ["#B07A4A", "#14301A"])} bottom={interpolateColors(f, [0, 40], ["#F2D49A", "#6E8A4A"])} /></Plane>
      <Plane cam={cam} d={0.35} f={f}><Ridges y={1300} color="#4E5A3A" seed="mid2" amp={110} /></Plane>
      <Plane cam={cam} d={0.55} f={f}><Svg><g transform="translate(540 1420) scale(1.8 1.3)">{prop("water", f, { amp: 5, pads: false, c1: "#2F4A3A", c2: "#26402F", c3: "#1C3024" })}</g></Svg></Plane>
      <Plane cam={cam} d={0.7} f={f}><Poison f={f + 30} x={540} y={1420} scale={lin(f, 0, 40, 0.35, 1.05)} opacity={lin(f, 0, 10, 0, 1)} id="p2" /></Plane>
      <Plane cam={cam} d={1.3} f={f}><Svg>
        <path d={`M -100 ${1720 + Math.sin(f / 6) * 8} Q 540 ${1560 + Math.sin(f / 5) * 20} 1180 ${1690 + Math.sin(f / 7) * 8}`} stroke="#2F6A2E" strokeWidth={70} fill="none" strokeLinecap="round" />
        <path d={`M -100 ${1720 + Math.sin(f / 6) * 8} Q 540 ${1560 + Math.sin(f / 5) * 20} 1180 ${1690 + Math.sin(f / 7) * 8}`} stroke="#5FA35A" strokeWidth={18} fill="none" strokeDasharray="40 50" strokeLinecap="round" />
      </Svg></Plane>
      <Grade color="#2EFF5A" opacity={lin(f, 5, 40, 0, 0.35)} mode="color" />
    </>
  },
  { // 3a — reaction close-up: a Deva, hands to face, trembling
    id: "deva-fear", from: 105, len: 23,
    cam: [{ at: 0, z: 1.0, shake: 6, focus: 1, dof: 10 }, { at: 22, z: 1.06 }],
    render: (f, cam) => <>
      <Plane cam={cam} d={0.2} f={f}><Sky top="#0E2A12" bottom="#3E6A2A" /></Plane>
      <Plane cam={cam} d={0.45} f={f}><Poison f={f + 80} x={300} y={1900} scale={1.3} opacity={0.9} id="p3a" /></Plane>
      <Plane cam={cam} d={1} f={f}><Svg><Actor look={DEVA} x={560} y={1920} s={2.25} f={f} action="afraid" facing={1} seed="dvc" /></Svg></Plane>
      <Plane cam={cam} d={1.4} f={f}><Particles f={f} n={40} kind="embers" color="#9CFF7A" seed="e3" /></Plane>
      <Grade color="#2EFF5A" opacity={0.3} mode="color" />
    </>
  },
  { // 3b — reaction close-up: an Asura, shocked, steps back
    id: "asura-shock", from: 128, len: 22,
    cam: [{ at: 0, x: -40, z: 1.08, shake: 4, focus: 1, dof: 10 }, { at: 21, x: 30, z: 1.0 }],
    render: (f, cam) => <>
      <Plane cam={cam} d={0.2} f={f}><Sky top="#0E2A12" bottom="#3E6A2A" /></Plane>
      <Plane cam={cam} d={0.45} f={f}><Poison f={f + 120} x={800} y={1900} scale={1.3} opacity={0.9} id="p3b" /></Plane>
      <Plane cam={cam} d={1} f={f}><Svg><Actor look={ASURA} x={520 + lin(f, 0, 21, 0, 60)} y={1940} s={2.2} f={f} action="surprised" facing={-1} seed="asc" /></Svg></Plane>
      <Plane cam={cam} d={1.4} f={f}><Particles f={f} n={40} kind="embers" color="#9CFF7A" seed="e3b" /></Plane>
      <Grade color="#2EFF5A" opacity={0.3} mode="color" />
    </>
  },
  { // 4 — wide reveal of Kailash: crane up + pan, god-rays, Devas walk to Shiva and fold hands
    id: "kailash-reveal", from: 150, len: 45,
    cam: [{ at: 0, y: 380, x: -120, z: 1.15, focus: 0.5, dof: 5 }, { at: 42, y: 0, x: 0, z: 1.0 }],
    render: (f, cam) => <>
      <Plane cam={cam} d={0.08} f={f}><Sky top="#1B2A4A" bottom="#7FA6C8" /></Plane>
      <Plane cam={cam} d={0.12} f={f}><GodRays f={f} x={560} y={560} color="#FFF3D1" opacity={lin(f, 0, 25, 0, 1)} /></Plane>
      <Plane cam={cam} d={0.3} f={f}><Svg>
        <polygon points="-100,1600 260,980 400,1080 560,700 720,1060 860,960 1180,1600" fill="#5E6A86" />
        <polygon points="470,840 560,700 650,840 600,820 560,860 520,820" fill="#F2F6FF" />
        <polygon points="230,1030 260,980 300,1040" fill="#E6ECF5" /><polygon points="830,1010 860,960 900,1020" fill="#E6ECF5" />
      </Svg></Plane>
      <Plane cam={cam} d={0.3} f={f}><Svg>
        <circle cx={560} cy={520} r={150} fill="#FFF3D1" opacity={0.18} />
        <Actor look={SHIVA} x={560} y={770} s={0.5} f={f} action="idle" facing={1} seed="sh4" />
        <ShivaMoon sx={560} sy={770} s={0.5} />
        <g transform="translate(640 770) scale(0.5)"><rect x={-6} y={-420} width={12} height={420} rx={5} fill="#6B6F78" /><path d="M -46 -420 Q -50 -470 -30 -496 Q -34 -455 -8 -440 L 0 -500 L 8 -440 Q 34 -455 30 -496 Q 50 -470 46 -420 Z" fill="#C9CED6" /></g>
      </Svg></Plane>
      <Plane cam={cam} d={0.6} f={f}><Fog f={f} y={1180} color="#E8F0FF" opacity={0.6} seed="f4" /></Plane>
      <Plane cam={cam} d={0.85} f={f}><Svg>
        {[0, 1, 2].map((i) => {
          const walk = lin(f, 0, 32, 0, 1);
          const x = 140 + i * 110 + walk * 160;
          return <Actor key={i} look={i === 1 ? DEVA2 : DEVA} x={x} y={1640 + i * 25} s={0.48} f={f + i * 6} action={walk < 1 ? "walk" : undefined} pose={walk < 1 ? undefined : "clasp"} facing={1} seed={`w${i}`} />;
        })}
      </Svg></Plane>
      <Plane cam={cam} d={1.25} f={f}><Particles f={f} n={90} kind="snow" color="#FFFFFF" seed="sn4" /></Plane>
    </>
  },
  { // 5 — low-angle medium on Shiva, dolly-in; the halahal spirals into his raised palm
    id: "shiva-takes", from: 195, len: 60,
    cam: [{ at: 0, z: 1.0, y: 60, focus: 1, dof: 8 }, { at: 56, z: 1.16, y: -20 }],
    render: (f, cam) => {
      const sx = 430, sy = 1930, s = 2.6;
      const palm = { x: sx + 138 * s, y: sy - 318 * s };
      return <>
        <Plane cam={cam} d={0.1} f={f}><Sky top="#0F1A2E" bottom="#3A5A7A" /></Plane>
        <Plane cam={cam} d={0.2} f={f}><GodRays f={f + 40} x={540} y={300} color="#BFE9FF" opacity={0.7} /></Plane>
        <Plane cam={cam} d={0.3} f={f}><Svg><polygon points="-100,1500 300,900 540,640 800,920 1180,1500" fill="#46526E" /><polygon points="480,740 540,640 600,740" fill="#F2F6FF" /></Svg></Plane>
        <Plane cam={cam} d={1} f={f}><Svg>
          <circle cx={sx} cy={sy - 430 * s} r={330} fill="#7DFF6A" opacity={0.12 + 0.05 * Math.sin(f / 6)} />
          <Actor look={SHIVA} x={sx} y={sy} s={s} f={f} pose={f < 8 ? "idle" : "talk"} expression="neutral" facing={1} seed="sh5" />
          <ShivaMoon sx={sx} sy={sy} s={s} />
          <g transform={`translate(${sx - 250} ${sy}) scale(${s * 0.75})`}><rect x={-7} y={-640} width={14} height={640} rx={6} fill="#6B6F78" />
            <path d="M -60 -640 Q -64 -700 -40 -730 Q -44 -680 -10 -660 L 0 -740 L 10 -660 Q 44 -680 40 -730 Q 64 -700 60 -640 Z" fill="#C9CED6" stroke="#8C939E" strokeWidth={4} /></g>
          {Array.from({ length: 26 }, (_, i) => {
            const t = Math.min(1, Math.max(0, (f - 6 - i * 1.6) / 30));
            const ang = i * 0.9 + t * 5;
            const rad = (1 - t) * (300 + (i % 5) * 30);
            return t > 0 && t < 1 ? <circle key={i} cx={palm.x + Math.cos(ang) * rad} cy={palm.y + Math.sin(ang) * rad * 0.6 - (1 - t) * 120} r={14 + (1 - t) * 26} fill="#3FAF4A" opacity={0.55 * (1 - t * 0.5)} /> : null;
          })}
          <circle cx={palm.x} cy={palm.y} r={34 + 10 * Math.sin(f / 4)} fill="#7DFF6A" opacity={lin(f, 20, 40, 0, 0.75)} />
        </Svg></Plane>
        <Plane cam={cam} d={1.35} f={f}><Particles f={f} n={36} kind="embers" color="#9CFF7A" seed="e5" /></Plane>
        <Grade color="#2EFF5A" opacity={0.14} mode="soft-light" />
      </>;
    }
  },
  { // 6 — close-up face/throat, slow push-in: the throat turns blue, a calm smile — Neelkanth
    id: "neelkanth", from: 255, len: 45,
    cam: [{ at: 0, z: 1.0, y: 0, focus: 1, dof: 10 }, { at: 44, z: 1.1, y: 60 }],
    render: (f, cam) => {
      const s = 3.1, sx = 540, sy = 820 + 430 * s;
      const glow = lin(f, 4, 30, 0, 1);
      return <>
        <Plane cam={cam} d={0.15} f={f}><Sky top="#0B1424" bottom="#2E4A6A" /></Plane>
        <Plane cam={cam} d={0.35} f={f}><Fog f={f} y={1300} color="#9FB6CC" opacity={0.35} seed="f6" /></Plane>
        <Plane cam={cam} d={1} f={f}><Svg>
          <Actor look={SHIVA} x={sx} y={sy} s={s} f={f} pose="idle" expression={f < 26 ? "neutral" : "smiling"} facing={1} seed="sh6" />
          <ShivaMoon sx={sx} sy={sy} s={s} />
          <defs><radialGradient id="throat"><stop offset="0" stopColor="#3A7BFF" stopOpacity={0.95} /><stop offset="0.6" stopColor="#1E4FD8" stopOpacity={0.6} /><stop offset="1" stopColor="#1E4FD8" stopOpacity={0} /></radialGradient></defs>
          <ellipse cx={sx} cy={sy - 366 * s} rx={46 * s * (0.6 + 0.4 * glow)} ry={20 * s} fill="url(#throat)" opacity={glow} style={{ mixBlendMode: "multiply" }} />
          <ellipse cx={sx} cy={sy - 366 * s} rx={78 * s} ry={34 * s} fill="#6FA8FF" opacity={glow * 0.25 * (0.8 + 0.2 * Math.sin(f / 5))} style={{ mixBlendMode: "screen" }} />
        </Svg></Plane>
        <Plane cam={cam} d={1.4} f={f}><Particles f={f} n={30} kind="embers" color="#BFD8FF" seed="e6" /></Plane>
        <Vignette strength={0.75} />
      </>;
    }
  }
];

export const NEELKANTH_POC_SHOTS = SHOTS.map((s) => ({ id: s.id, from: s.from, len: s.len }));

const XFADE = 5;
export const NeelkanthCinematicPOC: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {SHOTS.map((s, i) => {
        const hardCut = s.id === "asura-shock"; // 3a -> 3b is a hard cut (reaction beat)
        const start = Math.max(0, s.from - (i && !hardCut ? XFADE : 0));
        return (
          <Sequence key={s.id} from={start} durationInFrames={s.len + (s.from - start)} name={s.id}>
            <ShotView shot={s} offset={s.from - start} />
          </Sequence>
        );
      })}
      <Vignette strength={0.35} />
      <Letterbox />
      <Sequence from={0}><Audio src={staticFile("sfx/water_loop.mp3")} volume={(f) => lin(f, 0, 10, 0, 0.5) * lin(f, 90, 105, 1, 0)} /></Sequence>
      <Sequence from={58}><Audio src={staticFile("sfx/riser.mp3")} volume={0.5} /></Sequence>
      <Sequence from={105}><Audio src={staticFile("sfx/whoosh.mp3")} volume={0.45} /></Sequence>
      <Sequence from={150}><Audio src={staticFile("sfx/bell.mp3")} volume={0.55} /></Sequence>
      <Sequence from={225}><Audio src={staticFile("sfx/swoosh.mp3")} volume={0.4} /></Sequence>
      <Sequence from={262}><Audio src={staticFile("sfx/ding.mp3")} volume={0.35} /></Sequence>
      <Sequence from={0}><Audio src={staticFile("sfx/music_saga.mp3")} volume={(f) => 0.16 * lin(f, 280, 299, 1, 0)} /></Sequence>
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{ shot: Shot; offset: number }> = ({ shot, offset }) => {
  const lf = useCurrentFrame() - offset; // frames since the shot's own start (negative during the crossfade-in)
  const f = Math.max(0, lf);
  const cam = camAt(shot.cam, f);
  const opacity = offset > 0 ? lin(lf, -offset, 0, 0, 1) : 1;
  return <AbsoluteFill style={{ opacity }}>{shot.render(f, cam)}</AbsoluteFill>;
};
