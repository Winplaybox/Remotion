// "Paper Lab" world kit: the grey studio with floating 3D paper sheets, soft shadows and an orange key light;
// the dark ProofChip (source · page · date) shown on every claim; and matte clay props (rupee coin stack,
// gavel, house, chart bars) drawn in SVG with soft clay shading. Pure functions of the frame, CSS/SVG only.
import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '@visuals/fonts';
import type {ClayKind, Proof} from './model';
import {U} from './unpaper3d';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// ---------- Paper Lab ----------
const SHEETS = Array.from({length: 7}).map((_, i) => ({
  x: 60 + random(`pl-x${i}`) * 960, y: 120 + random(`pl-y${i}`) * 1600, w: 140 + random(`pl-w${i}`) * 160,
  z: -500 + random(`pl-z${i}`) * 380, rx: (random(`pl-rx${i}`) - 0.5) * 70, ry: (random(`pl-ry${i}`) - 0.5) * 80,
  rz: (random(`pl-rz${i}`) - 0.5) * 50, sp: 60 + random(`pl-s${i}`) * 50
}));

/** Grey studio + orange key light (top right) + floating paper sheets drifting in 3D with soft shadows. */
export const PaperLab: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 60% at 50% 42%, ${U.grey} 0%, #DCDCE0 58%, #B9B9BE 100%)`}}>
      {/* orange key light */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 55% 40% at 88% 8%, rgba(240,120,40,0.30), rgba(240,120,40,0.08) 45%, transparent 70%)'}} />
      {/* cool fill from the other side, very faint */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 50% 35% at 0% 95%, rgba(18,184,214,0.08), transparent 70%)'}} />
      <AbsoluteFill style={{perspective: 1400}}>
        {SHEETS.map((s, i) => {
          const t = f / s.sp + i;
          const dy = Math.sin(t) * 22, dx = Math.cos(t * 0.7) * 14;
          return (
            <div key={i} style={{position: 'absolute', left: s.x - s.w / 2, top: s.y - s.w * 0.7, width: s.w, height: s.w * 1.4,
              transform: `translate3d(${dx}px, ${dy}px, ${s.z}px) rotateX(${s.rx + Math.sin(t) * 6}deg) rotateY(${s.ry + Math.cos(t) * 8}deg) rotateZ(${s.rz}deg)`,
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F4F4F4 55%, #E6E6E6 100%)', borderRadius: 4, opacity: 0.85,
              boxShadow: '0 18px 30px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08), inset -6px -6px 18px rgba(240,120,40,0.10)'}}>
              {[0.16, 0.26, 0.36, 0.46, 0.56].map((y, k) => (
                <div key={k} style={{position: 'absolute', left: '14%', top: `${y * 100}%`, width: `${k % 2 ? 58 : 72}%`, height: 5, borderRadius: 3, background: 'rgba(23,23,23,0.08)'}} />
              ))}
            </div>
          );
        })}
      </AbsoluteFill>
      {/* floor contact shadow */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 6% at 50% 76%, rgba(0,0,0,0.10), transparent 70%)'}} />
    </AbsoluteFill>
  );
};

// ---------- ProofChip ----------
/** Dark pill on every claim: SOURCE · page · date. */
export const ProofChip: React.FC<{proof: Proof; top?: number; delay?: number}> = ({proof, top = 250, delay = 8}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [delay, delay + 10], [0, 1], clamp);
  const y = interpolate(f, [delay, delay + 10], [-14, 0], clamp);
  const long = `${proof.source}${proof.page}${proof.date}`.length > 46;
  return (
    <div style={{position: 'absolute', top, width: '100%', display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${y}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, maxWidth: 1000, padding: '12px 26px', borderRadius: 99, background: U.ink,
        boxShadow: '0 10px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)', fontFamily: FONT.mono, fontSize: long ? 24 : 28, color: '#fff', whiteSpace: 'nowrap'}}>
        <svg width={26} height={26} viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6z" fill="none" stroke={U.saffron} strokeWidth={2} /><path d="M15 2v5h5" fill="none" stroke={U.saffron} strokeWidth={2} />
          <path d="M9 13l2 2 4-4" fill="none" stroke={U.cyan} strokeWidth={2.4} strokeLinecap="round" /></svg>
        <span>{proof.source}</span><span style={{color: U.saffron}}>·</span>
        <span style={{color: U.saffron}}>{proof.page}</span><span style={{color: U.saffron}}>·</span>
        <span style={{color: '#BDBDBD'}}>{proof.date}</span>
      </div>
    </div>
  );
};

// ---------- Clay props ----------
/** Matte clay shading: soft top-left light, no specular, darker rim. */
const ClayDefs: React.FC<{id: string; base: string; dark: string; light: string}> = ({id, base, dark, light}) => (
  <radialGradient id={id} cx="35%" cy="30%" r="80%"><stop offset="0" stopColor={light} /><stop offset="0.55" stopColor={base} /><stop offset="1" stopColor={dark} /></radialGradient>
);

