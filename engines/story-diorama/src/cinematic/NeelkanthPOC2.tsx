import React from "react";
import { AbsoluteFill, Audio, interpolate, interpolateColors, Sequence, staticFile, useCurrentFrame } from "remotion";
import { camAt, type Cam, type CamKey } from "./camera";
import { Actor, ASURA, DEVA, DEVA2, Fog, GodRays, Grade, lin, Particles, Plane, Poison, Ridges, Sky, Vignette } from "./NeelkanthPOC";
import { handPos, ShivaFigure, Trishul } from "./ShivaFigure";
import { NEELKANTH_LINES as LINES } from "./neelkanth-lines";

/**
 * PROOF OF CONCEPT — iteration 2. Cinematic 2.5D, EP11 Neelkanth, 10 s, 1080x1920, 30 fps. Studio only, no channel.
 * Four narration-driven shots (one per narration line), each with its own camera move and character acting:
 *  S1 0-78    "…amrit se pehle nikla HALAHAL"   churning: Mandara turns (texture bands slide), Vasuki slides, Devas/Asuras heave
 *  S2 78-144  "…devta aur asur kaanp uthe"      over-the-shoulder: halahal erupts, ocean turns green, ripples, reactions
 *  S3 144-222 "Tab Mahadev aage aaye…"          smoke wipe -> Shiva silhouette lights up, steps forward, poison flows into palm
 *  S4 222-300 "…bane NEELKANTH"                  action cut on the rising palm -> drinks, eyes close, throat turns blue
 * Captions are karaoke-timed to the narration windows below (real voice is generated in CI, see poc-narration.yml).
 */
export const POC2_FPS = 30;
export const POC2_FRAMES = 300;
const W = 1080, H = 1920;
const sm = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });

/** Narration windows (frames). Each window = one shot. */
export const LINE_WINDOWS: [number, number][] = [[0, 78], [78, 144], [144, 222], [222, 300]];

const SvgBox: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>{children}</svg>;

// ---------------------------------------------------------------- ocean (procedural waves + reflection)
const Ocean: React.FC<{ f: number; y0: number; tox: number; reflectX: number; reflectColor: string; ripple?: { x: number; t: number } }> = ({ f, y0, tox, reflectX, reflectColor, ripple }) => {
  const deep = interpolateColors(tox, [0, 1], ["#123A5C", "#0F3A1C"]);
  const mid = interpolateColors(tox, [0, 1], ["#1F6A8F", "#2E7D32"]);
  const crest = interpolateColors(tox, [0, 1], ["#BFE6F5", "#B8FF9A"]);
  const rows = 9;
  return (
    <SvgBox>
      <defs><linearGradient id="oc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mid} /><stop offset="1" stopColor={deep} /></linearGradient></defs>
      <rect x={-300} y={y0} width={W + 600} height={H - y0 + 900} fill="url(#oc)" />
      {/* reflection column of the light source (wobbling segments) */}
      {Array.from({ length: 16 }, (_, i) => {
        const yy = y0 + 10 + i * i * 4.2;
        const w = 30 + i * 9 + Math.sin(f / 5 + i * 1.3) * 12;
        return <rect key={i} x={reflectX - w / 2 + Math.sin(f / 7 + i) * 10} y={yy} width={w} height={3 + i * 0.7} rx={3} fill={reflectColor} opacity={0.75 - i * 0.04} />;
      })}
      {/* wave rows: perspective — far rows thin & slow, near rows tall & fast */}
      {Array.from({ length: rows }, (_, r) => {
        const t = r / (rows - 1);
        const y = y0 + 12 + t * t * (H - y0 + 200);
        const amp = 3 + t * 22, len = 60 + t * 260, sp = 0.6 + t * 2.4;
        const pts: string[] = [];
        for (let x = -300; x <= W + 300; x += 24) pts.push(`${x},${(y + Math.sin((x + f * sp * 6) / len * Math.PI * 2 + r) * amp).toFixed(1)}`);
        return <polyline key={r} points={pts.join(" ")} fill="none" stroke={crest} strokeWidth={1.5 + t * 4} opacity={0.25 + t * 0.35} strokeLinecap="round" />;
      })}
      {ripple ? [0, 1, 2].map((k) => {
        const p = (ripple.t + k * 0.33) % 1;
        return <ellipse key={k} cx={ripple.x} cy={y0 + 60} rx={60 + p * 520} ry={10 + p * 70} fill="none" stroke={crest} strokeWidth={6 * (1 - p)} opacity={1 - p} />;
      }) : null}
    </SvgBox>
  );
};

