// Unpaper 3D motif kit — "un-papering" a PDF: a sheet that unfolds / peels in real CSS 3D perspective,
// a camera dolly with parallax depth layers, decoded mono tokens that fly out of the paper and assemble
// into the key idea, and a saffron/cyan glow edge. Pure CSS 3D (no WebGL, no extra deps) so it stays cheap
// to render on a 2-vCPU runner. Every component is a pure function of the current frame (deterministic).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {FONT} from '@visuals/fonts';
import {UNPAPER_BRAND} from './brand';

export const U = UNPAPER_BRAND.colors;
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.out(Easing.cubic);

/** Saffron -> cyan gradient rim with a soft outer glow. Wrap any card in it. */
export const GlowEdge: React.FC<{radius?: number; width?: number; strength?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({
  radius = 28, width = 4, strength = 1, style, children
}) => {
  const f = useCurrentFrame();
  const a = 135 + Math.sin(f / 30) * 25; // the light slowly travels round the rim
  return (
    <div style={{position: 'relative', borderRadius: radius, padding: width,
      background: `linear-gradient(${a}deg, ${U.saffron}, rgba(255,255,255,0.65) 50%, ${U.cyan})`,
      boxShadow: `0 0 ${24 * strength}px rgba(240,120,40,${0.35 * strength}), 0 0 ${44 * strength}px rgba(18,184,214,${0.22 * strength})`, ...style}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: radius - width, overflow: 'hidden'}}>{children}</div>
    </div>
  );
};

/** Layered depth shadow for a sheet lifted `lift` (0..1) off the studio floor. */
export const depthShadow = (lift: number) =>
  [`0 ${2 + lift * 6}px ${4 + lift * 8}px rgba(0,0,0,0.18)`, `0 ${12 + lift * 30}px ${30 + lift * 50}px rgba(0,0,0,${0.16 + lift * 0.1})`,
    `0 ${40 + lift * 60}px ${80 + lift * 60}px rgba(0,0,0,${0.08 + lift * 0.08})`].join(', ');

/** Faint "printed text" lines so an empty sheet still reads as a page of a paper. */
export const PaperText: React.FC<{w: number; h: number; seed: string; pad?: number}> = ({h, seed, pad = 48}) => {
  const rows = Math.floor((h - pad * 2) / 30);
  return (
    <div style={{position: 'absolute', inset: pad, display: 'flex', flexDirection: 'column', gap: 16}}>
      {Array.from({length: rows}).map((_, i) => (
        <div key={i} style={{height: 12, borderRadius: 6, background: i % 7 === 0 ? 'rgba(23,23,23,0.22)' : 'rgba(23,23,23,0.09)',
          width: `${i % 7 === 0 ? 45 : 70 + random(`${seed}-${i}`) * 30}%`, marginTop: i % 7 === 0 && i ? 14 : 0}} />
      ))}
    </div>
  );
};

/**
 * A paper sheet in 3D perspective that unfolds from a tri-fold (top and bottom panels fold out over the middle),
 * then can peel away like a turned page. `unfold` 0 = folded, 1 = flat. `peel` 0 = flat, 1 = turned away.
 * The children are drawn across the three panels, so the content folds with the paper.
 */
