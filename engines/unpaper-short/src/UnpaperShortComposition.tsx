// Unpaper "Studio" style for 180s vertical Shorts (1080x1920).
// Look: soft grey studio vignette, 3D props with contact shadows, kinetic word-by-word type,
// real PDF pages that go grey -> colour, counters, coin-flip transitions. One file = whole style kit.
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {FONT, useBundledFonts} from '@visuals/fonts';

const P = FONT.ui;
const M = FONT.mono;
export const S = {ink: '#171717', soft: '#55565C', saffron: '#F07828', cyan: '#12B8D6', bg1: '#F2F2F2', bg2: '#BDBDBD', red: '#E5484D'};
const FPS = 30;
/** Every Unpaper asset lives under public/unpaper/ so it never collides with other engines. */
const asset = (p: string) => staticFile(`unpaper/${p}`);
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// ---------- building blocks ----------
const Studio: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 55% at 50% 45%, ${S.bg1} 0%, #DCDCE0 55%, ${S.bg2} 100%)`}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 6% at 50% 74%, rgba(0,0,0,0.10), transparent 70%)'}} />
  </AbsoluteFill>
);

const Kinetic: React.FC<{lines: string[]; delay?: number; size?: number; top: number; accentLast?: boolean}> = ({lines, delay = 4, size = 104, top, accentLast = true}) => {
  const f = useCurrentFrame();
  let k = 0;
  return (
    <div style={{position: 'absolute', top, width: '100%', textAlign: 'center', fontFamily: P}}>
      {lines.map((ln, li) => (
        <div key={li} style={{fontSize: li === 0 && lines.length > 1 ? size * 0.62 : size, fontWeight: li === 0 && lines.length > 1 ? 700 : 800,
          lineHeight: 1.08, letterSpacing: -2, color: accentLast && li === lines.length - 1 ? S.ink : S.ink}}>
          {ln.split(' ').map((w, wi) => {
            const t = f - delay - (k++) * 4;
            const o = interpolate(t, [0, 8], [0, 1], clamp);
            const y = interpolate(t, [0, 10], [40, 0], {...clamp, easing: Easing.out(Easing.cubic)});
            const b = interpolate(t, [0, 8], [12, 0], clamp);
            const hot = accentLast && li === lines.length - 1 && wi === ln.split(' ').length - 1 && lines.length > 1;
            return <span key={wi} style={{display: 'inline-block', opacity: o, transform: `translateY(${y}px)`, filter: `blur(${b}px)`,
              marginRight: '0.25em', color: hot ? S.saffron : undefined}}>{w}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

const Kicker: React.FC<{text: string; top: number}> = ({text, top}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 10], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', top, width: '100%', display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{fontFamily: M, fontSize: 30, letterSpacing: 4, color: S.soft, textTransform: 'uppercase',
        padding: '10px 26px', borderRadius: 99, border: '2px solid rgba(46,47,53,0.18)', background: 'rgba(255,255,255,0.55)'}}>{text}</div>
    </div>
  );
};

const Prop: React.FC<{src: string; w: number; cx?: number; cy: number; delay?: number; tilt?: boolean; dim?: number}> = ({src, w, cx = 540, cy, delay = 8, tilt = true, dim = 1}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - delay, fps, config: {damping: 13, mass: 0.8}});
  const float = Math.sin((f - delay) / 22) * 10;
  const ry = tilt ? Math.sin((f - delay) / 40) * 10 : 0;
  return (
    <div style={{position: 'absolute', left: cx - w / 2, top: cy - w / 2, width: w, height: w, opacity: Math.min(1, s * 1.4) * dim}}>
      <div style={{position: 'absolute', left: w * 0.15, right: w * 0.15, bottom: w * 0.02, height: w * 0.08, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.32), transparent 70%)', transform: `scale(${0.7 + s * 0.3 - float / 200})`, filter: 'blur(6px)'}} />
      <div style={{perspective: 1200, width: '100%', height: '100%'}}>
        <Img src={asset(src)} style={{width: '100%', height: '92%', objectFit: 'contain',
          transform: `translateY(${float - (1 - s) * 120}px) scale(${0.6 + s * 0.4}) rotateY(${ry}deg)`}} />
      </div>
    </div>
  );
};

const Captions: React.FC<{text: string; dur: number}> = ({text, dur}) => {
  const f = useCurrentFrame();
  const words = text.split(/\s+/);
  const chunks: string[][] = [];
  for (let i = 0; i < words.length; i += 5) chunks.push(words.slice(i, i + 5));
  const start = 6, end = dur - 16, per = (end - start) / words.length;
  let idx = 0, acc = 0;
  for (let i = 0; i < chunks.length; i++) { if (f >= start + acc * per) idx = i; acc += chunks[i]!.length; }
  const cs = start + chunks.slice(0, idx).reduce((a, c) => a + c.length, 0) * per;
  const local = f - cs, spoken = Math.floor(local / per);
  const sc = interpolate(local, [0, 5], [0.92, 1], clamp);
  return (
    <div style={{position: 'absolute', top: 1430, width: '100%', display: 'flex', justifyContent: 'center'}}>
      <div style={{transform: `scale(${sc})`, maxWidth: 900, textAlign: 'center', padding: '16px 30px', borderRadius: 24,
        background: 'rgba(255,255,255,0.86)', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', fontFamily: P, fontWeight: 700, fontSize: 50, lineHeight: 1.2}}>
        {(chunks[idx] ?? []).map((w, i) => <span key={i} style={{color: i === spoken ? S.saffron : i < spoken ? S.ink : 'rgba(46,47,53,0.4)'}}>{w} </span>)}
      </div>
    </div>
  );
};

const Source: React.FC<{cite: string; src: string}> = ({cite, src}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [12, 24], [0, 1], clamp);
  const short = cite.split(' — ')[0];
  return (
    <div style={{position: 'absolute', top: 250, width: '100%', display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{display: 'flex', gap: 12, alignItems: 'center', fontFamily: M, fontSize: 30, color: S.ink,
        background: 'rgba(255,255,255,0.92)', padding: '10px 24px', boxShadow: '0 6px 18px rgba(0,0,0,0.10)', borderRadius: 99}}>
        <span style={{width: 12, height: 12, borderRadius: 9, background: S.cyan}} />
        <span style={{color: S.cyan, fontWeight: 500}}>SOURCE</span><span>{src} · {short}</span>
      </div>
    </div>
  );
};

// ---------- scenes ----------
const TitleScene: React.FC<any> = ({kicker, lines, prop, strike}) => {
  const f = useCurrentFrame();
  const sl = interpolate(f, [40, 52], [0, 1], clamp);
  return (<>
    <Kicker text={kicker} top={430} />
    <Kinetic lines={lines} top={530} />
    {prop ? <Prop src={prop} w={620} cy={1080} /> : null}
    {strike ? <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <line x1={330} y1={870} x2={330 + 420 * sl} y2={870 + 420 * sl} stroke={S.red} strokeWidth={22} strokeLinecap="round" />
      <line x1={750} y1={870} x2={750 - 420 * sl} y2={870 + 420 * sl} stroke={S.red} strokeWidth={22} strokeLinecap="round" />
    </svg> : null}
  </>);
};

const PdfScene: React.FC<any> = ({page, kicker, lines, note, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - 6, fps, config: {damping: 15}});
  const gray = interpolate(f, [25, 55], [1, 0], clamp);
  const zoom = interpolate(f, [0, dur], [1, 1.07]);
  return (<>
    <Kicker text={kicker} top={330} />
    <Kinetic lines={lines} top={410} size={92} />
    <div style={{position: 'absolute', left: 190, top: 690, width: 700, height: 680, perspective: 1600}}>
      <div style={{width: '100%', height: '100%', overflow: 'hidden', borderRadius: 18, background: '#fff',
        boxShadow: '0 40px 80px rgba(0,0,0,0.25)', transform: `rotateX(${(1 - s) * 40 + 6}deg) translateY(${(1 - s) * 200}px) scale(${zoom})`, opacity: s}}>
        <Img src={asset(page)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top',
          filter: `grayscale(${gray}) contrast(${1 + gray * 0.2})`}} />
      </div>
    </div>
    <div style={{position: 'absolute', top: 1385, width: '100%', textAlign: 'center', fontFamily: M, fontSize: 24, color: S.soft,
      opacity: interpolate(f, [30, 45], [0, 1], clamp)}}>{note}</div>
  </>);
};

const TrainScene: React.FC<any> = ({kicker, lines, words, prop, dur}) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 40], [900, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const per = (dur - 50) / words.length;
  return (<>
    <Kicker text={kicker} top={400} />
    <Kinetic lines={lines} top={480} />
    <div style={{position: 'absolute', left: x, top: 0, width: 1080, height: 1920}}><Prop src={prop} w={900} cy={830} tilt={false} delay={0} /></div>
    <div style={{position: 'absolute', top: 1180, width: '100%', display: 'flex', justifyContent: 'center', gap: 8, padding: '0 40px'}}>
      {words.map((w: string, i: number) => {
        const t = f - 40 - i * per;
        const on = t >= 0 && t < per; const done = t >= per;
        const o = interpolate(t, [0, 6], [0.25, 1], clamp);
        return <div key={i} style={{fontFamily: P, fontWeight: 700, fontSize: 34, padding: '12px 14px', borderRadius: 14,
          background: on ? S.saffron : done ? '#fff' : 'rgba(255,255,255,0.45)', color: on ? '#fff' : S.ink, opacity: o,
          transform: `translateY(${on ? -12 : 0}px)`, boxShadow: on ? '0 12px 24px rgba(255,138,31,0.4)' : 'none'}}>{w}</div>;
      })}
    </div>
    <div style={{position: 'absolute', top: 1300, width: '100%', textAlign: 'center', fontFamily: M, fontSize: 26, color: S.soft}}>1 → 2 → 3 → 4 → 5 → 6</div>
  </>);
};

const FlipScene: React.FC<any> = ({kicker, lines, from, to}) => {
  const f = useCurrentFrame();
  const r = interpolate(f, [18, 42], [0, 180], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const showTo = r > 90;
  return (<>
    <Kicker text={kicker} top={400} />
    {showTo ? <Sequence from={42} layout="none"><Kinetic lines={lines} top={480} delay={0} /></Sequence> : null}
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, perspective: 1400}}>
      <div style={{position: 'absolute', inset: 0, transform: `rotateY(${showTo ? r - 180 : r}deg)`}}>
        <Prop src={showTo ? to : from} w={showTo ? 640 : 860} cy={1060} delay={showTo ? 40 : 0} tilt={showTo} />
      </div>
    </div>
  </>);
};

