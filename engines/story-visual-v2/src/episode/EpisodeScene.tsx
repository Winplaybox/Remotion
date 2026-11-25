import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Particles } from "../SceneLayer";
import { FRAME, type StoryStyleConfig } from "../types";
import type { Actor, Butterfly, EpisodeArt, PageArt, PathKey } from "./art";

/**
 * ART for one page of an episode (language-free). Local frame 0 = page start; `body` = frames until the next page's
 * cut. Every motion is a function of the frame, so renders are deterministic.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (f: number, a: number, b: number, e = Easing.out(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });

function along(path: PathKey[], u: number): { x: number; y: number; s: number } {
  if (u <= path[0]!.t) return { x: path[0]!.x, y: path[0]!.y, s: path[0]!.s ?? 100 };
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    if (u <= b.t) {
      const k = Easing.inOut(Easing.sin)((u - a.t) / Math.max(1e-6, b.t - a.t));
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, s: (a.s ?? 100) + ((b.s ?? 100) - (a.s ?? 100)) * k };
    }
  }
  const z = path[path.length - 1]!;
  return { x: z.x, y: z.y, s: z.s ?? 100 };
}

/** Plate: oversized, slow lateral drift only (no zoom). */
export const Plate: React.FC<{ src: string; t: number; parallax: number; filter?: string }> = ({ src, t, parallax, filter }) => (
  <Img src={src} style={{ position: "absolute", left: -24, top: -40, width: FRAME.width + 48, height: FRAME.height + 80, objectFit: "cover", transform: `translate(${Math.sin(t * 0.22) * 12 * parallax}px, ${Math.cos(t * 0.17) * 5 * parallax}px)`, filter: filter ?? "none" }} />
);

const Splash: React.FC<{ x: number; y: number; f: number; color: string }> = ({ x, y, f, color }) => {
  if (f < 0 || f > 30) return null;
  const drops = Array.from({ length: 16 }, (_, i) => {
    const ang = Math.PI * (0.08 + (0.84 * i) / 15);
    const v = 15 + ((i * 37) % 9);
    const dx = Math.cos(ang) * v * f * (i % 2 ? 1 : 0.8);
    const dy = -Math.sin(ang) * v * f + 0.9 * f * f;
    const s = 10 + ((i * 13) % 12);
    return <div key={i} style={{ position: "absolute", left: x + dx - s / 2, top: y + dy - s / 2, width: s, height: s * 0.85, borderRadius: "50%", background: color, opacity: interpolate(f, [0, 22, 30], [1, 0.9, 0], clamp), boxShadow: "inset -2px -2px 0 rgba(0,0,0,0.18)" }} />;
  });
  const ring = ease(f, 0, 18);
  return (
    <>
      <div style={{ position: "absolute", left: x - 260 * ring, top: y - 40 * ring, width: 520 * ring, height: 80 * ring, borderRadius: "50%", border: `6px solid ${color}`, opacity: 1 - ring }} />
      {drops}
    </>
  );
};

const ActorView: React.FC<{ a: Actor; dir: string; local: number; body: number; fps: number; style: StoryStyleConfig }> = ({ a, dir, local, body, fps, style }) => {
  const t = local / fps;
  const u = local / Math.max(1, body);
  const start = Math.round((a.at ?? 0) * body) + (a.at ? 0 : 4);
  const end = a.until !== undefined ? Math.round(a.until * body) : Infinity;
  if (local < start - 1 || local > end + 8) return null;
  const k = local - start;
  // pose swaps (at > 0, enter none) and exits cross-fade over 8 frames
  let opacity = a.enter === "none" ? ease(k, 0, 8) : ease(k, 0, 6);
  if (end !== Infinity) opacity *= 1 - ease(local, end - 2, end + 6);

  const pos = a.path ? along(a.path, u) : { x: a.x, y: a.y };
  let dx = 0;
  let dy = 0;
  let sx = 1;
  let sy = 1;
  const e = ease(k, 0, 20);
  switch (a.enter) {
    case "hop": { const h = ease(k, 0, 18, Easing.linear); dy = -Math.sin(h * Math.PI) * 90 + (1 - h) * 40; if (k > 16 && k < 24) { const q = Math.sin(((k - 16) / 8) * Math.PI); sy = 1 - 0.05 * q; sx = 1 + 0.04 * q; } break; }
    case "slide-left": dx = -(pos.x + a.w * 0.7) * (1 - e); dy = -Math.abs(Math.sin(k * 0.45)) * 22 * (1 - e); break;
    case "slide-right": dx = (FRAME.width - pos.x + a.w * 0.7) * (1 - e); dy = -Math.abs(Math.sin(k * 0.45)) * 22 * (1 - e); break;
    case "rise": dy = (1 - e) * 70; break;
    case "drop": { const d = ease(k, 0, 11, Easing.in(Easing.quad)); dy = -(1 - d) * 520; if (k >= 11 && k < 21) { const q = Math.sin(((k - 11) / 10) * Math.PI); sy = 1 - 0.12 * q; sx = 1 + 0.09 * q; } break; }
    case "none": break;
  }
  let rot = 0;
  switch (a.idle) {
    case "breathe": sy *= 1 + Math.sin(t * 2.4) * 0.008; rot = Math.sin(t * 1.1) * 0.5 * style.motion.sway; break;
    case "still": sy *= 1 + Math.sin(t * 2.0) * 0.005; break;
    case "gallop": dy += -Math.abs(Math.sin(t * 9)) * 20; rot = Math.sin(t * 9) * 2.5; break;
    case "sad": sy *= 1 + Math.sin(t * 1.6) * 0.007; rot = Math.sin(t * 1.2) * 1.4; break;
    case "wave": sy *= 1 + Math.sin(t * 2.4) * 0.007; rot = Math.sin(t * 2.6) * 1.2; break;
  }
  const lift = Math.min(1, Math.max(0, -dy / 200));
  const sh = (a.shadow ?? 0.8) * a.w * (1 - lift * 0.4);
  return (
    <>
      <div style={{ position: "absolute", left: pos.x + dx - sh / 2, top: pos.y - 34, width: sh, height: 68, borderRadius: "50%", background: `radial-gradient(closest-side, ${style.characters.shadow}, rgba(0,0,0,0))`, opacity: opacity * (1 - lift * 0.6) }} />
      <div style={{ position: "absolute", left: pos.x - a.w / 2 + dx, top: pos.y + dy, width: a.w, transform: "translateY(-100%)", opacity }}>
        <Img src={staticFile(`${dir}/${a.src}`)} style={{ display: "block", width: "100%", transformOrigin: "50% 100%", transform: `rotate(${rot}deg) scale(${sx}, ${sy})`, filter: style.characters.grade ?? "none" }} />
      </div>
      {a.splash ? <Splash x={pos.x} y={pos.y - 30} f={k - 11} color={a.splash} /> : null}
    </>
  );
};