const Rupee: React.FC = () => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <defs><ClayDefs id="c-coin" base="#F0A94E" dark="#C2742A" light="#FFD49A" /><ClayDefs id="c-coin-top" base="#F6B864" dark="#D8893A" light="#FFE2B8" /></defs>
    {[0, 1, 2, 3, 4].map((k) => (
      <g key={k} transform={`translate(${k % 2 ? 4 : -3}, ${-k * 20})`}>
        <ellipse cx={100} cy={160} rx={62} ry={20} fill="url(#c-coin)" />
        <rect x={38} y={146} width={124} height={14} fill="url(#c-coin)" />
        <ellipse cx={100} cy={146} rx={62} ry={20} fill="url(#c-coin-top)" />
      </g>
    ))}
    <text x={104} y={72} textAnchor="middle" fontFamily="Inter, Arial" fontWeight={900} fontSize={30} fill="#B5651F" transform="scale(1,0.5) translate(0,74)">₹</text>
  </svg>
);

const Gavel: React.FC = () => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <defs><ClayDefs id="c-wood" base="#B4774C" dark="#7E4E2E" light="#D9A57C" /><ClayDefs id="c-head" base="#9C6440" dark="#6A3E22" light="#C98E64" />
      <ClayDefs id="c-block" base="#8E5A39" dark="#5E3820" light="#B8825C" /></defs>
    <ellipse cx={100} cy={168} rx={70} ry={16} fill="url(#c-block)" />
    <rect x={30} y={150} width={140} height={18} fill="url(#c-block)" />
    <ellipse cx={100} cy={150} rx={70} ry={16} fill="#B07A54" />
    <g transform="rotate(-32 100 100)">
      <rect x={94} y={62} width={16} height={104} rx={8} fill="url(#c-wood)" />
      <rect x={50} y={38} width={104} height={40} rx={18} fill="url(#c-head)" />
      <rect x={44} y={42} width={14} height={32} rx={6} fill="#7E4E2E" /><rect x={146} y={42} width={14} height={32} rx={6} fill="#7E4E2E" />
    </g>
  </svg>
);

const House: React.FC = () => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <defs><ClayDefs id="c-wall" base="#F2E8DC" dark="#CDBFAF" light="#FFFFFF" /><ClayDefs id="c-roof" base={U.saffron} dark="#B9551A" light="#FFA86A" />
      <ClayDefs id="c-door" base={U.cyan} dark="#0B7E93" light="#7FE3F2" /></defs>
    <rect x={42} y={92} width={116} height={82} rx={10} fill="url(#c-wall)" />
    <path d="M28 100 L100 36 L172 100 Q174 108 164 108 L36 108 Q26 108 28 100 Z" fill="url(#c-roof)" />
    <rect x={86} y={124} width={30} height={50} rx={8} fill="url(#c-door)" />
    <rect x={54} y={118} width={22} height={20} rx={5} fill="#BFE9F2" /><rect x={126} y={118} width={22} height={20} rx={5} fill="#BFE9F2" />
  </svg>
);

const Chart: React.FC = () => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <defs><ClayDefs id="c-b1" base="#D9D9DD" dark="#A9A9AF" light="#FFFFFF" /><ClayDefs id="c-b2" base={U.cyan} dark="#0B7E93" light="#8BE6F4" />
      <ClayDefs id="c-b3" base={U.saffron} dark="#B9551A" light="#FFB07A" /><ClayDefs id="c-base" base="#ECECEF" dark="#C4C4C9" light="#FFFFFF" /></defs>
    <rect x={24} y={164} width={152} height={16} rx={8} fill="url(#c-base)" />
    <rect x={38} y={118} width={34} height={50} rx={10} fill="url(#c-b1)" />
    <rect x={84} y={84} width={34} height={84} rx={10} fill="url(#c-b2)" />
    <rect x={130} y={40} width={34} height={128} rx={10} fill="url(#c-b3)" />
  </svg>
);

const CLAY: Record<ClayKind, React.FC> = {rupee: Rupee, gavel: Gavel, house: House, chart: Chart};

/** A matte clay prop that drops in with a squash and floats, with a soft contact shadow. */
export const ClayProp: React.FC<{kind: ClayKind; size: number; cx: number; cy: number; delay?: number}> = ({kind, size, cx, cy, delay = 0}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - delay, fps, config: {damping: 10, mass: 0.7}});
  const float = Math.sin((f - delay) / 20) * 8;
  const squash = 1 + (1 - s) * 0.25;
  const Comp = CLAY[kind];
  return (
    <div style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, opacity: Math.min(1, s * 1.5)}}>
      <div style={{position: 'absolute', left: size * 0.18, right: size * 0.18, bottom: -size * 0.02, height: size * 0.1, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.30), transparent 70%)', transform: `scale(${0.75 + s * 0.25 - float / 160})`}} />
      <div style={{width: '100%', height: '100%', transform: `translateY(${float - (1 - s) * 160}px) scale(${s / squash}, ${s * squash})`, transformOrigin: '50% 100%',
        filter: 'drop-shadow(0 14px 16px rgba(0,0,0,0.18))'}}>
        <Comp />
      </div>
    </div>
  );
};