const AttentionScene: React.FC<any> = ({kicker, words, focus, targets, label, tags}) => {
  const f = useCurrentFrame();
  const y0 = 600, gap = 120, xL = 330;
  const pos = (i: number) => y0 + i * gap;
  return (<>
    <Kicker text={kicker} top={400} />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {words.map((_: string, i: number) => {
        if (i === focus) return null;
        const t = f - 20 - i * 4;
        const p = interpolate(t, [0, 14], [0, 1], clamp);
        const strong = targets.includes(i);
        const y1 = pos(focus) + 30, y2 = pos(i) + 30, bend = 200 + Math.abs(focus - i) * 60;
        return <path key={i} d={`M ${xL + 260} ${y1} C ${xL + 260 + bend} ${y1}, ${xL + 260 + bend} ${y2}, ${xL + 260} ${y2}`}
          fill="none" stroke={strong ? S.saffron : S.cyan} strokeOpacity={strong ? 0.95 : 0.35} strokeWidth={strong ? 12 : 4}
          strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />;
      })}
    </svg>
    {words.map((w: string, i: number) => {
      const o = interpolate(f - i * 3, [0, 8], [0, 1], clamp);
      const isF = i === focus, isT = targets.includes(i);
      return <div key={i} style={{position: 'absolute', left: xL, top: pos(i), width: 260, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 16, fontFamily: P, fontWeight: 800, fontSize: 42, opacity: o,
        background: isF ? S.ink : isT ? S.saffron : '#fff', color: isF || isT ? '#fff' : S.ink, boxShadow: '0 10px 24px rgba(0,0,0,0.12)'}}>{w}</div>;
    })}
    {tags ? Object.entries(tags).map(([k, v]: any) => <div key={k} style={{position: 'absolute', left: 70, top: pos(+k) + 12, width: 240, textAlign: 'right',
      fontFamily: P, fontWeight: 700, fontSize: 36, color: S.saffron, opacity: interpolate(f, [45, 60], [0, 1], clamp)}}>{v}</div>) : null}
    <div style={{position: 'absolute', top: 1330, width: '100%', textAlign: 'center', fontFamily: M, fontSize: 24, color: S.soft}}>{label}</div>
  </>);
};

