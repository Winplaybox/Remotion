import React from "react";
import { interpolate, spring } from "remotion";
import { FONT } from "./fonts";

/**
 * Shared pieces for character/mystery engines: Caption, SpeechBubble, ClueNote, Spotlight, CaseBadge, CountdownRing.
 * All absolutely positioned in the 1080x1920 frame; pure functions of the props you pass (frame-local values).
 */

/** Words written in CAPS are highlighted in the accent colour (that is how we mark the clue words in the copy). */
export const Highlighted: React.FC<{ text: string; accent: string }> = ({ text, accent }) => (
  <>
    {text.split(/(\s+)/).map((w, i) => {
      const bare = w.replace(/[^A-Za-z]/g, "");
      const hot = bare.length > 1 && bare === bare.toUpperCase();
      return <span key={i} style={hot ? { color: accent } : undefined}>{w}</span>;
    })}
  </>
);

/** Big 2-line caption band (keep inside 1500–1700, YouTube UI covers below). */
export const Caption: React.FC<{ text: string; f: number; fps: number; accent: string; top?: number }> = ({ text, f, fps, accent, top = 1580 }) => {
  if (!text) return null;
  const k = spring({ frame: f, fps, config: { damping: 16, stiffness: 180 } });
  const size = text.length > 70 ? 40 : text.length > 48 ? 44 : 50;
  return (
    <div style={{ position: "absolute", top, left: 40, right: 40, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${(1 - k) * 18}px)` }}>
      <div style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: size, lineHeight: 1.18, color: "#fff", textAlign: "center", background: "rgba(8,6,16,.72)", borderRadius: 22, padding: "14px 26px", textShadow: "0 3px 0 #000", maxWidth: 1000 }}>
        <Highlighted text={text} accent={accent} />
      </div>
    </div>
  );
};

/** Speech bubble; (tx, ty) = where the tail points (speaker's head). */
export const SpeechBubble: React.FC<{ text: string; f: number; fps: number; tx: number; ty: number; top: number; accent: string; name: string }> = ({ text, f, fps, tx, ty, top, accent, name }) => {
  const k = spring({ frame: f, fps, config: { damping: 12, stiffness: 170 } });
  const w = 940;
  const left = Math.max(30, Math.min(1080 - w - 30, tx - w / 2));
  const size = text.length > 60 ? 44 : 50;
  const boxBottom = top + 250;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, k * 1.4) }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={`M ${tx - 34} ${boxBottom - 4} L ${tx} ${Math.min(ty, boxBottom + 80)} L ${tx + 34} ${boxBottom - 4} Z`} fill="#FFFDF5" stroke="#1A1410" strokeWidth={6} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", left, top, width: w, height: 250, transform: `scale(${0.7 + 0.3 * k})`, transformOrigin: `${tx - left}px 250px`, background: "#FFFDF5", border: "6px solid #1A1410", borderRadius: 40, display: "flex", flexDirection: "column", justifyContent: "center", padding: "10px 34px", boxSizing: "border-box", boxShadow: "0 12px 0 rgba(0,0,0,.35)" }}>
        <div style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: 30, color: accent, WebkitTextStroke: "1px #1A1410", letterSpacing: 1 }}>{name}</div>
        <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: size, lineHeight: 1.16, color: "#1A1410" }}>{text}</div>
      </div>
    </div>
  );
};

/** Sticky clue note on the ClueBoard. */
export const ClueNote: React.FC<{ n: number; text: string; f: number; fps: number; x: number; y: number; w: number; h: number; active: boolean; accent: string; tilt: number }> = ({ n, text, f, fps, x, y, w, h, active, accent, tilt }) => {
  if (f < 0) return null;
  const k = spring({ frame: f, fps, config: { damping: 11, stiffness: 160 } });
  const glow = active ? 1 : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `rotate(${tilt}deg) scale(${(0.4 + 0.6 * k) * (active ? 1.06 : 1)})`, opacity: k, background: "#FFF1A8", border: `4px solid ${active ? accent : "#3A2E10"}`, borderRadius: 10, boxShadow: glow ? `0 0 40px ${accent}, 0 8px 0 rgba(0,0,0,.4)` : "0 8px 0 rgba(0,0,0,.4)", padding: "26px 16px 12px", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", top: -14, left: w / 2 - 14, width: 28, height: 28, borderRadius: 14, background: "#E2483D", border: "3px solid #1A1410" }} />
      <div style={{ position: "absolute", top: 4, left: 10, fontFamily: FONT.display, fontSize: 26, color: "#8A5A10" }}>SURAAG {n}</div>
      <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 28, lineHeight: 1.14, color: "#2A200C", marginTop: 10 }}>
        <Highlighted text={text} accent="#C0311F" />
      </div>
    </div>
  );
};

/** Darkens everything except an elliptical pool of light at (x, y). `amount` 0..1 fades the effect in/out. */
export const Spotlight: React.FC<{ x: number; y: number; rx: number; ry: number; amount: number; id: string }> = ({ x, y, rx, ry, amount, id }) => {
  if (amount <= 0.001) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id={`${id}-g`}>
          <stop offset="0" stopColor="#000" />
          <stop offset="0.62" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </radialGradient>
        <mask id={`${id}-m`}>
          <rect width={1080} height={1920} fill="#fff" />
          <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id}-g)`} />
        </mask>
      </defs>
      <rect width={1080} height={1920} fill="#05040C" opacity={0.68 * amount} mask={`url(#${id}-m)`} />
      <ellipse cx={x} cy={y} rx={rx * 0.75} ry={ry * 0.95} fill="#FFF4C8" opacity={0.07 * amount} />
    </svg>
  );
};