const ButterflyView: React.FC<{ b: Butterfly; dir: string; local: number; body: number; fps: number }> = ({ b, dir, local, body, fps }) => {
  const t = local / fps;
  const u = local / Math.max(1, body);
  const p = along(b.path, u);
  const resting = b.restAt !== undefined && u >= b.restAt;
  const settle = b.restAt !== undefined ? ease(u * body, b.restAt * body - 10, b.restAt * body + 6) : 0;
  const wob = 1 - settle;
  const x = p.x + Math.sin(t * 5.1) * 14 * wob;
  const y = p.y + Math.cos(t * 7.3) * 11 * wob;
  const flap = resting ? 0.55 + 0.45 * Math.abs(Math.cos(t * 2.2)) : 0.3 + 0.7 * Math.abs(Math.cos(t * 13));
  const tilt = Math.sin(t * 3) * 14 * wob;
  const opacity = ease(local, 0, 10);
  return (
    <div style={{ position: "absolute", left: x - p.s / 2, top: y - p.s / 2, width: p.s, height: p.s, opacity, transform: `rotate(${tilt}deg)`, filter: "drop-shadow(0 0 10px rgba(120,200,255,0.7)) drop-shadow(0 6px 6px rgba(0,0,0,0.18))" }}>
      <Img src={staticFile(`${dir}/${b.src}`)} style={{ width: "100%", height: "100%", objectFit: "contain", transform: `scaleX(${flap})` }} />
    </div>
  );
};

export const EpisodePage: React.FC<{ art: EpisodeArt; page: PageArt; style: StoryStyleConfig; body: number }> = ({ art, page, style, body }) => {
  const local = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = local / fps;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: style.background.palette.mid }}>
      <Plate src={staticFile(`${art.dir}/${page.bg}`)} t={t} parallax={style.motion.parallax} />
      {page.glow ? <div style={{ position: "absolute", left: FRAME.width / 2 - 600, top: 640, width: 1200, height: 1000, borderRadius: "50%", background: `radial-gradient(closest-side, ${page.glow}, rgba(0,0,0,0))`, opacity: 0.8 + Math.sin(t * 1.3) * 0.12 }} /> : null}
      <Particles kind={page.particles} color={page.particleColor} t={t} />
      {page.actors.map((a, i) => <ActorView key={i} a={a} dir={art.dir} local={local} body={body} fps={fps} style={style} />)}
      {page.butterfly ? <ButterflyView b={page.butterfly} dir={art.dir} local={local} body={body} fps={fps} /> : null}
      <Vignette />
    </AbsoluteFill>
  );
};

/** Warm book-page vignette so the plate reads as an illustration, not a screenshot. */
export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse 85% 70% at 50% 48%, rgba(0,0,0,0) 60%, rgba(70,40,12,0.28) 100%)" }} />
);

/** Hook card art: the first plate softened behind the emblem (the type sits in the UI layer). */
export const TitleArt: React.FC<{ art: EpisodeArt; style: StoryStyleConfig }> = ({ art, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  // Frame 0 is already a finished picture (Shorts thumbnail / first impression); the emblem only breathes.
  const pop = 1 + 0.035 * Math.sin(Math.min(1, f / 14) * Math.PI) ;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: style.background.palette.top }}>
      <Plate src={staticFile(`${art.dir}/${art.title.bg}`)} t={t} parallax={0.6} filter="blur(7px) saturate(1.05) brightness(1.05)" />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 46%, rgba(255,246,214,0.85) 0%, rgba(255,236,190,0.35) 38%, rgba(0,0,0,0) 70%)" }} />
      <Particles kind="pollen" color="#FFE7A0" t={t + 3} />
      <div style={{ position: "absolute", left: 540 - 360, top: 430, width: 720, height: 720, transform: `scale(${pop}) translateY(${Math.sin(t * 2) * 6}px)` }}>
        <Img src={staticFile(`${art.dir}/${art.title.emblem}`)} style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 18px 30px rgba(90,50,10,0.35))" }} />
      </div>
      <Vignette />
    </AbsoluteFill>
  );
};