const QkvScene: React.FC<any> = ({kicker, cards, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const per = (dur - 30) / 3;
  return (<>
    <Kicker text={kicker} top={400} />
    {cards.map((c: any, i: number) => {
      const s = spring({frame: f - 10 - i * per, fps, config: {damping: 14}});
      const cols = [S.saffron, S.cyan, S.ink];
      return <div key={i} style={{position: 'absolute', left: 140, top: 540 + i * 270, width: 800, height: 230, perspective: 1200}}>
        <div style={{width: '100%', height: '100%', borderRadius: 28, background: '#fff', display: 'flex', alignItems: 'center', gap: 36, padding: '0 40px',
          boxShadow: '0 24px 50px rgba(0,0,0,0.16)', transform: `rotateX(${(1 - s) * 90}deg)`, opacity: s, transformOrigin: 'top'}}>
          <div style={{width: 150, height: 150, borderRadius: 24, background: cols[i], color: '#fff', fontFamily: P, fontWeight: 800, fontSize: 96,
            display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{c.k}</div>
          <div style={{fontFamily: P, fontWeight: 700, fontSize: 48, color: S.ink, lineHeight: 1.15}}>{c.t}</div>
        </div>
      </div>;
    })}
  </>);
};

const CounterScene: React.FC<any> = ({kicker, value, suffix, prop, count, sub}) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [10, 45], [0, value], {...clamp, easing: Easing.out(Easing.cubic)}));
  const cols = 4, w = 210;
  return (<>
    <Kicker text={kicker} top={380} />
    <div style={{position: 'absolute', top: 460, width: '100%', textAlign: 'center', fontFamily: P, fontWeight: 800, fontSize: 210, color: S.ink, letterSpacing: -6}}>
      {n}<span style={{fontSize: 90, color: S.saffron, letterSpacing: -2}}>{suffix}</span>
    </div>
    {Array.from({length: count}).map((_, i) => (
      <Prop key={i} src={prop} w={w} cx={540 + ((i % cols) - (cols - 1) / 2) * 230} cy={900 + Math.floor(i / cols) * 230} delay={20 + i * 4} tilt={false} />
    ))}
    {sub ? <div style={{position: 'absolute', top: 1340, width: '100%', textAlign: 'center', fontFamily: M, fontSize: 30, color: S.soft}}>{sub}</div> : null}
  </>);
};

