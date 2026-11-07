import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, useBundledFonts } from "@visuals/fonts";
import { FPS, type StoryDiorama, type StoryLayer, type StoryScene } from "./model";
import { PROPS, PropDefs } from "./props";

const W = 1080, H = 1920;
type Pal = StoryDiorama["palette"];

function toneColor(tone: string | undefined, pal: Pal, base: string): string {
  if (tone === "accent") return pal.accent;
  if (tone === "accent2") return pal.accent2;
  if (tone === "accent3") return pal.accent3;
  if (tone === "ink") return pal.ink;
  if (tone === "paper") return pal.paper;
  return base;
}

/* ---------- layer animation ---------- */

function layerTransform(layer: StoryLayer, frame: number, fps: number, sceneP: number, camera: StoryScene["camera"]): { transform: string; opacity: number; visible: boolean; lf: number } {
  const lf = frame - layer.at * fps;
  if (lf < 0 && layer.enter !== "none") return { transform: "", opacity: 0, visible: false, lf };
  const e = spring({ frame: lf, fps, config: { damping: 15, stiffness: 110 } });
  let tx = 0, ty = 0, sc = 1, rot = 0, op = 1;
  switch (layer.enter) {
    case "fade": op = e; break;
    case "rise": ty = (1 - e) * 360; op = Math.min(1, e * 2); break;
    case "drop": ty = (1 - e) * -480; op = Math.min(1, e * 2); break;
    case "pop": sc = e; break;
    case "slideLeft": tx = (1 - e) * 800; break;
    case "slideRight": tx = (1 - e) * -800; break;
    default: break;
  }
  const t = frame / fps;
  switch (layer.idle) {
    case "bob": ty += Math.sin(t * 2.2 + layer.x) * 10; break;
    case "sway": rot += Math.sin(t * 1.6 + layer.x) * 1.6; break;
    case "drift": tx += Math.sin(t * 0.35 + layer.y) * 30; break;
    case "pulse": sc *= 1 + Math.sin(t * 2.5) * 0.025; break;
    case "walk": tx += lf * 2.2; ty += -Math.abs(Math.sin(t * 7)) * 8; break;
    default: break;
  }
  const d = layer.depth;
  if (camera === "push") sc *= 1 + 0.08 * sceneP * d;
  if (camera === "panLeft") tx -= 90 * sceneP * d;
  if (camera === "panRight") tx += 90 * sceneP * d;
  const camOffX = camera === "push" ? (layer.x - W / 2) * 0.08 * sceneP * d : 0;
  const camOffY = camera === "push" ? (layer.y - 1000) * 0.08 * sceneP * d : 0;
  return { transform: `translate(${tx + camOffX}px, ${ty + camOffY}px) rotate(${rot}deg) scale(${sc})`, opacity: op, visible: true, lf };
}

const Layer: React.FC<{ layer: StoryLayer; frame: number; fps: number; sceneP: number; scene: StoryScene; pal: Pal }> = ({ layer, frame, fps, sceneP, scene, pal }) => {
  const tr = layerTransform(layer, frame, fps, sceneP, scene.camera);
  if (!tr.visible) return null;
  const style: React.CSSProperties = { position: "absolute", inset: 0, transform: tr.transform, transformOrigin: `${layer.x}px ${layer.y}px`, opacity: tr.opacity };
  const flip = layer.flip ? -1 : 1;
  if (layer.kind === "image") {
    return (
      <div style={style}>
        <Img src={staticFile(layer.src)} style={{ position: "absolute", left: layer.x - (layer.width * layer.scale) / 2, top: undefined, bottom: H - layer.y, width: layer.width * layer.scale, transform: `scaleX(${flip})`, filter: "drop-shadow(0 12px 10px rgba(0,0,0,.35))" }} />
      </div>
    );
  }
  const Prop = PROPS[layer.prop];
  return (
    <div style={style}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <PropDefs />
        <g transform={`translate(${layer.x} ${layer.y}) scale(${layer.scale * flip} ${layer.scale})`}>
          <Prop lf={tr.lf} fps={fps} data={layer.data} pal={pal} />
        </g>
      </svg>
    </div>
  );
};

/* ---------- particles ---------- */