// ---------------------------------------------------------------- Mandara + Vasuki (rotation by sliding bands)
const MANDARA = "M -230 0 C -210 -160 -160 -330 -100 -470 C -70 -560 -30 -640 0 -660 C 40 -630 80 -560 110 -470 C 165 -320 210 -160 230 0 Z";
const Mandara: React.FC<{ spin: number; glow: number }> = ({ spin, glow }) => (
  <g>
    <defs>
      <clipPath id="md-clip"><path d={MANDARA} /></clipPath>
      <linearGradient id="md-shade" x1="0" x2="1"><stop offset="0" stopColor="#000" stopOpacity={0.55} /><stop offset="0.45" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.6} /></linearGradient>
      <radialGradient id="md-glow" cx="0.5" cy="1"><stop offset="0" stopColor="#8CFF6A" stopOpacity={0.9} /><stop offset="1" stopColor="#8CFF6A" stopOpacity={0} /></radialGradient>
    </defs>
    <path d={MANDARA} fill="#6B5A48" />
    <g clipPath="url(#md-clip)">
      {/* strata + trees sliding sideways = the mountain turns */}
      {Array.from({ length: 12 }, (_, r) => {
        const y = -40 - r * 52;
        return (
          <g key={r} transform={`translate(${((spin * (1 + r * 0.04) + r * 37) % 120) - 120} 0)`}>
            {Array.from({ length: 6 }, (_, k) => (
              <g key={k}>
                <rect x={k * 120} y={y - 14} width={70} height={12} rx={6} fill="#4E4134" />
                <path d={`M ${k * 120 + 90} ${y} l 14 -34 l 14 34 Z`} fill={r % 2 ? "#2F5A2A" : "#3E6E32"} />
              </g>
            ))}
          </g>
        );
      })}
      <path d={MANDARA} fill="url(#md-shade)" />
      <rect x={-260} y={-260} width={520} height={260} fill="url(#md-glow)" opacity={glow} />
    </g>
    <path d={MANDARA} fill="none" stroke="#2A2118" strokeWidth={5} />
    {/* snow cap */}
    <path d="M -38 -610 C -20 -640 20 -650 40 -612 C 20 -600 0 -620 -12 -600 C -20 -596 -30 -606 -38 -610 Z" fill="#F4F1EA" opacity={0.9} />
  </g>
);

/** Vasuki coils across the mountain; the scale pattern slides with the churn. */
const VasukiCoils: React.FC<{ slide: number }> = ({ slide }) => (
  <g>
    {[-110, -230, -350].map((y, i) => (
      <g key={i}>
        <path d={`M -200 ${y + 40} C -80 ${y - 10} 80 ${y - 10} 200 ${y + 40}`} stroke="#1E5A28" strokeWidth={46 - i * 6} fill="none" strokeLinecap="round" />
        <path d={`M -200 ${y + 40} C -80 ${y - 10} 80 ${y - 10} 200 ${y + 40}`} stroke="#5FBF5A" strokeWidth={14 - i * 2} fill="none" strokeDasharray="10 16" strokeDashoffset={slide * (i % 2 ? -1 : 1)} />
      </g>
    ))}
  </g>
);

