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
  /** true = draw the "slightly different" variant (shape rule). */
  odd?: boolean;
  /** glyph element: [normal, odd] characters. */
  glyphs?: readonly [string, string];
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

const Ring: React.FC<ElementProps> = ({ a, dir, r, sats, body, line, odd }) => {
  const n = sats + (odd ? 1 : 0);
  return (
    <g>
      <circle r={r * 0.78} fill="none" stroke={line} strokeOpacity={0.55} strokeWidth={r * 0.045} />
      <circle r={r * 0.06} fill={line} opacity={0.35} />
      {Array.from({ length: n }, (_, i) => <Satellite key={i} a={a + (i * TAU) / n} dir={dir} rx={r * 0.78} size={r * 0.1} color={body} />)}
    </g>
  );
};

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

const Clock: React.FC<ElementProps> = ({ a, dir, r, body, line, odd }) => {
  const [hx, hy] = pt(a, r * 0.62);
  const sweep = Array.from({ length: 10 }, (_, j) => {
    const [x, y] = pt(a - dir * (j + 1) * 0.07, r * 0.62);
    return <line key={j} x1={0} y1={0} x2={x} y2={y} stroke={body} strokeOpacity={0.12 * (1 - j / 10)} strokeWidth={r * 0.05} strokeLinecap="round" />;
  });
  return (
    <g>
      <circle r={r * 0.8} fill="#ffffff" fillOpacity={0.03} stroke={line} strokeOpacity={0.6} strokeWidth={r * 0.05} />
      {Array.from({ length: odd ? 8 : 12 }, (_, i) => {
        const k = odd ? 8 : 12;
        const [x1, y1] = pt((i * TAU) / k, r * 0.66);
        const [x2, y2] = pt((i * TAU) / k, r * (i % (k / 4) === 0 ? 0.52 : 0.6));
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

const Gear: React.FC<ElementProps> = ({ a, r, body, line, odd }) => (
  <g transform={`rotate(${(a * 180) / Math.PI})`}>
    <path d={gearPath(r, odd ? 8 : 10)} fill={line} fillOpacity={0.14} stroke={line} strokeOpacity={0.75} strokeWidth={r * 0.04} strokeLinejoin="round" />
    <circle r={r * 0.3} fill="none" stroke={body} strokeWidth={r * 0.05} />
    <line x1={0} y1={0} x2={r * 0.5} y2={0} stroke={body} strokeWidth={r * 0.07} strokeLinecap="round" />
    <circle cx={r * 0.5} cy={0} r={r * 0.18} fill="url(#oo-glow)" />
    <circle r={r * 0.09} fill={body} />
  </g>
);


/** Sudarshan-style chakra: flame-toothed wheel spinning, with a glowing marker. */
const Chakra: React.FC<ElementProps> = ({ a, dir, r, body, line, odd }) => {
  const spokes = odd ? 6 : 8;
  const teeth = 12;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * TAU, a1 = ((i + 0.5) / teeth) * TAU, a2 = ((i + 1) / teeth) * TAU;
    const [x0, y0] = pt(a0, r * 0.62), [xt, yt] = pt(a0 + (a1 - a0) * 0.9, r * 0.86), [x2, y2] = pt(a2, r * 0.62);
    pts.push(`${i === 0 ? "M" : "L"} ${x0.toFixed(2)} ${y0.toFixed(2)} Q ${xt.toFixed(2)} ${yt.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`);
  }
  const deg = (a * 180) / Math.PI;
  const ghost = [1, 2, 3].map((k) => <path key={k} d={`${pts.join(" ")} Z`} fill="none" stroke={line} strokeOpacity={0.12 / k} strokeWidth={r * 0.05} transform={`rotate(${deg - dir * k * 7})`} />);
  return (
    <g>
      {ghost}
      <g transform={`rotate(${deg})`}>
        <path d={`${pts.join(" ")} Z`} fill={line} fillOpacity={0.12} stroke={line} strokeOpacity={0.85} strokeWidth={r * 0.045} strokeLinejoin="round" />
        <circle r={r * 0.46} fill="none" stroke={line} strokeOpacity={0.5} strokeWidth={r * 0.03} />
        {Array.from({ length: spokes }, (_, i) => {
          const [x, y] = pt((i / spokes) * TAU, r * 0.46);
          return <line key={i} x1={0} y1={0} x2={x} y2={y} stroke={line} strokeOpacity={0.55} strokeWidth={r * 0.03} />;
        })}
        <circle cx={r * 0.46} cy={0} r={r * 0.24} fill="url(#oo-glow)" />
        <circle cx={r * 0.46} cy={0} r={r * 0.08} fill={body} />
      </g>
      <circle r={r * 0.12} fill={body} />
    </g>
  );
};

/** A diya flame orbiting a brass ring. */
const DiyaOrbit: React.FC<ElementProps> = ({ a, dir, r, line, odd }) => {
  const ring = r * 0.74;
  const [x, y] = pt(a, ring);
  const trail = Array.from({ length: 10 }, (_, j) => {
    const [tx, ty] = pt(a - dir * (j + 1) * 0.08, ring);
    return <circle key={j} cx={tx} cy={ty} r={r * 0.07 * (1 - j / 11)} fill="#FF9F1C" opacity={0.45 * (1 - j / 10)} />;
  });
  return (
    <g>
      <circle r={ring} fill="none" stroke={line} strokeOpacity={0.5} strokeWidth={r * 0.05} strokeDasharray={odd ? `${r * 0.16} ${r * 0.06}` : `${r * 0.05} ${r * 0.09}`} />
      <path d={`M ${-r * 0.2} ${-r * 0.02} Q 0 ${r * 0.18} ${r * 0.2} ${-r * 0.02} Z`} fill="#B5532E" />
      {trail}
      <circle cx={x} cy={y} r={r * 0.34} fill="url(#oo-flame)" />
      <g transform={`translate(${x} ${y}) rotate(0)`}>
        <path d={`M 0 ${-r * 0.2} C ${r * 0.09} ${-r * 0.08} ${r * 0.09} ${r * 0.02} 0 ${r * 0.06} C ${-r * 0.09} ${r * 0.02} ${-r * 0.09} ${-r * 0.08} 0 ${-r * 0.2} Z`} fill="#FFB938" />
        <path d={`M 0 ${-r * 0.1} C ${r * 0.04} ${-r * 0.04} ${r * 0.04} ${r * 0.02} 0 ${r * 0.04} C ${-r * 0.04} ${r * 0.02} ${-r * 0.04} ${-r * 0.04} 0 ${-r * 0.1} Z`} fill="#FFF4C2" />
      </g>
    </g>
  );
};

/** A letter/number that sways; the odd cell shows a look-alike character. */
const Glyph: React.FC<ElementProps> = ({ a, r, body, line, odd, glyphs }) => {
  const [normal, other] = glyphs ?? ["9", "6"];
  const sway = Math.sin(a) * 14;
  return (
    <g transform={`rotate(${sway})`}>
      <circle r={r * 0.8} fill={line} fillOpacity={0.06} stroke={line} strokeOpacity={0.25} strokeWidth={r * 0.03} />
      <text y={r * 0.36} textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize={r * 1.1} fill={body}>{odd ? other : normal}</text>
    </g>
  );
};

export const ELEMENT_RENDERERS: Record<OddOrbit["element"], React.FC<ElementProps>> = {
  ring: Ring,
  planet: Planet,
  atom: Atom,
  binary: Binary,
  comet: Comet,
  clock: Clock,
  spinner: Spinner,
  gear: Gear,
  chakra: Chakra,
  diya: DiyaOrbit,
  glyph: Glyph
};
