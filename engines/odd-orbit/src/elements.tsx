import React from "react";
import type { OddOrbit } from "./model";

export interface ElementProps {
  /** Current angle in radians (already includes direction). */
  a: number;
  /** +1 clockwise, -1 counter-clockwise. Needed so trails point backwards along travel. */
  dir: number;
  /** Cell radius in px. */
  r: number;
  sats: number;
  body: string;
  line: string;
}

const TAU = Math.PI * 2;
const pt = (a: number, rx: number, ry = rx): [number, number] => [Math.cos(a) * rx, Math.sin(a) * ry];

/** Glowing dot with a fading comet trail along an ellipse. */
const Satellite: React.FC<{ a: number; dir: number; rx: number; ry?: number; size: number; color: string; trail?: number; step?: number; front?: boolean }> = ({ a, dir, rx, ry = rx, size, color, trail = 9, step = 0.075 }) => {
  const nodes: React.ReactNode[] = [];
  for (let j = trail; j >= 1; j--) {
    const [x, y] = pt(a - dir * j * step, rx, ry);
    const k = 1 - j / (trail + 1);
    nodes.push(<circle key={j} cx={x} cy={y} r={size * (0.35 + 0.55 * k)} fill={color} opacity={0.5 * k * k} />);
  }
  const [x, y] = pt(a, rx, ry);
  return (
    <g>
      {nodes}
      <circle cx={x} cy={y} r={size * 3.2} fill="url(#oo-glow)" />
      <circle cx={x} cy={y} r={size} fill={color} />
    </g>
  );
};

const Ring: React.FC<ElementProps> = ({ a, dir, r, sats, body, line }) => (
  <g>
    <circle r={r * 0.78} fill="none" stroke={line} strokeOpacity={0.55} strokeWidth={r * 0.045} />
    <circle r={r * 0.06} fill={line} opacity={0.35} />
    {Array.from({ length: sats }, (_, i) => <Satellite key={i} a={a + (i * TAU) / sats} dir={dir} rx={r * 0.78} size={r * 0.1} color={body} />)}
  </g>
);

const Planet: React.FC<ElementProps> = ({ a, dir, r, body, line }) => {
  const rx = r * 0.86, ry = r * 0.3, tilt = -18;
  const behind = Math.sin(a) < 0;
  const moon = <Satellite a={a} dir={dir} rx={rx} ry={ry} size={r * 0.1} color={body} trail={7} step={0.09} />;
  return (
    <g transform={`rotate(${tilt})`}>
      <ellipse rx={rx} ry={ry} fill="none" stroke={line} strokeOpacity={0.45} strokeWidth={r * 0.035} />
      {behind ? moon : null}
      <g transform={`rotate(${-tilt})`}>
        <circle r={r * 0.36} fill="url(#oo-planet)" />
        <path d={`M ${-r * 0.36} 0 A ${r * 0.36} ${r * 0.36} 0 0 0 ${r * 0.36} 0`} fill="#000" opacity={0.25} transform="rotate(35)" />
      </g>
      {behind ? null : moon}
    </g>
  );
};

const Atom: React.FC<ElementProps> = ({ a, dir, r, body, line }) => (
  <g>
    {[0, 60, 120].map((rot, i) => (
      <g key={rot} transform={`rotate(${rot})`}>
        <ellipse rx={r * 0.84} ry={r * 0.3} fill="none" stroke={line} strokeOpacity={0.45} strokeWidth={r * 0.03} />
        <Satellite a={a + i * 2.1} dir={dir} rx={r * 0.84} ry={r * 0.3} size={r * 0.085} color={body} trail={6} step={0.1} />
      </g>
    ))}
    <circle r={r * 0.32} fill="url(#oo-glow)" />
    <circle r={r * 0.13} fill={line} />
  </g>
);

const Binary: React.FC<ElementProps> = ({ a, dir, r, body, line }) => (
  <g>
    <circle r={r * 0.5} fill="none" stroke={line} strokeOpacity={0.25} strokeDasharray={`${r * 0.08} ${r * 0.1}`} strokeWidth={r * 0.03} />
    <Satellite a={a} dir={dir} rx={r * 0.5} size={r * 0.16} color={body} trail={10} step={0.12} />
    <Satellite a={a + Math.PI} dir={dir} rx={r * 0.5} size={r * 0.11} color={line} trail={10} step={0.12} />
  </g>
);

