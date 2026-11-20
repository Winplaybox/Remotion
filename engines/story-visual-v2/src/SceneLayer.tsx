import React from "react";
import { AbsoluteFill, Img, interpolate, Easing, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FRAME, type ParticleKind, type StoryStyleConfig } from "./types";

/**
 * Everything that is ART: environment plate, character pair, contact shadow, foreground parallax strip, particles,
 * light. Knows nothing about text or language, so it is identical on every MindNest channel.
 */

const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};

interface Mote { x: number; y: number; r: number; phase: number; speed: number; drift: number; depth: number }
const MOTES = (() => { const r = rng(7); return Array.from({ length: 34 }, () => ({ x: r() * FRAME.width, y: 520 + r() * 1150, r: 0.5 + r(), phase: r() * Math.PI * 2, speed: 0.5 + r(), drift: r() * 2 - 1, depth: 0.4 + r() * 0.6 })); })();

export const Particles: React.FC<{ kind: ParticleKind; color: string; t: number }> = ({ kind, color, t }) => {
  if (kind === "none") return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {MOTES.map((m: Mote, i) => {
        if (kind === "fireflies") {
          const x = m.x + Math.sin(t * 0.6 * m.speed + m.phase) * 40 * m.depth;
          const y = m.y + Math.cos(t * 0.45 * m.speed + m.phase) * 30 * m.depth;
          const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 2.2 * m.speed + m.phase));
          const s = 6 + m.r * 7 * m.depth;
          return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", background: color, opacity: a, boxShadow: `0 0 ${s * 2.4}px ${s}px ${color}` }} />;
        }
        if (kind === "pollen") {
          if (i % 2) return null;
          const x = m.x + Math.sin(t * 0.4 * m.speed + m.phase) * 30;
          const y = m.y - ((t * 18 * m.speed) % 300) + 150;
          const s = 4 + m.r * 5 * m.depth;
          return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", background: color, opacity: 0.55 * m.depth, filter: "blur(1px)", boxShadow: `0 0 ${s * 2}px ${color}` }} />;
        }
        // leaves / petals: few, slow, falling with flutter, wrapping
        if (i % 4) return null;
        const fall = (m.y - 520 + t * 55 * m.speed) % 1500;
        const y = -60 + fall;
        const x = m.x + Math.sin(t * 1.1 * m.speed + m.phase) * 70 + m.drift * fall * 0.15;
        const rot = Math.sin(t * 1.6 + m.phase) * 70 + fall * 0.2;
        const w = kind === "petals" ? 18 + m.r * 8 : 26 + m.r * 12;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: w * 0.55, background: color, borderRadius: kind === "petals" ? "60% 40% 60% 40%" : "0 100% 0 100%", transform: `rotate(${rot}deg) scale(${0.7 + m.depth * 0.5})`, opacity: 0.85, boxShadow: "inset -3px -2px 0 rgba(0,0,0,0.12)" }} />
        );
      })}
    </AbsoluteFill>
  );
};

export const SceneLayer: React.FC<{ style: StoryStyleConfig }> = ({ style: s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const P = s.motion.parallax;
  // Slow lateral drift only (no constant zoom). Background moves least, foreground most.
  const bgX = Math.sin(t * 0.22) * 10 * P;
  const bgY = Math.cos(t * 0.17) * 4 * P;
  const fgX = Math.sin(t * 0.22) * 22 * P;

  const enter = interpolate(frame, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const w = FRAME.width * s.composition.characterScale;
  const sway = Math.sin(t * 1.1) * 0.5 * s.motion.sway;
  const breath = 1 + Math.sin(t * 2.4) * 0.006;
  const charX = Math.sin(t * 0.22) * 14 * P;
  const g = s.background.groundY;
  const bg = staticFile(`${s.assetDir}/bg.jpg`);

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: s.background.palette.mid }}>
      {/* L1 environment plate (oversized 4% so drift never reveals an edge) */}
      <Img src={bg} style={{ position: "absolute", left: -22, top: -40, width: FRAME.width + 44, height: FRAME.height + 80, objectFit: "cover", transform: `translate(${bgX}px, ${bgY}px)` }} />

      {/* L2 light: warm pool behind the pair (night) */}
      {s.characters.glow ? (
        <div style={{ position: "absolute", left: FRAME.width / 2 - 560, top: g - 760, width: 1120, height: 900, borderRadius: "50%", background: `radial-gradient(closest-side, ${s.characters.glow}, rgba(0,0,0,0))`, opacity: 0.85 + Math.sin(t * 1.3) * 0.1 }} />
      ) : null}

      {/* L3 particles drift behind the pair (never over faces) */}
      <Particles kind={s.motion.particles} color={s.motion.particleColor} t={t} />

      {/* L3b contact shadow */}
      <div style={{ position: "absolute", left: FRAME.width / 2 - w * 0.5 + charX, top: g - 46, width: w, height: 92, borderRadius: "50%", background: `radial-gradient(closest-side, ${s.characters.shadow}, rgba(0,0,0,0))`, opacity: enter }} />

      {/* L4 characters: anchored on the ground line, gentle sway + breathing from the feet */}
      <div style={{ position: "absolute", left: (FRAME.width - w) / 2 + charX, width: w, top: g, transform: `translateY(-100%) translateY(${(1 - enter) * 60}px)`, opacity: enter }}>
        <Img src={staticFile(`${s.assetDir}/characters.png`)} style={{ display: "block", width: "100%", transformOrigin: "50% 100%", transform: `rotate(${sway}deg) scaleY(${breath})`, filter: s.characters.grade ?? "none" }} />
      </div>


      {/* L6 foreground strip: the plate's own bottom re-layered and moved faster -> parallax depth */}
      <div style={{ position: "absolute", left: 0, top: 0, width: FRAME.width, height: FRAME.height, WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,0) ${s.background.foregroundFromY}px, #000 ${s.background.foregroundFromY + 120}px)`, maskImage: `linear-gradient(to bottom, rgba(0,0,0,0) ${s.background.foregroundFromY}px, #000 ${s.background.foregroundFromY + 120}px)` }}>
        <Img src={bg} style={{ position: "absolute", left: -22, top: -40, width: FRAME.width + 44, height: FRAME.height + 80, objectFit: "cover", transform: `translate(${fgX}px, ${bgY}px)` }} />
      </div>
    </AbsoluteFill>
  );
};