const StatsScene: React.FC<any> = ({kicker, prop, stats, unit}) => {
  const f = useCurrentFrame();
  return (<>
    <Kicker text={kicker} top={380} />
    <Prop src={prop} w={440} cy={680} />
    {stats.map((s: any, i: number) => {
      const t = f - 30 - i * 25;
      const v = interpolate(t, [0, 30], [0, s.value], {...clamp, easing: Easing.out(Easing.cubic)});
      const w = interpolate(t, [0, 30], [0, (s.value / 45) * 700], clamp);
      return <div key={i} style={{position: 'absolute', left: 140, top: 960 + i * 200, width: 800, opacity: interpolate(t, [0, 8], [0, 1], clamp)}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: P, fontWeight: 700, fontSize: 42, color: S.ink}}>
          <span>{s.label}</span><span><b style={{fontSize: 64, color: i ? S.cyan : S.saffron}}>{v.toFixed(1)}</b> {unit}</span></div>
        <div style={{height: 26, borderRadius: 13, background: 'rgba(0,0,0,0.08)', marginTop: 12}}>
          <div style={{height: 26, width: w, borderRadius: 13, background: i ? S.cyan : S.saffron}} /></div>
      </div>;
    })}
  </>);
};

const CtaScene: React.FC<any> = ({kicker, lines}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - 4, fps, config: {damping: 12}});
  const pulse = 1 + Math.max(0, Math.sin(f / 7)) * 0.05 * (f > 60 ? 1 : 0);
  return (<>
    <div style={{position: 'absolute', left: 390, top: 360, width: 300, height: 300, transform: `scale(${s})`}}>
      <Img src={asset('brand/logo.png')} style={{width: '100%', borderRadius: 60, boxShadow: '0 30px 60px rgba(0,0,0,0.3)'}} /></div>
    <Kicker text={kicker} top={720} />
    <Kinetic lines={lines} top={800} delay={12} />
    <div style={{position: 'absolute', top: 1140, width: '100%', display: 'flex', justifyContent: 'center', opacity: interpolate(f, [40, 55], [0, 1], clamp)}}>
      <div style={{transform: `scale(${pulse})`, background: S.red, color: '#fff', fontFamily: P, fontWeight: 800, fontSize: 50, padding: '22px 60px', borderRadius: 99,
        boxShadow: '0 18px 40px rgba(229,72,77,0.4)'}}>SUBSCRIBE · Unpaper</div></div>
  </>);
};