const Particles: React.FC<{ kind: StoryScene["particles"]; frame: number; seed: string }> = ({ kind, frame, seed }) => {
  if (kind === "none") return null;
  const n = kind === "stars" ? 80 : kind === "petals" ? 26 : kind === "rain" ? 90 : 34;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: n }, (_, i) => {
        const r1 = random(`${seed}${kind}a${i}`), r2 = random(`${seed}${kind}b${i}`), r3 = random(`${seed}${kind}c${i}`);
        if (kind === "stars") {
          const tw = 0.3 + 0.7 * Math.abs(Math.sin(frame / (14 + r3 * 30) + i));
          const big = r3 > 0.9;
          return big
            ? <path key={i} d="M 0 -12 L 3 -3 L 12 0 L 3 3 L 0 12 L -3 3 L -12 0 L -3 -3 Z" transform={`translate(${r1 * W} ${r2 * 1100}) scale(${0.6 + tw * 0.6})`} fill="#FFF6DA" opacity={tw} />
            : <circle key={i} cx={r1 * W} cy={r2 * 1200} r={1.2 + r3 * 2.2} fill="#FFF6DA" opacity={tw * 0.8} />;
        }
        if (kind === "embers") {
          const sp = 1.2 + r3 * 2.4;
          const y = H - ((r2 * H + frame * sp) % (H + 100));
          const x = r1 * W + Math.sin(frame / 20 + i) * 30;
          return <circle key={i} cx={x} cy={y} r={2 + r3 * 4} fill={r3 > 0.5 ? "#FFB347" : "#FF7A2F"} opacity={0.4 + 0.5 * Math.abs(Math.sin(frame / 8 + i))} />;
        }
        if (kind === "petals") {
          const sp = 2 + r3 * 2.5;
          const y = ((r2 * H + frame * sp) % (H + 100)) - 50;
          const x = r1 * W + Math.sin(frame / 25 + i) * 50;
          return <ellipse key={i} cx={0} cy={0} rx={14} ry={8} fill={r3 > 0.5 ? "#F28C28" : "#F6C343"} transform={`translate(${x} ${y}) rotate(${frame * (2 + r3 * 4) + i * 40})`} opacity={0.9} />;
        }
        if (kind === "rain") {
          const sp = 38 + r3 * 20;
          const y = ((r2 * (H + 200) + frame * sp) % (H + 200)) - 100;
          const x = r1 * (W + 300) - 150 + (y * 0.18);
          return <line key={i} x1={x} y1={y} x2={x - 14} y2={y - 70} stroke="#CFE3F5" strokeWidth={2.5} opacity={0.35 + r3 * 0.3} />;
        }
        if (kind === "bubbles") {
          const sp = 1.5 + r3 * 3;
          const y = H - ((r2 * 900 + frame * sp) % 900);
          const x = r1 * W + Math.sin(frame / 15 + i) * 12;
          return <circle key={i} cx={x} cy={y} r={4 + r3 * 12} fill="none" stroke="#D9FBFF" strokeWidth={2} opacity={0.55} />;
        }
        const x = r1 * W + Math.sin(frame / (30 + r3 * 20) + i) * 60;
        const y = 700 + r2 * 1000 + Math.cos(frame / (25 + r3 * 20) + i) * 50;
        return <circle key={i} cx={x} cy={y} r={4} fill="#E9FF8A" opacity={0.3 + 0.6 * Math.abs(Math.sin(frame / 10 + i))} style={{ filter: "drop-shadow(0 0 8px #E9FF8A)" }} />;
      })}
    </svg>
  );
};

/* ---------- typography ---------- */

