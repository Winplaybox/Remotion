import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, useBundledFonts } from "@visuals/fonts";
import { ELEMENT_RENDERERS } from "./elements";
import type { OddOrbit } from "./model";

const W = 1080;
const GRID_TOP = 470;
const GRID_BOTTOM = 1660;
const TAU = Math.PI * 2;

interface Cell { x: number; y: number; row: number; col: number; phase: number; mul: number; dir: number; delay: number }

function useLayout(p: OddOrbit) {
  return useMemo(() => {
    const rows = Math.ceil(p.count / p.cols);
    const pitch = Math.min(960 / p.cols, (GRID_BOTTOM - GRID_TOP) / rows);
    const gridW = pitch * p.cols;
    const gridH = pitch * rows;
    const x0 = (W - gridW) / 2 + pitch / 2;
    const y0 = GRID_TOP + (GRID_BOTTOM - GRID_TOP - gridH) / 2 + pitch / 2;
    const odd = p.oddIndex >= 0 && p.oddIndex < p.count ? p.oddIndex : Math.floor(random(`${p.seed}-odd`) * p.count);
    const cx = W / 2, cy = y0 + gridH / 2 - pitch / 2;
    const maxD = Math.hypot(gridW / 2, gridH / 2);
    const cells: Cell[] = Array.from({ length: p.count }, (_, i) => {
      const row = Math.floor(i / p.cols), col = i % p.cols;
      const x = x0 + col * pitch, y = y0 + row * pitch;
      let mul = 1 + (random(`${p.seed}-s${i}`) - 0.5) * 2 * p.speedJitter;
      let dir = 1;
      if (i === odd) {
        if (p.oddRule === "reverse") dir = -1;
        if (p.oddRule === "faster") mul = 1.55;
        if (p.oddRule === "slower") mul = 0.55;
      }
      return { x, y, row, col, phase: random(`${p.seed}-p${i}`) * TAU, mul, dir, delay: (Math.hypot(x - cx, y - cy) / maxD) * 16 };
    });
    return { cells, pitch, odd };
  }, [p]);
}

const Stars: React.FC<{ seed: string; frame: number }> = ({ seed, frame }) => (
  <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: 90 }, (_, i) => {
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / (18 + random(`${seed}-t${i}`) * 40) + i));
      return <circle key={i} cx={random(`${seed}-x${i}`) * W} cy={random(`${seed}-y${i}`) * 1920} r={0.6 + random(`${seed}-r${i}`) * 1.6} fill="#fff" opacity={0.25 * tw} />;
    })}
  </svg>
);