const Comet: React.FC<ElementProps> = ({ a, dir, r, body, line }) => (
  <g>
    <circle r={r * 0.74} fill="none" stroke={line} strokeOpacity={0.18} strokeWidth={r * 0.03} />
    <circle r={r * 0.12} fill={line} opacity={0.5} />
    <Satellite a={a} dir={dir} rx={r * 0.74} size={r * 0.12} color={body} trail={22} step={0.06} />
  </g>
);

const Clock: React.FC<ElementProps> = ({ a, dir, r, body, line }) => {
  const [hx, hy] = pt(a, r * 0.62);
  const sweep = Array.from({ length: 10 }, (_, j) => {
    const [x, y] = pt(a - dir * (j + 1) * 0.07, r * 0.62);
    return <line key={j} x1={0} y1={0} x2={x} y2={y} stroke={body} strokeOpacity={0.12 * (1 - j / 10)} strokeWidth={r * 0.05} strokeLinecap="round" />;
  });
  return (
    <g>
      <circle r={r * 0.8} fill="#ffffff" fillOpacity={0.03} stroke={line} strokeOpacity={0.6} strokeWidth={r * 0.05} />
      {Array.from({ length: 12 }, (_, i) => {
        const [x1, y1] = pt((i * TAU) / 12, r * 0.66);
        const [x2, y2] = pt((i * TAU) / 12, r * (i % 3 === 0 ? 0.52 : 0.6));
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={line} strokeOpacity={0.6} strokeWidth={r * 0.035} strokeLinecap="round" />;
      })}
      {sweep}
      <line x1={0} y1={0} x2={hx} y2={hy} stroke={body} strokeWidth={r * 0.06} strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={r * 0.2} fill="url(#oo-glow)" />
      <circle r={r * 0.07} fill={body} />
    </g>
  );
};

const arc = (rr: number, a0: number, a1: number): string => {
  const [x0, y0] = pt(a0, rr), [x1, y1] = pt(a1, rr);
  return `M ${x0} ${y0} A ${rr} ${rr} 0 0 ${a1 > a0 ? 1 : 0} ${x1} ${y1}`;
};

const Spinner: React.FC<ElementProps> = ({ a, dir, r, sats, body, line }) => (
  <g>
    <circle r={r * 0.7} fill="none" stroke={line} strokeOpacity={0.12} strokeWidth={r * 0.12} />
    {Array.from({ length: Math.max(1, sats) }, (_, i) => {
      const head = a + (i * TAU) / Math.max(1, sats);
      const segs = 6;
      return (
        <g key={i}>
          {Array.from({ length: segs }, (_, s) => {
            const a1 = head - dir * s * 0.22, a0 = head - dir * (s + 1) * 0.22;
            return <path key={s} d={arc(r * 0.7, Math.min(a0, a1), Math.max(a0, a1))} stroke={body} strokeOpacity={1 - s / segs} strokeWidth={r * 0.16} strokeLinecap="round" fill="none" />;
          })}
        </g>
      );
    })}
  </g>
);

const gearPath = (r: number, teeth = 10): string => {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 4; i++) {
    const ang = (i / (teeth * 4)) * TAU;
    const rr = i % 4 === 0 || i % 4 === 1 ? r * 0.82 : r * 0.64;
    const [x, y] = pt(ang, rr);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `M ${pts.join(" L ")} Z`;
};

const Gear: React.FC<ElementProps> = ({ a, r, body, line }) => (
  <g transform={`rotate(${(a * 180) / Math.PI})`}>
    <path d={gearPath(r)} fill={line} fillOpacity={0.14} stroke={line} strokeOpacity={0.75} strokeWidth={r * 0.04} strokeLinejoin="round" />
    <circle r={r * 0.3} fill="none" stroke={body} strokeWidth={r * 0.05} />
    <line x1={0} y1={0} x2={r * 0.5} y2={0} stroke={body} strokeWidth={r * 0.07} strokeLinecap="round" />
    <circle cx={r * 0.5} cy={0} r={r * 0.18} fill="url(#oo-glow)" />
    <circle r={r * 0.09} fill={body} />
  </g>
);

export const ELEMENT_RENDERERS: Record<OddOrbit["element"], React.FC<ElementProps>> = {
  ring: Ring,
  planet: Planet,
  atom: Atom,
  binary: Binary,
  comet: Comet,
  clock: Clock,
  spinner: Spinner,
  gear: Gear
};