const REG: Record<string, React.FC<any>> = {title: TitleScene, prop: TitleScene, pdfpage: PdfScene, train: TrainScene, flip: FlipScene,
  attention: AttentionScene, qkv: QkvScene, counter: CounterScene, stats: StatsScene, cta: CtaScene};

const Shell: React.FC<{sc: any; dur: number; srcLabel: string}> = ({sc, dur, srcLabel}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8, dur - 6, dur], [0, 1, 1, 0], clamp);
  const push = interpolate(f, [0, dur], [1, 1.035]);
  const Comp = REG[sc.type] ?? TitleScene;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{transform: `scale(${push})`}}><Comp {...sc.props} dur={dur} /></AbsoluteFill>
      {sc.cite ? <Source cite={sc.cite} src={srcLabel} /> : null}
      <Captions text={sc.caption} dur={dur} />
      <Audio src={asset(sc.audio)} />
    </AbsoluteFill>
  );
};

const Progress: React.FC<{total: number}> = ({total}) => {
  const f = useCurrentFrame();
  return <div style={{position: 'absolute', top: 0, left: 0, height: 10, width: (f / total) * 1080, background: S.saffron}} />;
};

const Bug: React.FC = () => (
  <div style={{position: 'absolute', top: 120, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14}}>
    <Img src={asset('brand/logo.png')} style={{width: 64, height: 64, borderRadius: 14}} />
    <span style={{fontFamily: P, fontWeight: 800, fontSize: 40, color: S.ink, letterSpacing: -1}}><span style={{color: S.saffron}}>un</span>paper</span>
  </div>
);

export const shortFrames = (ep: any) => Math.round(ep.scenes.reduce((a: number, s: any) => a + s.seconds, 0) * FPS);

export const Short: React.FC<{episode: any}> = ({episode}) => {
  useBundledFonts();
  let from = 0;
  const total = shortFrames(episode);
  const m = String(episode.source?.url || '').match(/arxiv\.org\/abs\/([\d.]+)/);
  const srcLabel = m ? `arXiv ${m[1]}` : (episode.source?.title || 'Source');
  return (
    <AbsoluteFill>
      <Studio />
      <Audio src={asset('ambient.mp3')} volume={0.12} loop />
      {episode.scenes.map((sc: any, i: number) => {
        const dur = Math.round(sc.seconds * FPS);
        const el = <Sequence key={i} from={from} durationInFrames={dur}><Shell sc={sc} dur={dur} srcLabel={srcLabel} /></Sequence>;
        from += dur; return el;
      })}
      <Bug />
      <Progress total={total} />
    </AbsoluteFill>
  );
};

export const UnpaperShortComposition: React.FC<{episode: any}> = (p) => <Short {...p} />;