export const PaperSheet3D: React.FC<{
  w: number; h: number; left: number; top: number; unfold: number; peel?: number; tiltX?: number; tiltY?: number;
  z?: number; glow?: boolean; paper?: string; creases?: boolean; children?: React.ReactNode;
}> = ({w, h, left, top, unfold, peel = 0, tiltX = 0, tiltY = 0, z = 0, glow = true, paper = '#FFFFFF', creases = true, children}) => {
  const ph = h / 3;
  const u = Math.max(0, Math.min(1, unfold));
  const topA = -170 * (1 - u);   // top panel hinged on its bottom edge
  const botA = 170 * (1 - u);    // bottom panel hinged on its top edge
  const shade = (a: number) => Math.min(0.45, Math.abs(Math.sin((a * Math.PI) / 180)) * 0.45);
  const lift = 1 - u * 0.6 + peel * 0.6;
  const panel = (i: number): React.CSSProperties => ({position: 'absolute', left: 0, top: i * ph, width: w, height: ph, overflow: 'hidden',
    background: paper, backfaceVisibility: 'hidden'});
  const inner = (i: number) => <div style={{position: 'absolute', left: 0, top: -i * ph, width: w, height: h}}>{children}</div>;
  const back = (i: number, a: number): React.CSSProperties => ({...panel(i), background: '#E4E4E4', transform: 'rotateX(180deg)',
    boxShadow: `inset 0 0 40px rgba(0,0,0,${0.1 + shade(a)})`});
  const rim = glow ? interpolate(u, [0.7, 1], [0, 1], clamp) * (1 - peel) : 0;
  return (
    <div style={{position: 'absolute', left, top, width: w, height: h, transformStyle: 'preserve-3d',
      transformOrigin: '0% 50%',
      transform: `translateZ(${z}px) rotateX(${tiltX}deg) rotateY(${tiltY - peel * 110}deg) rotateZ(${peel * -6}deg)`,
      opacity: interpolate(peel, [0.75, 1], [1, 0], clamp)}}>
      {/* contact + ambient shadow under the middle panel (grows as the paper lifts) */}
      <div style={{position: 'absolute', left: 0, top: ph, width: w, height: ph, borderRadius: 6, boxShadow: depthShadow(lift)}} />
      {rim > 0 ? <div style={{position: 'absolute', inset: -5, borderRadius: 10, opacity: rim,
        background: `linear-gradient(140deg, ${U.saffron}, rgba(255,255,255,0.5) 50%, ${U.cyan})`,
        boxShadow: `0 0 28px rgba(240,120,40,0.45), 0 0 50px rgba(18,184,214,0.3)`, transform: 'translateZ(-1px)'}} /> : null}
      {/* middle panel (flat) */}
      <div style={{...panel(1), borderRadius: 2}}>{inner(1)}</div>
      {/* top panel: hinge = its bottom edge */}
      <div style={{position: 'absolute', left: 0, top: 0, width: w, height: ph, transformStyle: 'preserve-3d', transformOrigin: '50% 100%',
        transform: `rotateX(${topA}deg)`}}>
        <div style={{...panel(0), top: 0, borderRadius: '6px 6px 0 0'}}>{inner(0)}
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent, rgba(0,0,0,${shade(topA)}))`}} /></div>
        <div style={{...back(0, topA), top: 0}} />
      </div>
      {/* bottom panel: hinge = its top edge */}
      <div style={{position: 'absolute', left: 0, top: ph * 2, width: w, height: ph, transformStyle: 'preserve-3d', transformOrigin: '50% 0%',
        transform: `rotateX(${botA}deg)`}}>
        <div style={{...panel(2), top: 0, borderRadius: '0 0 6px 6px'}}>{inner(2)}
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(0deg, transparent, rgba(0,0,0,${shade(botA)}))`}} /></div>
        <div style={{...back(2, botA), top: 0}} />
      </div>
      {/* fold creases stay faintly visible once flat (off for content-dense cards) */}
      {creases ? <>
      <div style={{position: 'absolute', left: 0, top: ph, width: w, height: 2, background: 'rgba(0,0,0,0.06)', transform: 'translateZ(1px)'}} />
      <div style={{position: 'absolute', left: 0, top: ph * 2, width: w, height: 2, background: 'rgba(0,0,0,0.06)', transform: 'translateZ(1px)'}} />
      </> : null}
    </div>
  );
};

/**
 * Camera: a perspective stage with a dolly (push in from far) and a slow orbit drift. Children placed with
 * <Depth z> get real parallax: nearer layers move more than the paper behind them.
 */
