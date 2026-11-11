import React, { createContext, useContext } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { STYLE_BY_ID, type Recipe } from "./recipes";

/**
 * <StyledScene style="comic-art"> …any scene… </StyledScene>
 * Applies a catalogue style to everything inside using deterministic SVG filters + CSS overlays (no randomness: noise seeds
 * come from the frame number). Use `useStyleFrame()` inside the scene to get the style's held frame (limited animation).
 */
const HeldFrame = createContext<number | null>(null);
export const useStyleFrame = (): number => {
  const held = useContext(HeldFrame);
  const f = useCurrentFrame();
  return held ?? f;
};

const levels = (n: number) => Array.from({ length: n }, (_, i) => (i / (n - 1)).toFixed(3)).join(" ");
const rgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export const FilterDefs: React.FC<{ id: string; r: Recipe; frame: number; w: number; h: number }> = ({ id, r, frame, w, h }) => {
  const prims: React.ReactNode[] = [];
  let last = "SourceGraphic";
  const add = (key: string, node: React.ReactNode, out: string) => { prims.push(<React.Fragment key={key}>{node}</React.Fragment>); last = out; };

  if (r.wobble) {
    const seed = 3 + (r.wobble.boil ? Math.floor(frame / r.wobble.boil) % 4 : 0);
    add("wob", (
      <>
        <feTurbulence type="fractalNoise" baseFrequency={r.wobble.freq} numOctaves={2} seed={seed} result="wn" />
        <feDisplacementMap in={last} in2="wn" scale={r.wobble.scale} xChannelSelector="R" yChannelSelector="G" result="wd" />
      </>
    ), "wd");
  }
  if (r.pixel) {
    const k = r.pixel;
    add("pix", (
      <>
        <feFlood x={Math.floor(k / 2) - 1} y={Math.floor(k / 2) - 1} width={2} height={2} result="pf" />
        <feComposite x={0} y={0} width={k} height={k} in="pf" in2="pf" result="pc" />
        <feTile in="pc" x={0} y={0} width={w} height={h} result="pt" />
        <feComposite in={last} in2="pt" operator="in" result="pi" />
        <feMorphology in="pi" operator="dilate" radius={Math.floor(k / 2)} result="pm" />
      </>
    ), "pm");
  }
  if (r.posterize) {
    const t = levels(r.posterize);
    add("post", (
      <feComponentTransfer in={last} result="po">
        <feFuncR type="discrete" tableValues={t} />
        <feFuncG type="discrete" tableValues={t} />
        <feFuncB type="discrete" tableValues={t} />
      </feComponentTransfer>
    ), "po");
  }
  if (r.ink) {
    const k = (r.ink * 1.6).toFixed(2);
    const src = last;
    add("ink", (
      <>
        <feColorMatrix in={src} type="saturate" values="0" result="ig" />
        <feConvolveMatrix in="ig" order={3} kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" divisor={1} bias={0} preserveAlpha="true" result="ie" />
        <feColorMatrix in="ie" type="matrix" values={`-${k} -${k} -${k} 0 1  -${k} -${k} -${k} 0 1  -${k} -${k} -${k} 0 1  0 0 0 1 0`} result="il" />
        <feBlend in={src} in2="il" mode="multiply" result="ib" />
      </>
    ), "ib");
  }
  if (r.duotone) {
    const [d, l] = [rgb(r.duotone[0]), rgb(r.duotone[1])];
    add("duo", (
      <>
        <feColorMatrix in={last} type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" result="dl" />
        <feComponentTransfer in="dl" result="dd">
          <feFuncR type="table" tableValues={`${d[0].toFixed(3)} ${l[0].toFixed(3)}`} />
          <feFuncG type="table" tableValues={`${d[1].toFixed(3)} ${l[1].toFixed(3)}`} />
          <feFuncB type="table" tableValues={`${d[2].toFixed(3)} ${l[2].toFixed(3)}`} />
        </feComponentTransfer>
      </>
    ), "dd");
  }
  if (r.bloom) {
    const src = last;
    add("bloom", (
      <>
        <feGaussianBlur in={src} stdDeviation={r.bloom} result="bb" />
        <feBlend in={src} in2="bb" mode="screen" result="bs" />
      </>
    ), "bs");
  }
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <defs>
        <filter id={id} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x={0} y={0} width={w} height={h} colorInterpolationFilters="sRGB">
          {prims.length ? prims : <feOffset dx={0} dy={0} />}
        </filter>
      </defs>
    </svg>
  );
};

const gradeCss = (r: Recipe) => {
  const g = r.grade ?? {};
  const parts: string[] = [];
  if (g.contrast !== undefined) parts.push(`contrast(${g.contrast})`);
  if (g.saturate !== undefined) parts.push(`saturate(${g.saturate})`);
  if (g.brightness !== undefined) parts.push(`brightness(${g.brightness})`);
  if (g.sepia !== undefined) parts.push(`sepia(${g.sepia})`);
  if (g.hue !== undefined) parts.push(`hue-rotate(${g.hue}deg)`);
  if (g.gray !== undefined) parts.push(`grayscale(${g.gray})`);
  return parts.join(" ");
};