export const OddOrbitComposition: React.FC<OddOrbit> = (p) => {
  useBundledFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { cells, pitch, odd } = useLayout(p);
  const Element = ELEMENT_RENDERERS[p.element];
  const t = frame / fps;
  const playFrames = p.playSeconds * fps;
  const reveal = p.revealSeconds > 0 ? spring({ frame: frame - playFrames, fps, config: { damping: 16, stiffness: 110 } }) : 0;
  const r = pitch * 0.42;
  const head = spring({ frame, fps, config: { damping: 18 } });
  const timeLeft = Math.max(0, p.playSeconds - t);
  const oddCell = cells[odd];
  const pal = p.palette;
  const glowDrift = Math.sin(t * 0.4) * 40;

  const drawCell = (c: Cell, i: number, isOdd: boolean) => {
    const pop = spring({ frame: frame - c.delay, fps, config: { damping: 13, stiffness: 140 } });
    const a = c.phase + c.dir * TAU * p.speed * c.mul * t;
    const scale = pop * (isOdd ? 1 + reveal * 0.55 : 1);
    const opacity = isOdd ? 1 : 1 - reveal * 0.82;
    const tinted = isOdd && p.oddRule === "tint";
    return (
      <g key={i} transform={`translate(${c.x} ${c.y}) scale(${scale})`} opacity={opacity}>
        <Element a={a} dir={c.dir} r={r} sats={p.satellites} body={tinted ? pal.oddTint : pal.body} line={tinted ? pal.oddTint : pal.line} />
      </g>
    );
  };

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${pal.bgTop}, ${pal.bgBottom})`, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 38% at ${50 + glowDrift / 20}% ${55 + glowDrift / 40}%, ${pal.glow}aa, transparent 70%)` }} />
      <Stars seed={p.seed} frame={frame} />

      <div style={{ position: "absolute", top: 250, width: "100%", textAlign: "center", opacity: head, transform: `translateY(${(1 - head) * -30}px)` }}>
        <div style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: 54, color: "#fff", letterSpacing: 0.5, textShadow: "0 4px 24px rgba(0,0,0,.6)" }}>{p.title}</div>
        <div style={{ fontFamily: FONT.ui, fontWeight: 500, fontSize: 32, color: "#D8DCF0", marginTop: 14, opacity: 1 - reveal }}>{p.subtitle}</div>
      </div>

      {p.showTimer ? (
        <div style={{ position: "absolute", top: 400, left: 300, right: 300, opacity: head * (1 - reveal) }}>
          <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,.12)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(timeLeft / p.playSeconds) * 100}%`, background: timeLeft < 3 ? "#FF6B6B" : pal.accent, boxShadow: `0 0 16px ${pal.accent}` }} />
          </div>
        </div>
      ) : null}

      <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="oo-glow">
            <stop offset="0" stopColor="#fff" stopOpacity={0.9} />
            <stop offset="0.35" stopColor={pal.line} stopOpacity={0.35} />
            <stop offset="1" stopColor={pal.line} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="oo-planet" cx="0.35" cy="0.35">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.45" stopColor={pal.line} />
            <stop offset="1" stopColor={pal.glow} />
          </radialGradient>
        </defs>
        {cells.map((c, i) => (i === odd ? null : drawCell(c, i, false)))}
        {oddCell ? (
          <g>
            {reveal > 0.01
              ? [0, 1, 2].map((k) => {
                  const ph = ((frame - playFrames) / fps + k / 3) % 1;
                  return <circle key={k} cx={oddCell.x} cy={oddCell.y} r={r * (1.4 + ph * 1.6)} fill="none" stroke={pal.accent} strokeWidth={4} opacity={(1 - ph) * reveal} />;
                })
              : null}
            {reveal > 0.01 ? <circle cx={oddCell.x} cy={oddCell.y} r={r * 1.35} fill="none" stroke={pal.accent} strokeWidth={5} opacity={reveal} style={{ filter: `drop-shadow(0 0 12px ${pal.accent})` }} /> : null}
            {drawCell(oddCell, odd, true)}
          </g>
        ) : null}
      </svg>

      {oddCell && reveal > 0.01 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: oddCell.y + (oddCell.y > 1300 ? -r * 2.6 - 70 : r * 2.4), display: "flex", justifyContent: "center", opacity: reveal, transform: `scale(${0.8 + reveal * 0.2})` }}>
          <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 34, color: "#071018", background: pal.accent, padding: "12px 28px", borderRadius: 999, boxShadow: `0 0 40px ${pal.accent}88` }}>
            ROW {oddCell.row + 1} · #{oddCell.col + 1}
          </div>
        </div>
      ) : null}

      <div style={{ position: "absolute", top: 1730, width: "100%", textAlign: "center", fontFamily: FONT.ui, fontWeight: 800, fontSize: 34, color: "#E9ECFA", letterSpacing: 0.5, opacity: head }}>
        {reveal > 0.5 ? "DID YOU GET IT? FOLLOW FOR DAILY PUZZLES" : p.footer}
      </div>
      <div style={{ position: "absolute", top: 1820, width: "100%", textAlign: "center", fontFamily: FONT.ui, fontWeight: 700, fontSize: 22, color: "#9AA0C0", letterSpacing: 3 }}>{p.brand}</div>
      <div style={{ position: "absolute", top: 404, right: 120, fontFamily: FONT.mono, fontWeight: 700, fontSize: 24, color: "#9AA0C0", opacity: p.showTimer ? head * (1 - reveal) : 0, transform: "translateY(-50%)" }}>{Math.ceil(timeLeft)}s</div>
    </AbsoluteFill>
  );
};
