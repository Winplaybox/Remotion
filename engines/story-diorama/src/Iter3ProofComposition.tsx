import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import { FONT, useBundledFonts } from "@visuals/fonts";
import { Character } from "@visuals/rig/Character";
import { fillLook } from "@visuals/rig/presets";
import type { ActionId } from "@visuals/rig/motion";
import { type StoryDiorama, type StoryLayer, type StoryScene } from "./model";
import { PROPS, PropDefs } from "./props";

const W = 1080;
const H = 1920;
const BEAT = 60;
type Pal = StoryDiorama["palette"];

type BeatSpec = {
  id: string;
  source: string;
  mode: "wide" | "poison" | "reaction" | "acceptance" | "reveal";
  caption: string;
  title: string;
};

const BEATS: BeatSpec[] = [
  { id: "01-manthan", source: "manthan", mode: "wide", caption: "SAMUDRA MANTHAN", title: "THE COSMIC CHURNING" },
  { id: "02-halahal", source: "halahal", mode: "poison", caption: "AMRIT SE PEHLE… HALAHAL!", title: "THE POISON EMERGES" },
  { id: "03-reaction", source: "drink", mode: "reaction", caption: "DEVTA AUR ASUR… DONO GHABRAYE", title: "THE THREE WORLDS TREMBLE" },
  { id: "04-acceptance", source: "drink", mode: "acceptance", caption: "MAHADEV NE VISH SWEEKAR KIYA", title: "SHIVA ACCEPTS THE POISON" },
  { id: "05-neelkanth", source: "neelkanth", mode: "reveal", caption: "GALE MEIN ROKA… NEELKANTH!", title: "NEELKANTH" }
];

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => {
  const x = clamp01(n);
  return x * x * (3 - 2 * x);
};

const Atmosphere: React.FC<{ frame: number; mode: BeatSpec["mode"]; seed: string }> = ({ frame, mode, seed }) => {
  const poison = mode === "poison" || mode === "reaction" || mode === "acceptance";
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <defs>
        <radialGradient id="iter3-poison-glow">
          <stop offset="0" stopColor="#8DFF72" stopOpacity="0.62" />
          <stop offset="0.55" stopColor="#25C85B" stopOpacity="0.22" />
          <stop offset="1" stopColor="#25C85B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="iter3-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D7E9FF" stopOpacity="0.5" />
          <stop offset="1" stopColor="#D7E9FF" stopOpacity="0" />
        </linearGradient>
        <filter id="iter3-soft"><feGaussianBlur stdDeviation="24" /></filter>
      </defs>
      {mode === "wide" ? (
        <g opacity="0.22">
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M ${150 + i * 250} 0 L ${330 + i * 130} 1400 L ${470 + i * 150} 1400 Z`} fill="url(#iter3-beam)" />
          ))}
        </g>
      ) : null}
      {poison ? (
        <>
          <ellipse cx="540" cy="1050" rx="430" ry="500" fill="url(#iter3-poison-glow)" filter="url(#iter3-soft)" opacity={0.65 + Math.sin(frame / 8) * 0.12} />
          {Array.from({ length: 24 }, (_, i) => {
            const r1 = random(`${seed}-smoke-x-${i}`);
            const r2 = random(`${seed}-smoke-y-${i}`);
            const phase = frame * (0.018 + r1 * 0.012) + i * 0.7;
            const x = 540 + Math.sin(phase) * (38 + r1 * 180) + (r1 - 0.5) * 170;
            const y = 1500 - ((r2 * 760 + frame * (2.1 + r1 * 1.4)) % 900);
            const rx = 28 + r1 * 64;
            const ry = 46 + r2 * 100;
            return <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={i % 3 === 0 ? "#9BFF79" : "#1ACB61"} opacity={0.08 + 0.12 * Math.abs(Math.sin(phase))} filter="url(#iter3-soft)" />;
          })}
          {Array.from({ length: 34 }, (_, i) => {
            const r1 = random(`${seed}-spark-x-${i}`);
            const r2 = random(`${seed}-spark-y-${i}`);
            const y = 500 + ((r2 * 1000 - frame * (1.4 + r1)) % 1100 + 1100) % 1100;
            const x = 540 + (r1 - 0.5) * (260 + y * 0.35);
            return <circle key={i} cx={x} cy={y} r={2 + r1 * 4} fill="#B8FF91" opacity={0.25 + 0.45 * Math.abs(Math.sin(frame / 9 + i))} />;
          })}
        </>
      ) : null}
      {mode === "reveal" ? (
        <g opacity={0.55}>
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M ${180 + i * 180} 0 L ${480 + i * 25} 1540 L ${600 + i * 25} 1540 Z`} fill="url(#iter3-beam)" />
          ))}
        </g>
      ) : null}
    </svg>
  );
};