const abs: React.CSSProperties = { position: "absolute", inset: 0, pointerEvents: "none" };

export const StyledScene: React.FC<{ style: string; frame?: number; children: React.ReactNode }> = ({ style, frame: frameProp, children }) => {
  const spec = STYLE_BY_ID[style];
  const cf = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (!spec) throw new Error(`unknown style ${style}`);
  const r = spec.recipe;
  const frame = frameProp ?? cf;
  const held = r.hold ? Math.floor(frame / r.hold) * r.hold : frame;
  const fid = `st-${style}`;
  const hasFilter = !!(r.wobble || r.pixel || r.posterize || r.ink || r.duotone || r.bloom);
  const flick = r.flicker ? 1 + r.flicker * (Math.sin(frame * 12.9898) * 43758.5453 % 1) : 1;
  const css = [hasFilter ? `url(#${fid})` : "", gradeCss(r), flick !== 1 ? `brightness(${flick.toFixed(3)})` : ""].filter(Boolean).join(" ");
  const grainSeed = 1 + (Math.floor(frame / 2) % 8);

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      {hasFilter ? <FilterDefs id={fid} r={r} frame={frame} w={width} h={height} /> : null}
      <AbsoluteFill style={{ ...(css ? { filter: css } : {}) }}>
        <HeldFrame.Provider value={held}>{children}</HeldFrame.Provider>
      </AbsoluteFill>
      {r.tiltShift ? (
        <>
          <div style={{ ...abs, height: height * 0.3, backdropFilter: `blur(${r.tiltShift}px)`, WebkitMaskImage: "linear-gradient(180deg,#000,transparent)", maskImage: "linear-gradient(180deg,#000,transparent)" }} />
          <div style={{ ...abs, top: "auto", height: height * 0.3, backdropFilter: `blur(${r.tiltShift}px)`, WebkitMaskImage: "linear-gradient(0deg,#000,transparent)", maskImage: "linear-gradient(0deg,#000,transparent)" }} />
        </>
      ) : null}
      {r.tint ? <div style={{ ...abs, background: r.tint.color, opacity: r.tint.opacity, mixBlendMode: r.tint.blend ?? "multiply" }} /> : null}
      {r.paper ? <div style={{ ...abs, background: r.paper.color, opacity: r.paper.opacity, mixBlendMode: "multiply" }} /> : null}
      {r.halftone ? (
        <div style={{ ...abs, mixBlendMode: "multiply", opacity: r.halftone.opacity, backgroundImage: `radial-gradient(circle at center, ${r.halftone.color ?? "#000"} 32%, transparent 36%)`, backgroundSize: `${r.halftone.size}px ${r.halftone.size}px` }} />
      ) : null}
      {r.grain ? (
        <svg width={width} height={height} style={{ ...abs, opacity: r.grain, mixBlendMode: "overlay" }}>
          <filter id={`${fid}-grain`}>
            <feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} seed={grainSeed} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width={width} height={height} filter={`url(#${fid}-grain)`} />
        </svg>
      ) : null}
      {r.scan ? <div style={{ ...abs, opacity: r.scan * 4, background: "repeating-linear-gradient(0deg, rgba(0,0,0,.55) 0 1px, transparent 1px 4px)" }} /> : null}
      {r.vignette ? <div style={{ ...abs, background: `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${r.vignette}) 100%)` }} /> : null}
      {r.overlay === "speedlines" ? (
        <svg width={width} height={height} style={{ ...abs, opacity: 0.18 }}>
          {Array.from({ length: 36 }, (_, i) => {
            const a = (i / 36) * Math.PI * 2;
            return <line key={i} x1={width / 2 + Math.cos(a) * width * 0.55} y1={height / 2 + Math.sin(a) * height * 0.55} x2={width / 2 + Math.cos(a) * width} y2={height / 2 + Math.sin(a) * height} stroke="#fff" strokeWidth={4 + (i % 3) * 3} />;
          })}
        </svg>
      ) : null}
      {r.overlay === "border" ? <div style={{ ...abs, boxShadow: "inset 0 0 0 26px #7a2e1d, inset 0 0 0 34px #f2c14e, inset 0 0 0 44px #7a2e1d" }} /> : null}
      {r.overlay === "hud" ? (
        <svg width={width} height={height} style={{ ...abs, opacity: 0.85 }} fill="none" stroke="#00e5ff" strokeWidth={4}>
          <path d="M 40 120 L 40 40 L 120 40 M 960 40 L 1040 40 L 1040 120 M 40 1800 L 40 1880 L 120 1880 M 960 1880 L 1040 1880 L 1040 1800" />
          <circle cx={1000} cy={1740} r={34} strokeWidth={3} />
          <path d="M 70 1860 L 330 1860 M 70 1840 L 210 1840" strokeWidth={5} />
        </svg>
      ) : null}
      {r.letterbox ? (
        <>
          <div style={{ ...abs, bottom: "auto", height: height * r.letterbox, background: "#000" }} />
          <div style={{ ...abs, top: "auto", height: height * r.letterbox, background: "#000" }} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
