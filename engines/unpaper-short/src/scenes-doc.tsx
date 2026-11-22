// Unpaper document scenes (the brief's script formula):
//  DocHook   — the document spins in in 3D, its orange corner peels and a big number pops out from inside.
//  ShowDoc   — the real document (cover) floating in the Paper Lab: what it is, who issued it, when.
//  Decode    — the camera dives into the real page, an orange highlighter sweeps the line, the line lifts up as 3D text,
//              then the plain decode + a clay prop. ProofChip (source · page · date) is drawn by the shell.
//  Asar      — "Aap par asar": the personal angle.
//  FoldOutro — the paper folds into the logo: SUBSCRIBE · Unpaper, the comment question, commenter shoutout,
//              next-video teaser slot, handles, "Poora breakdown YouTube par / slides Instagram par".
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '@visuals/fonts';
import {UNPAPER_HANDLES} from './brand';
import type {ClayKind} from './model';
import {ClayProp} from './paperlab';
import {GlowEdge, PaperSheet3D, PaperText, U} from './unpaper3d';
import {IconComment, IconFacebook, IconInstagram, IconLoop, IconSave, IconShare, IconYouTube} from './icons';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.out(Easing.cubic);
const P = FONT.ui;
const M = FONT.mono;
const asset = (p: string) => staticFile(`unpaper/${p}`);

const Kicker: React.FC<{text: string; top: number; delay?: number}> = ({text, top, delay = 0}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top, width: '100%', display: 'flex', justifyContent: 'center', opacity: interpolate(f - delay, [0, 10], [0, 1], clamp)}}>
      <div style={{fontFamily: M, fontSize: 28, letterSpacing: 4, color: '#55565C', textTransform: 'uppercase', padding: '9px 24px', borderRadius: 99,
        border: '2px solid rgba(46,47,53,0.18)', background: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap'}}>{text}</div>
    </div>
  );
};

/** The page face of a document: a real image if given, else synthetic printed lines. */
const Page: React.FC<{image?: string | undefined; w: number; h: number; seed: string}> = ({image, w, h, seed}) => (
  <div style={{position: 'absolute', inset: 0, background: '#fff'}}>
    {image ? <Img src={asset(image)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}} /> : <PaperText w={w} h={h} seed={seed} />}
  </div>
);

// ---------- DocHook ----------
/** 3D extruded number: stacked text-shadows give it depth without WebGL. */
const extrude = (n: number, c: string) => Array.from({length: n}).map((_, i) => `${i + 1}px ${i + 1}px 0 ${c}`).join(', ');

