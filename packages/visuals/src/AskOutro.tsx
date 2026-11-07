import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "./fonts";

/** Mirrors engines/ask-outro.ts AskOutro (kept structural so visuals has no engine import). */
export interface AskOutroView {
  question: string; options: string[]; cta: string; ctaSub: string; handle: string; questionSeconds: number; ctaSeconds: number;
}

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Shared ending for every puzzle engine: question banner -> comment CTA banner + FOLLOW button tapped by a cursor.
 * The scene underneath stays bright (only the top/bottom strips get a backing) so viewers keep looking and the Short loops.
 * `from` = frame (of the whole composition) where the outro starts; render it as the LAST layer.
 */
export const AskOutro: React.FC<{ from: number; a: AskOutroView; accent: string; tapAt: number }> = ({ from, a, accent, tapAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - from;
  if (f < 0) return null;
  const qF = a.questionSeconds * fps;
  const inCta = f >= qF;
  const cf = f - qF;
  const bannerIn = spring({ frame: f, fps, config: { damping: 14, stiffness: 140 } });
  const swap = spring({ frame: cf, fps, config: { damping: 12, stiffness: 170 } });
  const tapF = tapAt * fps;
  const followed = inCta && cf >= tapF;
  const press = inCta ? interpolate(cf, [tapF - 3, tapF, tapF + 4], [1, 0.9, 1], clamp) : 1;
  // cursor glides in from bottom-right to the button, taps, then rests
  const cx = interpolate(cf, [6, tapF - 2], [1000, 600], clamp);
  const cy = interpolate(cf, [6, tapF - 2], [1900, 1615], clamp);
  const cursorOn = inCta && cf > 6;
  const btnIn = inCta ? spring({ frame: cf - 4, fps, config: { damping: 11, stiffness: 160 } }) : 0;
  const chip = (s: string, i: number) => {
    const k = spring({ frame: f - 8 - i * 3, fps, config: { damping: 12 } });
    return <span key={i} style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: 36, color: accent, border: `3px solid ${accent}`, borderRadius: 14, padding: "6px 18px", background: "rgba(0,0,0,.35)", transform: `scale(${0.6 + 0.4 * k})`, opacity: k }}>{s}</span>;
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* backing strips only — the puzzle in the middle stays fully visible */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 540, background: "linear-gradient(180deg, rgba(5,6,14,.98) 0%, rgba(5,6,14,.96) 78%, rgba(5,6,14,0))", opacity: bannerIn }} />
      {inCta ? <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 440, background: "linear-gradient(0deg, rgba(5,6,14,.98) 0%, rgba(5,6,14,.95) 70%, rgba(5,6,14,0))", opacity: btnIn }} /> : null}

      <div style={{ position: "absolute", top: 120, left: 50, right: 50, display: "flex", justifyContent: "center", transform: `translateY(${(1 - bannerIn) * -220}px)` }}>
        {!inCta ? (
          <div style={{ width: "100%", borderRadius: 30, border: `4px solid ${accent}`, background: "rgba(10,16,40,.96)", padding: "30px 34px", textAlign: "center", boxShadow: `0 0 50px ${accent}55` }}>
            <div style={{ fontFamily: FONT.display, fontSize: Math.min(96, 1900 / Math.max(10, a.question.length)), color: "#fff", lineHeight: 1.05 }}>{a.question}</div>
            {a.options.length ? <div style={{ marginTop: 22, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>{a.options.map(chip)}</div> : null}
          </div>
        ) : (
          <div style={{ width: "100%", borderRadius: 30, background: accent, padding: "30px 34px", textAlign: "center", transform: `scale(${0.85 + 0.15 * swap})`, boxShadow: `0 0 60px ${accent}99` }}>
            <div style={{ fontFamily: FONT.display, fontSize: Math.min(84, 1900 / Math.max(10, a.cta.length)), color: "#0B0B12", lineHeight: 1.05 }}>{a.cta}</div>
            <div style={{ marginTop: 14, fontFamily: FONT.ui, fontWeight: 900, fontSize: 38, color: "#B3121F" }}>{a.ctaSub}</div>
          </div>
        )}
      </div>

      {inCta ? (
        <div style={{ position: "absolute", top: 1545, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: btnIn, transform: `translateY(${(1 - btnIn) * 120}px)` }}>
          <div style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: 48, letterSpacing: 2, color: "#fff", background: followed ? "#1FA463" : "#E53935", border: "4px solid rgba(255,255,255,.9)", borderRadius: 22, padding: "18px 90px", transform: `scale(${press * (followed ? 1 : 1 + Math.sin(cf / 5) * 0.025)})`, boxShadow: `0 10px 40px ${followed ? "#1FA463" : "#E53935"}88` }}>
            {followed ? "✓ FOLLOWING" : "FOLLOW"}
          </div>
          <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, color: "#fff", border: "2px solid rgba(255,255,255,.5)", borderRadius: 99, padding: "6px 26px", background: "rgba(0,0,0,.4)" }}>{a.handle}</div>
        </div>
      ) : null}

      {cursorOn ? (
        <svg width={70} height={84} viewBox="0 0 28 34" style={{ position: "absolute", left: cx, top: cy, transform: `scale(${press})`, filter: "drop-shadow(0 4px 6px rgba(0,0,0,.6))" }}>
          <path d="M2 2 L2 28 L9 21 L14 32 L19 30 L14 19 L24 19 Z" fill="#fff" stroke="#111" strokeWidth={2} strokeLinejoin="round" />
        </svg>
      ) : null}
      {followed ? (() => {
        const r = interpolate(cf - tapF, [0, 14], [0, 1], clamp);
        return <div style={{ position: "absolute", left: 540 - 160 * (1 + r), top: 1595 - 50 * (1 + r), width: 320 * (1 + r), height: 100 * (1 + r), borderRadius: 40, border: "4px solid #1FA463", opacity: 1 - r }} />;
      })() : null}
    </AbsoluteFill>
  );
};
