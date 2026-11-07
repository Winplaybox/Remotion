import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "./fonts";

/** Opening card: "PICHHLE PUZZLE KA JAWAB" — the answer of the previous post, shown for `seconds` at the start. */
export const PrevAnswerCard: React.FC<{ seconds: number; heading: string; answer: string; accent: string; bg: string }> = ({ seconds, heading, answer, accent, bg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const end = seconds * fps;
  if (seconds <= 0 || frame >= end) return null;
  const pop = spring({ frame: frame - 4, fps, config: { damping: 11, stiffness: 150 } });
  const out = interpolate(frame, [end - 8, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: bg, alignItems: "center", justifyContent: "center", opacity: out }}>
      <div style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: 40, letterSpacing: 4, color: "#fff", opacity: 0.85 }}>{heading}</div>
      <div style={{ marginTop: 34, fontFamily: FONT.display, fontSize: Math.min(150, 1500 / Math.max(6, answer.length)), color: "#071018", background: accent, padding: "18px 48px", borderRadius: 30, transform: `scale(${0.6 + pop * 0.4})`, boxShadow: `0 0 60px ${accent}aa` }}>{answer}</div>
      <div style={{ marginTop: 40, fontFamily: FONT.ui, fontWeight: 800, fontSize: 36, color: "#fff", opacity: interpolate(frame, [20, 32], [0, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>Sahi pakda tha? 👀 Ab agla puzzle!</div>
    </AbsoluteFill>
  );
};

/** Big "AAPKA JAWAB?" overlay shown instead of revealing the answer. */
export const AskOverlay: React.FC<{ from: number; until?: number; title: string; line: string; sub: string; accent: string }> = ({ from, until = Infinity, title, line, sub, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from || frame >= until) return null;
  const p = spring({ frame: frame - from, fps, config: { damping: 10, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(5,4,16,${0.55 * Math.min(1, p)})` }}>
      <div style={{ fontFamily: FONT.display, fontSize: 170, color: accent, transform: `scale(${0.5 + p * 0.5}) rotate(${(1 - p) * -6}deg)`, textShadow: `0 0 50px ${accent}aa` }}>{title}</div>
      <div style={{ marginTop: 20, fontFamily: FONT.ui, fontWeight: 900, fontSize: 52, color: "#071018", background: "#fff", padding: "14px 36px", borderRadius: 99, opacity: Math.min(1, p * 1.5) }}>{line}</div>
      <div style={{ marginTop: 30, fontFamily: FONT.ui, fontWeight: 800, fontSize: 38, color: "#fff", maxWidth: 880, textAlign: "center", opacity: interpolate(frame - from, [18, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{sub}</div>
    </AbsoluteFill>
  );
};