/** A rope run of Vasuki between two points, sagging and vibrating under tension. */
const Rope: React.FC<{ x1: number; y1: number; x2: number; y2: number; f: number; slide: number; head?: boolean; w?: number }> = ({ x1, y1, x2, y2, f, slide, head, w = 34 }) => {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + 40 + Math.sin(f / 4) * 6;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  return (
    <g>
      <path d={d} stroke="#1E5A28" strokeWidth={w} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#5FBF5A" strokeWidth={w * 0.32} fill="none" strokeDasharray="9 14" strokeDashoffset={slide} />
      {head ? (
        <g transform={`translate(${x2} ${y2}) rotate(${Math.sin(f / 6) * 12})`}>
          <path d="M 0 -30 C 50 -40 80 -10 70 14 C 50 30 10 26 0 30 Z" fill="#1E5A28" stroke="#0E2A12" strokeWidth={4} />
          <circle cx={48} cy={-8} r={6} fill="#FFE34A" />
          <path d={`M 72 4 l 24 ${-4 + Math.sin(f / 3) * 4}`} stroke="#D32F2F" strokeWidth={4} />
        </g>
      ) : null}
    </g>
  );
};

// ---------------------------------------------------------------- captions (karaoke)
const Captions: React.FC<{ f: number }> = ({ f }) => {
  const li = LINE_WINDOWS.findIndex(([a, b]) => f >= a && f < b);
  if (li < 0) return null;
  const [a, b] = LINE_WINDOWS[li]!;
  const words: string[] = LINES.lines[li]!.caption.split(" ");
  const speakA = a + 3, speakB = b - 8; // speech sits inside the window with a short tail
  const total = words.reduce((n, w) => n + w.length + 2, 0);
  let acc = 0;
  const starts = words.map((w) => { const s = speakA + (acc / total) * (speakB - speakA); acc += w.length + 2; return s; });
  const appear = sm(f, a, a + 5) * (1 - sm(f, b - 4, b));
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 330, opacity: appear }}>
      <div style={{ width: 920, textAlign: "center", fontFamily: "'Poppins', 'Noto Sans', sans-serif", fontWeight: 800, fontSize: 64, lineHeight: 1.18, letterSpacing: -0.5 }}>
        {words.map((w, i) => {
          const on = f >= starts[i]!;
          const now = on && (i === words.length - 1 || f < starts[i + 1]!);
          const big = w === w.toUpperCase() && /[A-Z]/.test(w);
          return (
            <span key={i} style={{ display: "inline-block", margin: "0 9px", color: now ? "#FFD84A" : big ? "#9CFF7A" : "#FFFFFF", opacity: on ? 1 : 0.38,
              transform: `translateY(${now ? -4 : 0}px) scale(${now ? 1.08 : 1})`, WebkitTextStroke: "3px rgba(0,0,0,.85)", paintOrder: "stroke", textShadow: "0 6px 18px rgba(0,0,0,.7)" }}>{w}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- shots
interface Shot { id: string; from: number; len: number; cam: CamKey[]; render: (f: number, cam: Cam) => React.ReactNode }

const churn = (f: number) => Math.sin(f / 9); // back-and-forth heave
const SHOTS: Shot[] = [
  {
    id: "s1-manthan", from: 0, len: 78,
    cam: [{ at: 0, x: -70, y: 40, z: 1.14, focus: 1, dof: 3, shake: 0.8 }, { at: 78, x: 50, y: -10, z: 1.02, shake: 1.2 }],
    render: (f, cam) => {
      const heave = churn(f), spin = f * 3.2 + heave * 30, slide = f * 4 + heave * 40;
      const glow = sm(f, 40, 78);
      const pullL = heave * 7, pullR = -heave * 7;
      const devas = [{ x: 70, s: 0.5, look: DEVA }, { x: 205, s: 0.55, look: DEVA2 }];
      const asuras = [{ x: 875, s: 0.55, look: ASURA }, { x: 1010, s: 0.5, look: ASURA }];
      const ry = 1330;
      return <>
        <Plane cam={cam} d={0.15} f={f}><Sky top="#2B1E4A" bottom={interpolateColors(glow, [0, 1], ["#E89A5A", "#9ACB6A"])} sun={{ x: 760, y: 820, r: 46, color: "#FFE8B0" }} /></Plane>
        <Plane cam={cam} d={0.35} f={f}><Ridges y={900} color="#3A2E52" seed="m1" amp={120} /></Plane>
        <Plane cam={cam} d={0.6} f={f}><Ocean f={f} y0={880} tox={glow * 0.45} reflectX={760} reflectColor="#FFE8B0" /></Plane>
        <Plane cam={cam} d={1} f={f}>
          <SvgBox>
            <g transform="translate(540 1130)">
              <ellipse cx={0} cy={6} rx={300} ry={46} fill="#0E2A3A" opacity={0.55} />
              <path d="M -260 10 C -200 -60 200 -60 260 10 C 200 40 -200 40 -260 10 Z" fill="#5A7A4A" stroke="#2A3A20" strokeWidth={5} />
              <Mandara spin={spin} glow={glow} />
              <VasukiCoils slide={slide} />
            </g>
            <Rope x1={340} y1={1060} x2={devas[1]!.x + 92 * devas[1]!.s} y2={ry - 268 * devas[1]!.s} f={f} slide={-slide} head />
            <Rope x1={devas[1]!.x} y1={ry - 268 * devas[1]!.s} x2={devas[0]!.x + 92 * devas[0]!.s} y2={ry - 260 * devas[0]!.s} f={f + 7} slide={-slide} w={28} />
            <Rope x1={740} y1={1060} x2={asuras[0]!.x - 92 * asuras[0]!.s} y2={ry - 268 * asuras[0]!.s} f={f + 3} slide={slide} />
            <Rope x1={asuras[0]!.x} y1={ry - 268 * asuras[0]!.s} x2={asuras[1]!.x - 92 * asuras[1]!.s} y2={ry - 260 * asuras[1]!.s} f={f + 11} slide={slide} w={28} />
            {devas.map((d, i) => <Actor key={i} look={d.look} x={d.x - pullL * 2} y={ry} s={d.s} f={f} pose="forward" expression="stressed" lean={-8 + pullL} seed={`d${i}`} />)}
            {asuras.map((d, i) => <Actor key={i} look={d.look} x={d.x - pullR * 2} y={ry} s={d.s} f={f} pose="forward" expression="angry" facing={-1} lean={8 + pullR} seed={`a${i}`} />)}
          </SvgBox>
        </Plane>
        <Plane cam={cam} d={1.05} f={f}><Particles f={f} n={34} kind="spray" color="#DFF4FF" seed="sp1" area={[300, 960, 480, 220]} /></Plane>
        <Plane cam={cam} d={1.6} f={f}>
          <SvgBox><path d="M -200 1920 L -200 1560 C 0 1500 160 1560 300 1640 C 380 1700 420 1800 430 1920 Z" fill="#1A1410" /><path d="M 1280 1920 L 1280 1600 C 1100 1560 980 1640 900 1720 C 860 1780 850 1860 850 1920 Z" fill="#1A1410" /></SvgBox>
        </Plane>
        <Grade color="#FF9A4A" opacity={0.18 * (1 - glow)} />
        <Grade color="#5BD17A" opacity={0.22 * glow} />
      </>;
    }
  },
  {
    id: "s2-halahal", from: 78, len: 66,
    cam: [{ at: 0, x: 120, y: 80, z: 1.32, focus: 1, dof: 5, shake: 3 }, { at: 30, shake: 6 }, { at: 66, x: 20, y: -60, z: 1.0, shake: 2 }],
    render: (f, cam) => {
      const rise = sm(f, 0, 50), tox = 0.45 + rise * 0.55;
      const wipe = sm(f, 52, 66); // smoke fills the frame -> S3
      const ex = 640;
      return <>
        <Plane cam={cam} d={0.15} f={f}><Sky top="#0E0A1E" bottom={interpolateColors(rise, [0, 1], ["#7A9A5A", "#1E3A1A"])} /></Plane>
        <Plane cam={cam} d={0.35} f={f}><Ridges y={880} color="#1E1A2E" seed="m2" amp={110} /></Plane>
        <Plane cam={cam} d={0.55} f={f}><SvgBox><g transform="translate(330 900) scale(0.55)"><Mandara spin={f * 3} glow={1} /><VasukiCoils slide={f * 3} /></g></SvgBox></Plane>
        <Plane cam={cam} d={0.6} f={f}><Ocean f={f} y0={880} tox={tox} reflectX={ex} reflectColor="#B8FF9A" ripple={{ x: ex, t: f / 22 }} /></Plane>
        <Plane cam={cam} d={0.7} f={f}><Poison f={f + 30} x={ex} y={930} scale={0.45 + rise * 0.75} opacity={0.95} id="s2" /></Plane>
        <Plane cam={cam} d={0.7} f={f}><Particles f={f} n={26} kind="embers" color="#B8FF9A" seed="em2" area={[ex - 260, 300, 520, 640]} /></Plane>
        <Plane cam={cam} d={1.05} f={f}>
          <SvgBox>
            {/* reactions: look at the poison, then recoil */}
            <Actor look={DEVA} x={250 - sm(f, 10, 30) * 50} y={1300} s={0.62} f={f} action={f < 14 ? "lookRight" : "afraid"} {...(f >= 14 ? { pose: "point" as const } : {})} expression={f < 14 ? "surprised" : "afraid"} lean={-sm(f, 10, 30) * 6} seed="r1" />
            <Actor look={DEVA2} x={420 - sm(f, 18, 40) * 40} y={1350} s={0.66} f={f} action={f < 22 ? "lookRight" : "afraid"} {...(f >= 22 ? { pose: "handsFace" as const } : {})} expression="shocked" lean={-sm(f, 18, 40) * 9} seed="r2" />
            <Actor look={ASURA} x={900 + sm(f, 6, 26) * 50} y={1320} s={0.66} f={f} facing={-1} action={f < 8 ? "lookLeft" : "surprised"} {...(f >= 8 ? { pose: "handsUp" as const } : {})} expression="shocked" lean={sm(f, 6, 26) * 8} seed="r3" />
          </SvgBox>
        </Plane>
        {/* foreground over-the-shoulder: dark backs of two devas, out of focus */}
        <Plane cam={cam} d={1.7} f={f}>
          <SvgBox><g style={{ filter: "brightness(0.12)" }}>
            <Actor look={DEVA} x={110} y={2260} s={1.6} f={f} action="afraid" facing={1} seed="fg1" />
            <Actor look={DEVA2} x={1060} y={2320} s={1.5} f={f} facing={-1} action="nervous" seed="fg2" />
          </g></SvgBox>
        </Plane>
        <Grade color="#2E7D32" opacity={0.15 + rise * 0.3} mode="multiply" />
        <Grade color="#9CFF7A" opacity={0.12 * Math.max(0, Math.sin(f / 2.5))} mode="screen" />
        <AbsoluteFill style={{ background: `radial-gradient(circle at ${ex}px 900px, rgba(30,70,20,.98) ${wipe * 70}%, rgba(10,30,10,0) ${wipe * 70 + 25}%)`, opacity: wipe }} />
      </>;
    }
  },
  {
    id: "s3-mahadev", from: 144, len: 78,
    cam: [{ at: 0, x: 0, y: 260, z: 0.95, focus: 1, dof: 3 }, { at: 40, y: 80, z: 1.05 }, { at: 78, x: 30, y: -40, z: 1.2 }],
    render: (f, cam) => {
      const clear = 1 - sm(f, 0, 14); // smoke from S2 clears
      const lit = sm(f, 10, 34);
      const step = sm(f, 18, 40);
      const raise = sm(f, 30, 50);
      const flow = sm(f, 42, 70);
      const lower = sm(f, 68, 78); // palm starts toward the mouth -> continues in S4
      const sx = 560 - step * 40, sy = 1520 + step * 20, s = 0.6 + step * 0.06;
      const armR = { sh: 8 + raise * 140 + lower * 10, el: 6 - raise * 40 + lower * 60, cup: raise };
      const hp = handPos(1, armR);
      const hx = sx + hp.x * s, hy = sy + (hp.y + 172 * 0) * s;
      return <>
        <Plane cam={cam} d={0.1} f={f}><Sky top="#0A0E24" bottom={interpolateColors(lit, [0, 1], ["#1E2A44", "#5A6E9A"])} sun={{ x: 560, y: 520, r: 30, color: "#FFF6DA" }} /></Plane>
        <Plane cam={cam} d={0.25} f={f}><GodRays f={f} x={560} y={480} color="#DCE8FF" opacity={0.25 + lit * 0.6} /></Plane>
        <Plane cam={cam} d={0.35} f={f}><Ridges y={1100} color="#2A3456" seed="k1" amp={260} /></Plane>
        <Plane cam={cam} d={0.55} f={f}><Fog f={f} y={1180} color="#AFC3E8" opacity={0.35} seed="k3" /></Plane>
        {/* Kailash summit + Shiva on it */}
        <Plane cam={cam} d={1} f={f}>
          <SvgBox>
            <path d="M -200 1920 L -200 1600 C 120 1520 360 1500 560 1500 C 760 1500 980 1540 1280 1620 L 1280 1920 Z" fill="#DDE6F4" />
            <path d="M -200 1640 C 200 1570 400 1560 560 1560 C 760 1560 1000 1600 1280 1680 L 1280 1920 L -200 1920 Z" fill="#9EB0CE" />
            <g transform={`translate(${sx + 190 * s} ${sy}) scale(${s})`}><Trishul f={f} /></g>
            <g transform={`translate(${sx} ${sy}) scale(${s})`}>
              <ShivaFigure f={f} lit={lit} armR={armR} armL={{ sh: 14, el: 10 }} orb={flow} eyes={0} />
            </g>
            {/* stream of halahal poured from the cloud into the palm */}
            {flow > 0 ? (
              <path d={`M 120 360 C 300 ${420 + Math.sin(f / 5) * 20} ${hx - 160} ${hy - 300} ${hx} ${hy}`} stroke="#6BE05A" strokeWidth={10 + 16 * (1 - lower)} fill="none" strokeLinecap="round"
                strokeDasharray="60 22" strokeDashoffset={-f * 18} opacity={(0.9 * sm(f, 42, 48)) * (1 - lower)} />
            ) : null}
          </SvgBox>
        </Plane>
        {/* the poison cloud hangs top-left and is drawn down */}
        <Plane cam={cam} d={0.7} f={f}><Poison f={f + 80} x={140} y={620} scale={0.7 - flow * 0.35} opacity={0.9} id="s3" /></Plane>
        <Plane cam={cam} d={1.4} f={f}><Particles f={f} n={40} kind="snow" color="#FFFFFF" seed="sn3" /></Plane>
        <Grade color="#3A5AC9" opacity={0.25 * (1 - lit) + 0.1} mode="multiply" />
        <AbsoluteFill style={{ background: "rgba(30,70,20,1)", opacity: clear * 0.98 }} />
      </>;
    }
  },
  {
    id: "s4-neelkanth", from: 222, len: 78,
    cam: [{ at: 0, x: 40, y: 40, z: 1.0, focus: 1, dof: 0 }, { at: 34, x: 10, y: 0, z: 1.12 }, { at: 60, x: 0, y: 30, z: 1.28 }, { at: 78, z: 1.3 }],
    render: (f, cam) => {
      const toLips = sm(f, 0, 16);
      const drink = sm(f, 14, 30);
      const tilt = sm(f, 14, 26) * (1 - sm(f, 44, 58));
      const blue = sm(f, 26, 52);
      const open = sm(f, 54, 62);
      const away = sm(f, 36, 56);
      const title = sm(f, 56, 66);
      const armR = { sh: interpolate(toLips, [0, 1], [158, 162]) - away * 140, el: interpolate(toLips, [0, 1], [62, 128]) - away * 120, cup: 1 };
      const s = 1.32, sx = 540, sy = 1980;
      return <>
        <Plane cam={cam} d={0.1} f={f}><Sky top="#0A0E24" bottom="#4E6290" /></Plane>
        <Plane cam={cam} d={0.25} f={f}><GodRays f={f + 78} x={600} y={300} color="#DCE8FF" opacity={0.5 + blue * 0.3} /></Plane>
        <Plane cam={cam} d={0.4} f={f}><Ridges y={1300} color="#2A3456" seed="k1" amp={240} /></Plane>
        <Plane cam={cam} d={1} f={f}>
          <SvgBox>
            <g transform={`translate(${sx} ${sy}) scale(${s})`}>
              <ShivaFigure f={f} legs={false} armFront={away < 0.5} armR={armR} armL={{ sh: 12, el: 8 }} orb={1 - drink} headTilt={-12 * tilt}
                eyes={sm(f, 16, 24) * (1 - open)} throat={blue} smile={open} />
            </g>
            {/* throat glow pulse */}
            {blue > 0 ? <ellipse cx={sx} cy={sy - 806 * s} rx={70 + blue * 40} ry={40 + blue * 20} fill="#3A6AFF" opacity={blue * (0.25 + 0.15 * Math.sin(f / 3))} style={{ mixBlendMode: "screen" }} /> : null}
          </SvgBox>
        </Plane>
        <Plane cam={cam} d={1.3} f={f}><Particles f={f} n={30} kind="embers" color="#9CC2FF" seed="em4" area={[200, 500, 680, 900]} /></Plane>
        <Grade color="#2A4ACF" opacity={blue * 0.25} mode="soft-light" />
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 230, opacity: title }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: 132, letterSpacing: 8, color: "#BFD6FF", WebkitTextStroke: "4px #0A1440", paintOrder: "stroke",
            textShadow: "0 0 40px rgba(80,140,255,.9)", transform: `scale(${0.9 + title * 0.1})` }}>NEELKANTH</div>
        </AbsoluteFill>
      </>;
    }
  }
];

export const NEELKANTH_POC2_SHOTS = SHOTS.map((s) => ({ id: s.id, from: s.from, len: s.len }));

export const NeelkanthCinematicPOC2: React.FC<{ voice?: boolean }> = ({ voice = false }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {SHOTS.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.len} name={s.id}><ShotView shot={s} /></Sequence>
      ))}
      <Vignette strength={0.4} />
      <Captions f={frame} />
      {voice && LINES.lines.map((l, i) => (
        <Sequence key={l.id} from={LINE_WINDOWS[i]![0] + 3}><Audio src={staticFile(`audio/poc-neelkanth/${l.id}.wav`)} volume={1} /></Sequence>
      ))}
      <Sequence from={0}><Audio src={staticFile("sfx/water_loop.mp3")} volume={(f) => lin(f, 0, 8, 0, 0.35) * lin(f, 130, 144, 1, 0)} /></Sequence>
      <Sequence from={66}><Audio src={staticFile("sfx/riser.mp3")} volume={0.4} /></Sequence>
      <Sequence from={132}><Audio src={staticFile("sfx/whoosh.mp3")} volume={0.4} /></Sequence>
      <Sequence from={160}><Audio src={staticFile("sfx/bell.mp3")} volume={0.4} /></Sequence>
      <Sequence from={278}><Audio src={staticFile("sfx/ding.mp3")} volume={0.3} /></Sequence>
      <Sequence from={0}><Audio src={staticFile("sfx/music_saga.mp3")} volume={(f) => 0.12 * lin(f, 285, 299, 1, 0)} /></Sequence>
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill>{shot.render(f, camAt(shot.cam, f))}</AbsoluteFill>;
};