const OceanMotion: React.FC<{ frame: number; strength?: number }> = ({ frame, strength = 1 }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {[0, 1, 2, 3].map((row) => {
      const y = 1430 + row * 92;
      const d = Array.from({ length: 18 }, (_, i) => {
        const x = i * 68 - 30;
        const yy = y + Math.sin(frame / (5 + row) + i * 0.8 + row) * (7 + row * 2) * strength;
        return `${i === 0 ? "M" : "L"} ${x} ${yy}`;
      }).join(" ");
      return <path key={row} d={d} fill="none" stroke={row % 2 ? "#9DE8F0" : "#D8F8F8"} strokeWidth={row === 0 ? 4 : 2} opacity={0.14 + row * 0.035} />;
    })}
    <ellipse cx="540" cy="1510" rx={280 + Math.sin(frame / 7) * 22} ry="38" fill="none" stroke="#A6F3D0" strokeWidth="4" opacity="0.22" />
  </svg>
);

const PoisonOrb: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = 1 + Math.sin(frame / 4) * 0.08;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <defs><radialGradient id="iter3-orb"><stop offset="0" stopColor="#E7FFB0" /><stop offset="0.35" stopColor="#7DFF64" /><stop offset="1" stopColor="#18B94D" stopOpacity="0" /></radialGradient></defs>
      <g transform={`translate(650 1075) scale(${pulse})`}>
        <circle r="78" fill="url(#iter3-orb)" opacity="0.65" />
        <circle r="20" fill="#DFFF9C" opacity="0.9" />
        <circle r="48" fill="none" stroke="#A5FF78" strokeWidth="3" opacity="0.55" />
      </g>
    </svg>
  );
};

const RiggedFigure: React.FC<{
  layer: Extract<StoryLayer, { kind: "prop" }>;
  frame: number;
  mode: BeatSpec["mode"];
  index: number;
}> = ({ layer, frame, mode, index }) => {
  const data = layer.data ?? {};
  const read = (key: string, fallback: string) => typeof data[key] === "string" ? String(data[key]) : fallback;
  const isShiva = read("head", "") === "jata" || data.moon === true;
  const skin = read("skin", isShiva ? "#679ED4" : "#D8A17B");
  const robe = read("robe", isShiva ? "#D9942C" : "#E6A13B");
  const sash = read("sash", isShiva ? "#397D83" : "#D9A33E");
  const action: ActionId = mode === "reaction"
    ? (isShiva ? "lookRight" : "afraid")
    : mode === "acceptance"
      ? (isShiva ? "point" : "afraid")
      : mode === "reveal"
        ? "idle"
        : "walk";
  const look = fillLook({
    label: isShiva ? "Mahadev" : "Deva / Asura",
    gender: "m",
    skin,
    hair: isShiva ? "jata" : (read("head", "") === "crown" ? "slickBack" : "short"),
    hairColor: isShiva ? "#17121D" : "#241A18",
    headwear: read("head", "") === "crown" ? "pagdi" : "none",
    headwearColor: "#D8A63C",
    facialHair: isShiva ? "longBeard" : "none",
    top: "robe",
    topColor: robe,
    trim: sash,
    bottom: "dhoti",
    bottomColor: read("bottom", isShiva ? "#B77D39" : "#C28A3C"),
    shoes: "#493B31",
    accessories: isShiva ? ["tripund", "rudraksha", "earrings"] : ["tilak", "earrings"],
    height: isShiva ? 1.04 : 0.96,
    accent: "#E6B84F"
  });
  return (
    <g transform={`translate(${layer.x} ${layer.y}) scale(${layer.scale * (layer.flip ? -1 : 1)} ${layer.scale})`}>
      <ellipse cx="0" cy="4" rx="82" ry="12" fill="#020812" opacity="0.36" />
      <Character look={look} action={action} frame={frame} seed={`iter3-${mode}-${index}`} facing={1} />
      {isShiva ? (
        <g transform="translate(128 -330)" opacity="0.96">
          <path d="M 0 0 L 0 -230 M -46 -194 Q 0 -230 46 -194 M -34 -220 L -34 -160 M 34 -220 L 34 -160" fill="none" stroke="#C8D8E4" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 0 -255 A 34 34 0 1 1 -28 -215 A 26 26 0 1 0 0 -255" fill="#E9D8A2" />
        </g>
      ) : null}
    </g>
  );
};

