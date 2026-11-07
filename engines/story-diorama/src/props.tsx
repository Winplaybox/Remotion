import React from "react";
import { interpolate, random, spring } from "remotion";
import { FONT } from "@visuals/fonts";
import type { PropName, StoryDiorama } from "./model";

export interface PropCtx {
  /** Frames since the layer appeared (can be negative before `at`). */
  lf: number;
  fps: number;
  data: Record<string, unknown>;
  pal: StoryDiorama["palette"];
}

const num = (v: unknown, d: number) => (typeof v === "number" ? v : d);
const str = (v: unknown, d: string) => (typeof v === "string" ? v : d);
const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const SHADOW = "url(#sd-shadow)";

/* ---------- sky & landscape ---------- */

const Moon: React.FC<PropCtx> = ({ lf, data }) => {
  const k = num(data.phase, 1);
  return (
    <g>
      <circle r={260} fill="url(#sd-moonglow)" opacity={0.5 + Math.sin(lf / 30) * 0.08} />
      <circle r={110} fill="#FFF3D1" />
      {k < 1 ? <circle cx={220 * k} r={112} fill="#141A44" /> : null}
      <circle cx={-30} cy={-20} r={16} fill="#E9D9AE" /><circle cx={30} cy={30} r={22} fill="#E9D9AE" /><circle cx={40} cy={-40} r={9} fill="#E9D9AE" />
    </g>
  );
};

const MoonPhases: React.FC<PropCtx> = ({ lf, fps }) => {
  const labels = ["PURNIMA", "", "ASHTAMI", "", "AMAVASYA"];
  return (
    <g>
      {[1, 0.72, 0.5, 0.25, 0].map((k, i) => {
        const pop = spring({ frame: lf - i * 7, fps, config: { damping: 12 } });
        const x = (i - 2) * 190;
        const isNew = i === 4;
        const pulse = isNew ? 1 + Math.sin(lf / 6) * 0.06 : 1;
        return (
          <g key={i} transform={`translate(${x} 0) scale(${pop * pulse})`}>
            {isNew ? (
              <>
                <circle r={74} fill="#0B0F2E" stroke="#F6B93B" strokeWidth={4} strokeDasharray="10 12" />
                <circle r={120} fill="none" stroke="#F6B93B" strokeOpacity={0.25} strokeWidth={2} />
              </>
            ) : (
              <g>
                <clipPath id={`sd-mclip-${i}`}><circle r={72} /></clipPath>
                <circle r={130} fill="url(#sd-moonglow)" opacity={0.35 * k} />
                <g clipPath={`url(#sd-mclip-${i})`} filter={SHADOW}>
                  <circle r={72} fill="#FFF3D1" />
                  {k < 1 ? <circle cx={150 * k} r={74} fill="#0E1238" /> : null}
                </g>
                <circle r={72} fill="none" stroke="#FFF3D1" strokeOpacity={0.35} strokeWidth={2} />
              </g>
            )}
            {labels[i] ? <text y={140} textAnchor="middle" fontFamily={FONT.mono} fontWeight={700} fontSize={22} fill="#F5EEDF" opacity={0.8} letterSpacing={2}>{labels[i]}</text> : null}
          </g>
        );
      })}
      <path d="M -380 -110 Q 0 -190 380 -110" fill="none" stroke="#F5EEDF" strokeOpacity={0.35} strokeWidth={3} strokeDasharray="4 14" strokeLinecap="round" />
    </g>
  );
};

const cloudShape = (w: number) => (
  <>
    <circle cx={-w * 0.28} cy={0} r={w * 0.2} />
    <circle cx={0} cy={-w * 0.12} r={w * 0.27} />
    <circle cx={w * 0.3} cy={0} r={w * 0.19} />
    <rect x={-w * 0.48} y={0} width={w * 0.96} height={w * 0.2} rx={w * 0.1} />
  </>
);