export const DocHook: React.FC<{number: string; line: string; image?: string | undefined; seed?: string; exitAt?: number}> = ({number, line, image, seed = 'hook', exitAt}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const W = 520, H = 735, L = 540 - W / 2, T = 690;
  const spin = interpolate(f, [0, 20], [0, 1], {...clamp, easing: ease});
  const ry = -540 * (1 - spin) - 12 * spin;
  const peel = interpolate(f, [16, 30], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
  const c = 150 * peel; // dog-ear size
  const pop = spring({frame: f - 24, fps, config: {damping: 9, mass: 0.7}});
  const lineO = interpolate(f, [34, 44], [0, 1], clamp);
  const exit = exitAt === undefined ? 0 : interpolate(f, [exitAt - 10, exitAt], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const size = Math.max(110, Math.min(200, Math.floor(1300 / Math.max(4, number.length))));
  // the number starts inside the peeled corner (top right of the sheet) and flies up to centre stage
  const sx = L + W - 60, sy = T + 50;
  const nx = interpolate(pop, [0, 1], [sx - 540, 0]), ny = interpolate(pop, [0, 1], [sy - 470, 0]);
  return (
    <AbsoluteFill style={{opacity: 1 - exit, transform: `scale(${1 + exit * 0.15})`}}>
      <AbsoluteFill style={{perspective: 1500}}>
        <div style={{position: 'absolute', left: L, top: T, width: W, height: H, transformStyle: 'preserve-3d',
          transform: `translateZ(${-700 * (1 - spin)}px) rotateY(${ry}deg) rotateX(${8 + 18 * (1 - spin)}deg) scale(${0.45 + 0.55 * spin})`}}>
          {/* front */}
          <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 6, overflow: 'hidden',
            clipPath: `polygon(0 0, ${W - c}px 0, ${W}px ${c}px, ${W}px ${H}px, 0 ${H}px)`,
            boxShadow: '0 40px 80px rgba(0,0,0,0.25)'}}>
            <Page image={image} w={W} h={H} seed={seed} />
          </div>
          {/* back */}
          <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 6,
            background: 'linear-gradient(135deg, #EDEDED, #D6D6D6)'}} />
          {/* orange dog-ear: the folded corner shows its orange underside */}
          {c > 1 ? <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transform: 'translateZ(2px)'}}>
            <defs><linearGradient id={`ear-${seed}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFB070" /><stop offset="1" stopColor={U.saffron} /></linearGradient></defs>
            <path d={`M ${W - c} 0 L ${W} ${c} L ${W - c} ${c} Z`} fill={`url(#ear-${seed})`} style={{filter: 'drop-shadow(-6px 8px 8px rgba(0,0,0,0.25))'}} />
          </svg> : null}
        </div>
      </AbsoluteFill>
      {/* big number popping out */}
      <div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center', perspective: 1000}}>
        <div style={{display: 'inline-block', fontFamily: P, fontWeight: 900, fontSize: size, letterSpacing: -4, lineHeight: 1, color: U.saffron,
          textShadow: `${extrude(8, '#B9551A')}, 0 24px 40px rgba(0,0,0,0.25)`, whiteSpace: 'nowrap', opacity: Math.min(1, pop * 2),
          transform: `translate(${nx}px, ${ny}px) translateZ(${pop * 80}px) scale(${0.15 + pop * 0.85}) rotate(${(1 - pop) * -18}deg)`}}>{number}</div>
      </div>
      <div style={{position: 'absolute', top: 330 + size + 40, left: 60, right: 60, textAlign: 'center', fontFamily: P, fontWeight: 800, fontSize: 54,
        lineHeight: 1.1, color: U.ink, opacity: lineO, transform: `translateY(${(1 - lineO) * 20}px)`}}>{line}</div>
    </AbsoluteFill>
  );
};

// ---------- ShowDoc ----------
export const ShowDocScene: React.FC<{name: string; issuer: string; date: string; image: string; dur: number; seed: string}> = ({name, issuer, date, image, dur, seed}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - 4, fps, config: {damping: 14}});
  const ry = interpolate(f, [0, dur], [-16, 10]);
  const W = 500, H = 707;
  return (<>
    <Kicker text="Document" top={330} />
    <div style={{position: 'absolute', top: 400, left: 60, right: 60, textAlign: 'center', fontFamily: P, fontWeight: 900, fontSize: name.length > 22 ? 64 : 76,
      letterSpacing: -2, lineHeight: 1.05, color: U.ink, opacity: interpolate(f, [6, 16], [0, 1], clamp)}}>{name}</div>
    <div style={{position: 'absolute', top: 500, width: '100%', textAlign: 'center', fontFamily: M, fontSize: 28, color: '#55565C',
      opacity: interpolate(f, [12, 22], [0, 1], clamp)}}>{issuer} · <span style={{color: U.saffron}}>{date}</span></div>
    <AbsoluteFill style={{perspective: 1500}}>
      <div style={{position: 'absolute', left: 540 - W / 2, top: 600, width: W, height: H, transformStyle: 'preserve-3d',
        transform: `translateY(${(1 - s) * 300}px) rotateY(${ry}deg) rotateX(${6 + Math.sin(f / 30) * 3}deg) translateZ(${Math.sin(f / 25) * 20}px)`, opacity: s}}>
        <GlowEdge radius={8} width={4} style={{width: '100%', height: '100%'}}><Page image={image} w={W} h={H} seed={seed} /></GlowEdge>
      </div>
    </AbsoluteFill>
  </>);
};