const CinematicLayer: React.FC<{
  layer: StoryLayer;
  index: number;
  frame: number;
  fps: number;
  progress: number;
  mode: BeatSpec["mode"];
  pal: Pal;
}> = ({ layer, index, frame, fps, progress, mode, pal }) => {
  const lf = frame - layer.at * fps;
  if (lf < 0 && layer.enter !== "none") return null;
  const entry = spring({ frame: Math.max(0, lf), fps, config: { damping: 18, stiffness: 95 } });
  const depth = layer.depth ?? 0.5;
  const cam = mode === "wide" ? { x: -42 * progress, y: 8 * progress, z: 1 + 0.035 * progress } :
    mode === "poison" ? { x: 0, y: -32 * progress, z: 1 + 0.085 * progress } :
    mode === "reaction" ? { x: 36 * progress, y: 0, z: 1 + 0.045 * progress } :
    mode === "acceptance" ? { x: -16 * progress, y: -52 * progress, z: 1 + 0.13 * progress } :
    { x: 0, y: -22 * progress, z: 1 + 0.1 * progress };
  let tx = cam.x * depth;
  let ty = cam.y * depth;
  let scale = 1 + (cam.z - 1) * depth;
  let rotate = 0;
  let opacity = 1;
  switch (layer.enter) {
    case "fade": opacity = entry; break;
    case "rise": ty += (1 - entry) * 260; opacity = Math.min(1, entry * 1.6); break;
    case "drop": ty -= (1 - entry) * 320; opacity = Math.min(1, entry * 1.6); break;
    case "pop": scale *= entry; break;
    case "slideLeft": tx += (1 - entry) * 540; break;
    case "slideRight": tx -= (1 - entry) * 540; break;
  }
  const seconds = frame / fps;
  if (layer.idle === "bob") ty += Math.sin(seconds * 2.1 + layer.x) * 8;
  if (layer.idle === "sway") rotate += Math.sin(seconds * 1.7 + index) * 1.4;
  if (layer.idle === "drift") tx += Math.sin(seconds * 0.55 + index) * 20;
  if (layer.idle === "pulse") scale *= 1 + Math.sin(seconds * 2.2) * 0.025;
  if (layer.idle === "walk") { tx += lf * 1.1; ty -= Math.abs(Math.sin(seconds * 7 + index)) * 7; }
  if (layer.kind === "prop" && layer.prop === "figure") {
    const acting = mode === "reaction" || mode === "acceptance";
    if (acting) {
      const side = index % 2 === 0 ? -1 : 1;
      tx += Math.sin(seconds * 3.5 + index) * 8 + side * Math.sin(progress * Math.PI) * 12;
      rotate += Math.sin(seconds * 3 + index) * (mode === "reaction" ? 1.8 : 0.8);
    }
  }
  const style: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: Math.round(depth * 100) + index,
    opacity,
    transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale}) rotate(${rotate}deg)`,
    transformOrigin: `${layer.x}px ${layer.y}px`,
    willChange: "transform"
  };
  if (layer.kind === "image") {
    return <div style={style}><Img src={staticFile(layer.src)} style={{ position: "absolute", left: layer.x - layer.width * layer.scale / 2, bottom: H - layer.y, width: layer.width * layer.scale, transform: layer.flip ? "scaleX(-1)" : undefined }} /></div>;
  }
  const Prop = PROPS[layer.prop];
  return (
    <div style={style}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {layer.prop === "figure"
          ? <RiggedFigure layer={layer} frame={frame} mode={mode} index={index} />
          : <g transform={`translate(${layer.x} ${layer.y}) scale(${layer.scale * (layer.flip ? -1 : 1)} ${layer.scale})`}>
              <Prop lf={lf} fps={fps} data={layer.data} pal={pal} />
            </g>}
      </svg>
    </div>
  );
};

const BeatScene: React.FC<{ scene: StoryScene; spec: BeatSpec; pal: Pal }> = ({ scene, spec, pal }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = ease(frame / BEAT);
  const layers = [...scene.layers].sort((a, b) => a.depth - b.depth);
  const captionIn = spring({ frame: frame - 8, fps, config: { damping: 16, stiffness: 140 } });
  const isOcean = spec.mode === "wide" || spec.mode === "poison";
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: `linear-gradient(180deg, ${scene.sky[0]}, ${scene.sky[1]})` }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <PropDefs />
      </svg>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 38%, rgba(255,255,255,.14), transparent 62%)" }} />
      {layers.map((layer, i) => <CinematicLayer key={i} layer={layer} index={i} frame={frame} fps={fps} progress={progress} mode={spec.mode} pal={pal} />)}
      {isOcean ? <OceanMotion frame={frame} strength={spec.mode === "poison" ? 1.5 : 1} /> : null}
      <Atmosphere frame={frame} mode={spec.mode} seed={spec.id} />
      {spec.mode === "acceptance" ? <PoisonOrb frame={frame} /> : null}
      {spec.mode === "reveal" ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, background: "radial-gradient(ellipse at 50% 58%, transparent 18%, rgba(3,8,22,.38) 76%)" }} />
      ) : null}
      <div style={{ position: "absolute", top: 78, left: 58, right: 58, color: "#FFF5DE", fontFamily: FONT.display, fontWeight: 800, fontSize: 34, letterSpacing: 4, textShadow: "0 3px 14px rgba(0,0,0,.6)", opacity: 0.9 }}>
        EPIC BHARAT SAGA <span style={{ float: "right", fontFamily: FONT.mono, fontSize: 22, letterSpacing: 2 }}>ITER3 · 10 SEC</span>
      </div>
      <div style={{ position: "absolute", left: 58, right: 58, top: 150, height: 2, background: "rgba(255,245,222,.35)" }} />
      <div style={{ position: "absolute", left: 58, right: 58, top: 205, fontFamily: FONT.display, fontSize: 76, lineHeight: 0.98, fontWeight: 900, color: "#FFF1D0", textShadow: "0 5px 18px rgba(0,0,0,.42)", opacity: captionIn, transform: `translateY(${(1 - captionIn) * 24}px)` }}>
        {spec.title}
      </div>
      <div style={{ position: "absolute", left: 58, right: 58, bottom: 178, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT.ui, fontSize: 42, fontWeight: 900, color: "#FFF8E8", textAlign: "center", padding: "14px 24px", background: "rgba(5,12,22,.78)", border: "1px solid rgba(255,255,255,.24)", borderRadius: 14, letterSpacing: 1, opacity: captionIn, transform: `translateY(${(1 - captionIn) * 18}px)` }}>
          {spec.caption}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 12, background: "rgba(255,255,255,.08)" }}>
        <div style={{ width: `${clamp01(frame / BEAT) * 100}%`, height: "100%", background: "#E8B64B" }} />
      </div>
    </AbsoluteFill>
  );
};

/**
 * Isolated ITER3 proof only. It reads EP11's authored SVG scenes but does not replace,
 * mutate, or register over the production EpicBharatSaga composition.
 */
export const Iter3ProofComposition: React.FC<StoryDiorama> = (p) => {
  useBundledFonts();
  const sourceById = new Map(p.scenes.map((scene) => [scene.id, scene]));
  const fallback = p.scenes[0];
  const selected = BEATS.map((beat) => ({ beat, scene: sourceById.get(beat.source) ?? fallback }));
  return (
    <AbsoluteFill style={{ background: "#07101A" }}>
      {selected.map(({ beat, scene }, i) => (
        <Sequence key={beat.id} from={i * BEAT} durationInFrames={BEAT} name={beat.id}>
          <BeatScene scene={scene} spec={beat} pal={p.palette} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const iter3ProofDuration = () => BEATS.length * BEAT;