const Clouds: React.FC<PropCtx> = ({ lf, data }) => {
  const n = num(data.count, 3);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const w = 220 + random(`cl${i}`) * 160;
        const x = (random(`cx${i}`) - 0.5) * 1100 + Math.sin(lf / 90 + i) * 40 * (i % 2 ? 1 : -1);
        const y = -random(`cy${i}`) * num(data.spread, 500);
        return <g key={i} transform={`translate(${x} ${y})`} fill={str(data.color, "#E9E4F5")} opacity={0.85} filter={SHADOW}>{cloudShape(w)}</g>;
      })}
    </g>
  );
};

const Hills: React.FC<PropCtx> = ({ data }) => (
  <g filter={SHADOW}>
    <path d="M -800 0 Q -500 -260 -200 -80 Q 100 -300 400 -110 Q 650 -240 800 -120 L 800 400 L -800 400 Z" fill={str(data.color, "#30284F")} />
    <path d="M -800 80 Q -400 -100 0 40 Q 400 -120 800 60 L 800 400 L -800 400 Z" fill="#000" opacity={0.25} />
  </g>
);

const Sun: React.FC<PropCtx> = ({ lf, data }) => (
  <g>
    <circle r={420} fill="url(#sd-sunglow)" />
    <g transform={`rotate(${lf * 0.2})`} opacity={0.18}>
      {Array.from({ length: 16 }, (_, i) => <path key={i} d="M -18 -160 L 0 -460 L 18 -160 Z" fill={str(data.color, "#FFE3A3")} transform={`rotate(${i * 22.5})`} />)}
    </g>
    <circle r={150} fill={str(data.color, "#FFE3A3")} opacity={0.95} />
  </g>
);

/* ---------- architecture ---------- */

const Doorway: React.FC<PropCtx> = () => (
  <g>
    <g filter={SHADOW}>
      <rect x={-470} y={-760} width={940} height={760} fill="#B98C66" />
      {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-470} x2={470} y1={-740 + i * 54} y2={-740 + i * 54} stroke="#8E6648" strokeOpacity={0.25} strokeWidth={3} />)}
      <path d="M -540 -760 L 540 -760 L 490 -860 L -490 -860 Z" fill="#9C3D24" />
      {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M ${-520 + i * 49} -760 q 24 26 48 0`} fill="#7E2E1B" />)}
    </g>
    {[-330, 330].map((x) => (
      <g key={x} transform={`translate(${x} -480)`} filter={SHADOW}>
        <path d="M -70 120 L -70 -40 Q 0 -130 70 -40 L 70 120 Z" fill="#E6CFA8" />
        <path d="M -50 105 L -50 -30 Q 0 -100 50 -30 L 50 105 Z" fill="#2B1E1A" />
        <circle cy={20} r={14} fill="#FFB84D" opacity={0.85} />
        <circle cy={20} r={60} fill="url(#sd-flameglow)" />
      </g>
    ))}
    <g filter={SHADOW}>
      <path d="M -190 0 L -190 -440 Q 0 -620 190 -440 L 190 0 Z" fill="#E6CFA8" />
      <path d="M -160 0 L -160 -430 Q 0 -585 160 -430 L 160 0 Z" fill="#5B2F1B" />
      <line x1={0} x2={0} y1={-560} y2={0} stroke="#3A1D10" strokeWidth={6} />
      {[-1, 1].map((s) => (
        <g key={s}>
          {[0, 1, 2].map((r) => <rect key={r} x={s > 0 ? 18 : -142} y={-400 + r * 130} width={124} height={110} rx={6} fill="none" stroke="#3A1D10" strokeWidth={5} />)}
          {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={s * (40 + (i % 3) * 40)} cy={-370 + Math.floor(i / 3) * 110} r={7} fill="#D9A441" />)}
          <circle cx={s * 30} cy={-210} r={22} fill="none" stroke="#D9A441" strokeWidth={7} />
        </g>
      ))}
    </g>
    <rect x={-300} y={0} width={600} height={34} fill="#8A7A6E" filter={SHADOW} />
    <rect x={-360} y={34} width={720} height={34} fill="#76675C" filter={SHADOW} />
  </g>
);

const Toran: React.FC<PropCtx> = () => {
  const pts = Array.from({ length: 23 }, (_, i) => {
    const t = i / 22;
    return [(t - 0.5) * 860, Math.sin(t * Math.PI) * 60 + Math.sin(t * Math.PI * 4) * 12] as const;
  });
  return (
    <g>
      <path d={`M ${pts.map(([x, y]) => `${x} ${y}`).join(" L ")}`} fill="none" stroke="#6B4A1F" strokeWidth={4} />
      {pts.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`} filter={SHADOW}>
          {i % 2 === 0 ? <path d="M 0 0 Q 18 40 0 86 Q -18 40 0 0 Z" fill={i % 4 === 0 ? "#3E8E3A" : "#56A845"} /> : null}
          <circle r={17} fill={i % 3 === 0 ? "#F7B731" : "#F0801A"} />
          <circle r={8} fill="#000" opacity={0.15} />
        </g>
      ))}
    </g>
  );
};