// ---------- Decode shot ----------
export const DecodeScene: React.FC<{
  index: number; title: string; page: string; box: [number, number, number, number]; quote: string; decoded: string; prop?: ClayKind; dur: number;
}> = ({index, title, page, box, quote, decoded, prop}) => {
  const f = useCurrentFrame();
  const W = 760, H = Math.round(W * 1273 / 900), px = 540 - W / 2, py = 430;
  const [bx, by, bw, bh] = box;
  const ox = (bx + bw / 2) * W, oy = (by + bh / 2) * H;      // box centre in page coords
  const S = Math.min(3.2, 920 / (bw * W));
  const target = {x: 540, y: 960};
  const enter = interpolate(f, [0, 12], [0, 1], {...clamp, easing: ease});
  const dive = interpolate(f, [12, 48], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const sweep = interpolate(f, [46, 70], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const lift = interpolate(f, [72, 100], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.1))});
  const decO = interpolate(f, [98, 112], [0, 1], clamp);
  const scale = 1 + (S - 1) * dive;
  const tx = (target.x - (px + ox)) * dive, ty = (target.y - (py + oy)) * dive;
  const pageDim = interpolate(lift, [0, 1], [1, 0.3]);
  // lifted 3D line: starts on the highlighted box (screen), rises to the top band
  const cardTop = interpolate(lift, [0, 1], [target.y - (bh * H * S) / 2, 450]);
  const quoteSize = quote.length > 140 ? 32 : quote.length > 90 ? 36 : 42;
  return (<>
    {/* the real page, camera dives into the highlighted line */}
    <AbsoluteFill style={{perspective: 1600, opacity: enter * pageDim}}>
      <div style={{position: 'absolute', left: px, top: py, width: W, height: H, transformOrigin: `${ox}px ${oy}px`,
        transform: `translate(${tx}px, ${ty + (1 - enter) * 200}px) rotateX(${(1 - dive) * 14 + (1 - enter) * 20}deg) scale(${scale})`,
        boxShadow: '0 40px 80px rgba(0,0,0,0.25)', background: '#fff'}}>
        <Img src={asset(page)} style={{width: '100%', height: '100%', display: 'block'}} />
        <div style={{position: 'absolute', left: bx * W - 4, top: by * H - 3, width: (bw * W + 8) * sweep, height: bh * H + 6,
          background: 'rgba(240,120,40,0.42)', mixBlendMode: 'multiply', borderRadius: 3}} />
      </div>
    </AbsoluteFill>
    {/* kicker drawn above the page so the page never covers it; sits between the ProofChip (top 250) and the lifted quote */}
    <Kicker text={`Point ${index} · ${title}`} top={338} />
    {/* the line lifts off the page as 3D text */}
    {lift > 0 ? <div style={{position: 'absolute', left: 60, right: 60, top: cardTop, perspective: 1200, opacity: Math.min(1, lift * 3)}}>
      <div style={{transform: `translateZ(${lift * 60}px) rotateX(${(1 - lift) * 35}deg) scale(${0.92 + lift * 0.08})`, transformOrigin: '50% 100%',
        background: '#fff', borderRadius: 18, padding: '22px 28px 22px 36px', borderLeft: `10px solid ${U.saffron}`,
        boxShadow: `0 ${10 + lift * 30}px ${24 + lift * 40}px rgba(0,0,0,${0.12 + lift * 0.14}), 0 0 0 1px rgba(0,0,0,0.04)`}}>
        <div style={{fontFamily: "'Times New Roman', Georgia, serif", fontSize: quoteSize, lineHeight: 1.28, color: U.ink}}>
          <span style={{background: 'linear-gradient(transparent 55%, rgba(240,120,40,0.38) 55%)'}}>{quote}</span>
        </div>
      </div>
    </div> : null}
    {/* the decode */}
    <div style={{position: 'absolute', top: 800, left: 50, right: 50, textAlign: 'center', opacity: decO, transform: `translateY(${(1 - decO) * 30}px)`}}>
      <div style={{display: 'inline-block', fontFamily: P, fontWeight: 900, fontSize: decoded.length > 26 ? 58 : 68, lineHeight: 1.1, letterSpacing: -2, color: U.ink,
        background: 'rgba(255,255,255,0.85)', padding: '14px 30px', borderRadius: 22, boxShadow: '0 14px 30px rgba(0,0,0,0.12)'}}>{decoded}</div>
    </div>
    {prop ? <ClayProp kind={prop} size={300} cx={540} cy={1160} delay={104} /> : null}
  </>);
};

