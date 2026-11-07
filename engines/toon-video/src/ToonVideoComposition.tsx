import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, useBundledFonts } from "@visuals/fonts";
import { TOON_STYLES, type ToonStyle, type ToonVideo } from "./model";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const steps = (n: number) => Array.from({ length: n }, (_, i) => (i / (n - 1)).toFixed(3)).join(" ");
const GRAY = "0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0 0 0 1 0";
const LAPLACE = "-1 -1 -1 -1 8 -1 -1 -1 -1";

/** Edge lines as a black-on-white layer: gray -> Laplacian -> threshold -> (optional) thicken. */
const Edges: React.FC<{ from: string; cut: number; thick?: number; gain?: number; result: string }> = ({ from, cut, thick = 0, gain = 3, result }) => {
  // tableValues: values below `cut` stay white (1), above become black (0)
  const n = 20, k = Math.max(1, Math.round(cut * n));
  const table = Array.from({ length: n }, (_, i) => (i < k ? 1 : 0)).join(" ");
  return (
    <>
      <feColorMatrix in={from} type="matrix" values={GRAY} result={`${result}-g`} />
      <feConvolveMatrix in={`${result}-g`} order="3" kernelMatrix={LAPLACE} divisor={1 / gain} preserveAlpha="true" result={`${result}-l`} />
      <feComponentTransfer in={`${result}-l`} result={thick ? `${result}-t` : result}>
        <feFuncR type="discrete" tableValues={table} />
        <feFuncG type="discrete" tableValues={table} />
        <feFuncB type="discrete" tableValues={table} />
      </feComponentTransfer>
      {thick ? <feMorphology in={`${result}-t`} operator="erode" radius={thick} result={result} /> : null}
    </>
  );
};

const Poster: React.FC<{ from: string; levels: number; result: string }> = ({ from, levels, result }) => (
  <feComponentTransfer in={from} result={result}>
    <feFuncR type="discrete" tableValues={steps(levels)} />
    <feFuncG type="discrete" tableValues={steps(levels)} />
    <feFuncB type="discrete" tableValues={steps(levels)} />
  </feComponentTransfer>
);

/** One SVG filter per style; applied to the video with CSS `filter: url(#toon-<style>)`. */
const Filters: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id="toon-cartoon" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="smooth" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="soft" />
        <Poster from="smooth" levels={10} result="poster" />
        <feColorMatrix in="poster" type="saturate" values="1.5" result="color" />
        <Edges from="soft" cut={0.38} gain={3.5} result="edges" />
        <feBlend in="color" in2="edges" mode="multiply" />
      </filter>
      <filter id="toon-anime" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.6" result="smooth" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="3.6" result="soft" />
        <feComponentTransfer in="smooth" result="bright">
          <feFuncR type="linear" slope="1.04" intercept="0.02" />
          <feFuncG type="linear" slope="1.04" intercept="0.02" />
          <feFuncB type="linear" slope="1.08" intercept="0.03" />
        </feComponentTransfer>
        <Poster from="bright" levels={12} result="poster" />
        <feColorMatrix in="poster" type="saturate" values="1.35" result="color" />
        <feGaussianBlur in="color" stdDeviation="10" result="bloomBlur" />
        <feComposite in="color" in2="bloomBlur" operator="arithmetic" k1="0" k2="0.8" k3="0.28" k4="0" result="bloom" />
        <Edges from="soft" cut={0.45} gain={3.5} result="edges" />
        <feBlend in="bloom" in2="edges" mode="multiply" />
      </filter>
      <filter id="toon-comic" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="smooth" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="soft" />
        <feComponentTransfer in="smooth" result="contrast">
          <feFuncR type="linear" slope="1.2" intercept="-0.05" />
          <feFuncG type="linear" slope="1.2" intercept="-0.05" />
          <feFuncB type="linear" slope="1.2" intercept="-0.05" />
        </feComponentTransfer>
        <Poster from="contrast" levels={5} result="poster" />
        <feColorMatrix in="poster" type="saturate" values="1.6" result="color" />
        <Edges from="soft" cut={0.3} gain={3.5} thick={1} result="edges" />
        <feBlend in="color" in2="edges" mode="multiply" />
      </filter>
      <filter id="toon-sketch" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.9" result="smooth" />
        <feColorMatrix in="smooth" type="matrix" values={GRAY} result="g" />
        <feConvolveMatrix in="g" order="3" kernelMatrix={LAPLACE} preserveAlpha="true" result="l" />
        <feComponentTransfer in="l" result="ink">
          <feFuncR type="gamma" amplitude="-2.6" exponent="0.75" offset="1" />
          <feFuncG type="gamma" amplitude="-2.6" exponent="0.75" offset="1" />
          <feFuncB type="gamma" amplitude="-2.6" exponent="0.75" offset="1" />
        </feComponentTransfer>
        <feComponentTransfer in="g" result="shade">
          <feFuncR type="discrete" tableValues="0.72 0.84 0.93 1 1" />
          <feFuncG type="discrete" tableValues="0.70 0.82 0.92 1 1" />
          <feFuncB type="discrete" tableValues="0.66 0.78 0.90 0.98 0.98" />
        </feComponentTransfer>
        <feBlend in="shade" in2="ink" mode="multiply" />
      </filter>
      <filter id="toon-watercolor" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="7" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="G" result="wobble" />
        <feGaussianBlur in="wobble" stdDeviation="4.5" result="smooth" />
        <Poster from="smooth" levels={9} result="poster" />
        <feColorMatrix in="poster" type="saturate" values="1.2" result="color" />
        <feComponentTransfer in="color" result="light">
          <feFuncR type="linear" slope="0.82" intercept="0.17" />
          <feFuncG type="linear" slope="0.82" intercept="0.17" />
          <feFuncB type="linear" slope="0.82" intercept="0.17" />
        </feComponentTransfer>
        <Edges from="smooth" cut={0.35} gain={4} result="edges" />
        <feComponentTransfer in="edges" result="softEdges">
          <feFuncR type="linear" slope="0.5" intercept="0.5" />
          <feFuncG type="linear" slope="0.5" intercept="0.5" />
          <feFuncB type="linear" slope="0.5" intercept="0.5" />
        </feComponentTransfer>
        <feBlend in="light" in2="softEdges" mode="multiply" />
      </filter>
    </defs>
  </svg>
);