const Headline: React.FC<{ scene: StoryScene; frame: number; fps: number; pal: Pal; base: string }> = ({ scene, frame, fps, pal, base }) => {
  const beats = scene.headlines;
  return (
    <>
      {beats.map((beat, bi) => {
        const start = beat.at * fps;
        const next = beats[bi + 1];
        const end = next ? next.at * fps : Infinity;
        if (frame < start || frame > end + 8) return null;
        const out = Number.isFinite(end) ? interpolate(frame, [end, end + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
        let w = 0;
        return (
          <div key={bi} style={{ position: "absolute", top: 222, left: 62, right: 62, opacity: 1 - out, transform: `translateX(${out * -30}px) skewX(${out * -8}deg)` }}>
            {beat.lines.map((line, li) => (
              <div key={li} style={{ fontFamily: FONT.display, fontSize: 124, lineHeight: 1.0, letterSpacing: -0.5, color: toneColor(line.tone, pal, base), textShadow: "0 5px 0 rgba(0,0,0,.22)", whiteSpace: "nowrap" }}>
                {line.text.split(" ").map((word, wi) => {
                  const d = start + 4 + (w++) * 4;
                  const p = spring({ frame: frame - d, fps, config: { damping: 14, stiffness: 170 } });
                  return <span key={wi} style={{ display: "inline-block", marginRight: 26, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px)` }}>{word}</span>;
                })}
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
};

const SeriesHeader: React.FC<{ brand: string; tag: string; accent: string; pal: Pal }> = ({ brand, tag, accent, pal }) => (
  <div style={{ position: "absolute", top: 62, left: 62, right: 62, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: FONT.display, fontSize: 36, letterSpacing: 2, color: pal.accent2, background: "rgba(20,16,12,.78)", padding: "6px 16px 6px 10px", borderRadius: 8, boxShadow: "0 5px 0 rgba(0,0,0,.3)" }}>
      <svg width={40} height={40} viewBox="-20 -20 40 40">
        {[0, 45, 90, 135].map((r) => <ellipse key={r} rx={6} ry={18} fill={pal.accent2} opacity={0.85} transform={`rotate(${r})`} />)}
        <circle r={6} fill={pal.accent} />
      </svg>
      {brand}
    </div>
    <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 24, color: pal.ink, background: pal.paper, padding: "10px 18px", borderRadius: 8, border: `3px solid ${pal.accent2}`, boxShadow: "0 5px 0 rgba(0,0,0,.3)" }}>
      {tag}<span style={{ color: pal.accent }}>{accent}</span>
    </div>
  </div>
);

/** Caption chunks timed by character share across the narration (or scene) length. */
const Captions: React.FC<{ text: string; frame: number; fps: number; seconds: number; pal: Pal }> = ({ text, frame, fps, seconds, pal }) => {
  if (!text) return null;
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += 4) chunks.push(words.slice(i, i + 4).join(" "));
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const start = 0.25 * fps, end = (seconds - 0.35) * fps;
  let acc = 0;
  let current = -1, chunkStart = 0;
  chunks.forEach((c, i) => {
    const s = start + ((end - start) * acc) / total;
    acc += c.length;
    if (frame >= s) { current = i; chunkStart = s; }
  });
  if (current < 0 || frame > end + 6) return null;
  const pop = spring({ frame: frame - chunkStart, fps, config: { damping: 14, stiffness: 220 } });
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1585, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: 46, lineHeight: 1.15, color: pal.paper, textAlign: "center", background: "rgba(20,16,12,.72)", padding: "14px 26px", borderRadius: 14, borderBottom: `5px solid ${pal.accent2}`, transform: `scale(${0.9 + pop * 0.1})`, opacity: Math.min(1, pop * 1.4) }}>
        {chunks[current]}
      </div>
    </div>
  );
};

const Label: React.FC<{ l: StoryScene["labels"][number]; frame: number; fps: number; pal: Pal }> = ({ l, frame, fps, pal }) => {
  const lf = frame - l.at * fps;
  if (lf < 0) return null;
  const p = spring({ frame: lf, fps, config: { damping: 14 } });
  const line = interpolate(lf, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const len = Math.hypot(l.toX - l.x, l.toY - l.y);
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={l.x} y1={l.y} x2={l.toX} y2={l.toY} stroke={pal.paper} strokeWidth={3} strokeDasharray={len} strokeDashoffset={len * (1 - line)} />
        <circle cx={l.toX} cy={l.toY} r={9 * line} fill={pal.paper} stroke={pal.ink} strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", left: l.x, top: l.y, transform: `translate(-50%, -50%) scale(${p})`, background: pal.ink, color: pal.paper, fontFamily: FONT.mono, fontWeight: 700, fontSize: 24, letterSpacing: 2, padding: "8px 16px", whiteSpace: "nowrap", boxShadow: "0 4px 0 rgba(0,0,0,.3)" }}>{l.text}</div>
    </>
  );
};

/* ---------- paper finish ---------- */

const PaperFinish: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.55 }}>
      <filter id="sd-grain"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="7" /><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0.28 0" /></filter>
      <rect width={W} height={H} filter="url(#sd-grain)" />
    </svg>
    <div style={{ position: "absolute", left: 539, top: 0, bottom: 0, width: 2, background: "linear-gradient(90deg, rgba(255,255,255,.18), rgba(0,0,0,.18))" }} />
    {[640, 1280].map((y) => <div key={y} style={{ position: "absolute", top: y, left: 0, right: 0, height: 2, background: "linear-gradient(180deg, rgba(255,255,255,.1), rgba(0,0,0,.12))" }} />)}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 50%, transparent 60%, rgba(0,0,0,.35))" }} />
  </AbsoluteFill>
);

/* ---------- scene ---------- */

const Scene: React.FC<{ scene: StoryScene; pal: Pal; tf: number; first: boolean; captions: boolean }> = ({ scene, pal, tf, first, captions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = scene.seconds * fps;
  const sceneP = Math.min(1, frame / dur);
  const wipe = first ? 1 : interpolate(frame, [0, tf], [0, 1], { extrapolateRight: "clamp" });
  const base = scene.tone === "light" ? pal.paper : pal.ink;
  return (
    <AbsoluteFill style={{ clipPath: wipe < 1 ? `inset(${(1 - wipe) * 100}% 0 0 0)` : undefined, background: `linear-gradient(180deg, ${scene.sky[0]}, ${scene.sky[1]})` }}>
      <Particles kind={scene.particles === "stars" ? "stars" : "none"} frame={frame} seed={scene.id} />
      {scene.ground ? <div style={{ position: "absolute", left: 0, right: 0, top: scene.ground.y, bottom: 0, background: scene.ground.color, boxShadow: "0 -6px 16px rgba(0,0,0,.25)" }} /> : null}
      {scene.layers.map((layer, i) => <Layer key={i} layer={layer} frame={frame} fps={fps} sceneP={sceneP} scene={scene} pal={pal} />)}
      {scene.particles !== "stars" ? <Particles kind={scene.particles} frame={frame} seed={scene.id} /> : null}
      {scene.labels.map((l, i) => <Label key={i} l={l} frame={frame} fps={fps} pal={pal} />)}
      <div style={{ position: "absolute", top: 160, left: 62, right: 62, display: "flex", justifyContent: "space-between", fontFamily: FONT.mono, fontWeight: 500, fontSize: 22, letterSpacing: 2, color: base, opacity: 0.8 }}>
        <span>{scene.location}</span><span>{scene.fig}</span>
      </div>
      <div style={{ position: "absolute", top: 196, left: 62, right: 62, height: 2, background: base, opacity: 0.35 }} />
      <Headline scene={scene} frame={frame} fps={fps} pal={pal} base={base} />
      {captions ? <Captions text={scene.caption} frame={frame} fps={fps} seconds={scene.seconds} pal={pal} /> : null}
      {!first && wipe < 1 ? <div style={{ position: "absolute", left: 0, right: 0, top: `${(1 - wipe) * 100}%`, height: 14, background: pal.paper, boxShadow: "0 -8px 20px rgba(0,0,0,.4)" }} /> : null}
    </AbsoluteFill>
  );
};

export const StoryDioramaComposition: React.FC<StoryDiorama> = (p) => {
  useBundledFonts();
  let cursor = 0;
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      {p.scenes.map((scene, i) => {
        const from = Math.round(cursor * FPS);
        cursor += scene.seconds;
        const len = Math.round(scene.seconds * FPS) + (i < p.scenes.length - 1 ? p.transitionFrames : 0);
        return (
          <Sequence key={scene.id} from={from} durationInFrames={len} name={scene.id}>
            <Scene scene={scene} pal={p.palette} tf={p.transitionFrames} first={i === 0} captions={p.showCaptions} />
            {scene.audio ? <Audio src={staticFile(scene.audio)} /> : null}
          </Sequence>
        );
      })}
      <SeriesHeader brand={p.brand} tag={p.tag} accent={p.tagAccent} pal={p.palette} />
      <PaperFinish />
    </AbsoluteFill>
  );
};