// ---------- Aap par asar ----------
export const AsarScene: React.FC<{lines: string[]; prop?: ClayKind}> = ({lines, prop}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (<>
    <div style={{position: 'absolute', top: 340, width: '100%', textAlign: 'center', fontFamily: P, fontWeight: 900, fontSize: 104, letterSpacing: -3, lineHeight: 1,
      color: U.ink, opacity: interpolate(f, [0, 10], [0, 1], clamp)}}>Aap par <span style={{color: U.saffron}}>asar</span></div>
    {lines.map((l, i) => {
      const s = spring({frame: f - 12 - i * 10, fps, config: {damping: 13}});
      return <div key={i} style={{position: 'absolute', left: 90, right: 90, top: 520 + i * 170, height: 140, perspective: 1000}}>
        <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: 26, padding: '0 34px', borderRadius: 28, background: '#fff',
          boxShadow: '0 18px 40px rgba(0,0,0,0.14)', transform: `rotateX(${(1 - s) * -90}deg)`, transformOrigin: '50% 0%', opacity: s}}>
          <div style={{width: 64, height: 64, borderRadius: 18, flexShrink: 0, background: [U.saffron, U.cyan, U.ink][i % 3], color: '#fff', fontFamily: P, fontWeight: 900,
            fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
          <div style={{fontFamily: P, fontWeight: 800, fontSize: l.length > 34 ? 40 : 46, color: U.ink, lineHeight: 1.15}}>{l}</div>
        </div>
      </div>;
    })}
    {prop ? <ClayProp kind={prop} size={240} cx={540} cy={1230} delay={40} /> : null}
  </>);
};

// ---------- Outro: the paper folds into the logo ----------
const HANDLES = [
  {Icon: IconYouTube, h: UNPAPER_HANDLES.youtube.handle},
  {Icon: IconInstagram, h: UNPAPER_HANDLES.instagram.handle},
  {Icon: IconFacebook, h: UNPAPER_HANDLES.facebook.handle}
];