/** Paper / dots texture layered over the styled video. */
const Texture: React.FC<{ style: ToonStyle }> = ({ style }) => {
  if (style === "comic") return <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,.28) 1.6px, transparent 2.2px)", backgroundSize: "9px 9px", mixBlendMode: "multiply" }} />;
  if (style === "sketch" || style === "watercolor") {
    return <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(115deg, rgba(120,100,70,.06) 0 2px, transparent 2px 7px), radial-gradient(ellipse at 30% 20%, rgba(255,250,235,.25), rgba(200,185,150,.18))", mixBlendMode: "multiply" }} />;
  }
  return null;
};

export const ToonVideoComposition: React.FC<ToonVideo> = (p) => {
  useBundledFonts();
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const src = /^https?:/.test(p.src) ? p.src : staticFile(p.src);
  const s = TOON_STYLES[p.style];
  const portrait = p.height / p.width >= 1.5;
  // Before/after swipe: real for 0.5s, a line sweeps left->right by 1.7s.
  const swipe = p.showBefore ? interpolate(frame, [0.5 * fps, 1.7 * fps], [0, 100], clamp) : 100;
  const filter = `url(#toon-${p.style})`;
  const fit: React.CSSProperties = portrait ? { width: W, height: H, objectFit: "cover" } : { width: W, height: (W * p.height) / p.width, objectFit: "contain" };
  const fgTop = portrait ? 0 : (H - (W * p.height) / p.width) / 2;
  const badgeIn = interpolate(frame, [1.5 * fps, 1.9 * fps], [0, 1], clamp);

  const layer = (styled: boolean) => (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {!portrait ? (
        <OffthreadVideo src={src} muted style={{ position: "absolute", width: W, height: H, objectFit: "cover", filter: `${styled ? filter : ""} blur(28px) brightness(0.55)`, transform: "scale(1.15)" }} />
      ) : null}
      <div style={{ position: "absolute", top: fgTop, left: 0, filter: styled ? filter : undefined }}>
        <OffthreadVideo src={src} muted style={fit} />
      </div>
      {styled ? <Texture style={p.style} /> : null}
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{ background: "#0B0B10" }}>
      <Filters />
      <Audio src={src} />
      {/* "before" layer (unfiltered) under the styled layer, which the swipe reveals */}
      {swipe < 100 ? layer(false) : null}
      <AbsoluteFill style={{ clipPath: `inset(0 ${100 - swipe}% 0 0)` }}>{layer(true)}</AbsoluteFill>
      {swipe > 0 && swipe < 100 ? <div style={{ position: "absolute", top: 0, bottom: 0, left: `${swipe}%`, width: 8, marginLeft: -4, background: "#fff", boxShadow: "0 0 30px rgba(255,255,255,.9)" }} /> : null}
      {p.showBefore && swipe < 100 ? (
        <div style={{ position: "absolute", top: 120, left: 60, fontFamily: FONT.ui, fontWeight: 900, fontSize: 40, color: "#fff", background: "rgba(0,0,0,.55)", padding: "8px 22px", borderRadius: 12 }}>REAL</div>
      ) : null}
      <div style={{ position: "absolute", top: 120, right: 60, opacity: Math.max(badgeIn, swipe > 60 ? 1 : 0), fontFamily: FONT.ui, fontWeight: 900, fontSize: 40, letterSpacing: 3, color: p.style === "sketch" ? "#fff" : "#111", background: s.accent, padding: "8px 22px", borderRadius: 12, boxShadow: "0 6px 0 rgba(0,0,0,.35)" }}>{s.label}</div>
      {p.title ? (
        <div style={{ position: "absolute", bottom: 300, left: 60, right: 60, textAlign: "center", fontFamily: FONT.display, fontSize: 76, lineHeight: 1.05, color: "#fff", textShadow: "0 6px 0 rgba(0,0,0,.6), 0 0 30px rgba(0,0,0,.6)" }}>{p.title}</div>
      ) : null}
      {p.handle ? <div style={{ position: "absolute", bottom: 220, width: "100%", textAlign: "center", fontFamily: FONT.mono, fontWeight: 700, fontSize: 32, color: "#fff", textShadow: "0 2px 6px #000" }}>{p.handle}</div> : null}
    </AbsoluteFill>
  );
};
