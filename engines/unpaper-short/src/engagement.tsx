// Unpaper engagement overlays + the legacy title scene in the 3D motif.
//  HookOverlay — legacy (scene-list) episodes: the 3D DocHook over the first ~2 s (script episodes open with it as a scene).
//  CommentPill — mid-video ~1.5 s "Comment karo: ___?" prompt.
//  Title3D     — paper unfolds, the prop rises, decoded tokens assemble the key idea.
// All copy comes from the episode (episode.cta / script, defaults in unpaperCta).
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '@visuals/fonts';
import {Camera, DecodeAssemble, Depth, GlowEdge, PaperSheet3D, PaperText, U} from './unpaper3d';
import {IconComment} from './icons';
import {PaperLab} from './paperlab';
import {DocHook} from './scenes-doc';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const P = FONT.ui;
const M = FONT.mono;

// ---------- 1. Hook overlay (legacy episodes) ----------
export const HookOverlay: React.FC<{number: string; line: string; image?: string | undefined; dur: number}> = ({number, line, image, dur}) => {
  const f = useCurrentFrame();
  const bg = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: bg}}><PaperLab /></AbsoluteFill>
      <DocHook number={number} line={line} image={image} exitAt={dur} seed="legacy-hook" />
    </AbsoluteFill>
  );
};

// ---------- 2. Mid-video comment prompt (~1.5 s) ----------
export const CommentPill: React.FC<{text: string; dur: number}> = ({text, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 11, mass: 0.7}});
  const out = interpolate(f, [dur - 6, dur], [1, 0], clamp);
  const wob = Math.sin(f / 3) * 2 * (1 - Math.min(1, f / 20));
  const size = text.length > 30 ? 38 : 44;
  return (
    <div style={{position: 'absolute', top: 1600, width: '100%', display: 'flex', justifyContent: 'center', perspective: 900, opacity: out}}>
      <div style={{transform: `rotateX(${(1 - s) * 80}deg) scale(${0.6 + s * 0.4}) rotate(${wob}deg)`, transformOrigin: '50% 100%'}}>
        <GlowEdge radius={60} width={4} style={{maxWidth: 1000}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, background: U.ink, padding: '18px 34px 18px 22px', borderRadius: 56}}>
            <IconComment s={58} c={U.saffron} />
            <span style={{fontFamily: P, fontWeight: 800, fontSize: size, color: '#fff', whiteSpace: 'nowrap'}}>
              Comment karo: <span style={{color: U.saffron}}>{text}</span>
            </span>
          </div>
        </GlowEdge>
      </div>
    </div>
  );
};

// ---------- title-scene 3D (paper unfolds, tokens decode into the key idea) ----------
export const Title3D: React.FC<{kicker: string; lines: string[]; prop?: string; dur: number; seed: string}> = ({kicker, lines, prop, dur, seed}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const unfold = interpolate(f, [0, 18], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const rise = spring({frame: f - 16, fps, config: {damping: 13, mass: 0.8}});
  const float = Math.sin(f / 22) * 8;
  const ko = interpolate(f, [0, 10], [0, 1], clamp);
  return (
    <Camera dur={dur}>
      <Depth z={-140}>
        <PaperSheet3D w={720} h={600} left={180} top={790} unfold={unfold} tiltX={8}>
          <div style={{position: 'absolute', inset: 0, background: '#fff'}}><PaperText w={720} h={600} seed={seed} /></div>
        </PaperSheet3D>
      </Depth>
      {prop ? <Depth z={60}>
        <div style={{position: 'absolute', left: 540 - 250, top: 1000 - 250, width: 500, height: 500, opacity: Math.min(1, rise * 1.4),
          transform: `translateY(${float - (1 - rise) * 220}px) scale(${0.5 + rise * 0.5})`}}>
          <Img src={staticFile(`unpaper/${prop}`)} style={{width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 30px 30px rgba(0,0,0,0.28))'}} />
        </div>
      </Depth> : null}
      <Depth z={120}>
        <div style={{position: 'absolute', top: 450, width: '100%', display: 'flex', justifyContent: 'center', opacity: ko}}>
          <div style={{fontFamily: M, fontSize: 30, letterSpacing: 4, color: '#55565C', textTransform: 'uppercase', padding: '10px 26px', borderRadius: 99,
            border: '2px solid rgba(46,47,53,0.18)', background: 'rgba(255,255,255,0.7)'}}>{kicker}</div>
        </div>
        <DecodeAssemble lines={lines} top={540} origin={{x: 540, y: 980}} delay={10} seed={seed} />
      </Depth>
    </Camera>
  );
};