export const FoldOutro: React.FC<{question: string; shoutout?: string | undefined; nextTeaser?: string | undefined; crossPost: string; hook: string; backdrop?: boolean}> = ({
  question, shoutout, nextTeaser, crossPost, hook, backdrop
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fold = interpolate(f, [2, 16], [1, 0], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const shrink = interpolate(f, [8, 22], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const sheetO = interpolate(f, [18, 24], [1, 0], clamp);
  const logo = spring({frame: f - 18, fps, config: {damping: 10, mass: 0.7}});
  const at = (d: number) => interpolate(f, [d, d + 10], [0, 1], clamp);
  const pulse = 1 + Math.max(0, Math.sin(f / 6)) * 0.05 * (f > 40 ? 1 : 0);
  const W = 640, H = 900;
  const sy = interpolate(shrink, [0, 1], [0, 465 - (540 + H / 2)]);
  return (
    <AbsoluteFill>
      {backdrop ? <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1415, opacity: at(0),
        background: 'linear-gradient(180deg, rgba(242,242,242,0.94) 88%, rgba(242,242,242,0))'}} /> : null}
      {/* the sheet folds shut and shrinks into the logo */}
      {sheetO > 0 ? <AbsoluteFill style={{perspective: 1500, opacity: sheetO}}>
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${sy}px) scale(${1 - shrink * 0.74})`, transformOrigin: `540px ${540 + H / 2}px`, transformStyle: 'preserve-3d'}}>
          <PaperSheet3D w={W} h={H} left={540 - W / 2} top={540} unfold={fold}>
            <div style={{position: 'absolute', inset: 0, background: '#fff'}}><PaperText w={W} h={H} seed="outro" /></div>
          </PaperSheet3D>
        </div>
      </AbsoluteFill> : null}
      <div style={{position: 'absolute', left: 540 - 85, top: 380, width: 170, height: 170, transform: `scale(${logo}) rotate(${(1 - logo) * -25}deg)`}}>
        <Img src={asset('brand/logo.png')} style={{width: '100%', height: '100%', borderRadius: 36, boxShadow: '0 24px 50px rgba(0,0,0,0.3)'}} />
      </div>
      <div style={{position: 'absolute', top: 575, width: '100%', display: 'flex', justifyContent: 'center', opacity: at(24)}}>
        <div style={{transform: `scale(${pulse})`, background: '#E5484D', color: '#fff', fontFamily: P, fontWeight: 900, fontSize: 46, letterSpacing: 1,
          padding: '16px 50px', borderRadius: 99, boxShadow: '0 16px 36px rgba(229,72,77,0.4)'}}>SUBSCRIBE · Unpaper</div>
      </div>
      <div style={{position: 'absolute', top: 690, left: 70, right: 70, display: 'flex', justifyContent: 'center', opacity: at(30)}}>
        <GlowEdge radius={34} width={4}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20, background: U.ink, padding: '20px 32px', borderRadius: 30}}>
            <IconComment s={64} c={U.saffron} />
            <span style={{fontFamily: P, fontWeight: 800, fontSize: question.length > 44 ? 40 : 46, color: '#fff', lineHeight: 1.15}}>{question}</span>
          </div>
        </GlowEdge>
      </div>
      {shoutout ? <div style={{position: 'absolute', top: 858, width: '100%', textAlign: 'center', fontFamily: P, fontWeight: 700, fontSize: 34, color: U.ink, opacity: at(36)}}>
        Shoutout: <span style={{color: U.saffron, fontWeight: 900}}>{shoutout}</span> — aapke comment pe bana
      </div> : null}
      {nextTeaser ? <div style={{position: 'absolute', top: 918, left: 110, right: 110, opacity: at(40)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '16px 26px', borderRadius: 22, border: `3px dashed ${U.cyan}`, background: 'rgba(255,255,255,0.8)'}}>
          <div style={{fontFamily: M, fontSize: 24, color: '#fff', background: U.cyan, padding: '6px 14px', borderRadius: 10, flexShrink: 0}}>NEXT ▶</div>
          <div style={{fontFamily: P, fontWeight: 800, fontSize: nextTeaser.length > 40 ? 32 : 36, color: U.ink, lineHeight: 1.15}}>{nextTeaser}</div>
        </div>
      </div> : null}
      <div style={{position: 'absolute', top: 1060, width: '100%', display: 'flex', justifyContent: 'center', gap: 16, opacity: at(44)}}>
        {HANDLES.map(({Icon, h}) => (
          <div key={h} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px 10px 12px', borderRadius: 99, background: '#fff',
            boxShadow: '0 8px 18px rgba(0,0,0,0.10)'}}><Icon s={46} /><span style={{fontFamily: P, fontWeight: 800, fontSize: 30, color: U.ink, whiteSpace: 'nowrap'}}>{h}</span></div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 1160, width: '100%', textAlign: 'center', fontFamily: P, fontWeight: 800, fontSize: 36, color: U.ink, opacity: at(50)}}>
        {crossPost.split(' / ').map((part, i) => <span key={i}>{i ? <span style={{color: U.saffron}}> / </span> : null}{part}</span>)}
      </div>
      <div style={{position: 'absolute', top: 1235, left: 70, right: 70, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, opacity: at(56)}}>
        <IconSave s={40} /><IconShare s={40} />
        <span style={{fontFamily: M, fontSize: 26, color: U.ink, whiteSpace: 'nowrap'}}>Save + Share</span>
        <span style={{width: 2, height: 30, background: 'rgba(0,0,0,0.15)', margin: '0 6px'}} />
        <div style={{transform: `rotate(${f * 6}deg)`, display: 'flex'}}><IconLoop s={36} /></div>
        <span style={{fontFamily: M, fontSize: 24, color: '#55565C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 520}}>shuru se: {hook}</span>
      </div>
    </AbsoluteFill>
  );
};