const Rooftops: React.FC<PropCtx> = ({ lf, fps, data }) => {
  const lightAt = num(data.lightAt, 0.5) * fps;
  const houses = [
    { x: -720, w: 260, h: 300, roof: "flat" }, { x: -470, w: 220, h: 420, roof: "tile" }, { x: -230, w: 280, h: 330, roof: "flat" },
    { x: 40, w: 240, h: 470, roof: "tile" }, { x: 290, w: 260, h: 350, roof: "flat" }, { x: 540, w: 230, h: 430, roof: "tile" }, { x: 770, w: 240, h: 310, roof: "flat" }
  ];
  let lamp = 0;
  return (
    <g>
      {houses.map((h, i) => {
        const left = h.x - h.w / 2;
        const lamps = h.roof === "flat" ? [0.15, 0.5, 0.85] : [0.5];
        return (
          <g key={i} filter={SHADOW}>
            <rect x={left} y={-h.h} width={h.w} height={h.h + 200} fill={i % 2 ? "#C79A70" : "#B07D57"} />
            {h.roof === "tile" ? <path d={`M ${left - 30} ${-h.h} L ${h.x} ${-h.h - 120} L ${left + h.w + 30} ${-h.h} Z`} fill="#8E3420" /> : <rect x={left - 12} y={-h.h - 24} width={h.w + 24} height={26} fill="#9A7458" />}
            {[0.3, 0.7].map((k) => <rect key={k} x={left + h.w * k - 26} y={-h.h + 90} width={52} height={70} rx={26} fill="#2A1C16" />)}
            {[0.3, 0.7].map((k) => {
              const on = clamp01((lf - lightAt - i * 6) / 10);
              return <rect key={`w${k}`} x={left + h.w * k - 26} y={-h.h + 90} width={52} height={70} rx={26} fill="#FFC85A" opacity={on * 0.85} />;
            })}
            <rect x={h.x - 40} y={-120} width={80} height={120} rx={10} fill="#4A2A1A" />
            {lamps.map((k) => {
              const idx = lamp++;
              const on = clamp01((lf - lightAt - idx * 5) / 6);
              const ly = h.roof === "flat" ? -h.h - 24 : -h.h;
              const lx = left + h.w * k;
              return (
                <g key={`l${k}`} transform={`translate(${lx} ${ly})`}>
                  <path d="M -16 0 Q 0 16 16 0 Z" fill="#9A4A26" />
                  <g opacity={on} transform={`scale(${0.6 + on * 0.4 + Math.sin(lf / 3 + idx) * 0.06})`}>
                    <circle cy={-10} r={46} fill="url(#sd-flameglow)" />
                    <path d="M 0 -26 Q 7 -10 0 -2 Q -7 -10 0 -26 Z" fill="#FFD36B" />
                  </g>
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

const Temple: React.FC<PropCtx> = () => (
  <g filter={SHADOW} fill="#6E3B2A">
    <path d="M -160 0 L -160 -200 L -110 -200 L -90 -420 L 0 -560 L 90 -420 L 110 -200 L 160 -200 L 160 0 Z" />
    <path d="M 0 -560 L 0 -640" stroke="#6E3B2A" strokeWidth={6} />
    <path d="M 0 -640 L 50 -620 L 0 -600 Z" fill="#F0533F" />
    <path d="M -40 0 L -40 -110 Q 0 -160 40 -110 L 40 0 Z" fill="#2A1712" />
  </g>
);

const Tree: React.FC<PropCtx> = ({ lf }) => (
  <g filter={SHADOW}>
    <path d="M -50 0 Q -40 -200 -70 -380 L 70 -380 Q 40 -200 60 0 Z" fill="#6B4A32" />
    {[[-200, -460, 170], [0, -560, 210], [200, -470, 170], [-90, -360, 140], [120, -350, 140]].map(([x, y, r], i) => (
      <circle key={i} cx={(x ?? 0) + Math.sin(lf / 40 + i) * 4} cy={y} r={r} fill={i % 2 ? "#3F7A3A" : "#4E9446"} />
    ))}
    {Array.from({ length: 7 }, (_, i) => <line key={i} x1={-180 + i * 60} x2={-180 + i * 60} y1={-330} y2={-60 - (i % 3) * 40} stroke="#6B4A32" strokeWidth={4} />)}
  </g>
);

/* ---------- ritual objects ---------- */

const Flame: React.FC<{ lf: number; seed?: number; size?: number }> = ({ lf, seed = 0, size = 1 }) => {
  const f = 1 + Math.sin(lf / 2.3 + seed) * 0.06 + Math.sin(lf / 1.3 + seed * 2) * 0.04;
  return (
    <g transform={`scale(${size})`}>
      <circle cy={-30} r={120} fill="url(#sd-flameglow)" />
      <g transform={`scale(${1 / f} ${f}) skewX(${Math.sin(lf / 4 + seed) * 4})`}>
        <path d="M 0 -78 C 22 -46 24 -22 0 -4 C -24 -22 -22 -46 0 -78 Z" fill="#FF9F1C" />
        <path d="M 0 -56 C 12 -38 12 -22 0 -10 C -12 -22 -12 -38 0 -56 Z" fill="#FFF2B3" />
      </g>
    </g>
  );
};

const Diya: React.FC<PropCtx> = ({ lf }) => (
  <g>
    <g filter={SHADOW}>
      <path d="M -80 -20 Q -70 30 0 34 Q 70 30 80 -20 Q 40 -6 0 -6 Q -40 -6 -80 -20 Z" fill="#B5532E" />
      <path d="M -80 -20 Q -40 -34 0 -32 Q 40 -34 80 -20 Q 40 -6 0 -6 Q -40 -6 -80 -20 Z" fill="#7A2E17" />
      <path d="M -60 4 Q 0 20 60 4" stroke="#E08A5B" strokeWidth={4} fill="none" />
    </g>
    <g transform="translate(40 -24)"><Flame lf={lf} /></g>
  </g>
);

const DiyaRow: React.FC<PropCtx> = ({ lf, fps, data }) => {
  const n = num(data.count, 5), sp = num(data.spacing, 180);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const on = clamp01((lf - fps * 0.4 - i * 7) / 6);
        return (
          <g key={i} transform={`translate(${(i - (n - 1) / 2) * sp} 0)`}>
            <g filter={SHADOW}>
              <path d="M -70 -18 Q -60 26 0 30 Q 60 26 70 -18 Q 35 -5 0 -5 Q -35 -5 -70 -18 Z" fill="#B5532E" />
              <path d="M -70 -18 Q -35 -30 0 -28 Q 35 -30 70 -18 Q 35 -5 0 -5 Q -35 -5 -70 -18 Z" fill="#7A2E17" />
            </g>
            <g transform={`translate(32 -20) scale(${on})`} opacity={on}><Flame lf={lf} seed={i} size={0.85} /></g>
          </g>
        );
      })}
    </g>
  );
};

const Rangoli: React.FC<PropCtx> = ({ lf, fps }) => {
  const rings = [
    { r: 0, n: 1, rad: 46, col: "#2E9E5B" },
    { r: 96, n: 8, rad: 44, col: "#FFF4E0" },
    { r: 170, n: 12, rad: 46, col: "#E8473B" },
    { r: 246, n: 16, rad: 46, col: "#F28C28" },
    { r: 318, n: 20, rad: 40, col: "#F6C343" }
  ];
  let idx = 0;
  return (
    <g transform="scale(1 0.42)">
      <circle r={370} fill="#000" opacity={0.18} />
      {rings.map((ring, ri) =>
        Array.from({ length: ring.n }, (_, i) => {
          const k = idx++;
          const pop = spring({ frame: lf - k * 0.9 - ri * 4, fps, config: { damping: 11, stiffness: 180 } });
          const ang = (i / ring.n) * 360 + ri * 11;
          if (ring.r === 0) return <circle key={`${ri}-${i}`} r={ring.rad * pop} fill={ring.col} stroke="#fff" strokeWidth={6} />;
          return (
            <g key={`${ri}-${i}`} transform={`rotate(${ang}) translate(0 ${-ring.r}) scale(${pop})`}>
              <path d={`M 0 ${-ring.rad} C ${ring.rad * 0.8} ${-ring.rad * 0.4} ${ring.rad * 0.6} ${ring.rad * 0.5} 0 ${ring.rad} C ${-ring.rad * 0.6} ${ring.rad * 0.5} ${-ring.rad * 0.8} ${-ring.rad * 0.4} 0 ${-ring.rad} Z`} fill={ring.col} />
              <circle r={ring.rad * 0.22} fill="#fff" opacity={0.7} />
            </g>
          );
        })
      )}
    </g>
  );
};

const Lotus: React.FC<PropCtx> = () => {
  const petal = (len: number, wid: number) => `M 0 0 C ${wid} ${-len * 0.35} ${wid * 0.7} ${-len * 0.85} 0 ${-len} C ${-wid * 0.7} ${-len * 0.85} ${-wid} ${-len * 0.35} 0 0 Z`;
  return (
    <g>
      <ellipse cy={10} rx={260} ry={46} fill="#2F7D4A" filter={SHADOW} />
      <ellipse cy={4} rx={230} ry={34} fill="#3E9A5C" />
      <g filter={SHADOW}>
        {[-70, -48, 48, 70].map((a) => <path key={a} d={petal(170, 70)} transform={`rotate(${a})`} fill="#F28DB2" />)}
        {[-30, 30].map((a) => <path key={a} d={petal(210, 78)} transform={`rotate(${a})`} fill="#F6A6C4" />)}
        {[-14, 14].map((a) => <path key={a} d={petal(230, 70)} transform={`rotate(${a})`} fill="#F9BCD3" />)}
        <path d={petal(250, 72)} fill="#FCD3E1" />
        <path d={petal(250, 72)} fill="url(#sd-petal)" />
      </g>
      <circle cy={-40} r={150} fill="url(#sd-sunglow)" opacity={0.5} />
    </g>
  );
};

const Water: React.FC<PropCtx> = ({ lf }) => {
  const wave = (amp: number, off: number, y: number) => {
    const pts = Array.from({ length: 41 }, (_, i) => {
      const x = -700 + i * 35;
      return `${x} ${y + Math.sin(i * 0.6 + lf / 12 + off) * amp}`;
    });
    return `M ${pts.join(" L ")} L 700 900 L -700 900 Z`;
  };
  return (
    <g>
      <path d={wave(10, 0, 0)} fill="#1C7C8C" opacity={0.92} />
      <path d={wave(8, 2, 40)} fill="#166A79" />
      <path d={wave(6, 4, 120)} fill="#0F5563" />
      {[0, 1, 2].map((k) => {
        const ph = ((lf / 45 + k / 3) % 1);
        return <ellipse key={k} cy={20} rx={120 + ph * 360} ry={(120 + ph * 360) * 0.12} fill="none" stroke="#BFF3F5" strokeWidth={3} opacity={(1 - ph) * 0.6} />;
      })}
      {[[-380, 90], [400, 150], [-200, 240]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={90} ry={22} fill="#3E9A5C" filter={SHADOW} />)}
    </g>
  );
};

/* ---------- paper cards ---------- */

const Tape: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => <rect x={x - 70} y={y - 20} width={140} height={40} fill="#F3E7C2" opacity={0.85} transform={`rotate(${r} ${x} ${y})`} />;

const Check: React.FC<{ p: number; color: string; size?: number }> = ({ p, color, size = 1 }) => (
  <path d="M -22 2 L -6 20 L 26 -24" transform={`scale(${size})`} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={80} strokeDashoffset={80 * (1 - p)} />
);

const NoteCard: React.FC<PropCtx> = ({ lf, fps, data, pal }) => {
  const items = arr(data.items);
  const h = 170 + items.length * 110;
  return (
    <g transform="rotate(-2.5)">
      <rect x={-380} y={-h / 2} width={760} height={h} fill="#FBF6EA" filter={SHADOW} />
      {Array.from({ length: Math.floor(h / 46) }, (_, i) => <line key={i} x1={-380} x2={380} y1={-h / 2 + 60 + i * 46} y2={-h / 2 + 60 + i * 46} stroke="#9EC3E6" strokeOpacity={0.35} strokeWidth={2} />)}
      <line x1={-300} x2={-300} y1={-h / 2} y2={h / 2} stroke={pal.accent} strokeOpacity={0.4} strokeWidth={3} />
      <Tape x={-250} y={-h / 2} r={-8} /><Tape x={250} y={-h / 2} r={7} />
      <text x={-270} y={-h / 2 + 95} fontFamily={FONT.mono} fontWeight={700} fontSize={34} fill={pal.accent}>{str(data.title, "")}</text>
      {items.map((it, i) => {
        const p = clamp01((lf - fps * 0.6 - i * 14) / 10);
        const y = -h / 2 + 200 + i * 110;
        return (
          <g key={i} opacity={clamp01(p * 3)}>
            <g transform={`translate(-300 ${y - 22})`}><Check p={p} color={pal.accent} /></g>
            <text x={-250} y={y} fontFamily={FONT.display} fontSize={62} fill={pal.ink}>{it}</text>
          </g>
        );
      })}
    </g>
  );
};

const FestivalTracker: React.FC<PropCtx> = ({ lf, fps, data, pal }) => {
  const items = arr(data.items);
  const done = num(data.done, 0);
  const h = 190 + items.length * 120;
  return (
    <g transform="rotate(1.5)">
      <rect x={-410} y={-h / 2} width={820} height={h} rx={14} fill="#FBF6EA" filter={SHADOW} />
      <rect x={-410} y={-h / 2} width={820} height={120} rx={14} fill={pal.accent} />
      <rect x={-410} y={-h / 2 + 100} width={820} height={20} fill={pal.accent} />
      <text x={0} y={-h / 2 + 80} textAnchor="middle" fontFamily={FONT.display} fontSize={64} fill="#FBF6EA">{str(data.title, "")}</text>
      {[-300, 300].map((x) => <circle key={x} cx={x} cy={-h / 2 - 6} r={14} fill="#3A3A3A" />)}
      {items.map((it, i) => {
        const y = -h / 2 + 200 + i * 120;
        const isDone = i < done, isNext = i === done;
        const p = clamp01((lf - fps * 0.5 - i * 8) / 10);
        const ring = clamp01((lf - fps * 0.5 - items.length * 8 - 6) / 14);
        return (
          <g key={i} opacity={isDone || isNext ? 1 : 0.45}>
            <rect x={-350} y={y - 46} width={84} height={84} rx={10} fill="none" stroke={pal.ink} strokeWidth={5} />
            {isDone ? <g transform={`translate(-308 ${y - 6})`}><Check p={p} color={pal.accent} size={1.2} /></g> : null}
            <text x={-230} y={y + 22} fontFamily={FONT.display} fontSize={60} fill={pal.ink} textDecoration={isDone ? "line-through" : undefined}>{`DAY ${i + 1} · ${it}`}</text>
            {isNext ? (
              <ellipse cx={60} cy={y} rx={400} ry={66} fill="none" stroke={pal.accent3} strokeWidth={7} strokeDasharray={1700} strokeDashoffset={1700 * (1 - ring)} transform={`rotate(-2 60 ${y})`} />
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

const MonthCalendar: React.FC<PropCtx> = ({ lf, fps, data, pal }) => {
  const days = num(data.days, 30), start = num(data.startDay, 0);
  const ticks = (Array.isArray(data.ticks) ? data.ticks : []).map(Number);
  const circle = num(data.circle, -1);
  return (
    <g transform="rotate(-2)">
      <rect x={-400} y={-420} width={800} height={840} rx={14} fill="#FBF6EA" filter={SHADOW} />
      <rect x={-400} y={-420} width={800} height={140} rx={14} fill={pal.accent} />
      <text x={-360} y={-325} fontFamily={FONT.display} fontSize={80} fill="#FBF6EA">{str(data.month, "MONTH")}</text>
      <text x={360} y={-325} textAnchor="end" fontFamily={FONT.mono} fontWeight={700} fontSize={36} fill="#FBF6EA">{str(data.year, "")}</text>
      {Array.from({ length: days }, (_, i) => {
        const cell = i + start, cx = -340 + (cell % 7) * 113, cy = -220 + Math.floor(cell / 7) * 110;
        const d = i + 1;
        const tp = clamp01((lf - fps * 0.5 - ticks.indexOf(d) * 8) / 10);
        return (
          <g key={d} transform={`translate(${cx} ${cy})`}>
            <text textAnchor="middle" y={14} fontFamily={FONT.ui} fontWeight={800} fontSize={38} fill={d % 7 === (7 - start) % 7 ? pal.accent : pal.ink}>{d}</text>
            {ticks.includes(d) ? <g transform="scale(0.9)"><rect x={-40} y={-40} width={80} height={80} rx={8} fill="none" stroke={pal.ink} strokeWidth={4} /><Check p={tp} color={pal.accent} /></g> : null}
            {d === circle ? <circle r={50} fill="none" stroke={pal.accent3} strokeWidth={6} strokeDasharray={320} strokeDashoffset={320 * (1 - clamp01((lf - fps * 1.4) / 14))} /> : null}
          </g>
        );
      })}
    </g>
  );
};

const Progress: React.FC<PropCtx> = ({ lf, fps, data, pal }) => {
  const p = clamp01(lf / (num(data.seconds, 3) * fps));
  const e = 1 - Math.pow(1 - p, 2);
  return (
    <g>
      <text x={-360} y={-30} fontFamily={FONT.mono} fontWeight={700} fontSize={28} fill={pal.paper} letterSpacing={2}>{str(data.label, "PROGRESS")}</text>
      <rect x={-360} y={-10} width={600} height={36} fill="none" stroke={pal.paper} strokeWidth={4} />
      <rect x={-354} y={-4} width={588 * e} height={24} fill={pal.paper} />
      <text x={270} y={26} fontFamily={FONT.display} fontSize={64} fill={pal.paper}>{Math.round(interpolate(e, [0, 1], [0, 100]))}%</text>
    </g>
  );
};

export const PROPS: Record<PropName, React.FC<PropCtx>> = {
  moon: Moon, moonPhases: MoonPhases, clouds: Clouds, hills: Hills, doorway: Doorway, toran: Toran, diya: Diya, diyaRow: DiyaRow,
  rangoli: Rangoli, rooftops: Rooftops, lotus: Lotus, water: Water, tree: Tree, temple: Temple, sun: Sun, noteCard: NoteCard,
  festivalTracker: FestivalTracker, progress: Progress, monthCalendar: MonthCalendar
};

export const PropDefs: React.FC = () => (
  <defs>
    <filter id="sd-shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.35" /></filter>
    <radialGradient id="sd-moonglow"><stop offset="0" stopColor="#FFF3D1" stopOpacity={0.6} /><stop offset="1" stopColor="#FFF3D1" stopOpacity={0} /></radialGradient>
    <radialGradient id="sd-sunglow"><stop offset="0" stopColor="#FFE9B0" stopOpacity={0.8} /><stop offset="1" stopColor="#FFE9B0" stopOpacity={0} /></radialGradient>
    <radialGradient id="sd-flameglow"><stop offset="0" stopColor="#FFC24D" stopOpacity={0.75} /><stop offset="0.4" stopColor="#FF8A1C" stopOpacity={0.25} /><stop offset="1" stopColor="#FF8A1C" stopOpacity={0} /></radialGradient>
    <linearGradient id="sd-petal" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff" stopOpacity={0.6} /><stop offset="1" stopColor="#fff" stopOpacity={0} /></linearGradient>
  </defs>
);