/** Rubber stamp "CASE #007" that slams in. */
export const CaseStamp: React.FC<{ text: string; f: number; fps: number; color: string; x: number; y: number }> = ({ text, f, fps, color, x, y }) => {
  if (f < 0) return null;
  const k = spring({ frame: f, fps, config: { damping: 9, stiffness: 220 } });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(-8deg) scale(${2.4 - 1.4 * k})`, opacity: Math.min(1, k * 1.5), fontFamily: FONT.display, fontSize: 92, color, border: `8px solid ${color}`, borderRadius: 18, padding: "4px 28px", letterSpacing: 4, background: "rgba(0,0,0,.25)" }}>{text}</div>
  );
};

/** Countdown ring with the remaining whole seconds. */
export const CountdownRing: React.FC<{ seconds: number; elapsed: number; x: number; y: number; r: number; color: string; label: string }> = ({ seconds, elapsed, x, y, r, color, label }) => {
  const left = Math.max(0, seconds - elapsed);
  const frac = left / seconds;
  const c = 2 * Math.PI * r;
  const pulse = 1 + 0.08 * Math.max(0, 1 - ((elapsed % 1) * 4));
  return (
    <div style={{ position: "absolute", left: x - r - 20, top: y - r - 20, width: 2 * r + 40, height: 2 * r + 40 + 90 }}>
      <svg width={2 * r + 40} height={2 * r + 40}>
        <circle cx={r + 20} cy={r + 20} r={r} fill="rgba(5,4,12,.8)" stroke="#ffffff22" strokeWidth={16} />
        <circle cx={r + 20} cy={r + 20} r={r} fill="none" stroke={color} strokeWidth={16} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - frac)} transform={`rotate(-90 ${r + 20} ${r + 20})`} />
        <text x={r + 20} y={r + 20} dy={r * 0.36} textAnchor="middle" fontFamily="Anton" fontSize={r * 1.05} fill="#fff" transform={`translate(${r + 20} ${r + 20}) scale(${pulse}) translate(${-(r + 20)} ${-(r + 20)})`}>{Math.ceil(left)}</text>
      </svg>
      <div style={{ textAlign: "center", fontFamily: FONT.display, fontSize: 56, color, textShadow: "0 4px 0 #000", whiteSpace: "nowrap", marginLeft: -200, marginRight: -200 }}>{label}</div>
    </div>
  );
};

export const fadeInOut = (f: number, len: number, edge = 6) =>
  interpolate(f, [0, edge, Math.max(edge + 1, len - edge), len], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