export const Camera: React.FC<{dur: number; from?: number; dolly?: number; drift?: number; children: React.ReactNode}> = ({
  dur, from = 0, dolly = 260, drift = 1, children
}) => {
  const f = useCurrentFrame() - from;
  const push = interpolate(f, [0, 36], [-dolly, 0], {...clamp, easing: ease}) + interpolate(f, [36, dur], [0, 60], clamp);
  const ry = Math.sin(f / 55) * 4 * drift;
  const rx = 3 + Math.cos(f / 70) * 2 * drift;
  return (
    <AbsoluteFill style={{perspective: 1500, perspectiveOrigin: '50% 45%'}}>
      <AbsoluteFill style={{transformStyle: 'preserve-3d', transform: `translateZ(${push}px) rotateX(${rx}deg) rotateY(${ry}deg)`}}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Depth: React.FC<{z: number; children: React.ReactNode}> = ({z, children}) => (
  <AbsoluteFill style={{transformStyle: 'preserve-3d', transform: `translateZ(${z}px)`}}>{children}</AbsoluteFill>
);

const GLYPHS = '01<>/{}[]#=+*%$&λΣ∂';
const NOISE = ['0x7F', 'attn()', 'Q·Kᵀ', '{k:v}', '∑', 'softmax', '√d', 'λ', '</>', 'p.1', 'h=8', 'N=6', '0110', 'BLEU', 'tok', '∂/∂x'];

/** Scrambles `word` into mono glyphs; characters resolve left to right as p goes 0 -> 1. */
export const decodeText = (word: string, p: number, seed: string, f: number) => {
  const done = Math.floor(p * (word.length + 1));
  return word.split('').map((ch, i) => (i < done || ch === ' ' ? ch : GLYPHS[Math.floor(random(`${seed}-${i}-${Math.floor(f / 2)}`) * GLYPHS.length)]!)).join('');
};

/**
 * Decoded-text particles. Noise tokens burst out of the paper (origin) toward the camera and fade;
 * the words of `lines` fly out of the same spot, spin into place and decode from glyphs into the key idea.
 */
export const DecodeAssemble: React.FC<{
  lines: string[]; top: number; origin: {x: number; y: number}; delay?: number; size?: number; seed: string; noise?: number;
}> = ({lines, top, origin, delay = 0, size = 104, seed, noise = 14}) => {
  const f = useCurrentFrame() - delay;
  let k = 0;
  const lineH = (li: number) => (li === 0 && lines.length > 1 ? size * 0.62 : size);
  return (
    <>
      {/* noise tokens */}
      {Array.from({length: noise}).map((_, i) => {
        const t = f - i * 1.5;
        const p = interpolate(t, [0, 34], [0, 1], {...clamp, easing: ease});
        const ang = random(`${seed}-a${i}`) * Math.PI * 2;
        const dist = 260 + random(`${seed}-d${i}`) * 420;
        const x = origin.x + Math.cos(ang) * dist * p;
        const y = origin.y + Math.sin(ang) * dist * 0.8 * p - 260 * p;
        const z = 400 * p;
        const o = t < 0 ? 0 : interpolate(t, [0, 6, 22, 34], [0, 0.9, 0.7, 0], clamp);
        return <div key={`n${i}`} style={{position: 'absolute', left: x, top: y, fontFamily: FONT.mono, fontSize: 28 + random(`${seed}-s${i}`) * 16,
          color: i % 3 === 0 ? U.saffron : i % 3 === 1 ? U.cyan : U.ink, opacity: o, whiteSpace: 'nowrap',
          transform: `translate(-50%,-50%) translateZ(${z}px) rotate(${(random(`${seed}-r${i}`) - 0.5) * 60 * p}deg)`}}>{NOISE[i % NOISE.length]}</div>;
      })}
      {/* the key idea assembling */}
      <div style={{position: 'absolute', top, width: '100%', textAlign: 'center', fontFamily: FONT.ui, transformStyle: 'preserve-3d'}}>
        {lines.map((ln, li) => {
          const words = ln.split(' ');
          return (
            <div key={li} style={{fontSize: lineH(li), fontWeight: li === 0 && lines.length > 1 ? 700 : 800, lineHeight: 1.08, letterSpacing: -2,
              color: U.ink, transformStyle: 'preserve-3d'}}>
              {words.map((w, wi) => {
                const idx = k++;
                const t = f - 6 - idx * 4;
                const p = interpolate(t, [0, 22], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.2))});
                const dec = interpolate(t, [6, 26], [0, 1], clamp);
                const sx = (origin.x - 540) + (random(`${seed}-wx${idx}`) - 0.5) * 300;
                const sy = origin.y - top - li * lineH(0);
                const hot = lines.length > 1 && li === lines.length - 1 && wi === words.length - 1;
                const resolved = dec >= 1;
                return <span key={wi} style={{display: 'inline-block', marginRight: '0.25em', opacity: t < 0 ? 0 : interpolate(t, [0, 5], [0, 1], clamp),
                  fontFamily: resolved ? FONT.ui : FONT.mono, color: hot ? U.saffron : resolved ? U.ink : (idx % 2 ? U.cyan : U.saffron),
                  textShadow: resolved ? 'none' : '0 0 18px rgba(18,184,214,0.45)',
                  transform: `translate3d(${sx * (1 - p)}px, ${sy * (1 - p)}px, ${-300 * (1 - p)}px) rotateX(${(1 - p) * 70}deg) rotateY(${(1 - p) * -40}deg) scale(${0.4 + p * 0.6})`}}>
                  {decodeText(w, dec, `${seed}-${idx}`, f)}
                </span>;
              })}
            </div>
          );
        })}
      </div>
    </>
  );
};

/**
 * Scene transition: a sheet of paper (with the glow edge) swings across the frame in 3D and hides the cut,
 * stamped with a decoding token line. Place it centred on the cut: <Sequence from={cut - len/2} durationInFrames={len}>.
 */
export const PaperWipe: React.FC<{len: number; seed: string}> = ({len, seed}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, len], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const x = interpolate(p, [0, 1], [1250, -1450]);
  const ry = interpolate(p, [0, 0.5, 1], [-55, -12, 35]);
  return (
    <AbsoluteFill style={{perspective: 1300, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: x, top: -140, width: 1300, height: 2200, transformStyle: 'preserve-3d', transformOrigin: '0% 50%',
        transform: `rotateY(${ry}deg) rotateZ(-4deg)`}}>
        <GlowEdge radius={18} width={6} style={{width: '100%', height: '100%'}}>
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, #FFFFFF, ${U.grey} 60%, #DADADA)`}}>
            <PaperText w={1300} h={2200} seed={seed} pad={140} />
            <div style={{position: 'absolute', left: 140, top: 1060, fontFamily: FONT.mono, fontSize: 44, color: U.ink, letterSpacing: 4}}>
              <span style={{color: U.saffron}}>un</span>{decodeText('paper · decoding', interpolate(p, [0.2, 0.7], [0, 1], clamp), seed, f)}
            </div>
          </div>
        </GlowEdge>
      </div>
    </AbsoluteFill>
  );
};
